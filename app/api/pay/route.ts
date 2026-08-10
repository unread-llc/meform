import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { createGolomtInvoice, nextGolomtTransactionId } from "@/lib/golomt"
import { convertUsdToMnt } from "@/lib/exchange-rate"
import { rateLimit } from "@/lib/rate-limit"
import { isValidLocale, defaultLocale } from "@/lib/i18n"
import {
  STANDALONE_PAYMENT_USD,
  createStandalonePayment,
  getStandalonePayment,
  updateStandalonePaymentCheckout,
} from "@/lib/standalone-payment"

// Max 10 payment sessions per IP per 5 minutes
const RATE_LIMIT = { maxRequests: 10, windowMs: 5 * 60 * 1000 }

// Payers of the standalone (form-less) fee have no account and no
// registration record to key off, so the payment id is remembered in a
// cookie: clicking "pay" again after an invoice expires reuses the same
// payment record with a fresh invoice instead of littering the table with
// abandoned ones.
const PAYMENT_COOKIE = "mef_payment_id"
const COOKIE_MAX_AGE = 60 * 60 * 24 // 1 day

/** Mints a Golomt invoice, walking the retry suffix past already-used ids. */
async function mintInvoice(
  paymentId: string,
  amount: number,
  callbackUrl: string,
  currentTransactionId?: string
) {
  let transactionId = currentTransactionId
    ? nextGolomtTransactionId(currentTransactionId, paymentId)
    : undefined
  for (let attempt = 0; ; attempt++) {
    try {
      return await createGolomtInvoice({
        registrationId: paymentId,
        amount,
        callbackUrl,
        transactionId,
      })
    } catch (err: any) {
      const duplicated = String(err?.message || "").includes("duplicated")
      if (!duplicated || attempt >= 4) throw err
      transactionId = nextGolomtTransactionId(
        transactionId || `MEF2026-${paymentId}`,
        paymentId
      )
    }
  }
}

// Standalone payment: no form, no registration — just a fixed charge. A plain
// GET so the page can link to it directly; each hit mints a fresh Golomt
// invoice (they expire ~10 minutes after creation) and redirects the payer to
// the bank's payment page.
export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const localeParam = request.nextUrl.searchParams.get("locale") || ""
  const locale = isValidLocale(localeParam) ? localeParam : defaultLocale

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  const { allowed } = rateLimit(`standalone-pay:${ip}`, RATE_LIMIT)
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    )
  }

  try {
    const existingId = request.cookies.get(PAYMENT_COOKIE)?.value
    const existing = existingId ? await getStandalonePayment(existingId) : null

    // Already settled — don't charge twice, show the receipt instead.
    if (existing?.payment_status === "paid") {
      return NextResponse.redirect(
        `${appUrl}/${locale}/pay/success?payment_id=${existing.id}`
      )
    }

    if (existing) {
      const invoice = await mintInvoice(
        existing.id,
        existing.fee_amount,
        `${appUrl}/${locale}/pay/success?payment_id=${existing.id}`,
        existing.checkout_id
      )
      try {
        await updateStandalonePaymentCheckout(
          existing.id,
          invoice.transactionId,
          invoice.invoice
        )
      } catch (err: any) {
        // Paid between the read above and this write — send the payer to the
        // receipt instead of a live invoice they no longer owe.
        if (err?.name === "ConditionalCheckFailedException") {
          return NextResponse.redirect(
            `${appUrl}/${locale}/pay/success?payment_id=${existing.id}`
          )
        }
        throw err
      }
      return NextResponse.redirect(invoice.invoice)
    }

    // Golomt bills in MNT, so the USD price is converted at today's rate.
    const { mntAmount, rate } = await convertUsdToMnt(STANDALONE_PAYMENT_USD)
    const paymentId = uuidv4()
    const invoice = await mintInvoice(
      paymentId,
      mntAmount,
      `${appUrl}/${locale}/pay/success?payment_id=${paymentId}`
    )

    await createStandalonePayment({
      id: paymentId,
      amount: mntAmount,
      usdAmount: STANDALONE_PAYMENT_USD,
      exchangeRate: rate,
      checkoutId: invoice.transactionId,
      checkoutUrl: invoice.invoice,
      locale,
    })

    const response = NextResponse.redirect(invoice.invoice)
    response.cookies.set(PAYMENT_COOKIE, paymentId, {
      httpOnly: true,
      sameSite: "lax",
      secure: appUrl.startsWith("https://"),
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    })
    return response
  } catch (error) {
    // Log details server-side only — this endpoint is unauthenticated
    console.error("Standalone payment error:", error)
    return NextResponse.json(
      {
        error:
          "Failed to create payment link. Please contact us at registration@meforum.mn.",
      },
      { status: 500 }
    )
  }
}
