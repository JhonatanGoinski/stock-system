# 🗄️ Configuração do Prisma ORM

## 🚀 Comandos Principais

### 1. Configuração Inicial
\`\`\`bash
# Instalar dependências
npm install

# Gerar cliente Prisma
npm run db:generate
\`\`\`

### 2. Sincronizar com Banco (Desenvolvimento)
\`\`\`bash
# Push do schema para o banco (sem migrations)
npm run db:push

# Popular banco com dados de exemplo
npm run db:seed
\`\`\`

### 3. Migrations (Produção)
\`\`\`bash
# Criar nova migration
npm run db:migrate

# Aplicar migrations em produção
npm run db:migrate:deploy
\`\`\`

### 4. Utilitários
\`\`\`bash
# Abrir Prisma Studio (interface visual)
npm run db:studio

# Sincronizar schema com banco existente
npm run db:pull

# Reset completo do banco
npm run db:reset
\`\`\`

## 📋 Fluxo de Desenvolvimento

### Primeira Configuração
1. Configure a `DATABASE_URL` no `.env.local`
2. Execute: `npm run db:push`
3. Execute: `npm run db:seed`
4. Execute: `npm run dev`

### Alterações no Schema
1. Edite `prisma/schema.prisma`
2. Execute: `npm run db:push` (desenvolvimento)
3. Ou: `npm run db:migrate` (produção)

### Visualizar Dados
\`\`\`bash
npm run db:studio
\`\`\`
Acesse: http://localhost:5555

## 🔧 Comandos Detalhados

### db:push vs db:migrate

**db:push** (Desenvolvimento):
- Sincroniza schema diretamente com banco
- Não cria arquivos de migration
- Mais rápido para prototipagem
- ⚠️ Pode perder dados em mudanças destrutivas

**db:migrate** (Produção):
- Cria arquivos de migration versionados
- Histórico de mudanças
- Seguro para produção
- Permite rollback

### Exemplo de Uso

\`\`\`bash
# 1. Configurar banco pela primeira vez
npm run db:push
npm run db:seed

# 2. Fazer alterações no schema
# Editar prisma/schema.prisma

# 3. Aplicar mudanças
npm run db:push  # ou db:migrate

# 4. Visualizar dados
npm run db:studio
\`\`\`

## 🎯 Vantagens do Prisma

✅ **Type Safety**: Tipos TypeScript automáticos
✅ **Migrations**: Controle de versão do banco
✅ **Studio**: Interface visual para dados
✅ **Relacionamentos**: Fácil de definir e usar
✅ **Performance**: Queries otimizadas
✅ **IntelliSense**: Autocomplete no código

## 🔄 Workflow Recomendado

### Desenvolvimento Local
\`\`\`bash
npm run db:push    # Sincronizar schema
npm run db:seed    # Popular dados
npm run db:studio  # Visualizar dados
\`\`\`

### Deploy Produção
\`\`\`bash
npm run db:migrate:deploy  # Aplicar migrations
\`\`\`

## 📊 Monitoramento

### Verificar Status
\`\`\`bash
npx prisma db status
\`\`\`

### Logs de Query (Desenvolvimento)
Adicione no `.env.local`:
\`\`\`env
DATABASE_URL="..."
# Habilitar logs
PRISMA_LOG_LEVEL="query,info,warn,error"
\`\`\`

---

**🎉 Agora você pode gerenciar o banco com comandos simples do Prisma!**
