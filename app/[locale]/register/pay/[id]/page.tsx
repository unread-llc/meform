import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/lib/i18n"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getRegistration } from "@/lib/aws/dynamodb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Reads the registration from DynamoDB on every request
export const dynamic = "force-dynamic"

// Interstitial payment page. Emailed payment links land here (a plain
// side-effect-free GET, safe against mail-gateway link prefetchers); the
// button below hits /api/register/pay which mints a fresh Golomt invoice —
// invoices expire ~10 minutes after creation, so they must be created at the
// moment the payer is ready.
export default async function PayPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>
}) {
  const { locale, id } = await params
  const dict = await getDictionary(locale)
  const registration = await getRegistration(id).catch(() => null)

  const isPaid = registration?.payment_status === "paid"
  const amountLabel = registration
    ? registration.fee_usd_amount
      ? `$${registration.fee_usd_amount.toLocaleString()} (₮${registration.fee_amount.toLocaleString()})`
      : `${registration.fee_currency === "MNT" ? "₮" : "$"}${registration.fee_amount.toLocaleString()}`
    : ""

  return (
    <main className="min-h-screen">
      <Header locale={locale} dict={dict} />
      <section className="pt-24 pb-16 bg-secondary/30 min-h-[80vh] flex items-center">
        <div className="max-w-lg mx-auto px-4 w-full">
          <Card className="rounded-3xl text-center">
            {!registration ? (
              <>
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">
                    Registration not found
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    This payment link is not valid. Please contact us at
                    registration@meforum.mn.
                  </p>
                  <Button asChild className="w-full">
                    <Link href={`/${locale}`}>Back to home</Link>
                  </Button>
                </CardContent>
              </>
            ) : isPaid ? (
              <>
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">Payment received</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Thank you, {registration.firstname} — your participation
                    fee has already been paid and your registration is
                    confirmed.
                  </p>
                  <Button asChild className="w-full">
                    <Link
                      href={`/${locale}/register/success?registration_id=${registration.id}`}
                    >
                      View confirmation
                    </Link>
                  </Button>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">
                    Complete your payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    {registration.firstname} {registration.lastname}
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Participation fee
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {amountLabel}
                    </p>
                  </div>
                  <Button asChild className="w-full">
                    {/* Plain <a>: the API mints a fresh invoice and redirects
                        to Golomt's payment page */}
                    <a href={`/api/register/pay?id=${registration.id}`}>
                      Proceed to secure payment
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    You will be redirected to Golomt Bank&apos;s secure payment
                    page, which stays open for 10 minutes. If it expires,
                    return here and click the button again.
                  </p>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </section>
      <Footer dict={dict} locale={locale} />
    </main>
  )
}
