import { type NextRequest, NextResponse } from "next/server";
import { saleSchema } from "@/lib/validations";

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
    console.error("❌ Erro ao buscar vendas:", error);

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

export async function POST(request: NextRequest) {
  // Se estamos em build time, retornar imediatamente
  if (isBuildTime) {
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
      return NextResponse.json(
        { error: "Serviço indisponível" },
        { status: 503 }
      );
    }

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

    if (error && typeof error === "object" && "name" in error) {
      const zodError = error as { name: string };
      if (zodError.name === "ZodError") {
        return NextResponse.json(
          { error: "Dados inválidos", details: (error as any).errors },
          { status: 400 }
        );
      }
    }

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
      { error: "Erro ao registrar venda" },
      { status: 500 }
    );
  }
}
