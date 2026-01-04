import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function updateImageUrls() {
    try {
        // Tüm resimleri getir
        const images = await prisma.productImage.findMany()

        console.log(`Toplam ${images.length} resim bulunuyor...`)

        let updatedCount = 0

        for (const image of images) {
            // Eğer URL /uploads/ ile başlıyorsa, /api/images/ olarak değiştir
            if (image.url.startsWith("/uploads/")) {
                const newUrl = image.url.replace("/uploads/", "/api/images/")

                await prisma.productImage.update({
                    where: { id: image.id },
                    data: { url: newUrl }
                })

                console.log(`Güncellendi: ${image.url} -> ${newUrl}`)
                updatedCount++
            }
        }

        console.log(`\n✅ ${updatedCount} resim URL'si güncellendi!`)
    } catch (error) {
        console.error("Hata:", error)
    } finally {
        await prisma.$disconnect()
    }
}

updateImageUrls()
