import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Limpar dados existentes (opcional)
  await prisma.sale.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️ Dados existentes removidos");

  // Criar usuários de exemplo
  const adminUser = await prisma.user.create({
    data: {
      name: "Administrador",
      email: "admin@empresa.com",
      role: "admin",
      company: "Minha Empresa Ltda",
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      name: "Usuário",
      email: "user@empresa.com",
      role: "user",
      company: "Minha Empresa Ltda",
    },
  });

  console.log("👥 Usuários criados:", {
    adminUser: adminUser.email,
    regularUser: regularUser.email,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Erro durante o seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
