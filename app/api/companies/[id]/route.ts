import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = parseInt(params.id);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: "ID da empresa inválido" },
        { status: 400 }
      );
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

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            category: true,
            stockQuantity: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("❌ Erro ao buscar empresa:", error);
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
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const companyId = parseInt(params.id);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: "ID da empresa inválido" },
        { status: 400 }
      );
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

    // Verificar se CNPJ já existe em outra empresa (se fornecido)
    if (body.cnpj) {
      const existingCompany = await prisma.company.findFirst({
        where: {
          cnpj: body.cnpj,
          id: { not: companyId },
        },
      });

      if (existingCompany) {
        return NextResponse.json(
          { error: "CNPJ já cadastrado em outra empresa" },
          { status: 400 }
        );
      }
    }

    const company = await prisma.company.update({
      where: { id: companyId },
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
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    });

    console.log("✅ Empresa atualizada:", company.name);

    return NextResponse.json(company);
  } catch (error) {
    console.error("❌ Erro ao atualizar empresa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const companyId = parseInt(params.id);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: "ID da empresa inválido" },
        { status: 400 }
      );
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

    // Verificar se a empresa tem produtos
    const companyWithProducts = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!companyWithProducts) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    if (companyWithProducts._count.products > 0) {
      return NextResponse.json(
        {
          error:
            "Não é possível excluir uma empresa que possui produtos cadastrados",
          productCount: companyWithProducts._count.products,
        },
        { status: 400 }
      );
    }

    // Excluir a empresa
    await prisma.company.delete({
      where: { id: companyId },
    });

    console.log("✅ Empresa excluída:", companyId);

    return NextResponse.json({ message: "Empresa excluída com sucesso" });
  } catch (error) {
    console.error("❌ Erro ao excluir empresa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
