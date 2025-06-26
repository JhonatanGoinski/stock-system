import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Buscar credenciais no banco de dados
          const user = await prisma.loginCredentials.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user || !user.isActive) {
            return null;
          }

          // Verificar senha (comparação direta para senhas não hash)
          // Em produção, você deve usar bcrypt.compare() se as senhas estiverem hash
          if (user.password === credentials.password) {
            return {
              id: user.id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
              company: user.company,
            };
          }

          return null;
        } catch (error) {
          console.error("Erro na autenticação:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role;
        token.company = user.company;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
        session.user.company = token.company as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
