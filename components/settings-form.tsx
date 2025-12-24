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

import { useLanguage } from "@/components/language-provider"

// ... (imports)

export function SettingsForm({ store }: SettingsFormProps) {
    const { t } = useLanguage()
    const [state, dispatch, isPending] = useActionState(updateStoreSettings, null)

    return (
        <form action={dispatch} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("settings.contractTitle")}</CardTitle>
                    <CardDescription>
                        {t("settings.contractDesc")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2">
                        <Label htmlFor="contractText">{t("settings.contractLabel")}</Label>
                        <Textarea
                            id="contractText"
                            name="contractText"
                            defaultValue={store.contractText || ""}
                            className="min-h-[200px]"
                            placeholder={t("settings.contractPlaceholder")}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t("settings.notesTitle")}</CardTitle>
                    <CardDescription>
                        {t("settings.notesDesc")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2">
                        <Label htmlFor="noteText">{t("settings.notesLabel")}</Label>
                        <Textarea
                            id="noteText"
                            name="noteText"
                            defaultValue={store.noteText || ""}
                            className="min-h-[100px]"
                            placeholder={t("settings.notesPlaceholder")}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t("settings.bankTitle")}</CardTitle>
                    <CardDescription>
                        {t("settings.bankDesc")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2">
                        <Label htmlFor="bankInfo">{t("settings.bankLabel")}</Label>
                        <Textarea
                            id="bankInfo"
                            name="bankInfo"
                            defaultValue={store.bankInfo || ""}
                            className="min-h-[100px]"
                            placeholder={t("settings.bankPlaceholder")}
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
                    {isPending ? t("common.saving") : t("settings.saveSettings")}
                </Button>
            </div>
        </form>
    )
}
