import { Header } from "@/components/header"
import { PartnersSection } from "@/components/partners-section"
import { Footer } from "@/components/footer"
import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/lib/i18n"

export default async function PartnersPage({
    params,
}: {
    params: Promise<{ locale: Locale }>
}) {
    const { locale } = await params
    const dict = await getDictionary(locale)

    return (
        <main className="min-h-screen">
            <Header locale={locale} dict={dict} />
            <div className="pt-16">
                <PartnersSection dict={dict} expanded />
            </div>
            <Footer dict={dict} locale={locale} />
        </main>
    )
}
