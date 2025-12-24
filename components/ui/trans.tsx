"use client"

import { useLanguage } from "@/components/language-provider"

export function Trans({ k, args }: { k: string; args?: (string | number)[] }) {
    const { t } = useLanguage()
    return <>{t(k, args)}</>
}
