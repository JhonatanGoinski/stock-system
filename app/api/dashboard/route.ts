import { NextResponse } from "next/server";
import { logger, cacheUtils } from "@/lib/utils";

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

    // CORREÇÃO: Ajustar datas para compensar timezone UTC+3 do banco
    const today = new Date();

    // Início do dia de hoje (00:00:00) - timezone local
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    // Fim do dia de hoje (23:59:59) - timezone local
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Início do mês atual - timezone local
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    // 30 dias atrás (para produtos mais vendidos) - timezone local
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // 7 dias atrás (para gráfico de vendas) - timezone local
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6); // 6 dias atrás + hoje = 7 dias
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // AJUSTE: Como o banco salva com UTC+3, vamos buscar um dia antes para compensar
    // Se hoje é dia 25, queremos buscar vendas do dia 24 no banco (que foram salvas como 25)
    const adjustedSevenDaysAgo = new Date(sevenDaysAgo);
    adjustedSevenDaysAgo.setDate(sevenDaysAgo.getDate() - 1);

    const adjustedEndOfToday = new Date(endOfToday);
    adjustedEndOfToday.setDate(endOfToday.getDate() - 1);

    logger.info("📊 Iniciando consultas otimizadas do dashboard...");
    logger.debug("�� Datas calculadas (ajustadas para UTC+3):", {
      today: today.toISOString(),
      startOfToday: startOfToday.toISOString(),
      endOfToday: endOfToday.toISOString(),
      sevenDaysAgo: sevenDaysAgo.toISOString(),
      adjustedSevenDaysAgo: adjustedSevenDaysAgo.toISOString(),
      adjustedEndOfToday: adjustedEndOfToday.toISOString(),
      todayDate: today.getDate(),
      sevenDaysAgoDate: sevenDaysAgo.getDate(),
      adjustedSevenDaysAgoDate: adjustedSevenDaysAgo.getDate(),
      difference: today.getDate() - sevenDaysAgo.getDate(),
      expectedDays: "7 dias (incluindo hoje)",
      timezone: "Local (ajustado -1 dia para compensar UTC+3 do banco)",
      note: "Banco salva com UTC+3, então buscamos um dia antes",
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
      // Vendas de hoje (entre 00:00:00 e 23:59:59)
      prisma.sale.aggregate({
        where: {
          saleDate: {
            gte: startOfToday,
            lte: endOfToday,
          },
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
        },
        orderBy: {
          stockQuantity: "asc",
        },
      }),

      // Vendas dos últimos 7 dias (incluindo hoje) - Ajustar para compensar timezone UTC+3 do banco
      prisma.sale.groupBy({
        by: ["saleDate"],
        where: {
          saleDate: {
            gte: adjustedSevenDaysAgo,
            lte: adjustedEndOfToday,
          },
        },
        _sum: {
          totalAmount: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          saleDate: "asc",
        },
      }),
    ]);

    logger.debug("✅ Todas as consultas executadas em paralelo");

    // Logs de debug para verificar os dados
    logger.debug("💰 Vendas de hoje:", {
      startOfToday: startOfToday.toISOString(),
      endOfToday: endOfToday.toISOString(),
      totalRevenue: Number(todayRevenue._sum.totalAmount || 0),
    });

    // Log detalhado da consulta de vendas diárias
    logger.debug("🔍 Consulta de vendas diárias (ajustada para UTC+3):", {
      adjustedSevenDaysAgo: adjustedSevenDaysAgo.toISOString(),
      adjustedEndOfToday: adjustedEndOfToday.toISOString(),
      originalSevenDaysAgo: sevenDaysAgo.toISOString(),
      originalEndOfToday: endOfToday.toISOString(),
      timezone: "Local (ajustado -1 dia para compensar UTC+3)",
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
      dates: typedDailySales.map(
        (item) => item.saleDate.toISOString().split("T")[0]
      ),
      revenues: typedDailySales.map((item) =>
        Number(item._sum.totalAmount || 0)
      ),
      salesCounts: typedDailySales.map((item) => item._count.id),
    });

    // Debug: verificar cada venda individualmente
    typedDailySales.forEach((sale, index) => {
      const saleDate = new Date(sale.saleDate);
      const year = saleDate.getFullYear();
      const month = String(saleDate.getMonth() + 1).padStart(2, "0");
      const day = String(saleDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      logger.debug(`📦 Venda ${index + 1}:`, {
        date: dateString,
        revenue: Number(sale._sum.totalAmount || 0),
        count: sale._count.id,
        fullDate: sale.saleDate.toISOString(),
        localDate: saleDate.toLocaleDateString(),
        originalDate: sale.saleDate,
      });
    });

    // Formatar vendas diárias - CORREÇÃO: forçar data local sem conversão de timezone
    const formattedDailySales = typedDailySales.map((item) => {
      // Forçar uso da data local sem conversão de timezone
      const saleDate = new Date(item.saleDate);
      const year = saleDate.getFullYear();
      const month = String(saleDate.getMonth() + 1).padStart(2, "0");
      const day = String(saleDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      logger.debug("📅 Formatando data (forçando local):", {
        original: item.saleDate.toISOString(),
        localDate: saleDate.toLocaleDateString(),
        formatted: dateString,
        revenue: Number(item._sum.totalAmount || 0),
        year: year,
        month: month,
        day: day,
      });

      return {
        date: dateString,
        revenue: Number(item._sum.totalAmount || 0),
        sales_count: item._count.id,
      };
    });

    // Preencher dias sem vendas com zero - CORREÇÃO: usar datas originais para exibição
    const completeDailySales = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo); // Usar data original para exibição
      date.setDate(sevenDaysAgo.getDate() + i);

      // Usar a mesma formatação forçando data local
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      const existingDay = formattedDailySales.find(
        (day) => day.date === dateString
      );
      const dayData = existingDay || {
        date: dateString,
        revenue: 0,
        sales_count: 0,
      };

      completeDailySales.push(dayData);

      // Debug: log de cada dia sendo processado
      logger.debug(`📅 Processando dia ${i + 1}:`, {
        date: dateString,
        localDate: date.toLocaleDateString(),
        hasData: !!existingDay,
        revenue: dayData.revenue,
        sales_count: dayData.sales_count,
        note: "Data de exibição (original), dados vêm de consulta ajustada",
      });
    }

    logger.debug("📈 Vendas diárias completas:", {
      totalDays: completeDailySales.length,
      dates: completeDailySales.map((day) => day.date),
      revenues: completeDailySales.map((day) => day.revenue),
    });

    // Log adicional para verificar as datas geradas
    logger.debug("📅 Datas geradas para preenchimento:", {
      sevenDaysAgo: (() => {
        const date = new Date(sevenDaysAgo);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      })(),
      today: (() => {
        const date = new Date(today);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      })(),
      generatedDates: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(sevenDaysAgo);
        date.setDate(sevenDaysAgo.getDate() + i);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }),
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

    // Criar resposta com cache público (5 minutos)
    const response = NextResponse.json(dashboardData);

    // Aplicar headers de cache
    Object.entries(cacheUtils.public(300, 600)).forEach(([key, value]) => {
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
