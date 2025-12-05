import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { StoreNavigation } from "@/components/store-navigation"

export default async function StoreLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session || session.user.role !== "STORE") {
        redirect("/login")
    }

    // ...

    return (
        <div className="flex h-screen w-full flex-col">
            <StoreNavigation
                username={session.user.username || ""}
                onLogout={async () => {
                    "use server"
                    await signOut()
                }}
            />
            <main className="flex-1 bg-muted/10 p-6">{children}</main>
        </div>
    )
}
