import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/lib/i18n"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StandalonePaymentResult } from "@/components/payment/standalone-payment-result"
import { Suspense } from "react"

// Receipt page for the form-less payment (app/[locale]/pay). Golomt redirects
// here after checkout; the client component confirms the payment server-side.
export default async function PaySuccessPage({
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
            <StandalonePaymentResult locale={locale} />
          </Suspense>
        </div>
      </section>
      <Footer dict={dict} locale={locale} />
    </main>
  )
}
