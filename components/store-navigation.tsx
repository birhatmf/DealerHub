"use client"

import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"

export function StoreNavigation({ username, onLogout }: { username: string, onLogout: () => void }) {
    const { t } = useLanguage()

    return (
        <header className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center gap-4">
                <Link href="/store" className="text-lg font-bold">
                    {t("common.storePanel")}
                </Link>
                <nav className="flex gap-4 text-sm text-muted-foreground">
                    <Link href="/store" className="hover:text-foreground">
                        {t("common.dashboard")}
                    </Link>
                    <Link href="/store/products" className="hover:text-foreground">
                        {t("common.products")}
                    </Link>
                    <Link href="/store/customers" className="hover:text-foreground">
                        {t("common.customers")}
                    </Link>
                    <Link href="/store/orders" className="hover:text-foreground">
                        {t("common.orders")}
                    </Link>
                    <Link href="/store/settings" className="hover:text-foreground">
                        {t("common.settings")}
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
