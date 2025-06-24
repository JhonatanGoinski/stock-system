import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Função helper para testar conexão
export async function testConnection() {
  try {
    await prisma.$connect()
    console.log("✅ Conexão com banco de dados OK")
    return true
  } catch (error) {
    console.error("❌ Erro de conexão:", error)
    return false
  }
}

// Tipos exportados do Prisma
export type { Product, Customer, Sale, User } from "@prisma/client"

// Tipos customizados
export type SaleWithDetails = {
  id: number
  productId: number
  customerId: number | null
  quantity: number
  unitPrice: number
  totalAmount: number
  discount: number | null
  notes: string | null
  saleDate: Date
  createdAt: Date
  product: {
    name: string
    category: string
  }
  customer: {
    name: string
    email: string | null
  } | null
}
