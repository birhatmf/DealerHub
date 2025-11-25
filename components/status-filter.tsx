"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const ORDER_STATUSES = [
    { value: "all", label: "Tümü" },
    { value: "SIPARIS_ALINDI", label: "Sipariş Alındı" },
    { value: "TEKLIF_HALINDE", label: "Teklif Halinde" },
    { value: "HAZIRLANIYOR", label: "Hazırlanıyor" },
    { value: "KARGODA", label: "Kargoda" },
    { value: "TESLIM_EDILDI", label: "Teslim Edildi" },
]

export function StatusFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentStatus = searchParams.get("status") || "all"

    const handleStatusChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === "all") {
            params.delete("status")
        } else {
            params.set("status", value)
        }
        router.push(`?${params.toString()}`)
    }

    return (
        <Select value={currentStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Durum Seçin" />
            </SelectTrigger>
            <SelectContent>
                {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                        {status.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
