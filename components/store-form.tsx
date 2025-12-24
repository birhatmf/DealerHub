"use client"

import { useActionState, useState, useEffect } from "react"
import { createStore, updateStore } from "@/app/actions/store"
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

interface StoreFormProps {
    store?: any
    open?: boolean
    setOpen?: (open: boolean) => void
}

export function StoreForm({ store, open: controlledOpen, setOpen: setControlledOpen }: StoreFormProps) {
    const [open, setOpen] = useState(false)
    const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined
    const isOpen = isControlled ? controlledOpen : open
    const onOpenChange = isControlled ? setControlledOpen : setOpen

    const updateAction = updateStore.bind(null, store?.id)
    const [state, dispatch, isPending] = useActionState(
        store ? updateAction : createStore,
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
                    <Button>Yeni Mağaza Ekle</Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{store ? "Mağazayı Düzenle" : "Mağaza Ekle"}</DialogTitle>
                    <DialogDescription>
                        {store
                            ? "Mağaza bilgilerini güncelleyin."
                            : "Yeni bir mağaza ve kullanıcı hesabı oluşturun."}
                    </DialogDescription>
                </DialogHeader>
                <form action={dispatch} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Mağaza Adı
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={store?.name}
                            className="col-span-3"
                            required
                        />
                    </div>
                    {state?.errors?.name && (
                        <p className="text-right text-sm text-red-500">{state.errors.name}</p>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                            Kullanıcı Adı
                        </Label>
                        <Input
                            id="username"
                            name="username"
                            defaultValue={store?.user?.username}
                            className="col-span-3"
                            required={!store}
                            placeholder={store ? "Değiştirmek için girin" : undefined}
                        />
                    </div>
                    {state?.errors?.username && (
                        <p className="text-right text-sm text-red-500">
                            {state.errors.username}
                        </p>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">
                            Şifre
                        </Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            className="col-span-3"
                            required={!store}
                            placeholder={store ? "Değiştirmek için girin" : undefined}
                        />
                    </div>
                    {state?.errors?.password && (
                        <p className="text-right text-sm text-red-500">
                            {state.errors.password}
                        </p>
                    )}
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
