import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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

    // Verificar se a empresa existe
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    // Atualizar apenas o status
    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        isActive: body.isActive,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    console.log(
      "✅ Status da empresa atualizado:",
      company.name,
      "isActive:",
      company.isActive
    );

    return NextResponse.json(company);
  } catch (error) {
    console.error("❌ Erro ao atualizar status da empresa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
