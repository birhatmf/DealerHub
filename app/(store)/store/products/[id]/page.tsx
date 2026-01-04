import { Trans } from "@/components/ui/trans"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ProductActions } from "@/components/product-actions"

// Badge component inline tanımı
function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "destructive" | "outline" }) {
    const variants = {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground"
    }
    
    return (
        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`} {...props} />
    )
}

interface PageProps {
    params: { id: string }
}

export default async function ProductDetailPage({ params }: PageProps) {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.id) return null

    const store = await prisma.store.findUnique({
        where: { userId: session.user.id },
    })

    if (!store) return <div><Trans k="common.noData" /></div>

    const product = await prisma.product.findFirst({
        where: {
            id: id,
            storeId: store.id
        },
        include: {
            images: {
                orderBy: { id: "asc" }
            }
        }
    })

    if (!product) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/store/products">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            <Trans k="common.back" />
                        </Button>
                    </Link>
                </div>
                <div className="text-center py-12">
                    <p className="text-muted-foreground"><Trans k="products.productNotFound" /></p>
                </div>
            </div>
        )
    }

    const serializedProduct = {
        ...product,
        price: Number(product.price)
    }

    const allImages = product.images && product.images.length > 0
        ? product.images.map((img: any) => img.url)
        : product.imageUrl
            ? [product.imageUrl]
            : []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/store/products">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            <Trans k="common.back" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                </div>
                <ProductActions product={serializedProduct} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Images Section */}
                <Card>
                    <CardHeader>
                        <CardTitle><Trans k="products.productImages" /></CardTitle>
                    </CardHeader>
                    <CardContent>
                        {allImages.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                {allImages.map((image: any, index: number) => (
                                    <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                                        <Image
                                            src={image}
                                            alt={`${product.name} - Resim ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                                <p className="text-muted-foreground"><Trans k="products.noImages" /></p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Product Details */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle><Trans k="products.productDetails" /></CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    <Trans k="products.productName" />
                                </label>
                                <p className="text-lg font-semibold">{product.name}</p>
                            </div>

                            {product.description && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        <Trans k="products.description" />
                                    </label>
                                    <p className="text-sm">{product.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        <Trans k="common.price" />
                                    </label>
                                    <p className="text-lg font-semibold">₺{Number(product.price).toFixed(2)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        <Trans k="common.stock" />
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <p className="text-lg font-semibold">{product.stock}</p>
                                        <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                                            {product.stock > 0 ? <Trans k="products.inStock" /> : <Trans k="products.outOfStock" />}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    <Trans k="common.createdAt" />
                                </label>
                                <p className="text-sm">
                                    {new Date(product.createdAt).toLocaleDateString("tr-TR")}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}