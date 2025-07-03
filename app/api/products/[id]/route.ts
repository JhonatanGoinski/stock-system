import { type NextRequest, NextResponse } from "next/server";
import { productSchema } from "@/lib/validations";

// Forçar rota dinâmica para evitar problemas durante o build
export const dynamic = "force-dynamic";

// Verificar se estamos em ambiente de build (apenas quando não há DATABASE_URL)
const isBuildTime =
  process.env.NODE_ENV === "production" && !process.env.DATABASE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const id = Number.parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        sales: {
          include: {
            customer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            saleDate: "desc",
          },
        },
        _count: {
          select: {
            sales: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    const totalRevenue = product.sales.reduce(
      (sum, sale) => sum + Number(sale.totalAmount),
      0
    );
    const totalQuantity = product.sales.reduce(
      (sum, sale) => sum + sale.quantity,
      0
    );

    const formattedProduct = {
      ...product,
      costPrice: Number(product.costPrice),
      salePrice: Number(product.salePrice),
      sales: product.sales.map((sale) => ({
        ...sale,
        customer: sale.customer,
        unitPrice: Number(sale.unitPrice),
        totalAmount: Number(sale.totalAmount),
        discount: Number(sale.discount || 0),
      })),
      totalRevenue,
      totalQuantity,
      salesCount: product._count.sales,
      _count: undefined,
    };

    console.log("✅ Produto encontrado:", product.name);
    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error("❌ Erro ao buscar produto:", error);

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const id = Number.parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        category: validatedData.category,
        size: validatedData.size || null,
        costPrice: validatedData.cost_price,
        salePrice: validatedData.sale_price,
        stockQuantity: validatedData.stock_quantity,
        companyId: validatedData.company_id || null,
      },
    });

    const formattedProduct = {
      ...product,
      costPrice: Number(product.costPrice),
      salePrice: Number(product.salePrice),
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);

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
      { error: "Erro ao atualizar produto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("🔍 DELETE request recebida para produto:", params.id);

  // Se estamos em build time, retornar imediatamente
  if (isBuildTime) {
    console.log("🚫 Build time detected, skipping DELETE operation");
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
      console.log("❌ Prisma não disponível para DELETE");
      return NextResponse.json(
        { error: "Serviço indisponível" },
        { status: 503 }
      );
    }

    const id = Number.parseInt(params.id);
    if (isNaN(id)) {
      console.log("❌ ID inválido:", params.id);
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    console.log("🔍 Verificando se produto existe:", id);

    // Verificar se o produto existe
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      console.log("❌ Produto não encontrado:", id);
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    console.log("✅ Produto encontrado, deletando:", product.name);

    // Deletar o produto (as vendas serão deletadas automaticamente devido ao onDelete: Cascade)
    await prisma.product.delete({
      where: { id },
    });

    console.log("✅ Produto deletado com sucesso:", product.name);
    return NextResponse.json({
      message: "Produto deletado com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro ao deletar produto:", error);

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
      { error: "Erro ao deletar produto" },
      { status: 500 }
    );
  }
}
