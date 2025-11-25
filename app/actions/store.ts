"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const StoreSchema = z.object({
    name: z.string().min(3, "Mağaza adı en az 3 karakter olmalıdır."),
    username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır."),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
})

export async function createStore(prevState: any, formData: FormData) {
    const validatedFields = StoreSchema.safeParse({
        name: formData.get("name"),
        username: formData.get("username"),
        password: formData.get("password"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { name, username, password } = validatedFields.data

    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    username,
                    password: hashedPassword,
                    role: "STORE",
                },
            })

            await tx.store.create({
                data: {
                    name,
                    userId: user.id,
                },
            })
        })

        revalidatePath("/admin/stores")
        return { success: true }
    } catch (error) {
        return {
            message: "Bir hata oluştu. Kullanıcı adı kullanılıyor olabilir.",
        }
    }
}

export async function updateStore(
    id: string,
    prevState: any,
    formData: FormData,
) {
    const validatedFields = StoreSchema.partial().safeParse({
        name: formData.get("name"),
        username: formData.get("username"),
        password: formData.get("password"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { name, username, password } = validatedFields.data

    try {
        await prisma.$transaction(async (tx) => {
            const store = await tx.store.findUnique({
                where: { id },
                include: { user: true },
            })

            if (!store) {
                throw new Error("Mağaza bulunamadı.")
            }

            if (name) {
                await tx.store.update({
                    where: { id },
                    data: { name },
                })
            }

            if (username || password) {
                const userData: any = {}
                if (username) userData.username = username
                if (password) userData.password = await bcrypt.hash(password, 10)

                await tx.user.update({
                    where: { id: store.userId },
                    data: userData,
                })
            }
        })

        revalidatePath("/admin/stores")
        return { success: true }
    } catch (error) {
        return {
            message: "Güncelleme sırasında bir hata oluştu.",
        }
    }
}

export async function deleteStore(id: string) {
    try {
        await prisma.$transaction(async (tx) => {
            const store = await tx.store.findUnique({
                where: { id },
            })

            if (!store) {
                throw new Error("Mağaza bulunamadı.")
            }

            // 1. Delete all order items for this store's orders
            // We need to find all orders first
            const orders = await tx.order.findMany({
                where: { storeId: id },
                select: { id: true },
            })
            const orderIds = orders.map(o => o.id)

            if (orderIds.length > 0) {
                await tx.orderItem.deleteMany({
                    where: { orderId: { in: orderIds } },
                })
            }

            // 2. Delete all orders
            await tx.order.deleteMany({
                where: { storeId: id },
            })

            // 3. Delete all products (OrderItems already deleted, so this is safe if no other constraints)
            // Wait, if OrderItems reference Products, and we deleted OrderItems, we can delete Products.
            await tx.product.deleteMany({
                where: { storeId: id },
            })

            // 4. Delete all customers
            await tx.customer.deleteMany({
                where: { storeId: id },
            })

            // 5. Delete store
            await tx.store.delete({
                where: { id },
            })

            // 6. Delete user
            await tx.user.delete({
                where: { id: store.userId },
            })
        })

        revalidatePath("/admin/stores")
        return { success: true }
    } catch (error: any) {
        console.error(error)
        return {
            message: error.message || "Silme işlemi sırasında bir hata oluştu.",
        }
    }
}
