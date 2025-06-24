import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Para demo, vamos usar credenciais fixas
          // Em produção, você deve hash as senhas no banco
          if (credentials.email === "admin@empresa.com" && credentials.password === "admin123") {
            return {
              id: "1",
              email: "admin@empresa.com",
              name: "Administrador",
              role: "admin",
              company: "Minha Empresa Ltda",
            }
          }

          if (credentials.email === "user@empresa.com" && credentials.password === "user123") {
            return {
              id: "2",
              email: "user@empresa.com",
              name: "Usuário",
              role: "user",
              company: "Minha Empresa Ltda",
            }
          }

          return null
        } catch (error) {
          console.error("Erro na autenticação:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.company = user.company
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role as string
        session.user.company = token.company as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
