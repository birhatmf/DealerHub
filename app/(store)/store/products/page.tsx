import { Trans } from "@/components/ui/trans"
import { ProductForm } from "@/components/product-form"
import { ProductActions } from "@/components/product-actions"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import Image from "next/image"
import Link from "next/link"

export default async function ProductsPage() {
    const session = await auth()
    if (!session?.user?.id) return null

    const store = await prisma.store.findUnique({
        where: { userId: session.user.id },
    })

    // ... (imports)

    // ... (inside component)

    if (!store) return <div><Trans k="common.noData" /></div>

    const products = await prisma.product.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: "desc" },
        include: { images: true },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold"><Trans k="products.title" /></h1>
                <ProductForm />
            </div>

            <div className="rounded-md border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]"><Trans k="common.image" /></TableHead>
                            <TableHead><Trans k="products.productName" /></TableHead>
                            <TableHead><Trans k="common.price" /></TableHead>
                            <TableHead><Trans k="common.stock" /></TableHead>
                            <TableHead className="text-right"><Trans k="common.actions" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => {
                            const serializedProduct = {
                                ...product,
                                price: Number(product.price)
                            }
                            return (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        {product.images[0]?.url ? (
                                            <div className="relative h-12 w-12 overflow-hidden rounded-md">
                                                <Image
                                                    src={product.images[0].url}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-12 w-12 rounded-md bg-muted" />
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <Link href={`/store/products/${product.id}`} className="hover:underline">
                                            {product.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>₺{Number(product.price).toFixed(2)}</TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                    <TableCell className="text-right">
                                        <ProductActions product={serializedProduct} />
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {products.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    <Trans k="products.noProducts" />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
