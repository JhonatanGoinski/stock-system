import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Verificar se estamos em ambiente de build
const isBuildTime =
  process.env.NODE_ENV === "production" && !process.env.DATABASE_URL;

export const prisma: PrismaClient | undefined =
  globalForPrisma.prisma ??
  (isBuildTime
    ? undefined
    : new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
      }));

if (process.env.NODE_ENV !== "production" && !isBuildTime)
  globalForPrisma.prisma = prisma;

// Função helper para testar conexão
export async function testConnection() {
  try {
    if (!prisma) {
      console.log("⚠️ Prisma não disponível durante build");
      return false;
    }
    await prisma.$connect();
    console.log("✅ Conexão com banco de dados OK");
    return true;
  } catch (error) {
    console.error("❌ Erro de conexão:", error);
    return false;
  }
}

// Tipos exportados do Prisma
export type { Product, Customer, Sale, User } from "@prisma/client";

// Tipos customizados
export type SaleWithDetails = {
  id: number;
  productId: number;
  customerId: number | null;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  discount: number | null;
  notes: string | null;
  saleDate: Date;
  createdAt: Date;
  product: {
    name: string;
    category: string;
  };
  customer: {
    name: string;
    email: string | null;
  } | null;
};
