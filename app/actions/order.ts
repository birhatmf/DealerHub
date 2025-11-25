"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const OrderItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
})

const OrderSchema = z.object({
    customerId: z.string(),
    items: z.array(OrderItemSchema).min(1, "En az bir ürün seçmelisiniz."),
    paymentMethod: z.string().optional(),
    notes: z.string().optional(),
    paidAmount: z.coerce.number().min(0),
    status: z.string().default("SIPARIS_ALINDI"),
})

export async function createOrder(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "STORE") {
        return { message: "Yetkisiz işlem." }
    }

    const store = await prisma.store.findUnique({
        where: { userId: session.user.id },
    })

    if (!store) {
        return { message: "Mağaza bulunamadı." }
    }

    // Parse items from JSON string
    let items = []
    try {
        items = JSON.parse(formData.get("items") as string)
    } catch (e) {
        return { message: "Ürünler hatalı formatta." }
    }

    const validatedFields = OrderSchema.safeParse({
        customerId: formData.get("customerId"),
        items,
        paymentMethod: formData.get("paymentMethod"),
        notes: formData.get("notes"),
        paidAmount: formData.get("paidAmount"),
        status: formData.get("status"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { customerId, items: orderItems, paymentMethod, notes, paidAmount, status } = validatedFields.data

    // Calculate total amount
    const totalAmount = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    try {
        await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    storeId: store.id,
                    customerId,
                    totalAmount,
                    paymentMethod,
                    notes,
                    paidAmount,
                    status,
                    items: {
                        create: orderItems.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
            })

            // Update stock
            for (const item of orderItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                })
            }
        })

        revalidatePath("/store/orders")
        return { success: true }
    } catch (error) {
        console.error(error)
        return {
            message: "Sipariş oluşturulurken bir hata oluştu.",
        }
    }
}

export async function updateOrder(
    id: string,
    prevState: any,
    formData: FormData,
) {
    const session = await auth()
    if (!session?.user?.id || (session.user.role !== "STORE" && session.user.role !== "ROOT")) {
        return { message: "Yetkisiz işlem." }
    }

    let storeId: string | undefined

    if (session.user.role === "STORE") {
        const store = await prisma.store.findUnique({
            where: { userId: session.user.id },
        })

        if (!store) {
            return { message: "Mağaza bulunamadı." }
        }
        storeId = store.id
    }

    // Parse items from JSON string
    let items = []
    try {
        items = JSON.parse(formData.get("items") as string)
    } catch (e) {
        return { message: "Ürünler hatalı formatta." }
    }

    const validatedFields = OrderSchema.safeParse({
        customerId: formData.get("customerId"),
        items,
        paymentMethod: formData.get("paymentMethod"),
        notes: formData.get("notes"),
        paidAmount: formData.get("paidAmount"),
        status: formData.get("status"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { customerId, items: orderItems, paymentMethod, notes, paidAmount, status } = validatedFields.data

    // Calculate total amount
    const totalAmount = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    try {
        await prisma.$transaction(async (tx) => {
            const existingOrder = await tx.order.findUnique({
                where: { id },
                include: { items: true },
            })

            if (!existingOrder) {
                throw new Error("Sipariş bulunamadı.")
            }

            if (session.user.role === "STORE" && existingOrder.storeId !== storeId) {
                throw new Error("Bu siparişi düzenleme yetkiniz yok.")
            }

            // 1. Revert stock for existing items
            for (const item of existingOrder.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity,
                        },
                    },
                })
            }

            // 2. Delete existing items
            await tx.orderItem.deleteMany({
                where: { orderId: id },
            })

            // 3. Update order details
            await tx.order.update({
                where: { id },
                data: {
                    customerId,
                    totalAmount,
                    paymentMethod,
                    notes,
                    paidAmount,
                    status,
                    items: {
                        create: orderItems.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
            })

            // 4. Update stock for new items
            for (const item of orderItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                })
            }
        })

        revalidatePath("/store/orders")
        revalidatePath("/admin/orders")
        return { success: true }
    } catch (error: any) {
        console.error(error)
        return {
            message: error.message || "Sipariş güncellenirken bir hata oluştu.",
        }
    }
}

export async function updateOrderStatus(id: string, status: string) {
    const session = await auth()
    if (!session?.user?.id || (session.user.role !== "STORE" && session.user.role !== "ROOT")) {
        return { message: "Yetkisiz işlem." }
    }

    let storeId: string | undefined

    if (session.user.role === "STORE") {
        const store = await prisma.store.findUnique({
            where: { userId: session.user.id },
        })

        if (!store) {
            return { message: "Mağaza bulunamadı." }
        }
        storeId = store.id
    }

    try {
        const order = await prisma.order.findUnique({
            where: { id },
        })

        if (!order) {
            return { message: "Sipariş bulunamadı." }
        }

        if (session.user.role === "STORE" && order.storeId !== storeId) {
            return { message: "Bu siparişi düzenleme yetkiniz yok." }
        }

        await prisma.order.update({
            where: { id },
            data: { status },
        })

        revalidatePath("/store/orders")
        revalidatePath("/admin/orders")
        return { success: true }
    } catch (error) {
        return {
            message: "Sipariş güncellenirken bir hata oluştu.",
        }
    }
}

export async function deleteOrder(id: string) {
    const session = await auth()
    if (!session?.user?.id || (session.user.role !== "STORE" && session.user.role !== "ROOT")) {
        return { message: "Yetkisiz işlem." }
    }

    let storeId: string | undefined

    if (session.user.role === "STORE") {
        const store = await prisma.store.findUnique({
            where: { userId: session.user.id },
        })

        if (!store) {
            return { message: "Mağaza bulunamadı." }
        }
        storeId = store.id
    }

    try {
        await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id },
                include: { items: true },
            })

            if (!order) {
                throw new Error("Sipariş bulunamadı.")
            }

            if (session.user.role === "STORE" && order.storeId !== storeId) {
                throw new Error("Bu siparişi silme yetkiniz yok.")
            }

            // 1. Revert stock
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity,
                        },
                    },
                })
            }

            // 2. Delete order items
            await tx.orderItem.deleteMany({
                where: { orderId: id },
            })

            // 3. Delete order
            await tx.order.delete({
                where: { id },
            })
        })

        revalidatePath("/store/orders")
        revalidatePath("/admin/orders")
        return { success: true }
    } catch (error: any) {
        return {
            message: error.message || "Sipariş silinirken bir hata oluştu.",
        }
    }
}
