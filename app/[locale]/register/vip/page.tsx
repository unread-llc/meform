import type { Metadata } from "next"
import Image from "next/image"
import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/lib/i18n"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RegistrationForm } from "@/components/registration/registration-form"

const PAGE_TITLE = "YGL Learning Journey in Mongolia"

export async function generateMetadata(): Promise<Metadata> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const ogImage = `${appUrl}/ygl-og.png`
  return {
    title: PAGE_TITLE,
    openGraph: {
      title: PAGE_TITLE,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "The Forum of Young Global Leaders",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: PAGE_TITLE,
      images: [ogImage],
    },
  }
}

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
              {PAGE_TITLE}
            </h1>
          </div>
          <RegistrationForm dict={dict} locale={locale} priceUsd={3000} vip />
        </div>
      </section>
      <Footer dict={dict} locale={locale} />
    </main>
  )
}
