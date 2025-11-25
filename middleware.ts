import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { nextUrl } = req
    const user = req.auth?.user

    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
    const isPublicRoute = nextUrl.pathname === "/login"
    const isAdminRoute = nextUrl.pathname.startsWith("/admin")
    const isStoreRoute = nextUrl.pathname.startsWith("/store")

    if (isApiAuthRoute) {
        return null
    }

    if (isPublicRoute) {
        if (isLoggedIn) {
            if (user?.role === "ROOT") {
                return NextResponse.redirect(new URL("/admin", nextUrl))
            }
            return NextResponse.redirect(new URL("/store", nextUrl))
        }
        return null
    }

    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/login", nextUrl))
    }

    if (isAdminRoute && user?.role !== "ROOT") {
        return NextResponse.redirect(new URL("/store", nextUrl))
    }

    if (isStoreRoute && user?.role !== "STORE") {
        return NextResponse.redirect(new URL("/admin", nextUrl))
    }

    return null
})

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
