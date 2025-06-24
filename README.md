# 🏪 Sistema de Estoque Profissional

Sistema completo de gerenciamento de estoque e vendas desenvolvido com Next.js 14, TypeScript, Prisma ORM e PostgreSQL.

## ✨ Funcionalidades

- 📊 **Dashboard Avançado** com gráficos interativos e métricas em tempo real
- 📦 **Gestão de Produtos** (CRUD completo com controle de estoque)
- 👥 **Gestão de Clientes** (cadastro completo com histórico de compras)
- 💰 **Registro de Vendas** com controle automático de estoque
- 📈 **Relatórios Detalhados** com filtros avançados e exportação Excel/CSV
- 📱 **Interface Responsiva** (Desktop e Mobile otimizado)
- 🌙 **Tema Dark/Light** com persistência
- 🔒 **Sistema de Autenticação** (NextAuth.js)
- ⚡ **Performance Otimizada** com Prisma ORM

## 🚀 Início Rápido

### 1. Pré-requisitos
- Node.js 18+ 
- Conta no [Neon](https://neon.tech/) (PostgreSQL)

### 2. Instalação

\`\`\`bash
# Clonar o repositório
git clone <seu-repositorio>
cd sistema-estoque

# Instalar dependências
npm install

# Instalar shadcn/ui components
npx shadcn@latest add button card input label textarea select switch badge table tabs sheet dropdown-menu avatar separator skeleton alert

# Instalar bibliotecas de gráficos
npm install recharts

# Configurar ambiente
cp .env.example .env.local
\`\`\`

### 3. Configurar Banco de Dados

1. **Criar conta no Neon:**
   - Acesse: https://neon.tech/
   - Crie um novo projeto
   - Copie a connection string

2. **Configurar .env.local:**
\`\`\`env
# Database
DATABASE_URL="postgresql://usuario:senha@ep-exemplo.us-east-1.aws.neon.tech/neondb?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="seu-secret-super-secreto-aqui"
NEXTAUTH_URL="http://localhost:3000"
\`\`\`

3. **Configurar Prisma:**
\`\`\`bash
# Gerar cliente Prisma
npx prisma generate

# Criar tabelas no banco
npx prisma db push

# Popular com dados de exemplo
npx prisma db seed
\`\`\`

### 4. Executar o Sistema

\`\`\`bash
npm run dev
\`\`\`

Acesse: http://localhost:3000

## 🛠️ Tecnologias

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Recharts** - Gráficos interativos
- **Lucide React** - Ícones
- **next-themes** - Tema dark/light

### Backend
- **Next.js API Routes** - Backend integrado
- **Prisma ORM** - ORM moderno para TypeScript
- **PostgreSQL** - Banco de dados (Neon)
- **NextAuth.js** - Autenticação

### Validação e Forms
- **Zod** - Validação de schemas
- **React Hook Form** - Gerenciamento de formulários
- **@hookform/resolvers** - Integração Zod + RHF

## 📁 Estrutura do Projeto

\`\`\`
sistema-estoque/
├── app/                    # App Router do Next.js
│   ├── api/               # API Routes
│   │   ├── products/      # CRUD de produtos
│   │   ├── customers/     # CRUD de clientes
│   │   ├── sales/         # CRUD de vendas
│   │   ├── dashboard/     # Dados do dashboard
│   │   └── reports/       # Relatórios e exportação
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   ├── dashboard-stats.tsx
│   ├── product-form.tsx
│   ├── customer-form.tsx
│   ├── sale-form.tsx
│   └── reports-page.tsx
├── lib/                  # Utilitários
│   ├── prisma.ts         # Cliente Prisma
│   ├── utils.ts          # Funções uteis
│   └── validations.ts    # Schemas Zod
├── prisma/               # Prisma ORM
│   ├── schema.prisma     # Schema do banco
│   └── seed.ts           # Dados de exemplo
└── docs/                 # Documentação
\`\`\`

## 🎯 Funcionalidades Detalhadas

### 📊 Dashboard
- **Métricas em tempo real:** vendas do dia, mês, total de clientes
- **Gráficos interativos:** faturamento, produtos mais vendidos, categorias
- **Alertas:** produtos com estoque baixo
- **Top rankings:** melhores clientes e produtos

### 📦 Gestão de Produtos
- **CRUD completo:** criar, editar, visualizar, deletar
- **Controle de estoque:** quantidade, alertas de estoque baixo
- **Categorização:** organização por categorias
- **Precificação:** preço de custo e venda

### 👥 Gestão de Clientes
- **Cadastro completo:** dados pessoais, endereço, contato
- **Histórico de compras:** todas as vendas do cliente
- **Status ativo/inativo:** controle de clientes
- **Estatísticas:** total gasto, itens comprados

### 💰 Sistema de Vendas
- **Registro rápido:** seleção de produto e cliente
- **Cálculo automático:** subtotal, desconto, total
- **Controle de estoque:** redução automática após venda
- **Vendas balcão:** vendas sem cliente cadastrado

### 📈 Relatórios Avançados
- **Filtros:** data, cliente, produto
- **Métricas:** faturamento, lucro, margem
- **Exportação:** CSV/Excel
- **Análises:** top clientes, produtos mais vendidos

## 🔧 Scripts Disponíveis

### Aplicação
\`\`\`bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run start        # Executar produção
npm run lint         # Verificar código
\`\`\`

### Banco de Dados (Prisma)
\`\`\`bash
npx prisma generate     # Gerar cliente TypeScript
npx prisma db push      # Sincronizar schema (desenvolvimento)
npx prisma db seed      # Popular dados de exemplo
npx prisma studio       # Interface visual (localhost:5555)
npx prisma migrate dev  # Criar migration (produção)
npx prisma db pull      # Sincronizar schema do banco
\`\`\`

## 🎨 Temas e Responsividade

### Temas
- **Modo claro/escuro** automático
- **Detecção do sistema** operacional
- **Persistência** da preferência
- **Transições suaves** entre temas

### Mobile
- **Layout responsivo** completo
- **Navegação otimizada** para touch
- **Cards adaptáveis** para telas pequenas
- **Performance otimizada** para dispositivos móveis

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
3. Deploy automático

### Outros Provedores
\`\`\`bash
# Build da aplicação
npm run build

# Aplicar migrations em produção
npx prisma migrate deploy

# Executar em produção
npm start
\`\`\`

## 🔒 Autenticação

### Credenciais de Teste
- **Admin:** admin@empresa.com / admin123
- **Usuário:** user@empresa.com / user123

### Configuração
O sistema usa NextAuth.js com provider de credenciais. Para produção, configure providers OAuth (Google, GitHub, etc.).

## 📊 Banco de Dados

### Schema Principal
- **Products:** produtos com estoque e preços
- **Customers:** clientes com dados completos
- **Sales:** vendas com relacionamentos
- **Users:** usuários do sistema (futuro)

### Relacionamentos
- **Sale → Product:** cada venda referencia um produto
- **Sale → Customer:** cada venda pode ter um cliente (opcional)
- **Índices otimizados** para consultas rápidas

## 🛡️ Segurança

- **Validação de dados** com Zod em todas as APIs
- **Transações de banco** para operações críticas
- **Sanitização de inputs** automática
- **Controle de acesso** por rotas protegidas

## 📈 Performance

- **Server Components** por padrão
- **Lazy loading** de componentes
- **Otimização de imagens** automática
- **Cache de dados** estratégico
- **Bundle splitting** automático

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- 📖 [Documentação Completa](docs/SETUP_GUIDE.md)
- 🗄️ [Guia do Prisma](docs/PRISMA_SETUP.md)
- 🔧 [Solução de Problemas](docs/TROUBLESHOOTING.md)
- 💬 Abra uma [Issue](../../issues) para reportar bugs
- 💡 [Discussions](../../discussions) para dúvidas

---

**Desenvolvido com ❤️ usando Next.js 14, TypeScript, Prisma ORM e shadcn/ui**
