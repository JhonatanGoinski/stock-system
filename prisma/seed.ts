import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...")

  // Limpar dados existentes (opcional)
  await prisma.sale.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  console.log("🗑️ Dados existentes removidos")

  // Criar usuários de exemplo
  const adminUser = await prisma.user.create({
    data: {
      name: "Administrador",
      email: "admin@empresa.com",
      role: "admin",
      company: "Minha Empresa Ltda",
    },
  })

  const regularUser = await prisma.user.create({
    data: {
      name: "Usuário",
      email: "user@empresa.com",
      role: "user",
      company: "Minha Empresa Ltda",
    },
  })

  console.log("👥 Usuários criados:", { adminUser: adminUser.email, regularUser: regularUser.email })

  // Criar clientes de exemplo
  const customers = await prisma.customer.createMany({
    data: [
      {
        name: "João Silva",
        email: "joao.silva@email.com",
        phone: "(11) 99999-1111",
        document: "123.456.789-00",
        address: "Rua das Flores, 123",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-567",
        notes: "Cliente VIP - desconto especial",
      },
      {
        name: "Maria Santos",
        email: "maria.santos@email.com",
        phone: "(11) 99999-2222",
        document: "987.654.321-00",
        address: "Av. Paulista, 456",
        city: "São Paulo",
        state: "SP",
        zipCode: "01310-100",
      },
      {
        name: "Pedro Oliveira",
        email: "pedro.oliveira@email.com",
        phone: "(21) 99999-3333",
        document: "456.789.123-00",
        address: "Rua Copacabana, 789",
        city: "Rio de Janeiro",
        state: "RJ",
        zipCode: "22070-001",
      },
      {
        name: "Ana Costa",
        email: "ana.costa@email.com",
        phone: "(31) 99999-4444",
        document: "789.123.456-00",
        address: "Rua da Liberdade, 321",
        city: "Belo Horizonte",
        state: "MG",
        zipCode: "30112-000",
      },
      {
        name: "Carlos Ferreira",
        email: "carlos.ferreira@email.com",
        phone: "(47) 99999-5555",
        document: "321.654.987-00",
        address: "Rua XV de Novembro, 654",
        city: "Blumenau",
        state: "SC",
        zipCode: "89010-000",
        notes: "Cliente atacadista",
      },
    ],
  })

  console.log("👥 Clientes criados:", customers.count)

  // Criar produtos de exemplo
  const products = await prisma.product.createMany({
    data: [
      {
        name: "Camiseta Básica Branca",
        description: "Camiseta 100% algodão",
        category: "camiseta",
        size: "M",
        costPrice: 15.0,
        salePrice: 29.9,
        stockQuantity: 50,
      },
      {
        name: "Camiseta Básica Preta",
        description: "Camiseta 100% algodão",
        category: "camiseta",
        size: "M",
        costPrice: 15.0,
        salePrice: 29.9,
        stockQuantity: 45,
      },
      {
        name: "Calça Jeans Masculina",
        description: "Calça jeans tradicional",
        category: "calca",
        size: "42",
        costPrice: 45.0,
        salePrice: 89.9,
        stockQuantity: 25,
      },
      {
        name: "Calça Jeans Feminina",
        description: "Calça jeans skinny",
        category: "calca",
        size: "38",
        costPrice: 50.0,
        salePrice: 99.9,
        stockQuantity: 30,
      },
      {
        name: "Camiseta Polo",
        description: "Polo masculina",
        category: "camiseta",
        size: "G",
        costPrice: 25.0,
        salePrice: 49.9,
        stockQuantity: 20,
      },
      {
        name: "Bermuda Jeans",
        description: "Bermuda masculina",
        category: "bermuda",
        size: "40",
        costPrice: 30.0,
        salePrice: 59.9,
        stockQuantity: 15,
      },
      {
        name: "Blusa Feminina",
        description: "Blusa social feminina",
        category: "blusa",
        size: "M",
        costPrice: 35.0,
        salePrice: 69.9,
        stockQuantity: 12,
      },
      {
        name: "Vestido Casual",
        description: "Vestido para o dia a dia",
        category: "vestido",
        size: "P",
        costPrice: 40.0,
        salePrice: 79.9,
        stockQuantity: 8,
      },
      {
        name: "Jaqueta Jeans",
        description: "Jaqueta jeans unissex",
        category: "jaqueta",
        size: "M",
        costPrice: 60.0,
        salePrice: 119.9,
        stockQuantity: 3, // Estoque baixo para testar alertas
      },
      {
        name: "Tênis Esportivo",
        description: "Tênis para corrida",
        category: "sapato",
        size: "40",
        costPrice: 80.0,
        salePrice: 159.9,
        stockQuantity: 18,
      },
    ],
  })

  console.log("📦 Produtos criados:", products.count)

  // Buscar produtos e clientes criados para criar vendas
  const createdProducts = await prisma.product.findMany()
  const createdCustomers = await prisma.customer.findMany()

  // Criar algumas vendas de exemplo com clientes
  const salesData = [
    {
      productId: createdProducts[0].id,
      customerId: createdCustomers[0].id,
      quantity: 2,
      unitPrice: 29.9,
      totalAmount: 59.8,
      discount: 0,
      notes: "Venda com desconto VIP",
      saleDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
    },
    {
      productId: createdProducts[1].id,
      customerId: createdCustomers[1].id,
      quantity: 1,
      unitPrice: 29.9,
      totalAmount: 29.9,
      discount: 0,
      saleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
    },
    {
      productId: createdProducts[2].id,
      customerId: createdCustomers[0].id, // João Silva comprando novamente
      quantity: 1,
      unitPrice: 89.9,
      totalAmount: 89.9,
      discount: 5.0, // Desconto de R$ 5
      notes: "Cliente VIP - desconto aplicado",
      saleDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
    },
    {
      productId: createdProducts[0].id,
      customerId: createdCustomers[2].id,
      quantity: 3,
      unitPrice: 29.9,
      totalAmount: 89.7,
      discount: 0,
      saleDate: new Date(), // Hoje
    },
    {
      productId: createdProducts[4].id,
      customerId: createdCustomers[3].id,
      quantity: 2,
      unitPrice: 49.9,
      totalAmount: 99.8,
      discount: 0,
      saleDate: new Date(), // Hoje
    },
    {
      productId: createdProducts[3].id,
      customerId: createdCustomers[4].id, // Carlos Ferreira (atacadista)
      quantity: 5,
      unitPrice: 95.0, // Preço especial atacado
      totalAmount: 475.0,
      discount: 24.5, // Desconto atacadista
      notes: "Venda atacado - desconto especial",
      saleDate: new Date(), // Hoje
    },
    // Algumas vendas sem cliente (balcão)
    {
      productId: createdProducts[5].id,
      customerId: null,
      quantity: 1,
      unitPrice: 59.9,
      totalAmount: 59.9,
      discount: 0,
      notes: "Venda balcão - sem cadastro",
      saleDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ]

  for (const saleData of salesData) {
    await prisma.sale.create({
      data: saleData,
    })

    // Atualizar estoque do produto
    await prisma.product.update({
      where: { id: saleData.productId },
      data: {
        stockQuantity: {
          decrement: saleData.quantity,
        },
      },
    })
  }

  console.log("💰 Vendas criadas:", salesData.length)

  console.log("✅ Seed concluído com sucesso!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Erro durante o seed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
