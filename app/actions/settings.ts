"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const SettingsSchema = z.object({
    contractText: z.string().optional(),
    noteText: z.string().optional(),
    bankInfo: z.string().optional(),
})

export async function updateStoreSettings(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { message: "Oturum açmanız gerekiyor." }
    }

    const validatedFields = SettingsSchema.safeParse({
        contractText: formData.get("contractText"),
        noteText: formData.get("noteText"),
        bankInfo: formData.get("bankInfo"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Lütfen alanları kontrol edin.",
        }
    }

    try {
        await prisma.store.update({
            where: { userId: session.user.id },
            data: {
                contractText: validatedFields.data.contractText,
                noteText: validatedFields.data.noteText,
                bankInfo: validatedFields.data.bankInfo,
            },
        })

        revalidatePath("/store/settings")
        revalidatePath("/store/orders/[id]")
        return { success: true, message: "Ayarlar başarıyla güncellendi." }
    } catch (error) {
        console.error("Settings update error:", error)
        return { message: "Ayarlar güncellenirken bir hata oluştu." }
    }
}
