import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saleSchema } from "@/lib/validations";

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        product: {
          select: {
            name: true,
            category: true,
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { saleDate: "desc" },
    });

    console.log("Vendas encontradas:", sales.length);

    const formattedSales = sales.map((sale) => ({
      id: sale.id,
      productId: sale.productId,
      customerId: sale.customerId,
      quantity: sale.quantity,
      unitPrice: Number(sale.unitPrice),
      totalAmount: Number(sale.totalAmount),
      discount: Number(sale.discount || 0),
      notes: sale.notes,
      saleDate: sale.saleDate,
      createdAt: sale.createdAt,
      product: {
        name: sale.product.name,
        category: sale.product.category,
      },
      customer: sale.customer
        ? {
            name: sale.customer.name,
            email: sale.customer.email,
          }
        : null,
    }));

    console.log("Vendas formatadas:", formattedSales.length);
    return NextResponse.json(formattedSales);
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = saleSchema.parse(body);

    // Verificar se o produto existe e tem estoque
    const product = await prisma.product.findUnique({
      where: { id: validatedData.product_id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    if (product.stockQuantity < validatedData.quantity) {
      return NextResponse.json(
        { error: "Estoque insuficiente" },
        { status: 400 }
      );
    }

    // Verificar se o cliente existe (se fornecido)
    if (validatedData.customer_id) {
      const customer = await prisma.customer.findUnique({
        where: { id: validatedData.customer_id },
      });
      if (!customer) {
        return NextResponse.json(
          { error: "Cliente não encontrado" },
          { status: 404 }
        );
      }
    }

    const discount = validatedData.discount || 0;
    const subtotal = validatedData.quantity * validatedData.unit_price;
    const total_amount = subtotal - discount;

    // Criar venda e atualizar estoque em transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar venda
      const sale = await tx.sale.create({
        data: {
          productId: validatedData.product_id,
          customerId: validatedData.customer_id || null,
          quantity: validatedData.quantity,
          unitPrice: validatedData.unit_price,
          totalAmount: total_amount,
          discount: discount,
          notes: validatedData.notes || null,
        },
      });

      // Atualizar estoque
      await tx.product.update({
        where: { id: validatedData.product_id },
        data: {
          stockQuantity: {
            decrement: validatedData.quantity,
          },
        },
      });

      return sale;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro ao registrar venda:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: (error as any).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao registrar venda" },
      { status: 500 }
    );
  }
}
