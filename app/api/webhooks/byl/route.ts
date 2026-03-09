import { NextRequest, NextResponse } from "next/server"
import { verifyWebhookSignature } from "@/lib/byl"
import {
  getRegistrationByCheckoutId,
  markRegistrationPaid,
} from "@/lib/aws/dynamodb"
import { sendRegistrationEmail } from "@/lib/aws/ses"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get("Byl-Signature") || ""

    console.log("Webhook received:", { signature: signature.slice(0, 10) + "...", payloadLength: payload.length })
    console.log("Webhook payload:", payload)

    if (!verifyWebhookSignature(payload, signature)) {
      console.error("Webhook signature verification failed")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(payload)
    console.log("Webhook event type:", event.type, "event keys:", Object.keys(event))

    if (event.type === "checkout.completed") {
      const checkoutId = event.data?.id
      console.log("Checkout ID from webhook:", checkoutId)

      if (!checkoutId) {
        console.error("Missing checkout ID in event.data:", JSON.stringify(event.data))
        return NextResponse.json(
          { error: "Missing checkout ID" },
          { status: 400 }
        )
      }

      const registration = await getRegistrationByCheckoutId(checkoutId)
      console.log("Registration found:", registration ? { id: registration.id, status: registration.payment_status } : null)

      if (registration && registration.payment_status !== "paid") {
        try {
          await markRegistrationPaid(registration.id)
          console.log("Registration marked as paid:", registration.id)
          await sendRegistrationEmail(registration, registration.locale).catch((err) =>
            console.error("Failed to send registration email:", err)
          )
        } catch (err: any) {
          if (err.name !== "ConditionalCheckFailedException") {
            throw err
          }
          console.log("Already paid (conditional check):", registration.id)
        }
      } else if (!registration) {
        console.error("No registration found for checkout_id:", checkoutId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
