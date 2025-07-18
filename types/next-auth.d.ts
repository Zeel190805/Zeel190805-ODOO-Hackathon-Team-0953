import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      isBanned?: boolean
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: "user" | "admin"
    isBanned: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: string
    isBanned?: boolean
  }
} 