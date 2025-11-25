"use client"

import { useActionState } from "react"
import { updateStoreSettings } from "@/app/actions/settings"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SettingsFormProps {
    store: {
        contractText: string | null
        noteText: string | null
        bankInfo: string | null
    }
}

export function SettingsForm({ store }: SettingsFormProps) {
    const [state, dispatch, isPending] = useActionState(updateStoreSettings, null)

    return (
        <form action={dispatch} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Satış Sözleşmesi</CardTitle>
                    <CardDescription>
                        Sipariş detaylarında ve çıktılarında görünecek satış sözleşmesi metni.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2">
                        <Label htmlFor="contractText">Sözleşme Metni</Label>
                        <Textarea
                            id="contractText"
                            name="contractText"
                            defaultValue={store.contractText || ""}
                            className="min-h-[200px]"
                            placeholder="Sözleşme maddelerini buraya giriniz..."
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Varsayılan Notlar</CardTitle>
                    <CardDescription>
                        Sipariş detaylarında görünecek genel notlar ve uyarılar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2">
                        <Label htmlFor="noteText">Notlar</Label>
                        <Textarea
                            id="noteText"
                            name="noteText"
                            defaultValue={store.noteText || ""}
                            className="min-h-[100px]"
                            placeholder="Genel notlarınızı buraya giriniz..."
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Banka ve Şirket Bilgileri</CardTitle>
                    <CardDescription>
                        Sayfanın en altında görünecek banka hesap bilgileri ve şirket ünvanı.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2">
                        <Label htmlFor="bankInfo">Banka / IBAN Bilgileri</Label>
                        <Textarea
                            id="bankInfo"
                            name="bankInfo"
                            defaultValue={store.bankInfo || ""}
                            className="min-h-[100px]"
                            placeholder="Banka Adı: ... IBAN: TR..."
                        />
                    </div>
                </CardContent>
            </Card>

            {state?.message && (
                <p className={`text-sm ${state.success ? "text-green-600" : "text-red-500"}`}>
                    {state.message}
                </p>
            )}

            <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
                </Button>
            </div>
        </form>
    )
}
