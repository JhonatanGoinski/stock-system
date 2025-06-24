import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { productSchema } from "@/lib/validations"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    const formattedProduct = {
      ...product,
      costPrice: Number(product.costPrice),
      salePrice: Number(product.salePrice),
    }

    return NextResponse.json(formattedProduct)
  } catch (error) {
    console.error("Erro ao buscar produto:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = productSchema.parse(body)

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
    })

    const formattedProduct = {
      ...product,
      costPrice: Number(product.costPrice),
      salePrice: Number(product.salePrice),
    }

    return NextResponse.json(formattedProduct)
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Produto deletado com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar produto:", error)
    return NextResponse.json({ error: "Erro ao deletar produto" }, { status: 500 })
  }
}
