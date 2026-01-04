"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import fs from "node:fs/promises"
import path from "node:path"

const ProductSchema = z.object({
    name: z.string().min(2, "Ürün adı en az 2 karakter olmalıdır."),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz."),
    stock: z.coerce.number().int().min(0, "Stok 0'dan küçük olamaz."),
})

export async function createProduct(prevState: any, formData: FormData) {
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

    const validatedFields = ProductSchema.safeParse({
        name: formData.get("name"),
        description: formData.get("description"),
        price: formData.get("price"),
        stock: formData.get("stock"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { name, description, price, stock } = validatedFields.data

    const imageFiles = formData.getAll("images") as File[]
    const uploadedImageUrls: string[] = []
    const uploadDir = path.join(process.cwd(), "public/uploads")

    for (const imageFile of imageFiles) {
        if (imageFile && imageFile.size > 0) {
            const buffer = Buffer.from(await imageFile.arrayBuffer())
            const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, "-")}`

            try {
                await fs.mkdir(uploadDir, { recursive: true })
                await fs.writeFile(path.join(uploadDir, fileName), buffer)
                uploadedImageUrls.push(`/api/images/${fileName}`)
            } catch (error) {
                console.error("Image upload failed:", error)
            }
        }
    }

    try {
        await prisma.product.create({
            data: {
                name,
                description,
                price,
                stock,
                storeId: store.id,
                images: {
                    create: uploadedImageUrls.map(url => ({ url }))
                }
            },
        })

        revalidatePath("/store/products")
        return { success: true }
    } catch (error) {
        return {
            message: "Ürün oluşturulurken bir hata oluştu.",
        }
    }
}

export async function updateProduct(
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

    const validatedFields = ProductSchema.partial().safeParse({
        name: formData.get("name"),
        description: formData.get("description"),
        price: formData.get("price"),
        stock: formData.get("stock"),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { name, description, price, stock } = validatedFields.data

    const imageFiles = formData.getAll("images") as File[]
    const uploadedImageUrls: string[] = []
    const uploadDir = path.join(process.cwd(), "public/uploads")

    for (const imageFile of imageFiles) {
        if (imageFile && imageFile.size > 0) {
            const buffer = Buffer.from(await imageFile.arrayBuffer())
            const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, "-")}`

            try {
                await fs.mkdir(uploadDir, { recursive: true })
                await fs.writeFile(path.join(uploadDir, fileName), buffer)
                uploadedImageUrls.push(`/api/images/${fileName}`)
            } catch (error) {
                console.error("Image upload failed:", error)
            }
        }
    }

    try {
        const product = await prisma.product.findUnique({
            where: { id },
        })

        if (!product) {
            return { message: "Ürün bulunamadı." }
        }

        if (session.user.role === "STORE" && product.storeId !== storeId) {
            return { message: "Bu ürünü düzenleme yetkiniz yok." }
        }

        const updateData: any = {
            name,
            description,
            price,
            stock,
        }

        if (uploadedImageUrls.length > 0) {
            await prisma.productImage.deleteMany({
                where: { productId: id }
            })
            updateData.images = {
                create: uploadedImageUrls.map(url => ({ url }))
            }
        }

        await prisma.product.update({
            where: { id },
            data: updateData,
        })

        revalidatePath("/store/products")
        revalidatePath("/admin/products")
        return { success: true }
    } catch (error) {
        return {
            message: "Ürün güncellenirken bir hata oluştu.",
        }
    }
}

export async function deleteProduct(id: string) {
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
        const product = await prisma.product.findUnique({
            where: { id },
            include: { _count: { select: { orderItems: true } } },
        })

        if (!product) {
            return { message: "Ürün bulunamadı." }
        }

        if (session.user.role === "STORE" && product.storeId !== storeId) {
            return { message: "Bu ürünü silme yetkiniz yok." }
        }

        if (product._count.orderItems > 0) {
            return { message: "Bu ürün siparişlerde kullanıldığı için silinemez." }
        }

        await prisma.product.delete({
            where: { id },
        })

        revalidatePath("/store/products")
        revalidatePath("/admin/products")
        return { success: true }
    } catch (error) {
        return {
            message: "Ürün silinirken bir hata oluştu.",
        }
    }
}
