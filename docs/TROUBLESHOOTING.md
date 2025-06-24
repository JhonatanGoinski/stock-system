# 🔧 Guia de Solução de Problemas

## 🚨 Problemas Comuns e Soluções

### 1. Erro de Conexão com Banco de Dados

**Erro:** `Error: connect ECONNREFUSED` ou `database connection failed`

**Soluções:**
\`\`\`bash
# Verificar se a URL está correta
echo $DATABASE_URL

# Testar conexão diretamente
psql "sua_connection_string" -c "SELECT 1;"

# Verificar se o arquivo .env.local existe e está correto
cat .env.local
\`\`\`

### 2. Erro de Dependências

**Erro:** `Module not found` ou `Cannot resolve module`

**Soluções:**
\`\`\`bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Verificar versão do Node.js
node --version  # Deve ser 18+
\`\`\`

### 3. Erro de Build

**Erro:** `Build failed` ou `Type errors`

**Soluções:**
\`\`\`bash
# Verificar erros de lint
npm run lint

# Verificar tipos TypeScript
npx tsc --noEmit

# Build com mais detalhes
npm run build -- --debug
\`\`\`

### 4. Porta já em Uso

**Erro:** `Port 3000 is already in use`

**Soluções:**
\`\`\`bash
# Usar porta diferente
npm run dev -- -p 3001

# Ou matar processo na porta 3000
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows
\`\`\`

### 5. Problemas com Tema Dark/Light

**Erro:** Tema não persiste ou não funciona

**Soluções:**
- Verificar se `next-themes` está instalado
- Limpar localStorage do navegador
- Verificar se `ThemeProvider` está no layout

### 6. Problemas Mobile

**Erro:** Layout quebrado no mobile

**Soluções:**
- Verificar viewport meta tag
- Testar em diferentes dispositivos
- Verificar classes Tailwind responsivas

## 🛠️ Comandos de Debug

### Verificar Status do Sistema
\`\`\`bash
# Verificar se todas as dependências estão instaladas
npm list

# Verificar configuração do Next.js
npx next info

# Verificar conexão com banco
npm run db:test  # Se você criar este script
\`\`\`

### Logs Detalhados
\`\`\`bash
# Executar com logs detalhados
DEBUG=* npm run dev

# Verificar logs do banco
tail -f logs/database.log  # Se você configurar logs
\`\`\`

## 📊 Monitoramento

### Verificar Performance
1. Abra DevTools (F12)
2. Vá na aba "Network"
3. Recarregue a página
4. Verifique tempos de carregamento

### Verificar Erros JavaScript
1. Abra DevTools (F12)
2. Vá na aba "Console"
3. Procure por erros em vermelho

## 🔄 Reset Completo

Se nada funcionar, faça um reset completo:

\`\`\`bash
# 1. Backup dos dados importantes
cp .env.local .env.backup

# 2. Limpar tudo
rm -rf node_modules package-lock.json .next

# 3. Reinstalar
npm install

# 4. Recriar banco (CUIDADO: apaga dados)
npm run db:reset

# 5. Testar
npm run dev
\`\`\`

## 📞 Onde Buscar Ajuda

1. **Documentação Next.js:** https://nextjs.org/docs
2. **Documentação Neon:** https://neon.tech/docs
3. **Stack Overflow:** Pesquise por erros específicos
4. **GitHub Issues:** Verifique issues conhecidas das dependências

## 📝 Reportar Problemas

Ao reportar um problema, inclua:

1. **Versão do Node.js:** `node --version`
2. **Sistema Operacional:** Windows/macOS/Linux
3. **Erro completo:** Copy/paste do terminal
4. **Passos para reproduzir:** O que você fez antes do erro
5. **Arquivos de configuração:** .env.local (sem senhas)

---

**💡 Dica:** Mantenha sempre backups dos seus dados e configurações!
