declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      company: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    company: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    role: string;
    company: string;
  }
}
