import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Logger inteligente com diferentes níveis baseados no ambiente
 */
export const logger = {
  // Logs de debug - só em desenvolvimento
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log("🐛 DEBUG:", ...args);
    }
  },

  // Logs informativos - só em desenvolvimento
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log("ℹ️ INFO:", ...args);
    }
  },

  // Logs de sucesso - só em desenvolvimento
  success: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log("✅ SUCCESS:", ...args);
    }
  },

  // Logs de aviso - sempre mostrados
  warn: (...args: any[]) => {
    console.warn("⚠️ WARN:", ...args);
  },

  // Logs de erro - sempre mostrados
  error: (...args: any[]) => {
    console.error("❌ ERROR:", ...args);
  },

  // Logs de build - só em desenvolvimento
  build: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log("🔨 BUILD:", ...args);
    }
  },
};

/**
 * Formata um valor numérico para o formato brasileiro de moeda (R$)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada no padrão R$ 1.234,56
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formata um valor numérico para o formato brasileiro sem o símbolo R$
 * @param value - Valor numérico a ser formatado
 * @returns String formatada no padrão 1.234,56
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
