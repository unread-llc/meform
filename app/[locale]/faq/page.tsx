import { Header } from "@/components/header"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/lib/i18n"

export default async function FAQPage({
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
                <FAQSection dict={dict} />
            </div>
            <Footer dict={dict} locale={locale} />
        </main>
    )
}
