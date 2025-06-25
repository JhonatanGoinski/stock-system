#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Padrões de logs para remover
const patternsToRemove = [
  /console\.log\([^)]*\);/g,
  /console\.info\([^)]*\);/g,
  /console\.warn\([^)]*\);/g,
  // Manter console.error para erros críticos
];

// Arquivos para ignorar
const ignoreFiles = [
  "node_modules",
  ".next",
  ".git",
  "scripts/remove-logs.js",
  "lib/utils.ts", // Manter o logger
];

// Função para processar um arquivo
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    let modifiedContent = content;
    let changes = 0;

    // Remover logs desnecessários
    patternsToRemove.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        modifiedContent = modifiedContent.replace(pattern, "");
        changes += matches.length;
      }
    });

    // Salvar se houve mudanças
    if (changes > 0) {
      fs.writeFileSync(filePath, modifiedContent);
      console.log(`✅ ${filePath} - ${changes} logs removidos`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
}

// Função para processar diretório recursivamente
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);

  items.forEach((item) => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!ignoreFiles.includes(item)) {
        processDirectory(fullPath);
      }
    } else if (
      stat.isFile() &&
      (item.endsWith(".ts") ||
        item.endsWith(".tsx") ||
        item.endsWith(".js") ||
        item.endsWith(".jsx")) &&
      !ignoreFiles.includes(item)
    ) {
      processFile(fullPath);
    }
  });
}

// Executar o script
console.log("🧹 Removendo logs desnecessários...");
processDirectory(".");
console.log("✅ Limpeza concluída!");
