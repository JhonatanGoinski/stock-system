import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isBuildTime =
  process.env.NODE_ENV === "production" && !process.env.DATABASE_URL;

export const prisma: PrismaClient | undefined =
  globalForPrisma.prisma ??
  (isBuildTime
    ? undefined
    : new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["error", "warn"]
            : ["error"],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      }));

if (process.env.NODE_ENV !== "production" && !isBuildTime)
  globalForPrisma.prisma = prisma;

export async function testConnection() {
  try {
    if (!prisma) {
      return false;
    }

    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    return true;
  } catch (error) {
    return false;
  }
}

export type { Product, Customer, Sale, User } from "@prisma/client";

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
