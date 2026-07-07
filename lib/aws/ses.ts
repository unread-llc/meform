import { Resend } from "resend"
import { readFileSync, existsSync } from "fs"
import { join } from "path"
import type { RegistrationRecord } from "./dynamodb"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.SES_FROM_EMAIL || "info@meforum.mn"

function loadTemplate(filename: string): string {
  const candidates = [
    join(process.cwd(), "assets", "mail", filename),
    join(process.cwd(), ".next", "assets", "mail", filename),
    join(__dirname, "..", "..", "assets", "mail", filename),
  ]
  const path = candidates.find((p) => existsSync(p))
  if (!path) throw new Error(`Mail template not found: ${filename}`)
  return readFileSync(path, "utf-8")
}

function injectName(html: string, name: string): string {
  // ENG/MNG confirmation: Dear\xa0 followed by an empty Calibri span
  // MNG invoice: Эрхэм хүндэт\xa0 followed by an empty Calibri span
  return html
    .replace(
      /Dear\u00a0<\/span><span style="font-family:Calibri,sans-serif">\u00a0<\/span>/,
      // Replacer fn keeps user-supplied names literal ($-sequences would
      // otherwise be interpreted as replacement patterns)
      () =>
        `Dear\u00a0</span><span style="font-family:Calibri,sans-serif">${name}</span>`
    )
    .replace(
      /Эрхэм хүндэт\u00a0<\/span><span style="font-family:Calibri,sans-serif"> <\/span>/,
      () =>
        `Эрхэм хүндэт\u00a0</span><span style="font-family:Calibri,sans-serif">${name}</span>`
    )
}

// ---------------------------------------------------------------------------
// 1. Confirmation email — sent after payment is verified
// ---------------------------------------------------------------------------

export async function sendRegistrationEmail(
  registration: RegistrationRecord,
  locale: string = "en"
) {
  const name = `${registration.firstname} ${registration.lastname}`

  // VIP (YGL Learning Journey) registrations get the dedicated YGL email.
  if (registration.is_vip) {
    const html = loadTemplate("ygl_confirmation.html").replace(
      /\[Participant Name\]/g,
      () => name
    )
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [registration.email],
      subject: "YGL Learning Journey in Mongolia 2026 — Participation Confirmed",
      html,
    })
    return
  }

  const templateFile = locale === "mn" ? "mng_confirmation.html" : "eng_confirmation.html"
  const html = injectName(loadTemplate(templateFile), name)

  const subject =
    locale === "mn"
      ? "Монголын Эдийн Засгийн Форум 2026 - Бүртгэл баталгаажлаа"
      : "Mongolia Economic Forum 2026 - Registration Confirmed"

  await resend.emails.send({
    from: FROM_EMAIL,
    to: [registration.email],
    subject,
    html,
  })
}

// ---------------------------------------------------------------------------
// 2. Invoice email — sent at registration with PDF attachment
// ---------------------------------------------------------------------------

const assetPdfCache = new Map<string, Buffer>()

function getAssetPdfBuffer(filename: string): Buffer {
  const cached = assetPdfCache.get(filename)
  if (cached) return cached
  const candidates = [
    join(process.cwd(), "assets", filename),
    join(process.cwd(), ".next", "assets", filename),
    join(__dirname, "..", "..", "assets", filename),
  ]
  const pdfPath = candidates.find((p) => existsSync(p))
  if (!pdfPath) {
    console.error(`${filename} not found. Tried:`, candidates)
    throw new Error(`${filename} not found`)
  }
  console.log("Loading PDF from:", pdfPath)
  const buffer = readFileSync(pdfPath)
  assetPdfCache.set(filename, buffer)
  return buffer
}

export async function sendInvoiceEmail(
  registration: RegistrationRecord,
  locale: string = "en"
) {
  // VIP (YGL Learning Journey) registrations get the YGL payment-request
  // email with a durable payment link instead of the MEF invoice PDF.
  // Manual resends (admin panel) go out without the stamped invoice PDF —
  // its printed amount only matches registrations created at the old fixed
  // exchange rate.
  if (registration.is_vip) {
    return sendYglInvoiceEmail(registration, { attachPdf: false })
  }

  const name = `${registration.firstname} ${registration.lastname}`
  const html = injectName(loadTemplate("mng_invoice.html"), name)

  const subject = "Монголын Эдийн Засгийн Форум 2026 - Нэхэмжлэх / Invoice"

  const pdfBuffer = getAssetPdfBuffer("invoice.pdf")

  await resend.emails.send({
    from: FROM_EMAIL,
    to: [registration.email],
    subject,
    html,
    attachments: [
      {
        filename: "MEF2026_Invoice.pdf",
        content: pdfBuffer,
      },
    ],
  })
}

// ---------------------------------------------------------------------------
// 3. YGL invoice email — sent to VIP registrations with a durable payment link
//    (Golomt checkout URLs expire within minutes, so the link points at
//    /api/register/pay which re-issues a fresh invoice on demand)
// ---------------------------------------------------------------------------

export async function sendYglInvoiceEmail(
  registration: RegistrationRecord,
  { attachPdf = true }: { attachPdf?: boolean } = {}
) {
  const name = `${registration.firstname} ${registration.lastname}`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  // Link to the interstitial page (side-effect-free GET), not the invoice-
  // minting API: corporate mail gateways prefetch emailed links.
  const paymentUrl = `${appUrl}/${registration.locale || "en"}/register/pay/${registration.id}`

  const html = loadTemplate("ygl_invoice.html")
    .replace(/\[Participant Name\]/g, () => name)
    .replace(/\{\{PAYMENT_URL\}\}/g, () => paymentUrl)

  await resend.emails.send({
    from: FROM_EMAIL,
    to: [registration.email],
    subject:
      "YGL Learning Journey in Mongolia 2026 — Complete Your Registration",
    html,
    ...(attachPdf
      ? {
          // Official stamped invoice with bank-transfer details, for
          // participants who wire the fee instead of paying by card
          attachments: [
            {
              filename: "YGL_Learning_Journey_Invoice.pdf",
              content: getAssetPdfBuffer("ygl_invoice.pdf"),
            },
          ],
        }
      : {}),
  })
}
