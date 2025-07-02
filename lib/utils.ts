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

/**
 * UTILITÁRIOS PARA TRATAMENTO DE DATAS SEM TIMEZONE
 *
 * Estas funções garantem que todas as datas sejam salvas e consultadas
 * sem problemas de timezone, usando timestamp without time zone
 */

/**
 * Cria uma data sem timezone (apenas data, sem horário)
 * @param date - Data opcional, se não fornecida usa a data atual
 * @returns Date com horário zerado (00:00:00)
 */
export function createDateWithoutTimezone(date?: Date | string): Date {
  let inputDate: Date;

  if (typeof date === "string") {
    // Se for string, assume formato YYYY-MM-DD
    inputDate = new Date(date + "T00:00:00");
  } else if (date) {
    inputDate = new Date(date);
  } else {
    inputDate = new Date();
  }

  // Criar nova data com apenas ano, mês e dia (sem timezone)
  return new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate(),
    0,
    0,
    0,
    0
  );
}

/**
 * Obtém a data atual considerando timezone do Brasil (UTC-3)
 * @returns Date com UTC zerado da data atual no Brasil
 */
export function getCurrentDateUTC(): Date {
  const now = new Date();

  // Compensar 3 horas para pegar a data do Brasil
  // Se são 22h no Brasil, no servidor UTC são 01h do dia seguinte
  const brazilOffset = 3; // UTC-3
  const brazilDate = new Date(now.getTime() - brazilOffset * 60 * 60 * 1000);

  // Criar data com UTC zerado baseada na data do Brasil
  const utcDate = new Date(
    Date.UTC(
      brazilDate.getFullYear(),
      brazilDate.getMonth(),
      brazilDate.getDate(),
      0,
      0,
      0,
      0
    )
  );

  console.log("🔧 getCurrentDateUTC (Brasil):", {
    now: now.toISOString(),
    brazilDate: brazilDate.toISOString(),
    utcDate: utcDate.toISOString(),
    note: "Data atual do Brasil (UTC-3) convertida para UTC zerado",
  });

  return utcDate;
}

/**
 * Força uma data a ser salva com UTC zerado (00:00:00 UTC)
 * @param date - Data a ser processada
 * @returns Date para salvar no banco
 */
export function forceDateWithoutTimezone(date: Date | string): Date {
  let inputDate: Date;

  if (typeof date === "string") {
    // Se for string, converter para Date
    inputDate = new Date(date);
  } else {
    inputDate = date;
  }

  // Criar data com UTC zerado (00:00:00 UTC) usando a data fornecida
  const utcDate = new Date(
    Date.UTC(
      inputDate.getFullYear(),
      inputDate.getMonth(),
      inputDate.getDate(),
      0,
      0,
      0,
      0
    )
  );

  // Log para debug
  console.log("🔧 forceDateWithoutTimezone (UTC zerado):", {
    input: date,
    inputDate: inputDate,
    utcDate: utcDate,
    utcDateISO: utcDate.toISOString(),
    utcDateLocal: utcDate.toLocaleDateString("pt-BR"),
    note: "Salvando com UTC zerado (00:00:00 UTC)",
  });

  return utcDate;
}

/**
 * Converte uma data para string no formato YYYY-MM-DD usando a data local
 * @param date - Data a ser convertida
 * @returns String no formato YYYY-MM-DD
 */
export function dateToStringUTC(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    console.warn("⚠️ Data inválida recebida:", date);
    return "";
  }

  // Usar a data local (não UTC) para mostrar o dia correto
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Converte uma data para string no formato YYYY-MM-DD
 * @param date - Data a ser convertida
 * @returns String no formato YYYY-MM-DD
 */
export function dateToString(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    console.warn("⚠️ Data inválida recebida:", date);
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Converte uma string YYYY-MM-DD para Date
 * @param dateString - String no formato YYYY-MM-DD
 * @returns Date com horário zerado
 */
export function stringToDate(dateString: string): Date {
  return createDateWithoutTimezone(dateString);
}

/**
 * Cria uma data para consulta no banco (timestamp without time zone)
 * @param date - Data opcional, se não fornecida usa a data atual
 * @returns Date com horário zerado para consulta
 */
export function createDateForQuery(date?: Date | string): Date {
  const inputDate = date ? new Date(date) : new Date();

  // Criar data com horário zerado para consulta
  const queryDate = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate(),
    0,
    0,
    0,
    0
  );

  console.log("🔍 createDateForQuery:", {
    input: date,
    result: queryDate,
    resultISO: queryDate.toISOString(),
    note: "Para consulta em timestamp without time zone",
  });

  return queryDate;
}

/**
 * Cria um range de datas para consulta
 * @param startDate - Data inicial (opcional)
 * @param endDate - Data final (opcional)
 * @returns Objeto com startDate e endDate
 */
