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
      `Dear\u00a0</span><span style="font-family:Calibri,sans-serif">${name}</span>`
    )
    .replace(
      /Эрхэм хүндэт\u00a0<\/span><span style="font-family:Calibri,sans-serif"> <\/span>/,
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
      name
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

let invoicePdfBuffer: Buffer | null = null

function getInvoicePdfBuffer(): Buffer {
  if (!invoicePdfBuffer) {
    const candidates = [
      join(process.cwd(), "assets", "invoice.pdf"),
      join(process.cwd(), ".next", "assets", "invoice.pdf"),
      join(__dirname, "..", "..", "assets", "invoice.pdf"),
    ]
    const pdfPath = candidates.find((p) => existsSync(p))
    if (!pdfPath) {
      console.error("Invoice PDF not found. Tried:", candidates)
      throw new Error("Invoice PDF not found")
    }
    console.log("Loading invoice PDF from:", pdfPath)
    invoicePdfBuffer = readFileSync(pdfPath)
  }
  return invoicePdfBuffer
}

export async function sendInvoiceEmail(
  registration: RegistrationRecord,
  locale: string = "en"
) {
  const name = `${registration.firstname} ${registration.lastname}`
  const html = injectName(loadTemplate("mng_invoice.html"), name)

  const subject = "Монголын Эдийн Засгийн Форум 2026 - Нэхэмжлэх / Invoice"

  const pdfBuffer = getInvoicePdfBuffer()

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
