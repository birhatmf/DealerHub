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
import { redirect } from "next/navigation"
import Image from "next/image"
import { StoreFilter } from "@/components/store-filter"
import { ProductActions } from "@/components/product-actions"

import { Trans } from "@/components/ui/trans"

export default async function AdminProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ store?: string }>
}) {
    const params = await searchParams
    const session = await auth()
    if (!session || session.user.role !== "ROOT") {
        redirect("/login")
    }

    const whereClause: any = {}
    if (params.store && params.store !== "all") {
        whereClause.storeId = params.store
    }

    const products = await prisma.product.findMany({
        where: whereClause,
        include: {
            store: true,
        },
        orderBy: { createdAt: "desc" },
    })

    const stores = await prisma.store.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    })

    // ... (imports)

    // ... (inside component)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold"><Trans k="products.title" /></h1>
                <StoreFilter stores={stores} />
            </div>

            <div className="rounded-md border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]"><Trans k="common.image" /></TableHead>
                            <TableHead><Trans k="products.productName" /></TableHead>
                            <TableHead><Trans k="common.store" /></TableHead>
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
                                        {product.imageUrl ? (
                                            <div className="relative h-12 w-12 overflow-hidden rounded-md">
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-12 w-12 rounded-md bg-muted" />
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.store.name}</TableCell>
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
                                <TableCell colSpan={6} className="text-center">
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
