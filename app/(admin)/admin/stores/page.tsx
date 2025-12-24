import { StoreForm } from "@/components/store-form"
import { StoreActions } from "@/components/store-actions"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"

export default async function StoresPage() {
    const stores = await prisma.store.findMany({
        include: {
            user: true,
            _count: {
                select: { orders: true, products: true },
            },
        },
        orderBy: { createdAt: "desc" },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Mağazalar</h1>
                <StoreForm />
            </div>

            <div className="rounded-md border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mağaza Adı</TableHead>
                            <TableHead>Kullanıcı Adı</TableHead>
                            <TableHead>Ürün Sayısı</TableHead>
                            <TableHead>Sipariş Sayısı</TableHead>
                            <TableHead>Oluşturulma Tarihi</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stores.map((store) => (
                            <TableRow key={store.id}>
                                <TableCell className="font-medium">{store.name}</TableCell>
                                <TableCell>{store.user.username}</TableCell>
                                <TableCell>{store._count.products}</TableCell>
                                <TableCell>{store._count.orders}</TableCell>
                                <TableCell>{formatDate(store.createdAt)}</TableCell>
                                <TableCell>
                                    <StoreActions store={store} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {stores.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    Henüz mağaza eklenmemiş.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
