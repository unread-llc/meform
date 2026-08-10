import { PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"
import { docClient, TABLE_NAME, getRegistration } from "@/lib/aws/dynamodb"

// Standalone payments: a fixed-price charge with no registration form behind
// it (see app/[locale]/pay). They live in the registrations table alongside
// registrations and carry item_type so the admin registrations scan filters
// them out — see app/api/admin/registrations/route.ts.

export const STANDALONE_PAYMENT_ITEM_TYPE = "standalone_payment"

/** Fixed price of the standalone payment page, in USD. */
export const STANDALONE_PAYMENT_USD = 235

export interface StandalonePayment {
  id: string
  item_type: typeof STANDALONE_PAYMENT_ITEM_TYPE
  /** Amount actually charged, in fee_currency (MNT — Golomt bills in MNT). */
  fee_amount: number
  fee_currency: string
  fee_usd_amount: number
  fee_exchange_rate?: number
  checkout_id?: string
  checkout_url?: string
  payment_status: "pending" | "paid"
  payment_provider: "golomt"
  locale?: string
  created_at: string
  paid_at?: string
}

export async function createStandalonePayment(fields: {
  id: string
  amount: number
  usdAmount: number
  exchangeRate: number
  checkoutId: string
  checkoutUrl: string
  locale: string
}): Promise<StandalonePayment> {
  const payment: StandalonePayment = {
    id: fields.id,
    item_type: STANDALONE_PAYMENT_ITEM_TYPE,
    fee_amount: fields.amount,
    fee_currency: "MNT",
    fee_usd_amount: fields.usdAmount,
    fee_exchange_rate: fields.exchangeRate,
    checkout_id: fields.checkoutId,
    checkout_url: fields.checkoutUrl,
    payment_status: "pending",
    payment_provider: "golomt",
    locale: fields.locale,
    created_at: new Date().toISOString(),
  }
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: payment,
      ConditionExpression: "attribute_not_exists(id)",
    })
  )
  return payment
}

export async function getStandalonePayment(
  id: string
): Promise<StandalonePayment | null> {
  const item = (await getRegistration(id)) as unknown as StandalonePayment | null
  return item?.item_type === STANDALONE_PAYMENT_ITEM_TYPE ? item : null
}

/** Points a payment at a freshly minted invoice, unless it is already paid. */
export async function updateStandalonePaymentCheckout(
  id: string,
  checkoutId: string,
  checkoutUrl: string
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression:
        "SET checkout_id = :checkoutId, checkout_url = :checkoutUrl",
      ConditionExpression: "payment_status <> :paid AND item_type = :t",
      ExpressionAttributeValues: {
        ":checkoutId": checkoutId,
        ":checkoutUrl": checkoutUrl,
        ":paid": "paid",
        ":t": STANDALONE_PAYMENT_ITEM_TYPE,
      },
    })
  )
}
