import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { registrationSchema } from "@/lib/registration-schema"
import {
  isValidVipGuestCode,
  recordFailedGuestCodeAttempt,
} from "@/lib/guest-codes"
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
    const { allowed } = rateLimit(`invite:${ip}`, RATE_LIMIT)
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { locale = "en", vip, code, ...formData } = body

    // Complimentary VIP (YGL guest) registrations must carry a valid guest
    // code — the page gates rendering, but this is the enforcement point.
    const isVipGuest = vip === true
    if (isVipGuest && !isValidVipGuestCode(code)) {
      const { throttled } = recordFailedGuestCodeAttempt()
      console.warn("Rejected complimentary registration: invalid guest code")
      return NextResponse.json(
        {
          error: throttled
            ? "Too many attempts. Please try again later."
            : "Invalid or expired invitation link.",
        },
        { status: throttled ? 429 : 403 }
      )
    }

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
      fee_currency: isVipGuest ? "USD" : "MNT",
      payment_status: "paid",
      is_invite: true,
      // Marks the record as YGL Learning Journey, which also routes the
      // confirmation to the dedicated YGL email template. The redeemed code is
      // stored so comps can be attributed to the link that was handed out.
      ...(isVipGuest ? { is_vip: true, invite_code: code as string } : {}),
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
