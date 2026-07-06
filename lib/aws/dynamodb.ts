import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb"

// No explicit credentials — on Amplify, the SDK uses the IAM service role
// automatically. For local dev, configure ~/.aws/credentials or set
// AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY in your shell environment.
const client = new DynamoDBClient({
  region: process.env.MEF_AWS_REGION || "ap-southeast-1",
  maxAttempts: 3,
})

export const docClient = DynamoDBDocumentClient.from(client)

export const TABLE_NAME = process.env.MEF_DYNAMODB_TABLE || "mef-registrations"

export interface RegistrationRecord {
  id: string
  registration_type: string
  sector: string
  lastname: string
  firstname: string
  gender: string
  birth: string
  nation: string
  residence: string
  company: string
  company_register: string
  position: string
  email: string
  phone: string
  passportno: string
  visa: string
  passport_img: string
  img: string
  fee_amount: number
  fee_currency: string
  fee_usd_amount?: number
  fee_exchange_rate?: number
  checkout_id?: string
  checkout_url?: string
  payment_status: "pending" | "paid"
  payment_provider?: string
  is_invite?: boolean
  is_vip?: boolean
  locale?: string
  created_at: string
  paid_at?: string
}

export async function createRegistration(
  record: RegistrationRecord
): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: record,
      ConditionExpression: "attribute_not_exists(id)",
    })
  )
}

export async function getRegistration(
  id: string
): Promise<RegistrationRecord | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  )
  return (result.Item as RegistrationRecord) || null
}

export async function getRegistrationByCheckoutId(
  checkoutId: string
): Promise<RegistrationRecord | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "checkout_id-index",
      KeyConditionExpression: "checkout_id = :cid",
      ExpressionAttributeValues: {
        ":cid": checkoutId,
      },
      // Only need 1 result — stop scanning after finding it
      Limit: 1,
    })
  )
  return (result.Items?.[0] as RegistrationRecord) || null
}

export async function deleteRegistration(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  )
}

export async function updateRegistrationCheckout(
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
      // Never touch a registration that has already been paid
      ConditionExpression: "payment_status <> :paid",
      ExpressionAttributeValues: {
        ":checkoutId": checkoutId,
        ":checkoutUrl": checkoutUrl,
        ":paid": "paid",
      },
    })
  )
}

export async function markRegistrationPaid(
  id: string
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression:
        "SET payment_status = :status, paid_at = :paidAt",
      // Only update if not already paid — prevents redundant writes
      ConditionExpression: "payment_status <> :status",
      ExpressionAttributeValues: {
        ":status": "paid",
        ":paidAt": new Date().toISOString(),
      },
    })
  )
}
