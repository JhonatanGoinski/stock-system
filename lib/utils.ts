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
 * Utilitários para cache
 */
export const cacheUtils = {
  // Cache público (pode ser compartilhado entre usuários)
  public: (maxAge: number = 300, staleWhileRevalidate: number = 600) => ({
    "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    "X-Cache-Status": "MISS",
  }),

  // Cache privado (específico do usuário)
  private: (maxAge: number = 60, staleWhileRevalidate: number = 120) => ({
    "Cache-Control": `private, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    "X-Cache-Status": "MISS",
  }),

  // Sem cache
  noCache: () => ({
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  }),

  // Cache para dados que mudam pouco
  static: (maxAge: number = 3600) => ({
    "Cache-Control": `public, max-age=${maxAge}, immutable`,
    "X-Cache-Status": "STATIC",
  }),
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

// Funções para tratamento consistente de datas UTC
export function toUTCDate(dateString: string): string {
  // Converte uma data string para UTC
  const [year, month, day] = dateString.split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  return utcDate.toISOString().split("T")[0];
}

export function getCurrentUTCDate(): string {
  // Retorna a data atual em UTC
  return new Date().toISOString().split("T")[0];
}

export function formatUTCDate(dateString: string): string {
  // Formata uma data UTC para exibição
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}
