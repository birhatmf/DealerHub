"use client"

import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"

export function AdminNavigation({ username, onLogout }: { username: string, onLogout: () => void }) {
    const { t } = useLanguage()

    return (
        <header className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center gap-4">
                <Link href="/admin" className="text-lg font-bold">
                    {t("common.adminPanel")}
                </Link>
                <nav className="flex gap-4 text-sm text-muted-foreground">
                    <Link href="/admin" className="hover:text-foreground">
                        {t("common.dashboard")}
                    </Link>
                    <Link href="/admin/stores" className="hover:text-foreground">
                        {t("common.stores")}
                    </Link>
                    <Link href="/admin/customers" className="hover:text-foreground">
                        {t("common.customers")}
                    </Link>
                    <Link href="/admin/products" className="hover:text-foreground">
                        {t("common.products")}
                    </Link>
                    <Link href="/admin/orders" className="hover:text-foreground">
                        {t("common.orders")}
                    </Link>
                    <Link href="/admin/users" className="hover:text-foreground">
                        {t("common.users")}
                    </Link>
                </nav>
            </div>
            <div className="flex items-center gap-4">
                <LanguageSwitcher />
                <span className="text-sm text-muted-foreground">
                    {username}
                </span>
                <form action={onLogout}>
                    <Button variant="outline" size="sm">
                        {t("common.logout")}
                    </Button>
                </form>
            </div>
        </header>
    )
}
