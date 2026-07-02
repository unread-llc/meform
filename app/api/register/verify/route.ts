import { NextRequest, NextResponse } from "next/server"
import { getRegistration, markRegistrationPaid } from "@/lib/aws/dynamodb"
import {
  checkGolomtTransaction,
  parseGolomtTransactionId,
  GOLOMT_SUCCESS_CODE,
} from "@/lib/golomt"
import { sendRegistrationEmail } from "@/lib/aws/ses"

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id")
  // Exact transactionId the payer just completed, forwarded from the Golomt
  // callback (?invoice=MEF2026-{id}[-R{n}]) by the success page.
  const txnParam = request.nextUrl.searchParams.get("txn")
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
    // Re-issued invoices get -R{n} suffixed transactionIds and the record only
    // stores the newest one, so the invoice actually paid may be an older id.
    // Check, in order: the id from the payment callback (only if it belongs to
    // this registration), the record's current id, and the original base id.
    const candidates = [
      txnParam && parseGolomtTransactionId(txnParam) === registration.id
        ? txnParam
        : null,
      registration.checkout_id,
      `MEF2026-${registration.id}`,
    ].filter((t, i, arr): t is string => !!t && arr.indexOf(t) === i)

    for (const transactionId of candidates) {
      try {
        const txn = await checkGolomtTransaction(transactionId)
        console.log(
          "Verify: Golomt response for",
          transactionId,
          ":",
          txn.errorCode,
          txn.errorDesc
        )
        if (txn.errorCode === GOLOMT_SUCCESS_CODE) {
          await markRegistrationPaid(registration.id)
          registration.payment_status = "paid"
          console.log("Verify: marked as paid:", registration.id)
          await sendRegistrationEmail(registration, registration.locale).catch(
            (err) => console.error("Failed to send registration email:", err)
          )
          break
        }
      } catch (err) {
        console.error("Golomt payment check failed:", transactionId, err)
      }
    }
  }

  return NextResponse.json({
    valid: true,
    firstname: registration.firstname,
    lastname: registration.lastname,
    payment_status: registration.payment_status,
  })
}
