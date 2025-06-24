import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations";

// Forçar rota dinâmica para evitar problemas durante o build
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        sales: {
          include: {
            product: {
              select: {
                name: true,
                category: true,
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

    if (!customer) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    const totalSpent = customer.sales.reduce(
      (sum, sale) => sum + Number(sale.totalAmount),
      0
    );
    const totalItems = customer.sales.reduce(
      (sum, sale) => sum + sale.quantity,
      0
    );

    const formattedCustomer = {
      ...customer,
      sales: customer.sales.map((sale) => ({
        ...sale,
        unitPrice: Number(sale.unitPrice),
        totalAmount: Number(sale.totalAmount),
        discount: Number(sale.discount || 0),
      })),
      totalSpent,
      totalItems,
      salesCount: customer._count.sales,
      _count: undefined,
    };

    return NextResponse.json(formattedCustomer);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);

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
    const validatedData = customerSchema.parse(body);

    const customer = await prisma.customer.update({
      where: { id },
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

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);

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
      { error: "Erro ao atualizar cliente" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const salesCount = await prisma.sale.count({
      where: { customerId: id },
    });

    if (salesCount > 0) {
      await prisma.customer.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        message: "Cliente desativado com sucesso (possui vendas)",
      });
    } else {
      await prisma.customer.delete({
        where: { id },
      });
      return NextResponse.json({
        message: "Cliente deletado com sucesso",
      });
    }
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);

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
      { error: "Erro ao deletar cliente" },
      { status: 500 }
    );
  }
}
