import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import dbConnect from "./mongodb"
import User from "@/models/user"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Invalid credentials")
        }

        await dbConnect()

        const user = await User.findOne({ email: credentials.email })

        if (!user || !user.hashedPassword) {
          throw new Error("Invalid credentials")
        }

        // Check if user is banned
        if (user.isBanned) {
          throw new Error("Account has been banned")
        }

        const isCorrectPassword = await bcrypt.compare(credentials.password, user.hashedPassword)

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials")
        }

        return user
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isBanned = user.isBanned
      }
      return token
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.isBanned = token.isBanned as boolean
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
