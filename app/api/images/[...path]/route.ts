import { NextRequest, NextResponse } from "next/server"
import { readFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: imagePath } = await params
    const fileName = imagePath.join("/")

    // Güvenlik: Path traversal koruması
    if (fileName.includes("..") || fileName.includes("\\")) {
        return NextResponse.json({ error: "Invalid path" }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), "public/uploads", fileName)

    // Dosya var mı kontrol et
    if (!existsSync(filePath)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    try {
        // Dosyayı oku ve MIME type belirle
        const fileBuffer = await readFile(filePath)
        const ext = path.extname(fileName).toLowerCase()
        const mimeTypes: Record<string, string> = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".webp": "image/webp",
            ".svg": "image/svg+xml",
        }

        const contentType = mimeTypes[ext] || "application/octet-stream"

        // Cache header'ları ekle (production için optimize, ama çok uzun değil)
        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600, must-revalidate",
            },
        })
    } catch (error) {
        console.error("Image serve error:", error)
        return NextResponse.json({ error: "Failed to load image" }, { status: 500 })
    }
}
