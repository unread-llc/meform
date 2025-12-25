import { Header } from "@/components/header"
import { TimelineSection } from "@/components/timeline-section"
import { Footer } from "@/components/footer"
import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/lib/i18n"

export default async function HistoryPage({
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
                <TimelineSection dict={dict} fullHistory />
            </div>
            <Footer dict={dict} locale={locale} />
        </main>
    )
}
