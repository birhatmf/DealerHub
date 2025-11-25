"use client"

import { useActionState, useState, useEffect } from "react"
import { createOrder, updateOrder } from "@/app/actions/order"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"

type Product = {
    id: string
    name: string
    price: number // Decimal to number
    stock: number
}

type Customer = {
    id: string
    fullName: string
}

interface OrderFormProps {
    products: Product[]
    customers: Customer[]
    order?: any
    onSuccess?: () => void
}

export function OrderForm({ products, customers, order, onSuccess }: OrderFormProps) {
    const updateAction = updateOrder.bind(null, order?.id)
    const [state, dispatch, isPending] = useActionState(
        order ? updateAction : createOrder,
        null,
    )

    const [cart, setCart] = useState<{ productId: string; quantity: number; price: number; name: string }[]>(
        order?.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: Number(item.price),
            name: item.product?.name || "Bilinmeyen Ürün", // Handle potentially missing product name if not included
        })) || []
    )
    const [selectedProduct, setSelectedProduct] = useState<string>("")
    const [quantity, setQuantity] = useState(1)
    const router = useRouter()

    useEffect(() => {
        if (state?.success) {
            if (onSuccess) {
                onSuccess()
            } else {
                router.push("/store/orders")
            }
        }
    }, [state, router, onSuccess])

    const handleAddToCart = () => {
        if (!selectedProduct) return
        const product = products.find((p) => p.id === selectedProduct)
        if (!product) return

        const existingItem = cart.find((item) => item.productId === selectedProduct)
        if (existingItem) {
            setCart(
                cart.map((item) =>
                    item.productId === selectedProduct
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            )
        } else {
            setCart([
                ...cart,
                { productId: product.id, quantity, price: Number(product.price), name: product.name },
            ])
        }
        setSelectedProduct("")
        setQuantity(1)
    }

    const handleRemoveFromCart = (productId: string) => {
        setCart(cart.filter((item) => item.productId !== productId))
    }

    const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

    return (
        <form action={dispatch} className="space-y-8">
            <input type="hidden" name="items" value={JSON.stringify(cart)} />

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Müşteri ve Detaylar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4">
                            <Label htmlFor="customerId">Müşteri Seçin</Label>
                            <Select name="customerId" defaultValue={order?.customerId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Müşteri seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((customer) => (
                                        <SelectItem key={customer.id} value={customer.id}>
                                            {customer.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {state?.errors?.customerId && (
                                <p className="text-sm text-red-500">{state.errors.customerId}</p>
                            )}
                        </div>

                        <div className="grid gap-4">
                            <Label htmlFor="paymentMethod">Ödeme Yöntemi</Label>
                            <Input
                                id="paymentMethod"
                                name="paymentMethod"
                                placeholder="Nakit, Havale, Kredi Kartı vb."
                                defaultValue={order?.paymentMethod || ""}
                            />
                        </div>

                        <div className="grid gap-4">
                            <Label htmlFor="paidAmount">Alınan Ödeme (₺)</Label>
                            <Input
                                id="paidAmount"
                                name="paidAmount"
                                type="number"
                                step="0.01"
                                defaultValue={order?.paidAmount ? Number(order.paidAmount) : "0"}
                            />
                        </div>

                        <div className="grid gap-4">
                            <Label htmlFor="notes">Özel Açıklama / Notlar</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                defaultValue={order?.notes || ""}
                            />
                        </div>

                        <div className="grid gap-4">
                            <Label htmlFor="status">Durum</Label>
                            <Select name="status" defaultValue={order?.status || "SIPARIS_ALINDI"}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Durum seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SIPARIS_ALINDI">Sipariş Alındı</SelectItem>
                                    <SelectItem value="TEKLIF_HALINDE">Teklif Halinde</SelectItem>
                                    <SelectItem value="HAZIRLANIYOR">Hazırlanıyor</SelectItem>
                                    <SelectItem value="KARGODA">Kargoda</SelectItem>
                                    <SelectItem value="TESLIM_EDILDI">Teslim Edildi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ürün Sepeti</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Ürün seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((product) => (
                                            <SelectItem key={product.id} value={product.id}>
                                                {product.name} (Stok: {product.stock}) - ₺{Number(product.price).toFixed(2)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="w-20"
                                min="1"
                            />
                            <Button type="button" onClick={handleAddToCart}>
                                Ekle
                            </Button>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ürün</TableHead>
                                        <TableHead>Adet</TableHead>
                                        <TableHead>Fiyat</TableHead>
                                        <TableHead>Toplam</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cart.map((item) => (
                                        <TableRow key={item.productId}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>₺{item.price.toFixed(2)}</TableCell>
                                            <TableCell>₺{(item.price * item.quantity).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveFromCart(item.productId)}
                                                    className="text-red-500"
                                                >
                                                    Sil
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {cart.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                Sepet boş.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <span className="text-lg font-bold">Toplam Tutar:</span>
                            <span className="text-2xl font-bold">₺{totalAmount.toFixed(2)}</span>
                        </div>

                        {state?.errors?.items && (
                            <p className="text-sm text-red-500">{state.errors.items}</p>
                        )}
                        {state?.message && (
                            <p className="text-sm text-red-500">{state.message}</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={isPending || cart.length === 0}>
                    {isPending ? "Kaydediliyor..." : (order ? "Siparişi Güncelle" : "Siparişi Oluştur")}
                </Button>
            </div>
        </form>
    )
}
