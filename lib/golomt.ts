import { createHmac } from "crypto"

const GOLOMT_BASE_URL = process.env.GOLOMT_BASE_URL || "https://ecommerce.golomtbank.com"
const GOLOMT_TOKEN = process.env.GOLOMT_TOKEN!
const GOLOMT_SECRET = process.env.GOLOMT_SECRET!
const GOLOMT_CALLBACK = process.env.GOLOMT_CALLBACK || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
const GOLOMT_TAG = "MEF2026"

function hmacChecksum(secret: string, data: string): string {
  return createHmac("sha256", secret).update(data).digest("hex")
}

// --- Types ---

interface InvoiceResponse {
  checksum: string
  transactionId: string
  invoice: string
}

interface TransactionResponse {
  amount: string
  bank: string
  errorDesc: string
  checksum: string
  errorCode: string
  cardHolder: string
  transactionId: string
  cardNumber: string
  token: string
}

export interface GolomtWebhookBody {
  amount: string
  bank: string
  errorDesc: string
  checksum: string
  errorCode: string
  cardHolder: string
  transactionId?: string
  cardNumber: string
  token?: string
}

interface GolomtErrorResponse {
  timestamp?: string
  status?: number
  error?: string
  message: string
  path?: string
}

// --- Client ---

export interface CreateGolomtInvoiceParams {
  registrationId: string
  amount: number
  callbackUrl: string
}

export interface GolomtInvoiceResult {
  transactionId: string
  invoice: string // payment URL/link for the user
}

/**
 * Creates a Golomt payment invoice.
 * The invoice URL is what gets shown to the user to complete payment.
 */
export async function createGolomtInvoice(
  params: CreateGolomtInvoiceParams
): Promise<GolomtInvoiceResult> {
  const transactionId = `${GOLOMT_TAG}-${params.registrationId}`
  const amountStr = params.amount.toFixed(2)
  const callbackUrl = params.callbackUrl

  // checksum = HMAC-SHA256(secret, transactionId + amount + "GET" + callbackURL)
  const checksum = hmacChecksum(
    GOLOMT_SECRET,
    transactionId + amountStr + "GET" + callbackUrl
  )

  const body = {
    amount: amountStr,
    callback: callbackUrl,
    checksum,
    genToken: "",
    returnType: "GET",
    transactionId,
  }

  const res = await fetch(`${GOLOMT_BASE_URL}/api/invoice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GOLOMT_TOKEN}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errorText = await res.text()
    let errorMsg = `Golomt API error: ${res.status}`
    try {
      const errObj: GolomtErrorResponse = JSON.parse(errorText)
      errorMsg = errObj.message || errorMsg
    } catch {}
    throw new Error(errorMsg)
  }

  const result: InvoiceResponse = await res.json()

  // Verify response checksum: HMAC-SHA256(secret, invoice + transactionId)
  const expectedChecksum = hmacChecksum(
    GOLOMT_SECRET,
    result.invoice + result.transactionId
  )
  if (result.checksum !== expectedChecksum) {
    throw new Error("Invalid Golomt response checksum")
  }

  // Construct full payment URL from the invoice ID
  const paymentUrl = `${GOLOMT_BASE_URL}/payment/UI/payment/${result.invoice}`

  return {
    transactionId: result.transactionId,
    invoice: paymentUrl,
  }
}

/**
 * Checks the status of a Golomt transaction.
 * Returns the transaction details if paid (errorCode "000").
 */
export async function checkGolomtTransaction(
  registrationId: string
): Promise<TransactionResponse> {
  const transactionId = `${GOLOMT_TAG}-${registrationId}`

  // checksum = HMAC-SHA256(secret, transactionId + transactionId)
  const checksum = hmacChecksum(
    GOLOMT_SECRET,
    transactionId + transactionId
  )

  const res = await fetch(`${GOLOMT_BASE_URL}/api/inquiry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GOLOMT_TOKEN}`,
    },
    body: JSON.stringify({ checksum, transactionId }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    let errorMsg = `Golomt inquiry error: ${res.status}`
    try {
      const errObj: GolomtErrorResponse = JSON.parse(errorText)
      errorMsg = errObj.message || errorMsg
    } catch {}
    throw new Error(errorMsg)
  }

  const result: TransactionResponse = await res.json()

  // Verify response checksum: HMAC-SHA256(secret, transactionId + errorCode + amount + token)
  const expectedChecksum = hmacChecksum(
    GOLOMT_SECRET,
    result.transactionId + result.errorCode + result.amount + result.token
  )
  if (result.checksum !== expectedChecksum) {
    throw new Error(`${result.errorCode}:${result.errorDesc}`)
  }

  return result
}

/**
 * Extracts the registration ID from a Golomt transactionId.
 * Format: "MEF2026-{registrationId}"
 */
export function parseGolomtTransactionId(transactionId: string): string | null {
  const parts = transactionId.split("-")
  if (parts.length < 2) return null
  // Registration ID is a UUID, rejoin everything after the tag
  return parts.slice(1).join("-")
}

export const GOLOMT_SUCCESS_CODE = "000"
