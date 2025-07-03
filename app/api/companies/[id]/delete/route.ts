import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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

    // Verificar se a empresa existe
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se a empresa tem produtos
    if (existingCompany._count.products > 0) {
      return NextResponse.json(
        {
          error: "Não é possível excluir a empresa",
          message: `Delete todos os produtos referentes à empresa "${existingCompany.name}" para prosseguir com a exclusão da empresa.`,
          productCount: existingCompany._count.products,
        },
        { status: 400 }
      );
    }

    // Deletar a empresa (não tem produtos, então é seguro)
    await prisma.company.delete({
      where: { id: companyId },
    });

    console.log("✅ Empresa deletada:", existingCompany.name);

    return NextResponse.json({
      message: "Empresa deletada com sucesso",
      deletedCompany: existingCompany.name,
    });
  } catch (error) {
    console.error("❌ Erro ao deletar empresa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
