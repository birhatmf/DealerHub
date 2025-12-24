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
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { StoreFilter } from "@/components/store-filter"
import { OrderActions } from "@/components/order-actions"

import { Trans } from "@/components/ui/trans"

export default async function AdminOrdersPage({
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

    const orders = await prisma.order.findMany({
        where: whereClause,
        include: {
            store: true,
            customer: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    })

    const stores = await prisma.store.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    })

    // Fetch all products and customers for admin to pass to edit form
    // Note: This might be heavy if there are too many, but for now it's fine.
    // Ideally we should fetch these only when editing a specific order, but OrderActions is client-side.
    // A better approach would be to fetch these inside the Dialog component using a server action or API,
    // but for simplicity and consistency with current architecture, we'll pass them.
    // However, since Admin sees all orders, passing ALL products/customers of ALL stores is too much.
    // We should probably only pass the products/customers of the store the order belongs to.
    // But OrderActions is rendered for each row.
    // We can't easily pass specific store's products to each OrderActions without fetching them all.
    // For Admin, maybe we should restrict editing items to only status?
    // User asked for "sipariş düzenlemede bütün özellikleri düzenlemeliyim".
    // Let's fetch all for now, or maybe we can skip passing them for Admin if it's too heavy?
    // No, user wants to edit.
    // Let's fetch all products and customers.
    const allProducts = await prisma.product.findMany({
        select: { id: true, name: true, price: true, stock: true, storeId: true },
    })

    const allCustomers = await prisma.customer.findMany({
        select: { id: true, fullName: true, storeId: true },
    })

    // ... (imports)

    // ... (inside component)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold"><Trans k="orders.title" /></h1>
                <StoreFilter stores={stores} />
            </div>

            <div className="rounded-md border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Trans k="orders.orderNo" /></TableHead>
                            <TableHead><Trans k="common.store" /></TableHead>
                            <TableHead><Trans k="orders.customer" /></TableHead>
                            <TableHead><Trans k="orders.amount" /></TableHead>
                            <TableHead><Trans k="orders.status" /></TableHead>
                            <TableHead><Trans k="orders.date" /></TableHead>
                            <TableHead className="text-right"><Trans k="common.actions" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order: any) => {
                            const serializedOrder = {
                                // ... (serialization)
                                ...order,
                                totalAmount: Number(order.totalAmount),
                                paidAmount: Number(order.paidAmount),
                                items: order.items.map((item: any) => ({
                                    ...item,
                                    price: Number(item.price),
                                    product: {
                                        ...item.product,
                                        price: Number(item.product.price)
                                    }
                                }))
                            }
                            return (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                                    <TableCell>{order.store.name}</TableCell>
                                    <TableCell>{order.customer.fullName}</TableCell>
                                    <TableCell>₺{Number(order.totalAmount).toFixed(2)}</TableCell>
                                    <TableCell><Trans k={`status.${order.status}`} /></TableCell>
                                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/orders/${order.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Trans k="orders.view" />
                                                </Button>
                                            </Link>
                                            <OrderActions
                                                order={serializedOrder}
                                                products={allProducts.filter(p => p.storeId === order.storeId).map(p => ({ ...p, price: Number(p.price) }))}
                                                customers={allCustomers.filter(c => c.storeId === order.storeId)}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    <Trans k="orders.noOrders" />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
