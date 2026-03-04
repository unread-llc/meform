import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/lib/i18n"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import Link from "next/link"

export default async function CancelPage({
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
          <Card className="rounded-3xl text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl">
                {dict.registration.cancel.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                {dict.registration.cancel.description}
              </p>
              <div className="flex flex-col gap-3">
                <Button asChild>
                  <Link href={`/${locale}/register`}>
                    {dict.registration.cancel.tryAgain}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/${locale}`}>
                    {dict.registration.cancel.backToHome}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer dict={dict} locale={locale} />
    </main>
  )
}
