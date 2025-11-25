import { CustomerForm } from "@/components/customer-form"
import { CustomerActions } from "@/components/customer-actions"
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

export default async function CustomersPage() {
    const session = await auth()
    if (!session?.user?.id) return null

    const store = await prisma.store.findUnique({
        where: { userId: session.user.id },
    })

    if (!store) return <div>Mağaza bulunamadı.</div>

    const customers = await prisma.customer.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: "desc" },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Müşteriler</h1>
                <CustomerForm />
            </div>

            <div className="rounded-md border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ad Soyad</TableHead>
                            <TableHead>Telefon</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Firma Adı</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.map((customer) => (
                            <TableRow key={customer.id}>
                                <TableCell className="font-medium">{customer.fullName}</TableCell>
                                <TableCell>{customer.phone}</TableCell>
                                <TableCell>{customer.email}</TableCell>
                                <TableCell>{customer.companyName}</TableCell>
                                <TableCell className="text-right">
                                    <CustomerActions customer={customer} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {customers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    Henüz müşteri eklenmemiş.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
