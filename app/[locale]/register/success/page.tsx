import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/lib/i18n"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ registration_id?: string }>
}) {
  const { locale } = await params
  const { registration_id } = await searchParams
  const dict = await getDictionary(locale)

  const qrData = registration_id ? `MEF2026:${registration_id}` : ""
  const qrUrl = qrData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`
    : ""

  return (
    <main className="min-h-screen">
      <Header locale={locale} dict={dict} />
      <section className="pt-24 pb-16 bg-secondary/30 min-h-[80vh] flex items-center">
        <div className="max-w-lg mx-auto px-4 w-full">
          <Card className="rounded-3xl text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">
                {dict.registration.success.title}
              </CardTitle>
              <p className="text-muted-foreground">
                {dict.registration.success.subtitle}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                {dict.registration.success.description}
              </p>

              {registration_id && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {dict.registration.success.registrationId}
                  </p>
                  <p className="font-mono text-sm bg-muted rounded-lg p-3 break-all">
                    {registration_id}
                  </p>
                </div>
              )}

              {qrUrl && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {dict.registration.success.qrCode}
                  </p>
                  <div className="flex justify-center">
                    <img
                      src={qrUrl}
                      alt="Registration QR Code"
                      width={200}
                      height={200}
                      className="rounded-lg"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dict.registration.success.qrDescription}
                  </p>
                </div>
              )}

              <Button asChild className="w-full">
                <Link href={`/${locale}`}>
                  {dict.registration.success.backToHome}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer dict={dict} locale={locale} />
    </main>
  )
}
