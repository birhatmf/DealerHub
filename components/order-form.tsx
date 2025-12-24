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

import { useLanguage } from "@/components/language-provider"

// ... (imports)

export function OrderForm({ products, customers, order, onSuccess }: OrderFormProps) {
    const { t } = useLanguage()
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
            name: item.product?.name || t("orders.unknownProduct"),
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
                        <CardTitle>{t("orders.customerDetails")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4">
                            <Label htmlFor="customerId">{t("orders.selectCustomer")}</Label>
                            <Select name="customerId" defaultValue={order?.customerId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder={t("orders.selectCustomerPlaceholder")} />
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
                            <Label htmlFor="paymentMethod">{t("orders.paymentMethod")}</Label>
                            <Input
                                id="paymentMethod"
                                name="paymentMethod"
                                placeholder={t("orders.paymentMethodPlaceholder")}
                                defaultValue={order?.paymentMethod || ""}
                            />
                        </div>

                        <div className="grid gap-4">
                            <Label htmlFor="paidAmount">{t("orders.receivedPayment")}</Label>
                            <Input
                                id="paidAmount"
                                name="paidAmount"
                                type="number"
                                step="0.01"
                                defaultValue={order?.paidAmount ? Number(order.paidAmount) : "0"}
                            />
                        </div>

                        <div className="grid gap-4">
                            <Label htmlFor="notes">{t("orders.notes")}</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                defaultValue={order?.notes || ""}
                            />
                        </div>

                        <div className="grid gap-4">
                            <Label htmlFor="status">{t("orders.status")}</Label>
                            <Select name="status" defaultValue={order?.status || "SIPARIS_ALINDI"}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t("orders.selectStatus")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SIPARIS_ALINDI">{t("status.SIPARIS_ALINDI")}</SelectItem>
                                    <SelectItem value="TEKLIF_HALINDE">{t("status.TEKLIF_HALINDE")}</SelectItem>
                                    <SelectItem value="HAZIRLANIYOR">{t("status.HAZIRLANIYOR")}</SelectItem>
                                    <SelectItem value="KARGODA">{t("status.KARGODA")}</SelectItem>
                                    <SelectItem value="TESLIM_EDILDI">{t("status.TESLIM_EDILDI")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("orders.cart")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("orders.selectProduct")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((product) => (
                                            <SelectItem key={product.id} value={product.id}>
                                                {product.name} ({t("orders.stock")} {product.stock}) - ₺{Number(product.price).toFixed(2)}
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
                                {t("orders.add")}
                            </Button>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("orders.product")}</TableHead>
                                        <TableHead>{t("orders.quantity")}</TableHead>
                                        <TableHead>{t("orders.price")}</TableHead>
                                        <TableHead>{t("orders.total")}</TableHead>
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
                                                    {t("orders.delete")}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {cart.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                {t("orders.emptyCart")}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <span className="text-lg font-bold">{t("orders.totalAmount")}</span>
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
                    {isPending ? t("common.saving") : (order ? t("orders.updateOrder") : t("orders.createOrder"))}
                </Button>
            </div>
        </form>
    )
}
