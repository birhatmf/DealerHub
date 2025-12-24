"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type Store = {
    id: string
    name: string
}

export function StoreFilter({ stores }: { stores: Store[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentStore = searchParams.get("store") || "all"

    const handleStoreChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === "all") {
            params.delete("store")
        } else {
            params.set("store", value)
        }
        router.push(`?${params.toString()}`)
    }

    return (
        <Select value={currentStore} onValueChange={handleStoreChange}>
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Mağaza Seçin" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                        {store.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
