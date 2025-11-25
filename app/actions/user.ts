"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import bcrypt from "bcryptjs"

const CreateAdminSchema = z.object({
    username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır."),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
})

export async function createAdminUser(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session || session.user.role !== "ROOT") {
        return { message: "Yetkisiz işlem." }
    }

    const validatedFields = CreateAdminSchema.safeParse({
        username: formData.get("username"),
        password: formData.get("password"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Lütfen alanları kontrol edin.",
        }
    }

    const { username, password } = validatedFields.data

    try {
        const existingUser = await prisma.user.findUnique({
            where: { username },
        })

        if (existingUser) {
            return {
                message: "Bu kullanıcı adı zaten kullanılıyor.",
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: "ROOT",
            },
        })

        revalidatePath("/admin/users")
        return { success: true, message: "Yönetici başarıyla oluşturuldu." }
    } catch (error) {
        console.error("Create admin error:", error)
        return { message: "Yönetici oluşturulurken bir hata oluştu." }
    }
}

export async function deleteUser(userId: string) {
    const session = await auth()
    if (!session || session.user.role !== "ROOT") {
        return { message: "Yetkisiz işlem." }
    }

    if (userId === session.user.id) {
        return { message: "Kendi hesabınızı silemezsiniz." }
    }

    try {
        await prisma.user.delete({
            where: { id: userId },
        })

        revalidatePath("/admin/users")
        return { success: true, message: "Kullanıcı başarıyla silindi." }
    } catch (error) {
        console.error("Delete user error:", error)
        return { message: "Kullanıcı silinirken bir hata oluştu." }
    }
}
