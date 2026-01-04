import { Trans } from "@/components/ui/trans"
import { PrintButton } from "@/components/print-button"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { formatDate } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.id) return null

    const store = await prisma.store.findUnique({
        where: { userId: session.user.id },
    })

    if (!store) return <div><Trans k="common.noData" /></div>

    // ...

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            customer: true,
            items: {
                include: {
                    product: {
                        include: {
                            images: true,
                        },
                    },
                },
            },
        },
    })

    if (!order || order.storeId !== store.id) {
        return <div><Trans k="orders.notFound" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between print:hidden">
                <h1 className="text-3xl font-bold"><Trans k="orders.details" /></h1>
                <PrintButton />
            </div>

            <div className="bg-white p-8 shadow-sm print:shadow-none border print:border-none">
                {/* Header */}
                <div className="flex justify-between border-b pb-8">
                    <div>
                        <h2 className="text-2xl font-bold">{store.name}</h2>
                        <p className="text-sm text-muted-foreground"><Trans k="orders.orderDate" /> {formatDate(order.createdAt)}</p>
                        <p className="text-sm text-muted-foreground"><Trans k="orders.orderNo" /> #{order.id.slice(-6)}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold"><Trans k="orders.customerInfo" /></h3>
                        <p>{order.customer.fullName}</p>
                        <p>{order.customer.phone}</p>
                        <p>{order.customer.email}</p>
                        <p>{order.customer.address}</p>
                        {order.customer.companyName && <p>{order.customer.companyName}</p>}
                        {order.customer.taxNo && <p>VN: {order.customer.taxNo}</p>}
                    </div>
                </div>

                {/* Items */}
                <div className="mt-8">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="pb-2"><Trans k="orders.product" /></th>
                                <th className="pb-2"><Trans k="orders.image" /></th>
                                <th className="pb-2 text-right"><Trans k="orders.quantity" /></th>
                                <th className="pb-2 text-right"><Trans k="orders.unitPrice" /></th>
                                <th className="pb-2 text-right"><Trans k="orders.total" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item: any) => (
                                <tr key={item.id} className="border-b">
                                    <td className="py-4">
                                        <Link href={`/store/products/${item.product.id}`} className="hover:underline">
                                            <div className="font-medium">{item.product.name}</div>
                                        </Link>
                                        <div className="text-sm text-muted-foreground">{item.product.description}</div>
                                    </td>
                                    <td className="py-4">
                                        {item.product.images[0]?.url && (
                                            <Link href={`/store/products/${item.product.id}`}>
                                                <div className="relative h-16 w-16 overflow-hidden rounded-md">
                                                    <Image
                                                        src={item.product.images[0].url}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </Link>
                                        )}
                                    </td>
                                    <td className="py-4 text-right">{item.quantity}</td>
                                    <td className="py-4 text-right">₺{Number(item.price).toFixed(2)}</td>
                                    <td className="py-4 text-right">₺{(Number(item.price) * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="mt-8 flex justify-end">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between">
                            <span><Trans k="orders.subtotal" /></span>
                            <span>₺{Number(order.totalAmount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span><Trans k="orders.grandTotal" /></span>
                            <span>₺{Number(order.totalAmount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span><Trans k="orders.paid" /></span>
                            <span>₺{Number(order.paidAmount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-red-500 font-medium">
                            <span><Trans k="orders.remaining" /></span>
                            <span>₺{(Number(order.totalAmount) - Number(order.paidAmount)).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Contract / Notes */}
                <div className="mt-12 border-t pt-8">
                    <h3 className="font-bold mb-4"><Trans k="orders.contractAndNotes" /></h3>
                    <div className="text-sm space-y-4 whitespace-pre-wrap">
                        {/* @ts-ignore */}
                        {store.contractText ? (
                            /* @ts-ignore */
                            <p>{store.contractText}</p>
                        ) : (
                            <>
                                <p><Trans k="orders.contract.clause1" args={[store.name, order.customer.fullName]} /></p>
                                <p><Trans k="orders.contract.clause2" /></p>
                                <p><Trans k="orders.contract.clause3" /></p>
                                <p><Trans k="orders.contract.clause4" /></p>
                            </>
                        )}

                        <p><strong><Trans k="orders.paymentMethod" />:</strong> {order.paymentMethod || <Trans k="orders.notSpecified" />}</p>

                        {/* @ts-ignore */}
                        {store.noteText && (
                            <div className="mt-4 p-4 bg-muted rounded-md">
                                <strong><Trans k="orders.storeNotes" /></strong>
                                {/* @ts-ignore */}
                                <p>{store.noteText}</p>
                            </div>
                        )}

                        {order.notes && (
                            <div className="mt-4">
                                <strong><Trans k="orders.orderNotes" /></strong>
                                <p>{order.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* @ts-ignore */}
                {store.bankInfo && (
                    <div className="mt-8 border-t pt-8">
                        <h3 className="font-bold mb-2"><Trans k="orders.bankInfo" /></h3>
                        <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                            {/* @ts-ignore */}
                            {store.bankInfo}
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    <p><Trans k="orders.thankYou" /></p>
                </div>
            </div>
        </div>
    )
}
