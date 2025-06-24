import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";

// Forçar rota dinâmica para evitar problemas durante o build
export const dynamic = "force-dynamic";

// Verificar se estamos em ambiente de build
const isBuildTime =
  process.env.NODE_ENV === "production" && !process.env.DATABASE_URL;

export async function GET() {
  try {
    // Verificar se estamos em build time
    if (isBuildTime) {
      return NextResponse.json(
        { error: "Serviço indisponível durante build" },
        { status: 503 }
      );
    }

    // Verificar se o Prisma está disponível
    if (!prisma) {
      return NextResponse.json(
        { error: "Serviço indisponível" },
        { status: 503 }
      );
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formattedProducts = products.map((product) => ({
      ...product,
      costPrice: Number(product.costPrice),
      salePrice: Number(product.salePrice),
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);

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
  try {
    // Verificar se estamos em build time
    if (isBuildTime) {
      return NextResponse.json(
        { error: "Serviço indisponível durante build" },
        { status: 503 }
      );
    }

    // Verificar se o Prisma está disponível
    if (!prisma) {
      return NextResponse.json(
        { error: "Serviço indisponível" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    const product = await prisma.product.create({
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

    return NextResponse.json(formattedProduct, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar produto:", error);

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
      { error: "Erro ao criar produto" },
      { status: 500 }
    );
  }
}
