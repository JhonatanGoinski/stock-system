import { NextResponse } from "next/server";
import { testConnection } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("🧪 Iniciando teste de conexão...");
    console.log(
      "🔍 DATABASE_URL atual:",
      process.env.DATABASE_URL ? "Definida" : "Não definida"
    );

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

        // Aqui você pode testar com a URL alternativa se necessário
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
