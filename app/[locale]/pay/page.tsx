import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/lib/i18n"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { convertUsdToMnt } from "@/lib/exchange-rate"
import { STANDALONE_PAYMENT_USD } from "@/lib/standalone-payment"

// Quotes today's USD/MNT rate on every request
export const dynamic = "force-dynamic"

const copy = {
  en: {
    title: "Payment",
    subtitle: "Mongolia Economic Forum 2026",
    amountLabel: "Amount due",
    pay: "Proceed to secure payment",
    note: "You will be redirected to Golomt Bank's secure payment page, which stays open for 10 minutes. If it expires, return here and click the button again.",
    charged: "Charged in MNT at today's rate",
  },
  mn: {
    title: "Төлбөр",
    subtitle: "Монголын эдийн засгийн чуулган 2026",
    amountLabel: "Төлөх дүн",
    pay: "Төлбөр төлөх",
    note: "Та Голомт банкны найдвартай төлбөрийн хуудас руу шилжих бөгөөд тус хуудас 10 минут нээлттэй байна. Хугацаа дуусвал энэ хуудсанд буцаж ирээд товчийг дахин дарна уу.",
    charged: "Өнөөдрийн ханшаар төгрөгөөр тооцно",
  },
} as const

// Form-less payment page: a fixed fee and a pay button, nothing else. The
// button hits /api/pay, which mints a fresh Golomt invoice at click time —
// invoices expire ~10 minutes after creation, so they must be created at the
// moment the payer is ready.
export default async function PayPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const t = copy[locale] ?? copy.en

  // Best-effort: if every rate source is down the page still renders, just
  // without the MNT equivalent (the bank's page shows the exact amount).
  const mntAmount = await convertUsdToMnt(STANDALONE_PAYMENT_USD)
    .then((c) => c.mntAmount)
    .catch(() => null)

  return (
    <main className="min-h-screen">
      <Header locale={locale} dict={dict} />
      <section className="pt-24 pb-16 bg-secondary/30 min-h-[80vh] flex items-center">
        <div className="max-w-lg mx-auto px-4 w-full">
          <Card className="rounded-3xl text-center">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">{t.title}</CardTitle>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t.amountLabel}</p>
                <p className="text-4xl font-bold text-primary">
                  ${STANDALONE_PAYMENT_USD.toLocaleString()}
                </p>
                {mntAmount && (
                  <p className="text-sm text-muted-foreground">
                    ≈ ₮{mntAmount.toLocaleString()} — {t.charged}
                  </p>
                )}
              </div>
              <Button asChild className="w-full">
                {/* Plain <a>: the API mints a fresh invoice and redirects to
                    Golomt's payment page */}
                <a href={`/api/pay?locale=${locale}`}>{t.pay}</a>
              </Button>
              <p className="text-xs text-muted-foreground">{t.note}</p>
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer dict={dict} locale={locale} />
    </main>
  )
}
