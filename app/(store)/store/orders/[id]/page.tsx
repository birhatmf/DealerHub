import { PrintButton } from "@/components/print-button"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { formatDate } from "@/lib/utils"
import Image from "next/image"

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.id) return null

    const store = await prisma.store.findUnique({
        where: { userId: session.user.id },
        include: {
            // We need all fields, but specifically the new ones are now part of the model
        }
    })

    if (!store) return <div>Mağaza bulunamadı.</div>

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            customer: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
    })

    if (!order || order.storeId !== store.id) {
        return <div>Sipariş bulunamadı.</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between print:hidden">
                <h1 className="text-3xl font-bold">Sipariş Detayı</h1>
                <PrintButton />
            </div>

            <div className="bg-white p-8 shadow-sm print:shadow-none border print:border-none">
                {/* Header */}
                <div className="flex justify-between border-b pb-8">
                    <div>
                        <h2 className="text-2xl font-bold">{store.name}</h2>
                        <p className="text-sm text-muted-foreground">Sipariş Tarihi: {formatDate(order.createdAt)}</p>
                        <p className="text-sm text-muted-foreground">Sipariş No: #{order.id.slice(-6)}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold">Müşteri Bilgileri</h3>
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
                                <th className="pb-2">Ürün</th>
                                <th className="pb-2">Resim</th>
                                <th className="pb-2 text-right">Adet</th>
                                <th className="pb-2 text-right">Birim Fiyat</th>
                                <th className="pb-2 text-right">Toplam</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item: any) => (
                                <tr key={item.id} className="border-b">
                                    <td className="py-4">
                                        <div className="font-medium">{item.product.name}</div>
                                        <div className="text-sm text-muted-foreground">{item.product.description}</div>
                                    </td>
                                    <td className="py-4">
                                        {item.product.imageUrl && (
                                            <div className="relative h-16 w-16 overflow-hidden rounded-md">
                                                <Image
                                                    src={item.product.imageUrl}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
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
                            <span>Ara Toplam:</span>
                            <span>₺{Number(order.totalAmount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Genel Toplam:</span>
                            <span>₺{Number(order.totalAmount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Ödenen:</span>
                            <span>₺{Number(order.paidAmount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-red-500 font-medium">
                            <span>Kalan:</span>
                            <span>₺{(Number(order.totalAmount) - Number(order.paidAmount)).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Contract / Notes */}
                {/* Contract / Notes */}
                <div className="mt-12 border-t pt-8">
                    <h3 className="font-bold mb-4">Satış Sözleşmesi ve Notlar</h3>
                    <div className="text-sm space-y-4 whitespace-pre-wrap">
                        {store.contractText ? (
                            <p>{store.contractText}</p>
                        ) : (
                            <>
                                <p>1. İşbu sözleşme {store.name} ile {order.customer.fullName} arasında düzenlenmiştir.</p>
                                <p>2. Ürünlerin mülkiyeti, bedeli tamamen ödenene kadar satıcıya aittir.</p>
                                <p>3. Teslimat süresi stok durumuna göre değişiklik gösterebilir.</p>
                                <p>4. İade ve değişim koşulları mağaza politikalarına tabidir.</p>
                            </>
                        )}

                        <p><strong>Ödeme Yöntemi:</strong> {order.paymentMethod || "Belirtilmemiş"}</p>

                        {store.noteText && (
                            <div className="mt-4 p-4 bg-muted rounded-md">
                                <strong>Mağaza Notları:</strong>
                                <p>{store.noteText}</p>
                            </div>
                        )}

                        {order.notes && (
                            <div className="mt-4">
                                <strong>Sipariş Notları:</strong>
                                <p>{order.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {store.bankInfo && (
                    <div className="mt-8 border-t pt-8">
                        <h3 className="font-bold mb-2">Banka ve Şirket Bilgileri</h3>
                        <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                            {store.bankInfo}
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    <p>Teşekkür ederiz!</p>
                </div>
            </div>
        </div>
    )
}
