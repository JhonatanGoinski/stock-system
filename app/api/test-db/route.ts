import { NextResponse } from "next/server";

// Verificar se estamos em ambiente de build
const isBuildTime =
  process.env.NODE_ENV === "production" && !process.env.DATABASE_URL;

export async function GET() {
  try {
    // Se estamos em build time, retornar imediatamente
    if (isBuildTime) {
      console.log("🚫 Build time detected, skipping database test");
      return NextResponse.json({
        status: "build_time",
        message: "Teste não disponível durante build",
        timestamp: new Date().toISOString(),
      });
    }

    console.log("🧪 Iniciando teste de conexão...");
    console.log(
      "🔍 DATABASE_URL atual:",
      process.env.DATABASE_URL ? "Definida" : "Não definida"
    );

    // Importar Prisma apenas quando não estamos em build
    const { testConnection } = await import("@/lib/prisma");
    const isConnected = await testConnection();

    if (isConnected) {
      return NextResponse.json({
        status: "success",
        message: "Conexão com banco de dados OK",
        timestamp: new Date().toISOString(),
        databaseUrl: process.env.DATABASE_URL ? "Definida" : "Não definida",
      });
    } else {
      // Tentar com URL alternativa (sem pooler)
      const originalUrl = process.env.DATABASE_URL;
      if (originalUrl && originalUrl.includes("-pooler.")) {
        console.log("🔄 Tentando URL alternativa sem pooler...");
        const alternativeUrl = originalUrl.replace("-pooler.", ".");
        console.log("🔗 URL alternativa:", alternativeUrl);

        return NextResponse.json(
          {
            status: "error",
            message: "Falha na conexão com banco de dados",
            suggestion: "Tente usar a URL sem pooler: " + alternativeUrl,
            timestamp: new Date().toISOString(),
            databaseUrl: "Definida (com pooler)",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          status: "error",
          message: "Falha na conexão com banco de dados",
          timestamp: new Date().toISOString(),
          databaseUrl: process.env.DATABASE_URL ? "Definida" : "Não definida",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Erro no teste de conexão:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Erro interno no teste de conexão",
        error: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
        databaseUrl: process.env.DATABASE_URL ? "Definida" : "Não definida",
      },
      { status: 500 }
    );
  }
}
