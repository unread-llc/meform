import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { registrationSchema } from "@/lib/registration-schema"
import { createRegistration, type RegistrationRecord } from "@/lib/aws/dynamodb"
import { sendRegistrationEmail } from "@/lib/aws/ses"
import { rateLimit } from "@/lib/rate-limit"

const RATE_LIMIT = { maxRequests: 5, windowMs: 15 * 60 * 1000 }

export async function POST(request: NextRequest) {
  try {
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
    const registrationId = uuidv4()

    const record: RegistrationRecord = {
      id: registrationId,
      ...data,
      fee_amount: 0,
      fee_currency: "MNT",
      payment_status: "paid",
      is_invite: true,
      locale,
      created_at: new Date().toISOString(),
    }

    await createRegistration(record)

    await sendRegistrationEmail(record, locale).catch((err) =>
      console.error("Failed to send invite registration email:", err)
    )

    return NextResponse.json({ registrationId })
  } catch (error: any) {
    console.error("Invite registration error:", error)
    return NextResponse.json(
      {
        error: "Failed to process registration",
        details: error?.message || String(error),
      },
      { status: 500 }
    )
  }
}
