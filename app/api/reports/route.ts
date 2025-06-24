import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Verificar se o Prisma está disponível
    if (!prisma) {
      return NextResponse.json(
        { error: "Serviço indisponível" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const customerId = searchParams.get("customerId");
    const productId = searchParams.get("productId");
    const format = searchParams.get("format");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Datas são obrigatórias" },
        { status: 400 }
      );
    }

    const whereClause: any = {
      saleDate: {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1),
      },
    };

    if (customerId && customerId !== "all") {
      whereClause.customerId = Number.parseInt(customerId);
    }

    if (productId && productId !== "all") {
      whereClause.productId = Number.parseInt(productId);
    }

    // Buscar vendas com detalhes
    const sales = await prisma.sale.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            name: true,
            category: true,
            costPrice: true,
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: { saleDate: "desc" },
    });

    // Calcular resumo
    const totalSales = sales.length;
    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number(sale.totalAmount),
      0
    );
    const totalCost = sales.reduce(
      (sum, sale) => sum + Number(sale.product.costPrice) * sale.quantity,
      0
    );
    const totalProfit = totalRevenue - totalCost;
    const totalItems = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalDiscount = sales.reduce(
      (sum, sale) => sum + Number(sale.discount || 0),
      0
    );
    const profitMargin =
      totalRevenue > 0
        ? ((totalProfit / totalRevenue) * 100).toFixed(2)
        : "0.00";

    // Estatísticas de clientes
    const customerStats = await prisma.sale.groupBy({
      by: ["customerId"],
      where: {
        ...whereClause,
        customerId: { not: null },
      },
      _sum: {
        totalAmount: true,
        quantity: true,
      },
      _count: {
        id: true,
      },
    });

    const customerStatsWithDetails = await Promise.all(
      customerStats.map(async (stat) => {
        // O erro "'prisma' is possibly 'undefined'" pode ocorrer se o objeto prisma não estiver importado corretamente.
        // Certifique-se de que o prisma está importado no topo do arquivo:
        // import { prisma } from "@/lib/prisma";
        // Se já estiver importado, adicione uma checagem de segurança:
        if (!prisma) {
          throw new Error("Prisma não está definido.");
        }
        const customer = await prisma.customer.findUnique({
          where: { id: stat.customerId! },
          select: {
            name: true,
            email: true,
            phone: true,
            city: true,
            state: true,
          },
        });
        return {
          name: customer?.name || "Cliente não encontrado",
          email: customer?.email,
          phone: customer?.phone,
          city: customer?.city,
          state: customer?.state,
          totalSpent: Number(stat._sum.totalAmount || 0),
          totalItems: stat._sum.quantity || 0,
          salesCount: stat._count.id,
        };
      })
    );

    // Estatísticas de produtos
    const productStats = await prisma.sale.groupBy({
      by: ["productId"],
      where: whereClause,
      _sum: {
        quantity: true,
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    const productStatsWithDetails = await Promise.all(
      productStats.map(async (stat) => {
        // O erro "'prisma' is possibly 'undefined'" pode ocorrer se o objeto prisma não estiver importado corretamente.
        // Certifique-se de que o prisma está importado no topo do arquivo:
        // import { prisma } from "@/lib/prisma";
        // Se já estiver importado, adicione uma checagem de segurança:
        if (!prisma) {
          throw new Error("Prisma não está definido.");
        }
        const product = await prisma.product.findUnique({
          where: { id: stat.productId },
          select: { name: true, category: true },
        });
        return {
          name: product?.name || "Produto não encontrado",
          category: product?.category || "",
          totalSold: stat._sum.quantity || 0,
          totalRevenue: Number(stat._sum.totalAmount || 0),
          salesCount: stat._count.id,
        };
      })
    );

    const formattedSales = sales.map((sale) => ({
      id: sale.id,
      date: sale.saleDate.toLocaleDateString("pt-BR"),
      time: sale.saleDate.toLocaleTimeString("pt-BR"),
      product_name: sale.product.name,
      product_category: sale.product.category,
      customer_name: sale.customer?.name || "Venda Balcão",
      customer_email: sale.customer?.email || null,
      customer_phone: sale.customer?.phone || null,
      customer_city: sale.customer?.city || null,
      customer_state: sale.customer?.state || null,
      quantity: sale.quantity,
      unit_price: Number(sale.unitPrice),
      discount: Number(sale.discount || 0),
      total_amount: Number(sale.totalAmount),
      cost_price: Number(sale.product.costPrice),
      profit:
        Number(sale.totalAmount) -
        Number(sale.product.costPrice) * sale.quantity,
      notes: sale.notes,
    }));

    const reportData = {
      summary: {
        totalSales,
        totalRevenue,
        totalCost,
        totalProfit,
        totalItems,
        totalDiscount,
        profitMargin,
      },
      sales: formattedSales,
      customerStats: customerStatsWithDetails.sort(
        (a, b) => b.totalSpent - a.totalSpent
      ),
      productStats: productStatsWithDetails.sort(
        (a, b) => b.totalRevenue - a.totalRevenue
      ),
    };

    // Se formato for CSV, retornar CSV
    if (format === "csv") {
      const csvHeaders = [
        "Data",
        "Hora",
        "Produto",
        "Categoria",
        "Cliente",
        "Email",
        "Telefone",
        "Cidade",
        "Estado",
        "Quantidade",
        "Preço Unit.",
        "Desconto",
        "Total",
        "Custo",
        "Lucro",
        "Observações",
      ];

      const csvRows = formattedSales.map((sale) => [
        sale.date,
        sale.time,
        sale.product_name,
        sale.product_category,
        sale.customer_name,
        sale.customer_email || "",
        sale.customer_phone || "",
        sale.customer_city || "",
        sale.customer_state || "",
        sale.quantity,
        sale.unit_price.toFixed(2),
        sale.discount.toFixed(2),
        sale.total_amount.toFixed(2),
        sale.cost_price.toFixed(2),
        sale.profit.toFixed(2),
        sale.notes || "",
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="relatorio-vendas-${startDate}-${endDate}.csv"`,
        },
      });
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);

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
