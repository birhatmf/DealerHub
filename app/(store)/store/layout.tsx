import { auth, signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function StoreLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session || session.user.role !== "STORE") {
        redirect("/login")
    }

    return (
        <div className="flex h-screen w-full flex-col">
            <header className="flex h-16 items-center justify-between border-b px-6">
                <div className="flex items-center gap-4">
                    <Link href="/store" className="text-lg font-bold">
                        Mağaza Paneli
                    </Link>
                    <nav className="flex gap-4 text-sm text-muted-foreground">
                        <Link href="/store" className="hover:text-foreground">
                            Dashboard
                        </Link>
                        <Link href="/store/products" className="hover:text-foreground">
                            Ürünler
                        </Link>
                        <Link href="/store/customers" className="hover:text-foreground">
                            Müşteriler
                        </Link>
                        <Link href="/store/orders" className="hover:text-foreground">
                            Siparişler
                        </Link>
                        <Link href="/store/settings" className="hover:text-foreground">
                            Ayarlar
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                        {session.user.username}
                    </span>
                    <form
                        action={async () => {
                            "use server"
                            await signOut()
                        }}
                    >
                        <Button variant="outline" size="sm">
                            Çıkış Yap
                        </Button>
                    </form>
                </div>
            </header>
            <main className="flex-1 bg-muted/10 p-6">{children}</main>
        </div>
    )
}
