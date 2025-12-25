import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { locales, type Locale } from "@/lib/i18n"
import { getDictionary } from "@/lib/dictionary"
import "../../app/globals.css"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export async function generateStaticParams() {
    return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
    const { locale } = await params
    const dict = await getDictionary(locale)

    return {
        title: dict.metadata.title,
        description: dict.metadata.description,
        keywords: ["Mongolia", "Economic Forum", "MEF", "Development", "Investment", "Ulaanbaatar", "Монгол", "Эдийн засаг", "Форум"],
    }
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ locale: Locale }>
}) {
    const { locale } = await params

    return (
        <html lang={locale}>
            <body className={`font-sans antialiased`}>
                {children}
                <Analytics />
            </body>
        </html>
    )
}
