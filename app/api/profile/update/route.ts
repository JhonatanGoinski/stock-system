import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, company, role, password } = body;

    // Validações básicas
    if (!name || !email || !company || !role) {
      return NextResponse.json(
        { message: "Todos os campos obrigatórios devem ser preenchidos" },
        { status: 400 }
      );
    }

    // Verificar se o email já existe (exceto para o usuário atual)
    const existingUser = await prisma?.loginCredentials.findFirst({
      where: {
        email: email,
        NOT: {
          email: session.user.email,
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Este email já está em uso por outro usuário" },
        { status: 400 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = {
      name,
      email,
      company,
      role,
    };

    // Adicionar senha apenas se foi fornecida
    if (password && password.trim() !== "") {
      updateData.password = password; // Salvar sem hash conforme solicitado
    }

    // Atualizar o registro na tabela login_credentials
    const updatedUser = await prisma?.loginCredentials.update({
      where: {
        email: session.user.email,
      },
      data: updateData,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { message: "Erro ao atualizar usuário" },
        { status: 500 }
      );
    }

    // Retornar dados atualizados para atualização da sessão
    return NextResponse.json({
      message: "Perfil atualizado com sucesso",
      user: {
        id: updatedUser.id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        company: updatedUser.company,
        role: updatedUser.role,
      },
      success: true,
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
