"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react"
import Link from "next/link"

interface VerifyResult {
  valid: boolean
  payment_status?: string
  fee_amount?: number
  fee_currency?: string
  fee_usd_amount?: number
}

const copy = {
  en: {
    paidTitle: "Payment received",
    paidText: "Thank you — your payment has been completed successfully.",
    pendingTitle: "Payment pending",
    pendingText:
      "We have not received confirmation from the bank yet. If you completed the payment, it will be confirmed shortly.",
    declinedTitle: "Payment declined",
    declinedText: "The bank declined this payment. You can try again.",
    invalidTitle: "Payment not found",
    invalidText:
      "This payment link is not valid. Please contact us at registration@meforum.mn.",
    amountLabel: "Amount",
    retry: "Try again",
    home: "Back to home",
  },
  mn: {
    paidTitle: "Төлбөр хүлээн авлаа",
    paidText: "Баярлалаа — таны төлбөр амжилттай хийгдлээ.",
    pendingTitle: "Төлбөр хүлээгдэж байна",
    pendingText:
      "Банкнаас баталгаажуулалт хараахан ирээгүй байна. Хэрэв та төлбөрөө хийсэн бол удахгүй баталгаажина.",
    declinedTitle: "Төлбөр амжилтгүй боллоо",
    declinedText: "Банк энэ гүйлгээг цуцаллаа. Та дахин оролдож болно.",
    invalidTitle: "Төлбөр олдсонгүй",
    invalidText:
      "Энэ төлбөрийн холбоос хүчингүй байна. registration@meforum.mn хаягаар бидэнтэй холбогдоно уу.",
    amountLabel: "Дүн",
    retry: "Дахин оролдох",
    home: "Нүүр хуудас",
  },
} as const

export function StandalonePaymentResult({ locale }: { locale: string }) {
  const searchParams = useSearchParams()
  const t = copy[locale as keyof typeof copy] ?? copy.en

  // Golomt's callback appends ?invoice=MEF2026-{id}[-R{n}]&status_code=000 to
  // the callback URL we registered (which already carries ?payment_id={id}).
  const invoiceParam = searchParams.get("invoice") || ""
  const statusCode = searchParams.get("status_code")
  const statusDesc = searchParams.get("desc")
  const paymentId =
    searchParams.get("payment_id") ||
    (invoiceParam.startsWith("MEF2026-")
      ? invoiceParam.replace("MEF2026-", "").replace(/-R\d+$/, "")
      : "")

  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<VerifyResult | null>(null)

  useEffect(() => {
    if (!paymentId) {
      setLoading(false)
      return
    }
    // Pass the exact transactionId that was just paid (if we have it) so the
    // server verifies that invoice, not whichever one the record points at.
    const txnQuery = invoiceParam
      ? `&txn=${encodeURIComponent(invoiceParam)}`
      : ""
    fetch(`/api/pay/verify?id=${encodeURIComponent(paymentId)}${txnQuery}`)
      .then((res) => res.json())
      .then((data) => setResult(data))
      .catch(() => setResult(null))
      .finally(() => setLoading(false))
  }, [paymentId, invoiceParam])

  if (loading) {
    return (
      <Card className="rounded-3xl text-center">
        <CardContent className="py-16">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!paymentId || !result?.valid) {
    return (
      <Shell icon="error" title={t.invalidTitle} text={t.invalidText}>
        <Button asChild className="w-full">
          <Link href={`/${locale}`}>{t.home}</Link>
        </Button>
      </Shell>
    )
  }

  const isPaid = result.payment_status === "paid"
  const amountLabel = result.fee_usd_amount
    ? `$${result.fee_usd_amount.toLocaleString()} (₮${result.fee_amount?.toLocaleString()})`
    : `₮${result.fee_amount?.toLocaleString()}`

  if (isPaid) {
    return (
      <Shell icon="success" title={t.paidTitle} text={t.paidText}>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t.amountLabel}</p>
          <p className="text-2xl font-bold text-primary">{amountLabel}</p>
        </div>
        <Button asChild className="w-full">
          <Link href={`/${locale}`}>{t.home}</Link>
        </Button>
      </Shell>
    )
  }

  // The bank reported a decline in the callback and the server-side check
  // confirms it is still unpaid: show a failure state with a retry link.
  const declined = statusCode && statusCode !== "000"

  return (
    <Shell
      icon={declined ? "error" : "pending"}
      title={declined ? t.declinedTitle : t.pendingTitle}
      text={declined ? t.declinedText : t.pendingText}
    >
      {declined && statusDesc && (
        <p className="font-mono text-xs bg-muted rounded-lg p-3 text-muted-foreground">
          {statusDesc} ({statusCode})
        </p>
      )}
      <Button asChild className="w-full">
        <a href={`/api/pay?locale=${locale}`}>{t.retry}</a>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/${locale}`}>{t.home}</Link>
      </Button>
    </Shell>
  )
}

function Shell({
  icon,
  title,
  text,
  children,
}: {
  icon: "success" | "error" | "pending"
  title: string
  text: string
  children: React.ReactNode
}) {
  const badge = {
    success: { bg: "bg-green-100", node: <CheckCircle2 className="w-8 h-8 text-green-600" /> },
    error: { bg: "bg-red-100", node: <XCircle className="w-8 h-8 text-red-600" /> },
    pending: { bg: "bg-amber-100", node: <Clock className="w-8 h-8 text-amber-600" /> },
  }[icon]

  return (
    <Card className="rounded-3xl text-center">
      <CardHeader className="pb-4">
        <div
          className={`mx-auto mb-4 w-16 h-16 ${badge.bg} rounded-full flex items-center justify-center`}
        >
          {badge.node}
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">{text}</p>
        {children}
      </CardContent>
    </Card>
  )
}
