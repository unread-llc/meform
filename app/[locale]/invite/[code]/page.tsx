import { notFound } from "next/navigation"
import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/lib/i18n"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RegistrationForm } from "@/components/registration/registration-form"

const VALID_INVITE_CODES = new Set(
  (process.env.INVITE_CODES || "mef2026").split(",").map((c) => c.trim())
)

export default async function InvitePage({
  params,
}: {
  params: Promise<{ locale: Locale; code: string }>
}) {
  const { locale, code } = await params

  if (!VALID_INVITE_CODES.has(code)) {
    notFound()
  }

  const dict = await getDictionary(locale)

  return (
    <main className="min-h-screen">
      <Header locale={locale} dict={dict} />
      <section className="pt-24 pb-16 bg-secondary/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              {dict.registration.title}
            </h1>
            <p className="text-muted-foreground text-lg">
              {dict.registration.subtitle}
            </p>
          </div>
          <RegistrationForm dict={dict} locale={locale} invite />
        </div>
      </section>
      <Footer dict={dict} locale={locale} />
    </main>
  )
}
