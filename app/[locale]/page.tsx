import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { StatsSection } from "@/components/stats-section"
import { TimelineSection } from "@/components/timeline-section"
import { BoardSection } from "@/components/board-section"
import { WhyParticipateSection } from "@/components/why-participate-section"
import { GallerySection } from "@/components/gallery-section"
import { PartnersSection } from "@/components/partners-section"
import { FAQSection } from "@/components/faq-section"
import { MongoliaSection } from "@/components/mongolia-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/lib/i18n"

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: Locale }>
}) {
    const { locale } = await params
    const dict = await getDictionary(locale)

    return (
        <main className="min-h-screen">
            <Header locale={locale} dict={dict} />
            <HeroSection dict={dict} locale={locale} />
            <AboutSection dict={dict} />
            <StatsSection dict={dict} />
            <TimelineSection dict={dict} />
            <BoardSection dict={dict} />
            <WhyParticipateSection dict={dict} />
            <GallerySection dict={dict} />
            <PartnersSection dict={dict} />
            <FAQSection dict={dict} />
            {/* <MongoliaSection dict={dict} /> */}
            <ContactSection dict={dict} />
            <Footer dict={dict} locale={locale} />
        </main>
    )
}
