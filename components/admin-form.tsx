"use client"

import { useActionState, useEffect, useState } from "react"
import { createAdminUser } from "@/app/actions/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

export function AdminForm() {
    const [open, setOpen] = useState(false)
    const [state, dispatch, isPending] = useActionState(createAdminUser, null)

    useEffect(() => {
        if (state?.success) {
            setOpen(false)
        }
    }, [state])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Yönetici Ekle
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Yeni Yönetici Ekle</DialogTitle>
                    <DialogDescription>
                        Sisteme tam erişim yetkisine sahip yeni bir yönetici oluşturun.
                    </DialogDescription>
                </DialogHeader>
                <form action={dispatch} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="username">Kullanıcı Adı</Label>
                        <Input id="username" name="username" required />
                        {state?.errors?.username && (
                            <p className="text-sm text-red-500">{state.errors.username}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Şifre</Label>
                        <Input id="password" name="password" type="password" required />
                        {state?.errors?.password && (
                            <p className="text-sm text-red-500">{state.errors.password}</p>
                        )}
                    </div>
                    {state?.message && (
                        <p className={`text-sm ${state.success ? "text-green-600" : "text-red-500"}`}>
                            {state.message}
                        </p>
                    )}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Oluşturuluyor..." : "Oluştur"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
