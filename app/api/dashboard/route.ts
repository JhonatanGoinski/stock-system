import { NextResponse } from "next/server";
import {
  logger,
  cacheUtils,
  createDateWithoutTimezone,
  generateLastDays,
  dateToString,
  dateToStringUTC,
  forceDateWithoutTimezone,
  createDateRangeWithTimezone,
  createDateForQuery,
  createDateRangeForQuery,
  createDateRangeForEnvironment,
  isVercel,
} from "@/lib/utils";

// Forçar rota dinâmica para evitar problemas durante o build
export const dynamic = "force-dynamic";

// Configuração de cache
export const revalidate = 300; // Revalidar a cada 5 minutos

// Verificar se estamos em ambiente de build (apenas quando não há DATABASE_URL)
const isBuildTime =
  process.env.NODE_ENV === "production" && !process.env.DATABASE_URL;

export async function GET() {
  // Se estamos em build time, retornar imediatamente
  if (isBuildTime) {
    logger.build("🚫 Build time detected, skipping Prisma operations");
    return NextResponse.json(
      { error: "Serviço indisponível durante build" },
      { status: 503 }
    );
  }

  // Importar Prisma apenas quando não estamos em build
  const { prisma } = await import("@/lib/prisma");

  try {
    // Verificar se o Prisma está disponível
    if (!prisma) {
      logger.error("❌ Prisma não disponível");
      return NextResponse.json(
        { error: "Serviço indisponível" },
        { status: 503 }
      );
    }

    logger.info("✅ Prisma disponível, executando query...");
    logger.debug(
      "🔍 DATABASE_URL:",
      process.env.DATABASE_URL ? "Definida" : "Não definida"
    );

    // Testar conexão primeiro
    try {
      await prisma.$connect();
      logger.success("✅ Conexão com banco estabelecida");
    } catch (connectionError) {
      logger.error("❌ Erro de conexão:", connectionError);
      return NextResponse.json(
        {
          error: "Erro de conexão com banco de dados",
          details: connectionError,
        },
        { status: 503 }
      );
    }

    // Usar a nova função que detecta o ambiente automaticamente
    const today = new Date();
    const todayRange = createDateRangeForEnvironment();
    const localTodayStart = todayRange.start;
    const localTodayEnd = todayRange.end;

    // Para vendas de hoje, usar a data local do servidor (sem timezone)
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    // Início do mês atual
    const startOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
      0,
      0,
      0,
      0
    );

    // 30 dias atrás
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // 7 dias atrás (incluindo hoje)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    logger.info("📊 Iniciando consultas do dashboard...");
    logger.debug("📅 Datas calculadas (ambiente detectado):", {
      today: today.toISOString(),
      todayDate: todayDate.toISOString(),
      localTodayStart: localTodayStart.toISOString(),
      localTodayEnd: localTodayEnd.toISOString(),
      startOfMonth: startOfMonth.toISOString(),
      thirtyDaysAgo: thirtyDaysAgo.toISOString(),
      sevenDaysAgo: sevenDaysAgo.toISOString(),
      environment: isVercel() ? "Vercel (UTC)" : "Local",
      note: todayRange.note,
    });

    // Executar todas as consultas em paralelo para melhor performance
    const [
      todayRevenue,
      monthRevenue,
      totalCustomers,
      topProductsWithDetails,
      topCustomersWithDetails,
      lowStockProducts,
      dailySales,
    ] = await Promise.all([
      // Vendas de hoje (usando data específica)
      prisma.sale.aggregate({
        where: {
          saleDate: todayDate,
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Vendas do mês
      prisma.sale.aggregate({
        where: {
          saleDate: {
            gte: startOfMonth,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Total de clientes ativos
      prisma.customer.count({
        where: { isActive: true },
      }),

      // Produtos mais vendidos com JOIN (elimina N+1)
      prisma.sale
        .groupBy({
          by: ["productId"],
          where: {
            saleDate: {
              gte: thirtyDaysAgo,
            },
          },
          _sum: {
            quantity: true,
            totalAmount: true,
          },
          orderBy: {
            _sum: {
              totalAmount: "desc",
            },
          },
          take: 5,
        })
        .then(async (topProducts) => {
          // Buscar detalhes dos produtos em uma única consulta
          const productIds = topProducts.map((item) => item.productId);
          const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, category: true },
          });

          // Mapear os resultados
          return topProducts.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            return {
              name: product?.name || "Produto não encontrado",
              category: product?.category || "",
              total_sold: item._sum.quantity || 0,
              revenue: Number(item._sum.totalAmount || 0),
            };
          });
        }),

      // Top clientes com JOIN (elimina N+1)
      prisma.sale
        .groupBy({
          by: ["customerId"],
          where: {
            saleDate: {
              gte: thirtyDaysAgo,
            },
            customerId: {
              not: null,
            },
          },
          _sum: {
            quantity: true,
            totalAmount: true,
          },
          orderBy: {
            _sum: {
              totalAmount: "desc",
            },
          },
          take: 5,
        })
        .then(async (topCustomers) => {
          // Buscar detalhes dos clientes em uma única consulta
          const customerIds = topCustomers
            .map((item) => item.customerId)
            .filter((id): id is number => id !== null);
          const customers = await prisma.customer.findMany({
            where: { id: { in: customerIds } },
            select: { id: true, name: true, email: true },
          });

          // Mapear os resultados
          return topCustomers.map((item) => {
            const customer = customers.find((c) => c.id === item.customerId);
            return {
              name: customer?.name || "Cliente não encontrado",
              email: customer?.email,
              total_spent: Number(item._sum.totalAmount || 0),
              total_items: item._sum.quantity || 0,
            };
          });
        }),

      // Produtos com estoque baixo
      prisma.product.findMany({
        where: {
          stockQuantity: {
            lt: 5,
          },
        },
        select: {
          name: true,
          category: true,
          stockQuantity: true,
          size: true,
        },
        orderBy: {
          stockQuantity: "asc",
        },
      }),

      // Vendas dos últimos 7 dias (incluindo hoje)
      prisma.sale
        .findMany({
          where: {
            saleDate: {
              gte: sevenDaysAgo, // Buscar dos últimos 7 dias
              lte: todayDate, // Até hoje (inclusive)
            },
          },
          select: {
            saleDate: true,
            totalAmount: true,
            id: true,
          },
          orderBy: {
            saleDate: "asc",
          },
        })
        .then((sales) => {
          // Agrupar manualmente por data local SEM compensação adicional
          const groupedByDate = new Map();

          sales.forEach((sale) => {
            // Usar a data como está, sem compensação adicional
            const localDate = new Date(sale.saleDate);
            const dateString = dateToStringUTC(localDate);

            if (!groupedByDate.has(dateString)) {
              groupedByDate.set(dateString, {
                saleDate: localDate,
                _sum: { totalAmount: 0 },
                _count: { id: 0 },
              });
            }

            const group = groupedByDate.get(dateString);
            group._sum.totalAmount += Number(sale.totalAmount);
            group._count.id += 1;
          });

          return Array.from(groupedByDate.values());
        }),
    ]);

    logger.debug("✅ Todas as consultas executadas em paralelo");

    // Logs de debug para verificar os dados
    logger.debug("💰 Vendas de hoje:", {
      todayDate: todayDate.toISOString(),
      totalRevenue: Number(todayRevenue._sum.totalAmount || 0),
      note: "Usando data específica em vez de range",
    });

    // Log detalhado da consulta de vendas diárias
    logger.debug("🔍 Consulta de vendas diárias:", {
      sevenDaysAgo: sevenDaysAgo.toISOString(),
      localTodayEnd: localTodayEnd.toISOString(),
    });

    // Log do resultado bruto do Prisma ORM
    logger.debug("🔍 Resultado bruto do Prisma ORM:", {
      dailySales: dailySales,
      type: typeof dailySales,
      isArray: Array.isArray(dailySales),
    });

    // Converter o resultado do Prisma ORM para o formato esperado
    const typedDailySales = dailySales as Array<{
      saleDate: Date;
      _sum: { totalAmount: any };
      _count: { id: number };
    }>;

    logger.debug("📊 Vendas diárias encontradas:", {
      totalDays: typedDailySales.length,
      dates: typedDailySales.map((item) => dateToStringUTC(item.saleDate)),
      revenues: typedDailySales.map((item) =>
        Number(item._sum.totalAmount || 0)
      ),
      salesCounts: typedDailySales.map((item) => item._count.id),
    });

    // Debug: verificar cada venda individualmente
    typedDailySales.forEach((sale, index) => {
      const dateString = dateToStringUTC(sale.saleDate);

      logger.debug(`📦 Venda ${index + 1}:`, {
        date: dateString,
        revenue: Number(sale._sum.totalAmount || 0),
        count: sale._count.id,
        fullDate: sale.saleDate.toISOString(),
        localDate: sale.saleDate.toLocaleDateString(),
        originalDate: sale.saleDate,
      });
    });

    // Formatar vendas diárias sem compensação adicional
    const formattedDailySales = typedDailySales.map((item) => {
      // Usar a data como está, sem compensação adicional
      const localDate = new Date(item.saleDate);
      const dateString = dateToStringUTC(localDate);

      logger.debug("📅 Formatando data (sem compensação adicional):", {
        original: item.saleDate.toISOString(),
        localDate: localDate.toISOString(),
        formatted: dateString,
        revenue: Number(item._sum.totalAmount || 0),
        note: "Usando data como está",
      });

      return {
        date: dateString,
        revenue: Number(item._sum.totalAmount || 0),
        sales_count: item._count.id,
      };
    });

    // CORREÇÃO: Gerar datas corretas para os últimos 7 dias
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last7Days.push(dateToStringUTC(date));
    }

    logger.debug("📅 Datas geradas para os últimos 7 dias:", {
      today: today.toISOString(),
      last7Days: last7Days,
    });

    // Preencher dias sem vendas com zero usando as datas corretas
    const completeDailySales = last7Days.map((dateString) => {
      const existingDay = formattedDailySales.find(
        (day) => day.date === dateString
      );
      const dayData = existingDay || {
        date: dateString,
        revenue: 0,
        sales_count: 0,
      };

      // Debug: log de cada dia sendo processado
      logger.debug(`📅 Processando dia:`, {
        date: dateString,
        hasData: !!existingDay,
        revenue: dayData.revenue,
        sales_count: dayData.sales_count,
        note: "Data corrigida",
      });

      return dayData;
    });

    logger.debug("📈 Vendas diárias completas:", {
      totalDays: completeDailySales.length,
      dates: completeDailySales.map((day) => day.date),
      revenues: completeDailySales.map((day) => day.revenue),
    });

    const dashboardData = {
      todayRevenue: Number(todayRevenue._sum.totalAmount || 0),
      monthRevenue: Number(monthRevenue._sum.totalAmount || 0),
      totalCustomers,
      topProducts: topProductsWithDetails,
      topCustomers: topCustomersWithDetails,
      lowStockProducts,
      dailySales: completeDailySales,
    };

    logger.info(
      "✅ Dados do dashboard carregados com sucesso (otimizado + cache)"
    );

    // Log final dos dados que serão retornados
    logger.debug("📤 Dados finais do dashboard:", {
      todayRevenue: dashboardData.todayRevenue,
      monthRevenue: dashboardData.monthRevenue,
      totalCustomers: dashboardData.totalCustomers,
      topProductsCount: dashboardData.topProducts.length,
      topCustomersCount: dashboardData.topCustomers.length,
      lowStockCount: dashboardData.lowStockProducts.length,
      dailySalesCount: dashboardData.dailySales.length,
      dailySalesDates: dashboardData.dailySales.map((day) => day.date),
    });

    // Criar resposta SEM cache temporariamente
    const response = NextResponse.json(dashboardData);

    // Aplicar headers SEM cache
    Object.entries(cacheUtils.noCache()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    logger.error("❌ Erro ao carregar dados do dashboard:", error);

    // Verificar se é um erro de conexão com o banco
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string };
      if (
        prismaError.code === "P1001" ||
        prismaError.code === "P1002" ||
        prismaError.code === "P1003"
      ) {
        return NextResponse.json(
          { error: "Erro de conexão com o banco de dados", details: error },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Erro interno do servidor", details: error },
      { status: 500 }
    );
  }
}
