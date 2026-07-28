import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/lib/i18n"
import { isValidVipGuestCode } from "@/lib/guest-codes"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RegistrationForm } from "@/components/registration/registration-form"

const PAGE_TITLE = "YGL Learning Journey in Mongolia"

export async function generateMetadata(): Promise<Metadata> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const ogImage = `${appUrl}/ygl-og.png`
  return {
    title: PAGE_TITLE,
    // Guest links are secret — keep them out of search engines.
    robots: { index: false, follow: false },
    openGraph: {
      title: PAGE_TITLE,
      images: [
        { url: ogImage, width: 1200, height: 630, alt: "The Forum of Young Global Leaders" },
      ],
    },
    twitter: { card: "summary_large_image", title: PAGE_TITLE, images: [ogImage] },
  }
}

export default async function VipGuestRegisterPage({
  params,
}: {
  params: Promise<{ locale: Locale; code: string }>
}) {
  const { locale, code } = await params

  if (!isValidVipGuestCode(code)) {
    notFound()
  }

  const dict = await getDictionary(locale)
  const isMn = locale === "mn"

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
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
              {isMn ? "Урилгат зочин — төлбөргүй бүртгэл" : "Invited guest — complimentary registration"}
            </span>
          </div>
          <RegistrationForm dict={dict} locale={locale} vip free inviteCode={code} />
        </div>
      </section>
      <Footer dict={dict} locale={locale} />
    </main>
  )
}
