"use client"

import { useActionState, useState, useEffect } from "react"
import { createProduct, updateProduct } from "@/app/actions/product"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ProductFormProps {
    product?: any
    open?: boolean
    setOpen?: (open: boolean) => void
}

export function ProductForm({ product, open: controlledOpen, setOpen: setControlledOpen }: ProductFormProps) {
    const [open, setOpen] = useState(false)
    const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined
    const isOpen = isControlled ? controlledOpen : open
    const onOpenChange = isControlled ? setControlledOpen : setOpen

    const updateAction = updateProduct.bind(null, product?.id)
    const [state, dispatch, isPending] = useActionState(
        product ? updateAction : createProduct,
        null,
    )

    useEffect(() => {
        if (state?.success && isOpen) {
            onOpenChange(false)
        }
    }, [state, isOpen, onOpenChange])

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {!isControlled && (
                <DialogTrigger asChild>
                    <Button>Yeni Ürün Ekle</Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{product ? "Ürünü Düzenle" : "Ürün Ekle"}</DialogTitle>
                    <DialogDescription>
                        {product
                            ? "Ürün bilgilerini güncelleyin."
                            : "Mağazanıza yeni bir ürün ekleyin."}
                    </DialogDescription>
                </DialogHeader>
                <form action={dispatch} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Ürün Adı
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={product?.name}
                            className="col-span-3"
                            required
                        />
                    </div>
                    {state?.errors?.name && (
                        <p className="text-right text-sm text-red-500">{state.errors.name}</p>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            Açıklama
                        </Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={product?.description || ""}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                            Fiyat (₺)
                        </Label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            defaultValue={product?.price ? Number(product.price) : undefined}
                            className="col-span-3"
                            required
                        />
                    </div>
                    {state?.errors?.price && (
                        <p className="text-right text-sm text-red-500">{state.errors.price}</p>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stock" className="text-right">
                            Stok
                        </Label>
                        <Input
                            id="stock"
                            name="stock"
                            type="number"
                            defaultValue={product?.stock}
                            className="col-span-3"
                            required
                        />
                    </div>
                    {state?.errors?.stock && (
                        <p className="text-right text-sm text-red-500">{state.errors.stock}</p>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="image" className="text-right">
                            Resim
                        </Label>
                        <Input id="image" name="image" type="file" accept="image/*" className="col-span-3" />
                    </div>

                    {state?.message && (
                        <p className="text-center text-sm text-red-500">{state.message}</p>
                    )}
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Kaydediliyor..." : "Kaydet"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
