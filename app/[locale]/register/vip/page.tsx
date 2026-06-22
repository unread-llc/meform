import Image from "next/image"
import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/lib/i18n"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RegistrationForm } from "@/components/registration/registration-form"

export default async function VipRegisterPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return (
    <main className="min-h-screen">
      <Header locale={locale} dict={dict} />
      <section className="pt-24 pb-16 bg-secondary/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Image
              src="/ygl-logo.png"
              alt="The Forum of Young Global Leaders"
              width={280}
              height={90}
              className="mx-auto mb-6 h-auto w-auto"
              priority
            />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              YGL Learning Journey in Mongolia
            </h1>
          </div>
          <RegistrationForm dict={dict} locale={locale} priceUsd={3000} />
        </div>
      </section>
      <Footer dict={dict} locale={locale} />
    </main>
  )
}
