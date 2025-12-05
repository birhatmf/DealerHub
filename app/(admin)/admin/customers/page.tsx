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

import { Trans } from "@/components/ui/trans"

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


    // ... (imports)

    // ... (inside component)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold"><Trans k="customers.title" /></h1>
                <StoreFilter stores={stores} />
            </div>

            <div className="rounded-md border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Trans k="customers.name" /></TableHead>
                            <TableHead><Trans k="common.store" /></TableHead>
                            <TableHead><Trans k="customers.phone" /></TableHead>
                            <TableHead><Trans k="customers.email" /></TableHead>
                            <TableHead><Trans k="customers.cityAddress" /></TableHead>
                            <TableHead className="text-right"><Trans k="common.actions" /></TableHead>
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
                                <TableCell colSpan={6} className="text-center">
                                    <Trans k="customers.noCustomers" />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
