import { NextRequest, NextResponse } from "next/server"
import { ScanCommand } from "@aws-sdk/lib-dynamodb"
import {
  docClient,
  TABLE_NAME,
  markRegistrationPaid,
  type RegistrationRecord,
} from "@/lib/aws/dynamodb"
import { checkGolomtTransaction, GOLOMT_SUCCESS_CODE } from "@/lib/golomt"
import { sendRegistrationEmail } from "@/lib/aws/ses"

// Reconciliation poll, invoked by an EventBridge schedule every few minutes.
// Golomt's push webhook has historically pointed at the retired 2023 backend,
// and the success-page verify only runs if the payer makes it back to our
// site — so without this, a completed payment whose redirect never lands
// would stay "pending" forever. Mirrors the old mef-payment Go backend's
// CheckInvoices cron.

// Look back far enough to catch late confirmations; invoices themselves die
// after ~10 minutes, so anything paid will show up well within this window.
const WINDOW_MS = 48 * 60 * 60 * 1000
// Upper bound on Golomt inquiry calls per run
const MAX_INQUIRIES = 40

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("x-cron-key") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const since = new Date(Date.now() - WINDOW_MS).toISOString()
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression:
        "payment_provider = :golomt AND payment_status = :pending AND created_at > :since",
      ExpressionAttributeValues: {
        ":golomt": "golomt",
        ":pending": "pending",
        ":since": since,
      },
      ProjectionExpression:
        "id, firstname, lastname, email, checkout_id, locale, is_vip, item_type, created_at",
    })
  )
  const registrations = (result.Items || []) as RegistrationRecord[]

  let inquiries = 0
  const paid: string[] = []

  for (const registration of registrations) {
    if (inquiries >= MAX_INQUIRIES) break

    // The paid invoice can be any re-issue, not just the newest one the
    // record points at: walk every transactionId this registration has used
    // (base plus -R2..-R{n} suffixes up to the current one).
    const base = `MEF2026-${registration.id}`
    const maxSuffix = parseInt(
      registration.checkout_id?.match(/-R(\d+)$/)?.[1] || "1",
      10
    )
    const candidates = [base]
    for (let n = 2; n <= maxSuffix; n++) candidates.push(`${base}-R${n}`)

    for (const transactionId of candidates) {
      if (inquiries >= MAX_INQUIRIES) break
      inquiries++
      try {
        const txn = await checkGolomtTransaction(transactionId)
        if (txn.errorCode === GOLOMT_SUCCESS_CODE) {
          await markRegistrationPaid(registration.id)
          console.log("Reconcile: marked as paid:", registration.id, transactionId)
          // Standalone (form-less) payments carry item_type and have no
          // registrant behind them — nothing to confirm by email.
          if (!registration.item_type) {
            await sendRegistrationEmail(registration, registration.locale).catch(
              (err) => console.error("Reconcile: confirmation email failed:", err)
            )
          }
          paid.push(registration.id)
          break
        }
      } catch (err: any) {
        // Already-paid race with the verify route/webhook is fine
        if (err?.name === "ConditionalCheckFailedException") break
        console.error("Reconcile: inquiry failed:", transactionId, err?.message)
      }
    }
  }

  return NextResponse.json({
    checked: registrations.length,
    inquiries,
    paid,
  })
}
