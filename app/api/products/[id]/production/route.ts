import { NextRequest, NextResponse } from "next/server";
import {
  createDateWithoutTimezone,
  forceDateWithoutTimezone,
} from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    console.log("📡 Buscando histórico de produção:", { productId });

    // Importar Prisma dinamicamente
    const { prisma } = await import("@/lib/prisma");

    // Verificar se o Prisma está disponível
    if (!prisma) {
      return NextResponse.json(
        { error: "Serviço indisponível" },
        { status: 503 }
      );
    }

    // Buscar o histórico de produção do produto
    const productionHistory = await (prisma as any).productionHistory.findMany({
      where: { productId },
      orderBy: { productionDate: "desc" },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(
      `✅ ${productionHistory.length} registros de produção encontrados`
    );

    // Formatar as datas corretamente antes de retornar
    const formattedHistory = productionHistory.map((record: any) => ({
      ...record,
      productionDate: record.productionDate.toLocaleDateString("pt-BR"),
      createdAt: record.createdAt.toLocaleDateString("pt-BR"),
    }));

    return NextResponse.json(formattedHistory);
  } catch (error) {
    console.error("❌ Erro ao buscar histórico de produção:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    const { quantity, productionDate, notes } = await request.json();

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "Quantidade deve ser maior que zero" },
        { status: 400 }
      );
    }

    // Usar a data fornecida ou a data atual - sempre forçada sem timezone
    const dateToUse = productionDate
      ? forceDateWithoutTimezone(productionDate)
      : forceDateWithoutTimezone(new Date());

    console.log("📡 Adicionando produção:", {
      productId,
      quantity,
      productionDate: dateToUse,
      productionDateISO: dateToUse.toISOString(),
      productionDateString: dateToUse.toLocaleDateString("pt-BR"),
      notes,
    });

    // Importar Prisma dinamicamente
    const { prisma } = await import("@/lib/prisma");

    // Verificar se o Prisma está disponível
    if (!prisma) {
      return NextResponse.json(
        { error: "Serviço indisponível" },
        { status: 503 }
      );
    }

    // Buscar o produto atual
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!currentProduct) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Usar transação para garantir consistência
    const result = await prisma.$transaction(async (tx) => {
      // Atualizar o estoque adicionando a quantidade de produção
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          stockQuantity: {
            increment: quantity,
          },
        },
      });

      // Registrar no histórico de produção
      const productionRecord = await (tx as any).productionHistory.create({
        data: {
          productId,
          quantity,
          productionDate: dateToUse,
          notes: notes || null,
        },
      });

      return { updatedProduct, productionRecord };
    });

    console.log("✅ Produção adicionada com sucesso:", {
      productId,
      quantity,
      newStock: result.updatedProduct.stockQuantity,
      productionDate: dateToUse,
      productionDateISO: dateToUse.toISOString(),
      productionDateString: dateToUse.toLocaleDateString("pt-BR"),
    });

    return NextResponse.json({
      message: `Produção de ${quantity} unidades adicionada com sucesso`,
      product: result.updatedProduct,
      productionRecord: result.productionRecord,
    });
  } catch (error) {
    console.error("❌ Erro ao adicionar produção:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
