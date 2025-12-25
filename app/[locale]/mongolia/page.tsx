import { Header } from "@/components/header"
import { MongoliaSection } from "@/components/mongolia-section"
import { Footer } from "@/components/footer"
import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/lib/i18n"

export default async function MongoliaPage({
    params,
}: {
    params: Promise<{ locale: Locale }>
}) {
    const { locale } = await params
    const dict = await getDictionary(locale)

    return (
        <main className="min-h-screen">
            <Header locale={locale} dict={dict} />
            <MongoliaSection dict={dict} expanded />
            <Footer dict={dict} locale={locale} />
        </main>
    )
}
