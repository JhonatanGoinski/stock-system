# 📋 Guia Completo de Configuração - Sistema de Estoque

Este guia te levará do zero até ter o sistema funcionando completamente com **Prisma ORM** e **dashboard avançado**.

## 🛠️ Pré-requisitos

### 1. Instalar Node.js
- Baixe e instale o Node.js 18+ em: https://nodejs.org/
- Verifique a instalação:
\`\`\`bash
node --version  # Deve ser 18+
npm --version
\`\`\`

### 2. Conta no Neon (PostgreSQL)
- Crie uma conta gratuita em: https://neon.tech/
- Será usado como banco de dados PostgreSQL

## 🚀 Passo 1: Configuração do Projeto

### 1.1 Clonar e instalar dependências
\`\`\`bash
# Clonar o repositório
git clone <seu-repositorio>
cd sistema-estoque

# Instalar dependências principais
npm install
\`\`\`

### 1.2 Instalar componentes shadcn/ui
\`\`\`bash
# Instalar CLI do shadcn/ui
npx shadcn@latest init

# Instalar componentes necessários
npx shadcn@latest add button card input label textarea select switch badge table tabs sheet dropdown-menu avatar separator skeleton alert
\`\`\`

### 1.3 Instalar bibliotecas de gráficos
\`\`\`bash
# Instalar Recharts para gráficos
npm install recharts

# Instalar NextAuth para autenticação
npm install next-auth
\`\`\`

## 🗄️ Passo 2: Configurar Banco de Dados (Neon)

### 2.1 Criar projeto no Neon
1. Acesse: https://neon.tech/
2. Faça login ou crie uma conta
3. Clique em "Create Project"
4. Escolha um nome: "sistema-estoque"
5. Selecione a região mais próxima
6. Clique em "Create Project"

### 2.2 Obter connection string
1. No dashboard do projeto, vá em "Connection Details"
2. Copie a "Connection String" completa
3. **Importante:** Use a string com pooling habilitado

Exemplo:
\`\`\`
postgresql://usuario:senha@ep-exemplo-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
\`\`\`

## 🔧 Passo 3: Configurar Variáveis de Ambiente

### 3.1 Criar arquivo .env.local
Na raiz do projeto, crie o arquivo `.env.local`:

\`\`\`env
# Database - Cole sua connection string do Neon aqui
DATABASE_URL="postgresql://usuario:senha@ep-exemplo-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"

# NextAuth - Gere um secret seguro
NEXTAUTH_SECRET="seu_secret_super_secreto_aqui_123456789"
NEXTAUTH_URL="http://localhost:3000"
\`\`\`

⚠️ **IMPORTANTE:** 
- Substitua a `DATABASE_URL` pela sua string real do Neon
- Gere um `NEXTAUTH_SECRET` seguro (pode usar: https://generate-secret.vercel.app/32)

## 📊 Passo 4: Configurar Prisma e Banco

### 4.1 Gerar cliente Prisma
\`\`\`bash
npx prisma generate
\`\`\`

### 4.2 Criar tabelas no Neon (PUSH)
\`\`\`bash
npx prisma db push
\`\`\`

Este comando:
- ✅ Lê o `schema.prisma`
- ✅ Cria todas as tabelas no Neon
- ✅ Configura relacionamentos
- ✅ Adiciona índices

### 4.3 Popular banco com dados de exemplo
\`\`\`bash
npx prisma db seed
\`\`\`

Este comando:
- ✅ Executa `prisma/seed.ts`
- ✅ Adiciona produtos de exemplo
- ✅ Cria clientes de teste
- ✅ Registra vendas de exemplo

### 4.4 Verificar se funcionou
\`\`\`bash
npx prisma studio
\`\`\`
- Acesse: http://localhost:5555
- Veja as tabelas criadas
- Verifique os dados inseridos

## ⚙️ Passo 5: Configurar Tailwind CSS

### 5.1 Verificar tailwind.config.ts
O arquivo deve estar assim:
\`\`\`typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
\`\`\`

## 🏃‍♂️ Passo 6: Executar o Sistema

### 6.1 Iniciar o servidor de desenvolvimento
\`\`\`bash
npm run dev
\`\`\`

### 6.2 Acessar o sistema
Abra seu navegador em: http://localhost:3000

## ✅ Passo 7: Verificações Finais

### 7.1 Testar Prisma Studio
\`\`\`bash
npx prisma studio
\`\`\`
- Acesse: http://localhost:5555
- Verifique se as tabelas existem
- Confirme se os dados foram inseridos

### 7.2 Testar funcionalidades
1. **Dashboard:** Verifique se carrega com gráficos
2. **Produtos:** Tente adicionar um produto
3. **Clientes:** Cadastre um cliente
4. **Vendas:** Registre uma venda
5. **Relatórios:** Gere um relatório com filtros
6. **Temas:** Teste dark/light mode
7. **Mobile:** Teste a responsividade

### 7.3 Credenciais de teste
- **Admin:** admin@empresa.com / admin123
- **Usuário:** user@empresa.com / user123

## 🎯 Funcionalidades Principais

### 📊 Dashboard Avançado
- **6 métricas principais:** vendas hoje/mês, clientes, produtos, estoque baixo
- **3 gráficos interativos:** linha (faturamento), pizza (categorias), barras (produtos)
- **Rankings:** top produtos, clientes e alertas de estoque

### 📦 Gestão de Produtos
- **CRUD completo:** criar, editar, visualizar, deletar
- **Controle de estoque:** alertas automáticos para estoque < 5
- **Categorização:** organização por tipo de produto
- **Validação:** preços e quantidades obrigatórios

### 👥 Gestão de Clientes
- **Cadastro completo:** dados pessoais, endereço, contato
- **Status ativo/inativo:** controle de clientes
- **Histórico:** todas as compras do cliente
- **Estatísticas:** total gasto e itens comprados

### 💰 Sistema de Vendas
- **Seleção inteligente:** produtos com estoque disponível
- **Cálculos automáticos:** subtotal, desconto, total
- **Controle de estoque:** redução automática após venda
- **Vendas balcão:** opção sem cliente cadastrado

### 📈 Relatórios Detalhados
- **Filtros avançados:** data, cliente, produto
- **Métricas completas:** faturamento, custo, lucro, margem
- **Exportação:** CSV/Excel com dados completos
- **Análises:** rankings de clientes e produtos

## 🔧 Comandos Úteis

### Desenvolvimento
\`\`\`bash
npm run dev              # Servidor de desenvolvimento
npm run build            # Build para produção
npm run start            # Executar produção
npm run lint             # Verificar código
\`\`\`

### Banco de Dados
\`\`\`bash
npx prisma generate      # Gerar cliente TypeScript
npx prisma db push       # Sincronizar schema (desenvolvimento)
npx prisma db seed       # Popular dados de exemplo
npx prisma studio        # Interface visual
npx prisma migrate dev   # Criar migration (produção)
npx prisma db pull       # Sincronizar do banco
\`\`\`

## 🚨 Solução de Problemas

### Erro de conexão com banco
\`\`\`bash
# Verificar se a URL está correta
echo $DATABASE_URL

# Testar conexão
npx prisma db push
\`\`\`

### Erro de dependências
\`\`\`bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
npx prisma generate
\`\`\`

### Gráficos não aparecem
\`\`\`bash
# Verificar se Recharts está instalado
npm install recharts
\`\`\`

### Componentes shadcn/ui não funcionam
\`\`\`bash
# Reinstalar componentes
npx shadcn@latest add button card input label textarea select switch badge table tabs sheet dropdown-menu avatar separator skeleton alert
\`\`\`

## 📋 Checklist Final

- [ ] Node.js 18+ instalado
- [ ] Projeto clonado e dependências instaladas
- [ ] shadcn/ui components instalados
- [ ] Recharts instalado
- [ ] Conta Neon criada
- [ ] DATABASE_URL configurada no .env.local
- [ ] NEXTAUTH_SECRET configurado
- [ ] `npx prisma generate` executado
- [ ] `npx prisma db push` executado (tabelas criadas)
- [ ] `npx prisma db seed` executado (dados inseridos)
- [ ] `npm run dev` funcionando
- [ ] Dashboard carregando com gráficos
- [ ] Prisma Studio acessível (localhost:5555)
- [ ] Todas as funcionalidades testadas

## 🎉 Próximos Passos

1. **Personalização:** Altere cores, logo e dados da empresa
2. **Deploy:** Configure para Vercel ou outro provedor
3. **Backup:** Configure backup automático do Neon
4. **Monitoramento:** Adicione logs e métricas
5. **Segurança:** Implemente autenticação OAuth

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs no terminal
2. Execute `npx prisma studio` para ver o banco
3. Confirme se `.env.local` está correto
4. Teste `npx prisma db push` novamente
5. Verifique se todas as dependências estão instaladas

---

**🎉 Parabéns! Seu sistema de estoque profissional com dashboard avançado está funcionando!**
