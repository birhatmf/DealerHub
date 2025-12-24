"use client"

import { useActionState } from "react"
import { authenticate } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm() {
    const [errorMessage, dispatch, isPending] = useActionState(
        authenticate,
        undefined,
    )

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Giriş Yap</CardTitle>
                <CardDescription>
                    Kullanıcı adı ve şifrenizle giriş yapın.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={dispatch} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="username">Kullanıcı Adı</Label>
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="admin"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Şifre</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    {errorMessage && (
                        <p className="text-sm text-red-500">{errorMessage}</p>
                    )}
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
