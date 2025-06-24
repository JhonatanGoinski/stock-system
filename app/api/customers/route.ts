import { type NextRequest, NextResponse } from "next/server";
import { customerSchema } from "@/lib/validations";

// Forçar rota dinâmica para evitar problemas durante o build
export const dynamic = "force-dynamic";

// Verificar se estamos em ambiente de build
const isBuildTime =
  process.env.NODE_ENV === "production" && !process.env.DATABASE_URL;

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");

    const customers = await prisma.customer.findMany({
      where: active === "true" ? { isActive: true } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { sales: true },
        },
      },
    });

    const formattedCustomers = customers.map((customer) => ({
      ...customer,
      salesCount: customer._count.sales,
      _count: undefined,
    }));

    return NextResponse.json(formattedCustomers);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);

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
    const validatedData = customerSchema.parse(body);

    const customer = await prisma.customer.create({
      data: {
        name: validatedData.name,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        document: validatedData.document || null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        state: validatedData.state || null,
        zipCode: validatedData.zip_code || null,
        notes: validatedData.notes || null,
        isActive: validatedData.is_active,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);

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
      { error: "Erro ao criar cliente" },
      { status: 500 }
    );
  }
}
