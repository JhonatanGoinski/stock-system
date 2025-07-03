import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filtros
    const isActiveParam = searchParams.get("isActive");
    const nameParam = searchParams.get("name");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "100", 10);

    const where: any = {};
    if (isActiveParam !== null) {
      where.isActive = isActiveParam === "true";
    }
    if (nameParam) {
      where.name = { contains: nameParam, mode: "insensitive" };
    }

    // Importar Prisma dinamicamente
    const { prisma } = await import("@/lib/prisma");

    // Verificar se o Prisma está disponível
    if (!prisma) {
      return NextResponse.json(
        { error: "Serviço indisponível" },
        { status: 503 }
      );
    }

    // Buscar empresas com filtro e paginação
    const companies = await prisma.company.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(companies);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Importar Prisma dinamicamente
    const { prisma } = await import("@/lib/prisma");

    // Verificar se o Prisma está disponível
    if (!prisma) {
      return NextResponse.json(
        { error: "Serviço indisponível" },
        { status: 503 }
      );
    }

    const body = await request.json();

    // Validação básica
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: "Nome da empresa é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se CNPJ já existe (se fornecido)
    if (body.cnpj) {
      const existingCompany = await prisma.company.findUnique({
        where: { cnpj: body.cnpj },
      });

      if (existingCompany) {
        return NextResponse.json(
          { error: "CNPJ já cadastrado" },
          { status: 400 }
        );
      }
    }

    const company = await prisma.company.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        cnpj: body.cnpj?.trim() || null,
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        address: body.address?.trim() || null,
        city: body.city?.trim() || null,
        state: body.state?.trim() || null,
        zipCode: body.zipCode?.trim() || null,
        isActive: true,
      },
    });

    console.log("✅ Empresa criada:", company.name);

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error("❌ Erro ao criar empresa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
