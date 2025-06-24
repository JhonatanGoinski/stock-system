import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Verificar se estamos em ambiente de build
const isBuildTime =
  process.env.NODE_ENV === "production" && !process.env.DATABASE_URL;

// Log para debug
console.log("🔍 Debug Prisma:", {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL ? "Definida" : "Não definida",
  isBuildTime,
});

export const prisma: PrismaClient | undefined =
  globalForPrisma.prisma ??
  (isBuildTime
    ? undefined
    : new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
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

    console.log("🔗 Tentando conectar ao banco...");
    await prisma.$connect();
    console.log("✅ Conexão com banco de dados OK");

    // Testar uma query simples
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Query de teste OK:", result);

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
