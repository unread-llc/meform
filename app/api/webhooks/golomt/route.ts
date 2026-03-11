import { NextRequest, NextResponse } from "next/server"
import {
  checkGolomtTransaction,
  parseGolomtTransactionId,
  GOLOMT_SUCCESS_CODE,
  type GolomtWebhookBody,
} from "@/lib/golomt"
import {
  getRegistration,
  markRegistrationPaid,
} from "@/lib/aws/dynamodb"
import { sendRegistrationEmail } from "@/lib/aws/ses"

export async function POST(request: NextRequest) {
  try {
    const req: GolomtWebhookBody = await request.json()
    console.log("Golomt webhook received:", JSON.stringify(req))

    if (!req.transactionId) {
      return NextResponse.json(
        { error: "Missing transactionId" },
        { status: 400 }
      )
    }

    const registrationId = parseGolomtTransactionId(req.transactionId)
    if (!registrationId) {
      console.error("Invalid Golomt transactionId format:", req.transactionId)
      return NextResponse.json(
        { error: "Invalid transactionId format" },
        { status: 400 }
      )
    }

    const registration = await getRegistration(registrationId)
    if (!registration) {
      console.error("No registration found for ID:", registrationId)
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      )
    }

    if (registration.payment_status === "paid") {
      return NextResponse.json({ received: true, status: "already_paid" })
    }

    // Verify payment with Golomt API
    const txn = await checkGolomtTransaction(registrationId)

    if (txn.errorCode === GOLOMT_SUCCESS_CODE) {
      try {
        await markRegistrationPaid(registration.id)
        console.log("Registration marked as paid via Golomt:", registration.id)
        await sendRegistrationEmail(registration, registration.locale).catch(
          (err) => console.error("Failed to send registration email:", err)
        )
      } catch (err: any) {
        if (err.name !== "ConditionalCheckFailedException") {
          throw err
        }
        console.log("Already paid (conditional check):", registration.id)
      }
    } else {
      console.error(
        "Golomt payment not successful:",
        txn.errorCode,
        txn.errorDesc
      )
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Golomt webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
