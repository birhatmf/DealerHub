import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { SettingsForm } from "@/components/settings-form"
import { redirect } from "next/navigation"

import { Trans } from "@/components/ui/trans"

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
        return <div><Trans k="common.noData" /></div>
    }

    // ... (imports)

    // ... (inside component)

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold"><Trans k="settings.title" /></h1>
            <SettingsForm store={store} />
        </div>
    )
}
