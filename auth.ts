import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Credentials({
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ username: z.string(), password: z.string() })
                    .safeParse(credentials)

                if (parsedCredentials.success) {
                    const { username, password } = parsedCredentials.data
                    const user = await prisma.user.findUnique({
                        where: { username },
                    })

                    if (!user) return null

                    const passwordsMatch = await bcrypt.compare(password, user.password)

                    if (passwordsMatch) {
                        return {
                            ...user,
                            role: user.role as "ROOT" | "STORE",
                        }
                    }
                }

                return null
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub
            }
            if (token.role && session.user) {
                session.user.role = token.role as "ROOT" | "STORE"
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
})
