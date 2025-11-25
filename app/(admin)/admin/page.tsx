import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { Progress } from "@/components/ui/progress"

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

    const statusLabels: Record<string, string> = {
        "SIPARIS_ALINDI": "Sipariş Alındı",
        "TEKLIF_HALINDE": "Teklif Halinde",
        "HAZIRLANIYOR": "Hazırlanıyor",
        "KARGODA": "Kargoda",
        "TESLIM_EDILDI": "Teslim Edildi"
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Satış</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₺{totalSales.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Tahsilat</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">₺{totalPaid.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bekleyen Ödeme</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">₺{totalPending.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sipariş Sayısı</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orderCount}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Sipariş Durumları</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(statusLabels).map(([key, label]) => {
                            const count = statusCounts[key] || 0
                            const percentage = orderCount > 0 ? (count / orderCount) * 100 : 0

                            return (
                                <div key={key} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{label}</span>
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
                        <CardTitle>Genel İstatistikler</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Toplam Mağaza</span>
                            <span className="text-xl font-bold">{storeCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Toplam Ürün</span>
                            <span className="text-xl font-bold">{productCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Tahsilat Oranı</span>
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
