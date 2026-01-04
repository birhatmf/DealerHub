import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
    const products = await prisma.product.findMany({ where: { imageUrl: { not: null } } })
    for (const product of products) {
        if (product.imageUrl) {
            const existing = await prisma.productImage.findFirst({ where: { productId: product.id, url: product.imageUrl } })
            if (!existing) {
                await prisma.productImage.create({ data: { productId: product.id, url: product.imageUrl } })
            }
        }
    }
}
main()