import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { productSchema } from "@/lib/validations"

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    })

    const formattedProducts = products.map((product) => ({
      ...product,
      costPrice: Number(product.costPrice),
      salePrice: Number(product.salePrice),
    }))

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = productSchema.parse(body)

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
    })

    const formattedProduct = {
      ...product,
      costPrice: Number(product.costPrice),
      salePrice: Number(product.salePrice),
    }

    return NextResponse.json(formattedProduct, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 })
  }
}
