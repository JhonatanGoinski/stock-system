import { type NextRequest, NextResponse } from "next/server";
import { saleSchema } from "@/lib/validations";
import {
  logger,
  createDateWithoutTimezone,
  createDateRange,
  forceDateWithoutTimezone,
  createDateRangeWithTimezone,
  dateToString,
  getCurrentDateUTC,
} from "@/lib/utils";

// Forçar rota dinâmica para evitar problemas durante o build
export const dynamic = "force-dynamic";

// Verificar se estamos em ambiente de build (apenas quando não há DATABASE_URL)
const isBuildTime =
  process.env.NODE_ENV === "production" && !process.env.DATABASE_URL;

export async function GET(request: NextRequest) {
  // Se estamos em build time, retornar imediatamente
  if (isBuildTime) {
    logger.build("🚫 Build time detected, skipping Prisma operations");
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
      logger.error("❌ Prisma não disponível");
      return NextResponse.json(
        { error: "Serviço indisponível" },
        { status: 503 }
      );
    }

    logger.info("✅ Prisma disponível, executando query...");

    // Obter parâmetros de filtro
    const { searchParams } = new URL(request.url);
    const dateFilter = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Construir filtro de data usando UTC zerado
    let dateWhereClause = {};
    if (dateFilter) {
      // Filtro por data específica
      const dateObj = new Date(dateFilter);
      const utcDate = new Date(
        Date.UTC(
          dateObj.getFullYear(),
          dateObj.getMonth(),
          dateObj.getDate(),
          0,
          0,
          0,
          0
        )
      );

      dateWhereClause = {
        saleDate: utcDate,
      };
    } else if (startDate && endDate) {
      // Filtro por intervalo de datas
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      const startUtcDate = new Date(
        Date.UTC(
          startDateObj.getFullYear(),
          startDateObj.getMonth(),
          startDateObj.getDate(),
          0,
          0,
          0,
          0
        )
      );

      const endUtcDate = new Date(
        Date.UTC(
          endDateObj.getFullYear(),
          endDateObj.getMonth(),
          endDateObj.getDate(),
          23,
          59,
          59,
          999
        )
      );

      dateWhereClause = {
        saleDate: {
          gte: startUtcDate,
          lte: endUtcDate,
        },
      };
    }

    const sales = await prisma.sale.findMany({
      where: dateWhereClause,
      include: {
        product: {
          select: {
            name: true,
            category: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedSales = sales.map((sale) => ({
      id: sale.id,
      productId: sale.productId,
      customerId: sale.customerId,
      quantity: sale.quantity,
      unitPrice: Number(sale.unitPrice),
      totalAmount: Number(sale.totalAmount),
      discount: Number(sale.discount || 0),
      notes: sale.notes,
      saleDate: sale.saleDate,
      createdAt: sale.createdAt,
      product: {
        name: sale.product.name,
        category: sale.product.category,
        company: sale.product.company,
      },
      customer: sale.customer
        ? {
            name: sale.customer.name,
            email: sale.customer.email,
          }
        : null,
    }));

    logger.success(`✅ ${formattedSales.length} vendas formatadas`);
    return NextResponse.json(formattedSales);
  } catch (error) {
    logger.error("❌ Erro ao buscar vendas:", error);

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
    const validatedData = saleSchema.parse(body);

    // Verificar se o produto existe e tem estoque
    const product = await prisma.product.findUnique({
      where: { id: validatedData.product_id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    if (product.stockQuantity < validatedData.quantity) {
      return NextResponse.json(
        { error: "Estoque insuficiente" },
        { status: 400 }
      );
    }

    // Verificar se o cliente existe (se fornecido)
    if (validatedData.customer_id) {
      const customer = await prisma.customer.findUnique({
        where: { id: validatedData.customer_id },
      });

      if (!customer) {
        return NextResponse.json(
          { error: "Cliente não encontrado" },
          { status: 404 }
        );
      }
    }

    const discount = validatedData.discount || 0;
    const subtotal = validatedData.quantity * validatedData.unit_price;
    const total_amount = subtotal - discount;

    // Criar venda e atualizar estoque em transação
    const result = await prisma.$transaction(async (tx) => {
      // SEMPRE usar a data fornecida pelo usuário (frontend já envia a data correta)
      const saleDateToSave = forceDateWithoutTimezone(validatedData.sale_date);

      console.log("📅 Salvando venda com data:", {
        originalDate: validatedData.sale_date,
        saleDateToSave: saleDateToSave,
        saleDateToSaveISO: saleDateToSave.toISOString(),
        saleDateToSaveLocal: saleDateToSave.toLocaleDateString("pt-BR"),
        currentTime: new Date().toLocaleString("pt-BR"),
        note: "Forçando data sem timezone para garantir dia correto",
      });

      const sale = await tx.sale.create({
        data: {
          productId: validatedData.product_id,
          customerId: validatedData.customer_id || null,
          quantity: validatedData.quantity,
          unitPrice: validatedData.unit_price,
          totalAmount: total_amount,
          discount: discount,
          notes: validatedData.notes || null,
          saleDate: saleDateToSave,
        },
        include: {
          product: {
            select: {
              name: true,
              category: true,
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      // Atualizar estoque
      await tx.product.update({
        where: { id: validatedData.product_id },
        data: {
          stockQuantity: {
            decrement: validatedData.quantity,
          },
        },
      });

      return sale;
    });

    // Formatar a resposta para seguir o mesmo padrão do GET
    const formattedSale = {
      id: result.id,
      productId: result.productId,
      customerId: result.customerId,
      quantity: result.quantity,
      unitPrice: Number(result.unitPrice),
      totalAmount: Number(result.totalAmount),
      discount: Number(result.discount || 0),
      notes: result.notes,
      saleDate: result.saleDate,
      createdAt: result.createdAt,
      product: {
        name: result.product.name,
        category: result.product.category,
        company: result.product.company,
      },
      customer: result.customer
        ? {
            name: result.customer.name,
            email: result.customer.email,
          }
        : null,
    };

    console.log("✅ Venda criada e formatada:", formattedSale);
    console.log("✅ Tipo da venda:", typeof formattedSale);
    console.log(
      "✅ Estrutura da venda:",
      JSON.stringify(formattedSale, null, 2)
    );
    return NextResponse.json(formattedSale, { status: 201 });
  } catch (error) {
    console.error("Erro ao registrar venda:", error);

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
      { error: "Erro ao registrar venda" },
      { status: 500 }
    );
  }
}
