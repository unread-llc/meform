import { NextRequest, NextResponse } from "next/server"
import { verifyWebhookSignature } from "@/lib/byl"
import {
  getRegistrationByCheckoutId,
  markRegistrationPaid,
} from "@/lib/aws/dynamodb"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get("Byl-Signature") || ""

    if (!verifyWebhookSignature(payload, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(payload)

    if (event.type === "checkout.completed") {
      const checkoutId = event.data?.id
      if (!checkoutId) {
        return NextResponse.json(
          { error: "Missing checkout ID" },
          { status: 400 }
        )
      }

      const registration = await getRegistrationByCheckoutId(checkoutId)
      if (registration && registration.payment_status !== "paid") {
        try {
          await markRegistrationPaid(registration.id)
        } catch (err: any) {
          // ConditionalCheckFailedException means already paid — safe to ignore
          if (err.name !== "ConditionalCheckFailedException") {
            throw err
          }
        }
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
