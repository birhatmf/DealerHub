import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { Progress } from "@/components/ui/progress"

import { Trans } from "@/components/ui/trans"

export default async function AdminDashboard() {
    const storeCount = await prisma.store.count()
    const productCount = await prisma.product.count()
    const orderCount = await prisma.order.count()

    // Calculate total sales and payments
    const orders = await prisma.order.findMany({
        select: {
            totalAmount: true,
            paidAmount: true,
            status: true
        }
    })

    const totalSales = orders.reduce((acc, order) => acc + Number(order.totalAmount), 0)
    const totalPaid = orders.reduce((acc, order) => acc + Number(order.paidAmount), 0)
    const totalPending = totalSales - totalPaid

    // Calculate status distribution
    const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    // ... (imports)

    // ... (inside component)

    const statusLabels: Record<string, string> = {
        "SIPARIS_ALINDI": "status.SIPARIS_ALINDI",
        "TEKLIF_HALINDE": "status.TEKLIF_HALINDE",
        "HAZIRLANIYOR": "status.HAZIRLANIYOR",
        "KARGODA": "status.KARGODA",
        "TESLIM_EDILDI": "status.TESLIM_EDILDI"
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold"><Trans k="dashboard.title" /></h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium"><Trans k="dashboard.totalSales" /></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₺{totalSales.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium"><Trans k="dashboard.totalPaid" /></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">₺{totalPaid.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium"><Trans k="dashboard.pendingPayment" /></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">₺{totalPending.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium"><Trans k="dashboard.orderCount" /></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orderCount}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle><Trans k="dashboard.orderStatus" /></CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(statusLabels).map(([key, labelKey]) => {
                            const count = statusCounts[key] || 0
                            const percentage = orderCount > 0 ? (count / orderCount) * 100 : 0

                            return (
                                <div key={key} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium"><Trans k={labelKey} /></span>
                                        <span className="text-muted-foreground">{count} adet</span>
                                    </div>
                                    <Progress value={percentage} className="h-2" />
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle><Trans k="dashboard.generalStats" /></CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium"><Trans k="dashboard.totalStores" /></span>
                            <span className="text-xl font-bold">{storeCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium"><Trans k="dashboard.totalProducts" /></span>
                            <span className="text-xl font-bold">{productCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium"><Trans k="dashboard.paymentRatio" /></span>
                            <span className="text-xl font-bold">
                                {totalSales > 0 ? ((totalPaid / totalSales) * 100).toFixed(1) : 0}%
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
