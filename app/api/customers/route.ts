import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { customerSchema } from "@/lib/validations"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get("active")

    const customers = await prisma.customer.findMany({
      where: active === "true" ? { isActive: true } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { sales: true },
        },
      },
    })

    const formattedCustomers = customers.map((customer) => ({
      ...customer,
      salesCount: customer._count.sales,
      _count: undefined,
    }))

    return NextResponse.json(formattedCustomers)
  } catch (error) {
    console.error("Erro ao buscar clientes:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = customerSchema.parse(body)

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
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar cliente:", error)
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 })
  }
}
