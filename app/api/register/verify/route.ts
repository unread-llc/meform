import { NextRequest, NextResponse } from "next/server"
import { getRegistration, markRegistrationPaid } from "@/lib/aws/dynamodb"
import { checkGolomtTransaction, GOLOMT_SUCCESS_CODE } from "@/lib/golomt"
import { sendRegistrationEmail } from "@/lib/aws/ses"

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id")
  if (!id) {
    return NextResponse.json({ valid: false }, { status: 400 })
  }

  const registration = await getRegistration(id)
  if (!registration) {
    return NextResponse.json({ valid: false })
  }

  // If pending and paid via Golomt, check with Golomt API to confirm payment
  if (
    registration.payment_status === "pending" &&
    registration.payment_provider === "golomt"
  ) {
    console.log("Verify: checking Golomt payment for", registration.id)
    console.log("Verify: GOLOMT_SECRET set?", !!process.env.GOLOMT_SECRET)
    console.log("Verify: GOLOMT_TOKEN set?", !!process.env.GOLOMT_TOKEN)
    try {
      const txn = await checkGolomtTransaction(registration.id)
      console.log("Verify: Golomt response:", txn.errorCode, txn.errorDesc)
      if (txn.errorCode === GOLOMT_SUCCESS_CODE) {
        await markRegistrationPaid(registration.id)
        registration.payment_status = "paid"
        console.log("Verify: marked as paid:", registration.id)
        await sendRegistrationEmail(registration, registration.locale).catch(
          (err) => console.error("Failed to send registration email:", err)
        )
      }
    } catch (err) {
      console.error("Golomt payment check failed:", err)
    }
  }

  return NextResponse.json({
    valid: true,
    firstname: registration.firstname,
    lastname: registration.lastname,
    payment_status: registration.payment_status,
  })
}
