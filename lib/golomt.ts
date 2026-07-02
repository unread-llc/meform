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
  /** Full transactionId to use. Defaults to "MEF2026-{registrationId}".
   *  Golomt rejects duplicate transactionIds, so re-issuing an invoice for the
   *  same registration needs a fresh one (see nextGolomtTransactionId). */
  transactionId?: string
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
  const transactionId =
    params.transactionId || `${GOLOMT_TAG}-${params.registrationId}`
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
    // MUST be "Y". The payment page fetches invoice details and then calls
    // /payment/generate/spQr with the returned token; without a token that
    // call 500s and the page renders "transaction time expired" for a live
    // invoice, making payment impossible. The token is only returned on the
    // FIRST details fetch (then persisted in the payer's localStorage), so
    // never call /payment/get/details server-side for an invoice a user
    // still needs to open.
    genToken: "Y",
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
 * Checks the status of a Golomt transaction by its full transactionId
 * (e.g. "MEF2026-{registrationId}" or a retry "MEF2026-{registrationId}-R2").
 */
export async function checkGolomtTransaction(
  transactionId: string
): Promise<TransactionResponse> {
  const config = getConfig()

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

  // Verify response checksum. Unpaid transactions come back with
  // errorCode: null, which the bank hashes as an empty string.
  const expectedChecksum = hmacChecksum(
    config.secret,
    result.transactionId +
      (result.errorCode || "") +
      result.amount +
      (result.token || "")
  )
  if (result.checksum !== expectedChecksum) {
    throw new Error(`${result.errorCode}:${result.errorDesc}`)
  }

  return result
}

/**
 * Next transactionId to use when re-issuing an invoice for a registration.
 * Golomt rejects duplicates, so retries append/increment an "-R{n}" suffix:
 * MEF2026-{id} -> MEF2026-{id}-R2 -> MEF2026-{id}-R3 ...
 */
export function nextGolomtTransactionId(
  currentTransactionId: string | undefined,
  registrationId: string
): string {
  const base = `${GOLOMT_TAG}-${registrationId}`
  if (!currentTransactionId) return base
  const match = currentTransactionId.match(/-R(\d+)$/)
  const attempt = match ? parseInt(match[1], 10) + 1 : 2
  return `${base}-R${attempt}`
}

/**
 * Extracts the registration ID from a Golomt transactionId.
 * Format: "MEF2026-{registrationId}" with an optional "-R{n}" retry suffix.
 */
export function parseGolomtTransactionId(transactionId: string): string | null {
  const parts = transactionId.split("-")
  if (parts.length < 2) return null
  return parts.slice(1).join("-").replace(/-R\d+$/, "")
}

export const GOLOMT_SUCCESS_CODE = "000"
