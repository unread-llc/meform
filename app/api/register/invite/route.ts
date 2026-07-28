import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { registrationSchema } from "@/lib/registration-schema"
import {
  isValidVipGuestCode,
  recordFailedGuestCodeAttempt,
} from "@/lib/guest-codes"
import {
  getVipInvite,
  inviteState,
  claimVipInvite,
  releaseVipInvite,
} from "@/lib/vip-invites"
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
    // Admin-generated invitations are single-use and looked up in storage;
    // codes from VIP_INVITE_CODES still work for links handed out earlier.
    const isVipGuest = vip === true
    const codeStr = typeof code === "string" ? code : ""
    let inviteSource: "stored" | "legacy" | null = null

    if (isVipGuest) {
      const stored = await getVipInvite(codeStr).catch(() => null)
      if (stored && inviteState(stored) === "active") {
        inviteSource = "stored"
      } else if (!stored && isValidVipGuestCode(codeStr)) {
        inviteSource = "legacy"
      }

      if (!inviteSource) {
        const { throttled } = recordFailedGuestCodeAttempt()
        const reason = stored ? inviteState(stored) : "invalid"
        console.warn(
          `Rejected complimentary registration: guest code ${reason}`
        )
        return NextResponse.json(
          {
            reason: throttled ? "throttled" : reason,
            error: throttled
              ? "Too many attempts. Please try again later."
              : reason === "redeemed"
                ? "This invitation link has already been used."
                : "Invalid or expired invitation link.",
          },
          { status: throttled ? 429 : 403 }
        )
      }
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
      ...(isVipGuest ? { is_vip: true, invite_code: codeStr } : {}),
      locale,
      created_at: new Date().toISOString(),
    }

    // Claim the invitation before creating the record. The conditional write
    // means only the first submit wins, so a forwarded link cannot be redeemed
    // twice even if two people submit at the same moment.
    if (inviteSource === "stored") {
      const claim = await claimVipInvite(codeStr, registrationId)
      if (!claim.ok) {
        console.warn(`Rejected complimentary registration: invite ${claim.reason}`)
        return NextResponse.json(
          {
            reason: claim.reason,
            error:
              claim.reason === "used"
                ? "This invitation link has already been used."
                : "Invalid or expired invitation link.",
          },
          { status: 403 }
        )
      }
    }

    try {
      await createRegistration(record)
    } catch (err) {
      // Don't burn the guest's one-time link on a failed write.
      if (inviteSource === "stored") {
        await releaseVipInvite(codeStr).catch((releaseErr) =>
          console.error("Failed to release claimed invite:", releaseErr)
        )
      }
      throw err
    }

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
