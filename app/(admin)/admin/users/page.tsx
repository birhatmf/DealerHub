import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { AdminForm } from "@/components/admin-form"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { deleteUser } from "@/app/actions/user"
import { formatDate } from "@/lib/utils"

import { Trans } from "@/components/ui/trans"

export default async function AdminUsersPage() {
    const session = await auth()
    if (!session || session.user.role !== "ROOT") {
        redirect("/login")
    }

    const admins = await prisma.user.findMany({
        where: { role: "ROOT" },
        orderBy: { createdAt: "desc" },
    })


    // ... (imports)

    // ... (inside component)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold"><Trans k="users.title" /></h1>
                <AdminForm />
            </div>

            <div className="rounded-md border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Trans k="users.username" /></TableHead>
                            <TableHead><Trans k="users.createdAt" /></TableHead>
                            <TableHead className="text-right"><Trans k="common.actions" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {admins.map((admin) => (
                            <TableRow key={admin.id}>
                                <TableCell className="font-medium">{admin.username}</TableCell>
                                <TableCell>{formatDate(admin.createdAt)}</TableCell>
                                <TableCell className="text-right">
                                    {admin.id !== session.user.id && (
                                        <form
                                            action={async () => {
                                                "use server"
                                                await deleteUser(admin.id)
                                            }}
                                        >
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    )}
                                    {admin.id === session.user.id && (
                                        <span className="text-sm text-muted-foreground italic">
                                            <Trans k="users.you" />
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
