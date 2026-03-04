import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/lib/i18n"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SuccessContent } from "@/components/registration/success-content"
import { Suspense } from "react"

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return (
    <main className="min-h-screen">
      <Header locale={locale} dict={dict} />
      <section className="pt-24 pb-16 bg-secondary/30 min-h-[80vh] flex items-center">
        <div className="max-w-lg mx-auto px-4 w-full">
          <Suspense>
            <SuccessContent locale={locale} dict={dict} />
          </Suspense>
        </div>
      </section>
      <Footer dict={dict} locale={locale} />
    </main>
  )
}
