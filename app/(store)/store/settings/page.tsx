import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { SettingsForm } from "@/components/settings-form"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
    const session = await auth()
    if (!session?.user?.id) return null

    const store = await prisma.store.findUnique({
        where: { userId: session.user.id },
        select: {
            contractText: true,
            noteText: true,
            bankInfo: true,
        },
    })

    if (!store) {
        return <div>Mağaza bulunamadı.</div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Mağaza Ayarları</h1>
            <SettingsForm store={store} />
        </div>
    )
}
