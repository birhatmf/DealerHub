import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { AdminNavigation } from "@/components/admin-navigation"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session || session.user.role !== "ROOT") {
        redirect("/login")
    }

    // ...

    return (
        <div className="flex h-screen w-full flex-col">
            <AdminNavigation
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
