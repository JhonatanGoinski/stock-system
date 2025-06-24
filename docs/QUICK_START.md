# ⚡ Início Rápido - Sistema de Estoque

## 🚀 Para quem tem pressa

### 1. Criar projeto e instalar dependências
\`\`\`bash
npx create-next-app@latest sistema-estoque --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
cd sistema-estoque
npm install @hookform/resolvers @prisma/client @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-sheet @radix-ui/react-slot @radix-ui/react-tabs class-variance-authority clsx lucide-react next-themes react-hook-form recharts tailwind-merge tailwindcss-animate zod
npm install -D prisma tsx
\`\`\`

### 2. Configurar Neon Database
1. Crie conta em: https://neon.tech/
2. Crie novo projeto: "sistema-estoque"
3. Copie a connection string

### 3. Configurar ambiente
\`\`\`bash
# Criar .env.local
echo 'DATABASE_URL="sua_connection_string_aqui"' > .env.local
echo 'NEXTAUTH_SECRET="seu-secret-123"' >> .env.local
echo 'NEXTAUTH_URL="http://localhost:3000"' >> .env.local
\`\`\`

### 4. Adicionar arquivos do sistema
- Copie todos os arquivos do projeto
- Especialmente: `prisma/`, `lib/`, `components/`, `app/`

### 5. Configurar banco com Prisma
\`\`\`bash
npx prisma generate    # Gerar cliente
npx prisma db push     # Criar tabelas no Neon
npx prisma db seed     # Popular dados de exemplo
\`\`\`

### 6. Executar
\`\`\`bash
npm run dev
\`\`\`

Acesse: http://localhost:3000

## ✅ Verificação Rápida

\`\`\`bash
# Ver dados no banco
npx prisma studio  # http://localhost:5555

# Testar aplicação
curl http://localhost:3000/api/products
\`\`\`

## 🔧 Comandos Essenciais

\`\`\`bash
# Desenvolvimento
npm run dev              # Executar app
npx prisma studio        # Ver banco
npx prisma db push       # Sync schema

# Produção
npm run build            # Build
npx prisma migrate deploy # Deploy migrations
\`\`\`

---

**⏱️ Tempo total: ~10 minutos**
\`\`\`

```shellscript file="scripts/setup.sh"
#!/bin/bash

# Script de configuração automática do Sistema de Estoque
# Execute com: bash scripts/setup.sh

echo "🚀 Configurando Sistema de Estoque com Prisma..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale em: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado."
    exit 1
fi

echo "✅ npm encontrado: $(npm --version)"

# Verificar se estamos em um projeto Next.js
if [ ! -f "package.json" ]; then
    echo "❌ package.json não encontrado. Execute este script na raiz do projeto Next.js"
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Verificar se .env.local existe
if [ ! -f .env.local ]; then
    echo "⚠️  Arquivo .env.local não encontrado!"
    echo "📝 Criando arquivo .env.local de exemplo..."
    
    cat > .env.local &lt;&lt; EOL
# Database - SUBSTITUA pela sua connection string do Neon
DATABASE_URL="postgresql://usuario:senha@ep-exemplo.us-east-1.aws.neon.tech/neondb?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="seu-super-secret-para-auth-$(date +%s)"
NEXTAUTH_URL="http://localhost:3000"
EOL

    echo "✅ Arquivo .env.local criado!"
    echo "🔧 IMPORTANTE: Edite o arquivo .env.local e adicione sua connection string do Neon"
    echo ""
else
    echo "✅ Arquivo .env.local já existe"
fi

# Verificar estrutura de pastas
echo "📁 Verificando estrutura de pastas..."

# Criar pastas necessárias se não existirem
mkdir -p app/api/dashboard
mkdir -p app/api/products
mkdir -p app/api/sales
mkdir -p components/ui
mkdir -p lib
mkdir -p prisma
mkdir -p docs

echo "✅ Estrutura de pastas verificada!"

# Verificar se o schema Prisma existe
if [ ! -f "prisma/schema.prisma" ]; then
    echo "⚠️  Schema Prisma não encontrado!"
    echo "📝 Certifique-se de copiar o arquivo prisma/schema.prisma"
else
    echo "✅ Schema Prisma encontrado"
    
    # Gerar cliente Prisma
    echo "🔧 Gerando cliente Prisma..."
    npx prisma generate
fi

echo ""
echo "🎉 Configuração inicial concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure sua conta no Neon (https://neon.tech/)"
echo "2. Edite o arquivo .env.local com sua connection string"
echo "3. Execute: npx prisma db push"
echo "4. Execute: npx prisma db seed"
echo "5. Execute: npm run dev"
echo "6. Acesse: http://localhost:3000"
echo ""
echo "🎯 Comandos úteis:"
echo "- npx prisma studio     # Interface visual do banco"
echo "- npx prisma db push    # Sincronizar schema"
echo "- npx prisma db seed    # Popular dados de exemplo"
echo "- npx prisma generate   # Gerar cliente TypeScript"
echo ""
echo "📚 Consulte docs/SETUP_GUIDE.md para instruções detalhadas"
