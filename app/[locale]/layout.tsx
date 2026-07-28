import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { locales, type Locale } from "@/lib/i18n"
import { getDictionary } from "@/lib/dictionary"
import "../../app/globals.css"

// Force all pages under [locale] to be statically generated at build time.
// Only API routes (POST-only) will run as Lambda on Amplify.
export const dynamic = "force-static"

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
            <head>
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-Q8V5P4TYZH"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        // Invite and guest links carry a secret code in the path.
                        // Mask it so the code is never reported to analytics.
                        var mefPath = location.pathname
                            .replace(/(\\/register\\/vip\\/guest\\/)[^/]+/, '$1[code]')
                            .replace(/(\\/invite\\/)[^/]+/, '$1[code]');
                        gtag('config', 'G-Q8V5P4TYZH', {
                            page_path: mefPath,
                            page_location: location.origin + mefPath
                        });
                    `}
                </Script>
            </head>
            <body className={`font-sans antialiased`}>
                {children}
                <Analytics />
            </body>
        </html>
    )
}
