import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const saleId = parseInt(params.id);

    console.log("📡 Deletando venda:", { saleId });

    // Importar Prisma dinamicamente
    const { prisma } = await import("@/lib/prisma");

    // Verificar se o Prisma está disponível
    if (!prisma) {
      return NextResponse.json(
        { error: "Serviço indisponível" },
        { status: 503 }
      );
    }

    // Buscar a venda para obter informações antes de deletar
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        product: true,
      },
    });

    if (!sale) {
      return NextResponse.json(
        { error: "Venda não encontrada" },
        { status: 404 }
      );
    }

    // Usar transação para garantir consistência
    await prisma.$transaction(async (tx) => {
      // Deletar a venda
      await tx.sale.delete({
        where: { id: saleId },
      });

      // Restaurar o estoque do produto
      await tx.product.update({
        where: { id: sale.productId },
        data: {
          stockQuantity: {
            increment: sale.quantity,
          },
        },
      });
    });

    console.log("✅ Venda deletada com sucesso:", {
      saleId,
      productId: sale.productId,
      quantityRestored: sale.quantity,
    });

    return NextResponse.json({
      message: "Venda deletada com sucesso",
      restoredQuantity: sale.quantity,
    });
  } catch (error) {
    console.error("❌ Erro ao deletar venda:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
