import { Button } from "@/components/ui/button"
import { OrderActions } from "@/components/order-actions"
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
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { StatusFilter } from "@/components/status-filter"

import { Trans } from "@/components/ui/trans"

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const params = await searchParams
    const session = await auth()
    if (!session?.user?.id) return null

    const store = await prisma.store.findUnique({
        where: { userId: session.user.id },
    })

    if (!store) return <div>Mağaza bulunamadı.</div>

    const whereClause: any = { storeId: store.id }
    if (params.status && params.status !== "all") {
        whereClause.status = params.status
    }

    const orders = await prisma.order.findMany({
        where: whereClause,
        include: {
            customer: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    })

    const products = await prisma.product.findMany({
        where: { storeId: store.id },
        select: { id: true, name: true, price: true, stock: true },
    })

    const customers = await prisma.customer.findMany({
        where: { storeId: store.id },
        select: { id: true, fullName: true },
    })


    // ... (imports)

    // ... (inside component)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold"><Trans k="orders.storeTitle" /></h1>
                <div className="flex gap-4">
                    <StatusFilter />
                    <Link href="/store/orders/create">
                        <Button><Trans k="orders.create" /></Button>
                    </Link>
                </div>
            </div>

            <div className="rounded-md border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Trans k="orders.orderNo" /></TableHead>
                            <TableHead><Trans k="orders.customer" /></TableHead>
                            <TableHead><Trans k="orders.amount" /></TableHead>
                            <TableHead><Trans k="orders.status" /></TableHead>
                            <TableHead><Trans k="orders.date" /></TableHead>
                            <TableHead className="text-right"><Trans k="common.actions" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => {
                            const serializedOrder = {
                                // ... (serialization)
                                ...order,
                                totalAmount: Number(order.totalAmount),
                                paidAmount: Number(order.paidAmount),
                                items: order.items.map((item) => ({
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
                                    <TableCell>{order.customer.fullName}</TableCell>
                                    <TableCell>₺{Number(order.totalAmount).toFixed(2)}</TableCell>
                                    <TableCell><Trans k={`status.${order.status}`} /></TableCell>
                                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/store/orders/${order.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Trans k="orders.detailPrint" />
                                                </Button>
                                            </Link>
                                            <OrderActions
                                                order={serializedOrder}
                                                products={products.map(p => ({ ...p, price: Number(p.price) }))}
                                                customers={customers}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">
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
