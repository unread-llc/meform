import { createHmac } from "crypto"

const BYL_API_URL = "https://byl.mn/api/v1"
const BYL_API_TOKEN = process.env.BYL_API_TOKEN!
const BYL_PROJECT_ID = process.env.BYL_PROJECT_ID!
const BYL_WEBHOOK_SECRET = process.env.BYL_WEBHOOK_SECRET!

interface CheckoutItem {
  price_data: {
    unit_amount: number
    currency: string
    product_data: {
      name: string
    }
  }
  quantity: number
}

interface CreateCheckoutParams {
  registrationId: string
  amount: number
  currency: string
  description: string
  successUrl: string
  cancelUrl: string
}

interface CheckoutResponse {
  id: string
  url: string
}

export async function createCheckout(
  params: CreateCheckoutParams
): Promise<CheckoutResponse> {
  const items: CheckoutItem[] = [
    {
      price_data: {
        unit_amount: params.amount,
        currency: params.currency,
        product_data: {
          name: params.description,
        },
      },
      quantity: 1,
    },
  ]

  const response = await fetch(
    `${BYL_API_URL}/projects/${BYL_PROJECT_ID}/checkouts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${BYL_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: items,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: {
          registration_id: params.registrationId,
        },
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to create checkout: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  console.log("byl.mn checkout response:", JSON.stringify(data))
  return {
    id: data.id || data.checkout_id || "",
    url: data.url || data.checkout_url || data.redirect_url || "",
  }
}

export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const expectedSignature = createHmac("sha256", BYL_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex")
  return signature === expectedSignature
}
