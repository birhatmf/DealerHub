"use client"

import { useState, useTransition } from "react"
import { deleteProduct } from "@/app/actions/product"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { ProductForm } from "./product-form"
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

interface ProductActionsProps {
    product: any
}

export function ProductActions({ product }: ProductActionsProps) {
    const [open, setOpen] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleDelete = async () => {
        startTransition(async () => {
            await deleteProduct(product.id)
            setShowDeleteDialog(false)
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
                    <DropdownMenuItem onSelect={() => setOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => setShowDeleteDialog(true)}
                        className="text-red-600"
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        Sil
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ProductForm open={open} setOpen={setOpen} product={product} />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu işlem geri alınamaz. Bu ürünü silmek istediğinize emin misiniz?
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
