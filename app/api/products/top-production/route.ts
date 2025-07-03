import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("📡 Buscando ranking de produtos mais produzidos...");

    // Importar Prisma dinamicamente
    const { prisma } = await import("@/lib/prisma");

    // Verificar se o Prisma está disponível
    if (!prisma) {
      return NextResponse.json(
        { error: "Serviço indisponível" },
        { status: 503 }
      );
    }

    // Buscar o ranking de produtos mais produzidos
    const topProduction = await (prisma as any).productionHistory.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 10, // Top 10 produtos
    });

    console.log(
      `✅ ${topProduction.length} produtos encontrados no ranking de produção`
    );

    // Buscar detalhes dos produtos em uma única consulta
    const productIds = topProduction.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        category: true,
        size: true,
        stockQuantity: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Mapear os resultados com detalhes dos produtos
    const formattedTopProduction = topProduction.map((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        id: item.productId,
        name: product?.name || "Produto não encontrado",
        category: product?.category || "",
        size: product?.size || null,
        stockQuantity: product?.stockQuantity || 0,
        totalProduced: item._sum.quantity || 0,
        company: product?.company || null,
      };
    });

    return NextResponse.json(formattedTopProduction);
  } catch (error) {
    console.error("❌ Erro ao buscar ranking de produção:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
