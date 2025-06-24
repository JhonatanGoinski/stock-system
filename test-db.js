const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log("🔍 Testando conexão com banco de dados...");

    // Testar conexão
    await prisma.$connect();
    console.log("✅ Conexão OK");

    // Contar vendas
    const salesCount = await prisma.sale.count();
    console.log(`📊 Total de vendas: ${salesCount}`);

    // Buscar algumas vendas
    const sales = await prisma.sale.findMany({
      take: 5,
      include: {
        product: true,
        customer: true,
      },
      orderBy: { saleDate: "desc" },
    });

    console.log("📋 Últimas vendas:");
    sales.forEach((sale, index) => {
      console.log(
        `${index + 1}. ID: ${sale.id}, Produto: ${
          sale.product.name
        }, Cliente: ${sale.customer?.name || "Balcão"}, Total: R$ ${
          sale.totalAmount
        }`
      );
    });
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
