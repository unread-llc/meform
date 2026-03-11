import { createHmac } from "crypto"

const GOLOMT_TAG = "MEF2026"

// Read env vars lazily to avoid issues with module load order
function getConfig() {
  const secret = process.env.GOLOMT_SECRET
  const token = process.env.GOLOMT_TOKEN
  if (!secret || !token) {
    throw new Error(`Golomt config missing: SECRET=${!!secret}, TOKEN=${!!token}`)
  }
  return {
    baseUrl: process.env.GOLOMT_BASE_URL || "https://ecommerce.golomtbank.com",
    token,
    secret,
  }
}

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
  invoice: string // payment URL for the user
}

/**
 * Creates a Golomt payment invoice.
 */
export async function createGolomtInvoice(
  params: CreateGolomtInvoiceParams
): Promise<GolomtInvoiceResult> {
  const config = getConfig()
  const transactionId = `${GOLOMT_TAG}-${params.registrationId}`
  const amountStr = params.amount.toFixed(2)
  const callbackUrl = params.callbackUrl

  const checksum = hmacChecksum(
    config.secret,
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

  const res = await fetch(`${config.baseUrl}/api/invoice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.token}`,
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

  // Verify response checksum
  const expectedChecksum = hmacChecksum(
    config.secret,
    result.invoice + result.transactionId
  )
  if (result.checksum !== expectedChecksum) {
    throw new Error("Invalid Golomt response checksum")
  }

  const paymentUrl = `${config.baseUrl}/payment/en/${result.invoice}`

  return {
    transactionId: result.transactionId,
    invoice: paymentUrl,
  }
}

/**
 * Checks the status of a Golomt transaction.
 */
export async function checkGolomtTransaction(
  registrationId: string
): Promise<TransactionResponse> {
  const config = getConfig()
  const transactionId = `${GOLOMT_TAG}-${registrationId}`

  const checksum = hmacChecksum(
    config.secret,
    transactionId + transactionId
  )

  const res = await fetch(`${config.baseUrl}/api/inquiry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.token}`,
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

  // Verify response checksum
  const expectedChecksum = hmacChecksum(
    config.secret,
    result.transactionId + result.errorCode + result.amount + (result.token || "")
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
  return parts.slice(1).join("-")
}

export const GOLOMT_SUCCESS_CODE = "000"
