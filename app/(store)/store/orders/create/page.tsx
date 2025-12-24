import { OrderForm } from "@/components/order-form"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export default async function CreateOrderPage() {
    const session = await auth()
    if (!session?.user?.id) return null

    const store = await prisma.store.findUnique({
        where: { userId: session.user.id },
    })

    if (!store) return <div>Mağaza bulunamadı.</div>

    const products = await prisma.product.findMany({
        where: { storeId: store.id },
        orderBy: { name: "asc" },
    })

    const customers = await prisma.customer.findMany({
        where: { storeId: store.id },
        orderBy: { fullName: "asc" },
    })

    // Convert Decimal to number for client component
    const formattedProducts = products.map(p => ({
        ...p,
        price: Number(p.price)
    }))

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Yeni Sipariş Oluştur</h1>
            <OrderForm products={formattedProducts} customers={customers} />
        </div>
    )
}
