import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: "ROOT" | "STORE"
        } & DefaultSession["user"]
    }

    interface User {
        role: "ROOT" | "STORE"
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: "ROOT" | "STORE"
        id: string
    }
}
