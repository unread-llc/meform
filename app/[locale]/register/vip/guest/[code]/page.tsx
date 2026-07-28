import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/lib/i18n"
import { isValidVipGuestCode } from "@/lib/guest-codes"
import { getVipInvite, inviteState } from "@/lib/vip-invites"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RegistrationForm } from "@/components/registration/registration-form"

// Invitations are looked up per request so revoking one in the admin panel
// takes effect immediately, rather than being served from a cached render.
export const dynamic = "force-dynamic"

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
  const dict = await getDictionary(locale)
  const isMn = locale === "mn"

  const invite = await getVipInvite(code).catch(() => null)
  const state = invite ? inviteState(invite) : null

  // Unknown code: 404, same as any bad URL. Codes from VIP_INVITE_CODES keep
  // working so links handed out before the admin generator existed don't break.
  if (!invite && !isValidVipGuestCode(code)) {
    notFound()
  }

  // Known but spent: tell the guest rather than showing a bare 404, since
  // people often reopen their own link after registering.
  if (invite && state !== "active") {
    return (
      <main className="min-h-screen">
        <Header locale={locale} dict={dict} />
        <section className="pt-24 pb-16 bg-secondary/30 min-h-[60vh]">
          <div className="max-w-lg mx-auto px-4 text-center">
            <Image
              src="/ygl-logo.png"
              alt="The Forum of Young Global Leaders"
              width={220}
              height={70}
              className="mx-auto mb-8 h-auto w-auto"
              priority
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              {state === "redeemed"
                ? isMn
                  ? "Энэ урилга ашиглагдсан байна"
                  : "This invitation has already been used"
                : isMn
                  ? "Энэ урилга хүчингүй болсон"
                  : "This invitation is no longer valid"}
            </h1>
            <p className="text-muted-foreground">
              {state === "redeemed"
                ? isMn
                  ? "Таны бүртгэл аль хэдийн баталгаажсан. Асуух зүйл байвал зохион байгуулагчидтай холбогдоно уу."
                  : "Your registration has already been completed. If you have any questions, please contact the organizers."
                : isMn
                  ? "Зохион байгуулагчидтай холбогдож шинэ урилга авна уу."
                  : "Please contact the organizers for a new invitation link."}
            </p>
            <a
              href="mailto:registration@meforum.mn"
              className="inline-block mt-6 text-primary hover:underline font-medium"
            >
              registration@meforum.mn
            </a>
          </div>
        </section>
        <Footer dict={dict} locale={locale} />
      </main>
    )
  }

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
              {invite?.guest_name
                ? isMn
                  ? `${invite.guest_name} — төлбөргүй бүртгэл`
                  : `${invite.guest_name} — complimentary registration`
                : isMn
                  ? "Урилгат зочин — төлбөргүй бүртгэл"
                  : "Invited guest — complimentary registration"}
            </span>
          </div>
          <RegistrationForm dict={dict} locale={locale} vip free inviteCode={code} />
        </div>
      </section>
      <Footer dict={dict} locale={locale} />
    </main>
  )
}
