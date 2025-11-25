"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const CustomerSchema = z.object({
    fullName: z.string().min(2, "Ad Soyad en az 2 karakter olmalıdır."),
    tc: z.string().optional(),
    email: z.string().email("Geçerli bir email adresi giriniz.").optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    companyName: z.string().optional(),
    taxNo: z.string().optional(),
    taxOffice: z.string().optional(),
})

export async function createCustomer(prevState: any, formData: FormData) {
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

    const validatedFields = CustomerSchema.safeParse({
        fullName: formData.get("fullName"),
        tc: formData.get("tc"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        address: formData.get("address"),
        companyName: formData.get("companyName"),
        taxNo: formData.get("taxNo"),
        taxOffice: formData.get("taxOffice"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    try {
        await prisma.customer.create({
            data: {
                ...validatedFields.data,
                storeId: store.id,
            },
        })

        revalidatePath("/store/customers")
        return { success: true }
    } catch (error) {
        return {
            message: "Müşteri oluşturulurken bir hata oluştu.",
        }
    }
}

export async function updateCustomer(
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

    const validatedFields = CustomerSchema.partial().safeParse({
        fullName: formData.get("fullName"),
        tc: formData.get("tc"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        address: formData.get("address"),
        companyName: formData.get("companyName"),
        taxNo: formData.get("taxNo"),
        taxOffice: formData.get("taxOffice"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    try {
        const customer = await prisma.customer.findUnique({
            where: { id },
        })

        if (!customer) {
            return { message: "Müşteri bulunamadı." }
        }

        if (session.user.role === "STORE" && customer.storeId !== storeId) {
            return { message: "Bu müşteriyi düzenleme yetkiniz yok." }
        }

        await prisma.customer.update({
            where: { id },
            data: validatedFields.data,
        })

        revalidatePath("/store/customers")
        revalidatePath("/admin/customers")
        return { success: true }
    } catch (error) {
        return {
            message: "Müşteri güncellenirken bir hata oluştu.",
        }
    }
}

export async function deleteCustomer(id: string) {
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
        const customer = await prisma.customer.findUnique({
            where: { id },
            include: { _count: { select: { orders: true } } },
        })

        if (!customer) {
            return { message: "Müşteri bulunamadı." }
        }

        if (session.user.role === "STORE" && customer.storeId !== storeId) {
            return { message: "Bu müşteriyi silme yetkiniz yok." }
        }

        if (customer._count.orders > 0) {
            return { message: "Bu müşterinin siparişleri olduğu için silinemez." }
        }

        await prisma.customer.delete({
            where: { id },
        })

        revalidatePath("/store/customers")
        revalidatePath("/admin/customers")
        return { success: true }
    } catch (error) {
        return {
            message: "Müşteri silinirken bir hata oluştu.",
        }
    }
}
