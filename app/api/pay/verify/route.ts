import { NextRequest, NextResponse } from "next/server"
import { markRegistrationPaid } from "@/lib/aws/dynamodb"
import {
  checkGolomtTransaction,
  parseGolomtTransactionId,
  GOLOMT_SUCCESS_CODE,
} from "@/lib/golomt"
import { getStandalonePayment } from "@/lib/standalone-payment"

// Confirms a standalone payment when the payer lands back on the receipt page.
// Mirrors /api/register/verify, minus the registration email — there is no
// registrant behind these payments.
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id")
  // Exact transactionId just completed, forwarded from the Golomt callback
  // (?invoice=MEF2026-{id}[-R{n}]) by the receipt page.
  const txnParam = request.nextUrl.searchParams.get("txn")
  if (!id) {
    return NextResponse.json({ valid: false }, { status: 400 })
  }

  const payment = await getStandalonePayment(id)
  if (!payment) {
    return NextResponse.json({ valid: false })
  }

  if (payment.payment_status === "pending") {
    // Re-issued invoices get -R{n} suffixed transactionIds and the record only
    // stores the newest one, so the invoice actually paid may be an older id.
    const candidates = [
      txnParam && parseGolomtTransactionId(txnParam) === payment.id
        ? txnParam
        : null,
      payment.checkout_id,
      `MEF2026-${payment.id}`,
    ].filter((t, i, arr): t is string => !!t && arr.indexOf(t) === i)

    for (const transactionId of candidates) {
      try {
        const txn = await checkGolomtTransaction(transactionId)
        if (txn.errorCode === GOLOMT_SUCCESS_CODE) {
          // A concurrent webhook/reconcile may have marked it already; that
          // conditional failure still means paid.
          await markRegistrationPaid(payment.id).catch((err: any) => {
            if (err?.name !== "ConditionalCheckFailedException") throw err
          })
          payment.payment_status = "paid"
          console.log("Verify: standalone payment marked as paid:", payment.id)
          break
        }
      } catch (err) {
        console.error("Golomt payment check failed:", transactionId, err)
      }
    }
  }

  return NextResponse.json({
    valid: true,
    payment_status: payment.payment_status,
    fee_amount: payment.fee_amount,
    fee_currency: payment.fee_currency,
    fee_usd_amount: payment.fee_usd_amount,
  })
}
