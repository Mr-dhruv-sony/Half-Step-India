import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./db"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

const googleProvider =
  googleClientId && googleClientSecret
    ? GoogleProvider({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      })
    : null

export const authOptions: NextAuthOptions = {
  providers: [
    ...(googleProvider ? [googleProvider] : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.isActive) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          departmentId: user.departmentId ?? undefined,
          stateCode: user.stateCode ?? undefined,
          districtCode: user.districtCode ?? undefined,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true
      }

      if (!user.email) {
        return false
      }

      const normalizedEmail = user.email.toLowerCase()
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      })

      if (existingUser) {
        return existingUser.isActive
      }

      const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10)

      await prisma.user.create({
        data: {
          name: user.name?.trim() || normalizedEmail.split("@")[0],
          email: normalizedEmail,
          passwordHash,
          role: UserRole.citizen,
          isActive: true,
        }
      })

      return true
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email
      }

      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email.toLowerCase() }
        })

        if (dbUser) {
          token.sub = dbUser.id
          token.role = dbUser.role
          token.departmentId = dbUser.departmentId ?? undefined
          token.stateCode = dbUser.stateCode ?? undefined
          token.districtCode = dbUser.districtCode ?? undefined
          token.name = dbUser.name
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string
        session.user.name = token.name
        session.user.email = token.email
        session.user.role = token.role as string
        session.user.departmentId = token.departmentId as string
        session.user.stateCode = token.stateCode as string
        session.user.districtCode = token.districtCode as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
