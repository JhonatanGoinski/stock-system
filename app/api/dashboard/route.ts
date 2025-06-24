import { NextResponse } from "next/server";

// Forçar rota dinâmica para evitar problemas durante o build
export const dynamic = "force-dynamic";

// Verificar se estamos em ambiente de build (apenas quando não há DATABASE_URL)
const isBuildTime =
  process.env.NODE_ENV === "production" && !process.env.DATABASE_URL;

export async function GET() {
  // Se estamos em build time, retornar imediatamente
  if (isBuildTime) {
    console.log("🚫 Build time detected, skipping Prisma operations");
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
      console.log("❌ Prisma não disponível");
      return NextResponse.json(
        { error: "Serviço indisponível" },
        { status: 503 }
      );
    }

    console.log("✅ Prisma disponível, executando query...");

    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Vendas de hoje
    const todayRevenue = await prisma.sale.aggregate({
      where: {
        saleDate: {
          gte: startOfToday,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Vendas do mês
    const monthRevenue = await prisma.sale.aggregate({
      where: {
        saleDate: {
          gte: startOfMonth,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Total de clientes ativos
    const totalCustomers = await prisma.customer.count({
      where: { isActive: true },
    });

    // Produtos mais vendidos (últimos 30 dias)
    const topProducts = await prisma.sale.groupBy({
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
    });

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, category: true },
        });
        return {
          name: product?.name || "Produto não encontrado",
          category: product?.category || "",
          total_sold: item._sum.quantity || 0,
          revenue: Number(item._sum.totalAmount || 0),
        };
      })
    );

    // Top clientes (últimos 30 dias)
    const topCustomers = await prisma.sale.groupBy({
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
    });

    const topCustomersWithDetails = await Promise.all(
      topCustomers.map(async (item) => {
        const customer = await prisma.customer.findUnique({
          where: { id: item.customerId! },
          select: { name: true, email: true },
        });
        return {
          name: customer?.name || "Cliente não encontrado",
          email: customer?.email,
          total_spent: Number(item._sum.totalAmount || 0),
          total_items: item._sum.quantity || 0,
        };
      })
    );

    // Produtos com estoque baixo
    const lowStockProducts = await prisma.product.findMany({
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
    });

    // Vendas dos últimos 7 dias
    const dailySales = await prisma.sale.groupBy({
      by: ["saleDate"],
      where: {
        saleDate: {
          gte: sevenDaysAgo,
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
    });

    const formattedDailySales = dailySales.map((item) => ({
      date: item.saleDate.toISOString().split("T")[0],
      revenue: Number(item._sum.totalAmount || 0),
      sales_count: item._count.id,
    }));

    const dashboardData = {
      todayRevenue: Number(todayRevenue._sum.totalAmount || 0),
      monthRevenue: Number(monthRevenue._sum.totalAmount || 0),
      totalCustomers,
      topProducts: topProductsWithDetails,
      topCustomers: topCustomersWithDetails,
      lowStockProducts,
      dailySales: formattedDailySales,
    };

    console.log("✅ Dados do dashboard carregados com sucesso");
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("❌ Erro ao carregar dados do dashboard:", error);

    // Verificar se é um erro de conexão com o banco
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string };
      if (
        prismaError.code === "P1001" ||
        prismaError.code === "P1002" ||
        prismaError.code === "P1003"
      ) {
        return NextResponse.json(
          { error: "Erro de conexão com o banco de dados" },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
