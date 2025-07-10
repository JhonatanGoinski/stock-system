import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const productId = parseInt(params.id);

    console.log("📡 Exportando histórico de produção:", { productId });

    // Importar Prisma dinamicamente
    const { prisma } = await import("@/lib/prisma");

    // Verificar se o Prisma está disponível
    if (!prisma) {
      return NextResponse.json(
        { error: "Serviço indisponível" },
        { status: 503 }
      );
    }

    // Buscar o produto com dados da empresa e histórico de produção
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            cnpj: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
          },
        },
        productionHistory: {
          orderBy: { productionDate: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Calcular totais
    const totalProduced = product.productionHistory.reduce(
      (sum, record) => sum + record.quantity,
      0
    );

    const totalCost = product.productionHistory.reduce(
      (sum, record) => sum + Number(product.costPrice) * record.quantity,
      0
    );

    const totalRevenue = product.productionHistory.reduce(
      (sum, record) => sum + Number(product.salePrice) * record.quantity,
      0
    );

    const totalProfit = totalRevenue - totalCost;

    // Formatar dados para o PDF
    const exportData = {
      product: {
        id: product.id,
        name: product.name,
        category: product.category,
        size: product.size,
        costPrice: Number(product.costPrice),
        salePrice: Number(product.salePrice),
        stockQuantity: product.stockQuantity,
      },
      company: product.company,
      productionHistory: product.productionHistory.map((record) => ({
        id: record.id,
        quantity: record.quantity,
        productionDate: record.productionDate.toLocaleDateString("pt-BR"),
        notes: record.notes,
        createdAt: record.createdAt.toLocaleDateString("pt-BR"),
      })),
      totals: {
        totalProduced,
        totalCost,
        totalRevenue,
        totalProfit,
      },
      exportDate: new Date().toLocaleDateString("pt-BR"),
    };

    console.log("✅ Dados preparados para exportação:", {
      productName: product.name,
      totalRecords: product.productionHistory.length,
      totalProduced,
    });

    return NextResponse.json(exportData);
  } catch (error) {
    console.error("❌ Erro ao exportar histórico de produção:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
