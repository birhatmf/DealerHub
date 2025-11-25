"use client"

import { useState, useTransition } from "react"
import { deleteOrder, updateOrderStatus } from "@/app/actions/order"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash, RefreshCw, Pencil } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { OrderForm } from "./order-form"

interface OrderActionsProps {
    order: any
    products?: any[]
    customers?: any[]
}

const ORDER_STATUSES = [
    { value: "SIPARIS_ALINDI", label: "Sipariş Alındı" },
    { value: "TEKLIF_HALINDE", label: "Teklif Halinde" },
    { value: "HAZIRLANIYOR", label: "Hazırlanıyor" },
    { value: "KARGODA", label: "Kargoda" },
    { value: "TESLIM_EDILDI", label: "Teslim Edildi" },
]

export function OrderActions({ order, products = [], customers = [] }: OrderActionsProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleDelete = async () => {
        startTransition(async () => {
            await deleteOrder(order.id)
            setShowDeleteDialog(false)
        })
    }

    const handleStatusUpdate = async (status: string) => {
        startTransition(async () => {
            await updateOrderStatus(order.id, status)
        })
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Menüyü aç</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Durum Güncelle
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            {ORDER_STATUSES.map((status) => (
                                <DropdownMenuItem
                                    key={status.value}
                                    onSelect={() => handleStatusUpdate(status.value)}
                                    disabled={order.status === status.value || isPending}
                                >
                                    {status.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem
                        onSelect={() => setShowDeleteDialog(true)}
                        className="text-red-600"
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        Sil
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Siparişi Düzenle</DialogTitle>
                        <DialogDescription>
                            Sipariş detaylarını güncelleyin.
                        </DialogDescription>
                    </DialogHeader>
                    <OrderForm
                        products={products}
                        customers={customers}
                        order={order}
                        onSuccess={() => setShowEditDialog(false)}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu işlem geri alınamaz. Bu siparişi silmek istediğinize emin misiniz?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isPending}
                        >
                            {isPending ? "Siliniyor..." : "Sil"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
