import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { registrationSchema, calculateFee } from "@/lib/registration-schema"
import { createRegistration, type RegistrationRecord } from "@/lib/aws/dynamodb"
import { createCheckout } from "@/lib/byl"
import { rateLimit } from "@/lib/rate-limit"

// Max 5 registration attempts per IP per 15 minutes
const RATE_LIMIT = { maxRequests: 5, windowMs: 15 * 60 * 1000 }

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
    const { locale = "en", ...formData } = body

    const parsed = registrationSchema.safeParse(formData)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const fee = calculateFee(data.nation)
    const registrationId = uuidv4()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const checkout = await createCheckout({
      registrationId,
      amount: fee.amount,
      currency: fee.currency,
      description: `MEF 2026 Registration - ${data.firstname} ${data.lastname}`,
      successUrl: `${appUrl}/${locale}/register/success?registration_id=${registrationId}`,
      cancelUrl: `${appUrl}/${locale}/register/cancel`,
    })

    const record: RegistrationRecord = {
      id: registrationId,
      ...data,
      fee_amount: fee.amount,
      fee_currency: fee.currency,
      checkout_id: checkout.id,
      checkout_url: checkout.url,
      payment_status: "pending",
      created_at: new Date().toISOString(),
    }

    await createRegistration(record)

    return NextResponse.json({
      registrationId,
      checkoutUrl: checkout.url,
      // Debug: remove after confirming byl.mn integration works
      _debug_checkout: checkout,
      _debug_raw_byl: checkout._raw,
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
