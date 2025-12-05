"use client"

import { useActionState, useState, useEffect } from "react"
import { createCustomer, updateCustomer } from "@/app/actions/customer"
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

interface CustomerFormProps {
    customer?: any
    open?: boolean
    setOpen?: (open: boolean) => void
}

import { useLanguage } from "@/components/language-provider"

// ... (imports)

export function CustomerForm({ customer, open: controlledOpen, setOpen: setControlledOpen }: CustomerFormProps) {
    const { t } = useLanguage()
    const [open, setOpen] = useState(false)
    const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined
    const isOpen = isControlled ? controlledOpen : open
    const onOpenChange = isControlled ? setControlledOpen : setOpen

    const updateAction = updateCustomer.bind(null, customer?.id)
    const [state, dispatch, isPending] = useActionState(
        customer ? updateAction : createCustomer,
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
                    <Button>{t("customers.addNew")}</Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{customer ? t("customers.edit") : t("customers.add")}</DialogTitle>
                    <DialogDescription>
                        {customer
                            ? t("customers.updateDesc")
                            : t("customers.createDesc")}
                    </DialogDescription>
                </DialogHeader>
                <form action={dispatch} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fullName">{t("customers.fullName")}</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                defaultValue={customer?.fullName}
                                required
                            />
                            {state?.errors?.fullName && (
                                <p className="text-sm text-red-500">{state.errors.fullName}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tc">{t("customers.tc")}</Label>
                            <Input
                                id="tc"
                                name="tc"
                                defaultValue={customer?.tc || ""}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">{t("customers.email")}</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={customer?.email || ""}
                            />
                            {state?.errors?.email && (
                                <p className="text-sm text-red-500">{state.errors.email}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">{t("customers.phone")}</Label>
                            <Input
                                id="phone"
                                name="phone"
                                defaultValue={customer?.phone || ""}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">{t("customers.cityAddress")}</Label>
                        <Textarea
                            id="address"
                            name="address"
                            defaultValue={customer?.address || ""}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="companyName">{t("customers.companyName")}</Label>
                            <Input
                                id="companyName"
                                name="companyName"
                                defaultValue={customer?.companyName || ""}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="taxNo">{t("customers.taxNo")}</Label>
                            <Input
                                id="taxNo"
                                name="taxNo"
                                defaultValue={customer?.taxNo || ""}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="taxOffice">{t("customers.taxOffice")}</Label>
                            <Input
                                id="taxOffice"
                                name="taxOffice"
                                defaultValue={customer?.taxOffice || ""}
                            />
                        </div>
                    </div>

                    {state?.message && (
                        <p className="text-center text-sm text-red-500">{state.message}</p>
                    )}
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? t("common.saving") : t("common.save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