export function createDateRangeForQuery(
  startDate?: Date | string,
  endDate?: Date | string
) {
  const start = startDate
    ? createDateForQuery(startDate)
    : createDateForQuery();
  const end = endDate ? createDateForQuery(endDate) : createDateForQuery();

  // Para endDate, vamos até o final do dia (23:59:59)
  end.setHours(23, 59, 59, 999);

  return {
    startDate: start,
    endDate: end,
  };
}

/**
 * Obtém a data atual
 * @returns Date com horário zerado
 */
export function getCurrentDate(): Date {
  return createDateWithoutTimezone();
}

/**
 * Obtém a data atual como string YYYY-MM-DD
 * @returns String no formato YYYY-MM-DD
 */
export function getCurrentDateString(): string {
  return dateToString(getCurrentDate());
}

/**
 * Cria um intervalo de datas para consultas (início e fim do dia)
 * @param date - Data opcional, se não fornecida usa a data atual
 * @returns Objeto com startDate e endDate
 */
export function createDateRange(date?: Date | string) {
  const targetDate = createDateWithoutTimezone(date);

  const startDate = new Date(targetDate);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(targetDate);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

/**
 * Cria um intervalo de datas para consultas (início e fim do dia) como strings
 * @param date - Data opcional, se não fornecida usa a data atual
 * @returns Objeto com startDate e endDate como strings
 */
export function createDateRangeStrings(date?: Date | string) {
  const range = createDateRange(date);
  return {
    startDate: dateToString(range.startDate),
    endDate: dateToString(range.endDate),
  };
}

/**
 * Formata uma data para exibição no formato brasileiro (DD/MM/YYYY)
 * @param date - Date ou string YYYY-MM-DD
 * @returns String formatada como DD/MM/YYYY
 */
export function formatDateForDisplay(date: Date | string): string {
  if (!date) {
    return "Data inválida";
  }

  let dateObj: Date;

  if (typeof date === "string") {
    // Se for string, tentar converter
    if (date.includes("T")) {
      // Se tem T, é uma data ISO
      dateObj = new Date(date);
    } else {
      // Se não tem T, assume YYYY-MM-DD
      dateObj = stringToDate(date);
    }
  } else {
    dateObj = date;
  }

  // Verificar se a data é válida
  if (isNaN(dateObj.getTime())) {
    console.warn("⚠️ Data inválida para formatação:", date);
    return "Data inválida";
  }

  return dateObj.toLocaleDateString("pt-BR");
}

/**
 * Gera um array de datas para os últimos N dias
 * @param days - Número de dias (padrão: 7)
 * @returns Array de strings no formato YYYY-MM-DD
 */
export function generateLastDays(days: number = 7): string[] {
  const dates: string[] = [];
  const today = getCurrentDate();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(dateToString(date));
  }

  return dates;
}

/**
 * Converte uma data UTC do banco para data local para exibição
 * @param utcDate - Data UTC do banco
 * @returns Data local para exibição
 */
export function utcToLocalDate(utcDate: Date): Date {
  // Converter UTC para data local
  const localDate = new Date(utcDate);
  return localDate;
}

/**
 * Cria um intervalo de datas para consultas considerando timezone
 * @param date - Data opcional, se não fornecida usa a data atual
 * @returns Objeto com startDate e endDate em UTC
 */
export function createDateRangeWithTimezone(date?: Date | string) {
  const targetDate = date ? new Date(date) : new Date();

  // Início do dia em UTC
  const startDate = new Date(
    Date.UTC(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      0,
      0,
      0,
      0
    )
  );

  // Fim do dia em UTC
  const endDate = new Date(
    Date.UTC(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      23,
      59,
      59,
      999
    )
  );

  return { startDate, endDate };
}

// Funções para tratamento consistente de datas UTC (mantidas para compatibilidade)
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

/**
 * Detecta se estamos em ambiente de produção (Vercel)
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

/**
 * Detecta se estamos na Vercel especificamente
 */
export function isVercel(): boolean {
  return process.env.VERCEL === "1";
}

/**
 * Cria datas para consulta usando UTC zerado (consistente com forceDateWithoutTimezone)
 * @param date - Data opcional, se não fornecida usa a data atual
 * @returns Objeto com start e end dates em UTC zerado
 */
export function createDateRangeForEnvironment(date?: Date | string) {
  const inputDate = date ? new Date(date) : new Date();

  // Criar data base com UTC zerado (00:00:00 UTC)
  const baseDate = new Date(
    Date.UTC(
      inputDate.getFullYear(),
      inputDate.getMonth(),
      inputDate.getDate(),
      0,
      0,
      0,
      0
    )
  );

  // Início do dia em UTC zerado
  const startOfDay = new Date(baseDate);

  // Fim do dia em UTC zerado (23:59:59 UTC)
  const endOfDay = new Date(
    Date.UTC(
      inputDate.getFullYear(),
      inputDate.getMonth(),
      inputDate.getDate(),
      23,
      59,
      59,
      999
    )
  );

  return {
    start: startOfDay,
    end: endOfDay,
    note: "Usando UTC zerado (consistente com forceDateWithoutTimezone)",
  };
}
