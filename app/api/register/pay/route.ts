import { NextRequest, NextResponse } from "next/server"
import {
  getRegistration,
  updateRegistrationCheckout,
} from "@/lib/aws/dynamodb"
import { createGolomtInvoice, nextGolomtTransactionId } from "@/lib/golomt"
import { rateLimit } from "@/lib/rate-limit"

// Max 10 payment-link requests per IP per 5 minutes
const RATE_LIMIT = { maxRequests: 10, windowMs: 5 * 60 * 1000 }

// Golomt invoices expire ~10-15 minutes after creation, so the checkout URL
// stored at registration time goes dead almost immediately. This endpoint is
// the durable payment link (used in emails): it reuses the current invoice if
// it is still live, otherwise mints a fresh one and redirects to it.
export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  const { allowed } = rateLimit(`pay:${ip}`, RATE_LIMIT)
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    )
  }

  const id = request.nextUrl.searchParams.get("id")
  if (!id) {
    return NextResponse.redirect(`${appUrl}/en`)
  }

  // Also throttle per registration: the IP-based limit is spoofable behind
  // the CDN (client-controlled X-Forwarded-For) and per-process, so cap how
  // fast invoices can be minted for any single registration regardless of
  // where the requests come from.
  const perRegistration = rateLimit(`pay-reg:${id}`, {
    maxRequests: 6,
    windowMs: 5 * 60 * 1000,
  })
  if (!perRegistration.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    )
  }

  const registration = await getRegistration(id)
  if (!registration) {
    return NextResponse.redirect(`${appUrl}/en`)
  }

  const locale = registration.locale || "en"

  if (registration.payment_status === "paid") {
    return NextResponse.redirect(
      `${appUrl}/${locale}/register/success?registration_id=${registration.id}`
    )
  }

  // Non-Golomt providers (byl) keep long-lived checkout URLs
  if (registration.payment_provider !== "golomt") {
    return NextResponse.redirect(
      registration.checkout_url || `${appUrl}/${locale}/register`
    )
  }

  try {
    // Always mint a fresh invoice — never probe the current one via
    // /payment/get/details: that consumes the one-time page token and would
    // break the payment page for the user (see createGolomtInvoice).
    const callbackUrl = `${appUrl}/${locale}/register/success?registration_id=${registration.id}`

    // Mint a fresh invoice. Golomt rejects duplicate transactionIds, so walk
    // the retry suffix forward past any already-used ids (e.g. after a
    // concurrent click already consumed the next one).
    let transactionId = nextGolomtTransactionId(
      registration.checkout_id,
      registration.id
    )
    let invoice
    for (let attempt = 0; ; attempt++) {
      try {
        invoice = await createGolomtInvoice({
          registrationId: registration.id,
          amount: registration.fee_amount,
          callbackUrl,
          transactionId,
        })
        break
      } catch (err: any) {
        const duplicated = String(err?.message || "").includes("duplicated")
        if (!duplicated || attempt >= 4) throw err
        transactionId = nextGolomtTransactionId(transactionId, registration.id)
      }
    }

    try {
      await updateRegistrationCheckout(
        registration.id,
        invoice.transactionId,
        invoice.invoice
      )
    } catch (err: any) {
      // Payment landed between the read above and this write — send the
      // payer to the success page instead of a dead invoice.
      if (err?.name === "ConditionalCheckFailedException") {
        return NextResponse.redirect(
          `${appUrl}/${locale}/register/success?registration_id=${registration.id}`
        )
      }
      throw err
    }

    return NextResponse.redirect(invoice.invoice)
  } catch (error: any) {
    // Log details server-side only — this endpoint is unauthenticated
    console.error("Payment link error:", error)
    return NextResponse.json(
      { error: "Failed to create payment link. Please contact us at registration@meforum.mn." },
      { status: 500 }
    )
  }
}
