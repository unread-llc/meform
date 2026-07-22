import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/lib/i18n"
import HandbookClient from "./handbook-client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const isMn = locale === "mn"
  return {
    title: "Mongolia Handbook 2026 — YGL Learning Journey",
    description: isMn
      ? "Монголын гарын авлага 2026 — хуудас эргүүлдэг номын хэлбэрээр."
      : "Read the Mongolia Handbook 2026 as an interactive page-turning book.",
  }
}

export default async function MongoliaHandbookPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return (
    <main className="min-h-screen">
      <Header locale={locale} dict={dict} />
      <HandbookClient locale={locale} />
      <Footer dict={dict} locale={locale} />
    </main>
  )
}
