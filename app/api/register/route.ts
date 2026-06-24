import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { registrationSchema, calculateFee } from "@/lib/registration-schema"
import { createRegistration, type RegistrationRecord } from "@/lib/aws/dynamodb"
import { createCheckout } from "@/lib/byl"
import { createGolomtInvoice } from "@/lib/golomt"
import { rateLimit } from "@/lib/rate-limit"
import { convertUsdToMnt } from "@/lib/exchange-rate"

// Max 20 registration attempts per IP per 15 minutes
const RATE_LIMIT = { maxRequests: 20, windowMs: 15 * 60 * 1000 }

export async function POST(request: NextRequest) {
  try {
    // --- Rate limiting ---
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"
    const { allowed } = rateLimit(ip, RATE_LIMIT)
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { locale = "en", payment_method, price_usd, ...formData } = body

    // Allowed fixed-price tiers (e.g. VIP page). Guard against arbitrary client pricing.
    const ALLOWED_PRICES_USD = [3000]
    const priceOverride = ALLOWED_PRICES_USD.includes(Number(price_usd))
      ? Number(price_usd)
      : undefined

    const parsed = registrationSchema.safeParse(formData)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const fee = calculateFee(data.nation, priceOverride)
    const registrationId = uuidv4()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // User-selected payment method, default to golomt
    const paymentProvider = payment_method === "byl" ? "byl" : "golomt"

    // Convert USD to MNT for international participants
    let checkoutAmount = fee.amount
    let checkoutCurrency = fee.currency
    let exchangeRate: number | undefined
    let originalUsdAmount: number | undefined

    if (fee.currency === "USD") {
      const conversion = await convertUsdToMnt(fee.amount)
      originalUsdAmount = fee.amount
      exchangeRate = conversion.rate
      checkoutAmount = conversion.mntAmount
      checkoutCurrency = "MNT"
    }

    let checkoutId = ""
    let checkoutUrl = ""

    if (paymentProvider === "golomt") {
      const callbackUrl = `${appUrl}/${locale}/register/success?registration_id=${registrationId}`
      const invoice = await createGolomtInvoice({
        registrationId,
        amount: checkoutAmount,
        callbackUrl,
      })
      checkoutId = invoice.transactionId
      checkoutUrl = invoice.invoice
    } else {
      const checkout = await createCheckout({
        registrationId,
        amount: checkoutAmount,
        currency: checkoutCurrency,
        description: `MEF 2026 Registration - ${data.firstname} ${data.lastname}`,
        successUrl: `${appUrl}/${locale}/register/success?registration_id=${registrationId}`,
        cancelUrl: `${appUrl}/${locale}/register/cancel`,
      })
      checkoutId = checkout.id
      checkoutUrl = checkout.url
    }

    const record: RegistrationRecord = {
      id: registrationId,
      ...data,
      fee_amount: checkoutAmount,
      fee_currency: checkoutCurrency,
      ...(originalUsdAmount !== undefined && {
        fee_usd_amount: originalUsdAmount,
        fee_exchange_rate: exchangeRate,
      }),
      checkout_id: checkoutId,
      checkout_url: checkoutUrl,
      payment_status: "pending",
      payment_provider: paymentProvider,
      // VIP (YGL Learning Journey) registrations get the YGL confirmation email.
      ...(priceOverride ? { is_vip: true } : {}),
      locale,
      created_at: new Date().toISOString(),
    }

    await createRegistration(record)

    // No email on registration; the confirmation ("paid successfully") email is
    // sent from the payment webhook once payment actually succeeds.

    return NextResponse.json({
      registrationId,
      checkoutUrl,
    })
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        error: "Failed to process registration",
        details: error?.message || String(error),
        code: error?.name || error?.Code || undefined,
      },
      { status: 500 }
    )
  }
}
