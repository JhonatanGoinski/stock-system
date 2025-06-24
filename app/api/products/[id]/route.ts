import { type NextRequest, NextResponse } from "next/server";
import { productSchema } from "@/lib/validations";

// Forçar rota dinâmica para evitar problemas durante o build
export const dynamic = "force-dynamic";

// Verificar se estamos em ambiente de build
const isBuildTime =
  process.env.NODE_ENV === "production" && !process.env.DATABASE_URL;

export async function GET(
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

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    const formattedProduct = {
      ...product,
      costPrice: Number(product.costPrice),
      salePrice: Number(product.salePrice),
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);

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

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Produto deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);

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
