import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { StoreFilter } from "@/components/store-filter"
import { CustomerActions } from "@/components/customer-actions"

export default async function AdminCustomersPage({
    searchParams,
}: {
    searchParams: Promise<{ store?: string }>
}) {
    const params = await searchParams
    const session = await auth()
    if (!session || session.user.role !== "ROOT") {
        redirect("/login")
    }

    const whereClause: any = {}
    if (params.store && params.store !== "all") {
        whereClause.storeId = params.store
    }

    const customers = await prisma.customer.findMany({
        where: whereClause,
        include: {
            store: true,
        },
        orderBy: { createdAt: "desc" },
    })

    const stores = await prisma.store.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Tüm Müşteriler</h1>
                <StoreFilter stores={stores} />
            </div>

            <div className="rounded-md border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Müşteri Adı</TableHead>
                            <TableHead>Mağaza</TableHead>
                            <TableHead>Telefon</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Şehir/Adres</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.map((customer) => (
                            <TableRow key={customer.id}>
                                <TableCell className="font-medium">{customer.fullName}</TableCell>
                                <TableCell>{customer.store.name}</TableCell>
                                <TableCell>{customer.phone}</TableCell>
                                <TableCell>{customer.email}</TableCell>
                                <TableCell className="max-w-[200px] truncate" title={customer.address || ""}>
                                    {customer.address}
                                </TableCell>
                                <TableCell className="text-right">
                                    <CustomerActions customer={customer} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {customers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    Henüz müşteri bulunmuyor.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
