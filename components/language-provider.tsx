"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { dictionary, Locale } from "@/lib/dictionary"

type LanguageContextType = {
    language: Locale
    setLanguage: (lang: Locale) => void
    t: (key: string, args?: (string | number)[]) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const t = (language: Locale, path: string, args?: (string | number)[]) => {
    const keys = path.split(".")
    let current: any = dictionary[language]

    for (const key of keys) {
        if (current[key] === undefined) {
            console.warn(`Translation missing for key: ${path} in language: ${language}`)
            return path
        }
        current = current[key]
    }

    let value = current as string

    if (args && args.length > 0) {
        args.forEach((arg, index) => {
            value = value.replace(`{${index}}`, String(arg))
        })
    }

    return value
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Locale>("tr")

    useEffect(() => {
        const savedLang = localStorage.getItem("language") as Locale
        if (savedLang && (savedLang === "tr" || savedLang === "en")) {
            setLanguage(savedLang)
        }
    }, [])

    const handleSetLanguage = (lang: Locale) => {
        setLanguage(lang)
        localStorage.setItem("language", lang)
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: (path, args) => t(language, path, args) }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        return {
            language: "tr" as Locale,
            setLanguage: () => {},
            t: (path: string, args?: (string | number)[]) => t("tr", path, args)
        }
    }
    return context
}
