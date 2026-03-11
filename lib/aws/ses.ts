import { SESClient, SendEmailCommand, SendRawEmailCommand } from "@aws-sdk/client-ses"
import { readFileSync } from "fs"
import { join } from "path"
import type { RegistrationRecord } from "./dynamodb"

const sesClient = new SESClient({
  region: process.env.MEF_AWS_REGION || "ap-southeast-1",
})

const FROM_EMAIL = process.env.SES_FROM_EMAIL || "info@meforum.mn"

// ---------------------------------------------------------------------------
// 1. Paid confirmation email (sent when payment is confirmed)
// ---------------------------------------------------------------------------

export async function sendRegistrationEmail(
  registration: RegistrationRecord,
  locale: string = "en"
) {
  const name = `${registration.firstname} ${registration.lastname}`

  const subject =
    "Монголын Эдийн Засгийн Форум 2026 - Бүртгэл баталгаажлаа / Registration Confirmed"

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; padding: 30px 0; border-bottom: 2px solid #f0f0f0;">
    <h1 style="margin: 0; font-size: 24px; color: #111;">
      Монголын Эдийн Засгийн Форум 2026
    </h1>
    <p style="margin: 5px 0 0; font-size: 14px; color: #666;">Mongolia Economic Forum 2026</p>
  </div>

  <div style="padding: 30px 0;">
    <!-- Mongolian -->
    <p>Эрхэм хүндэт ${name},</p>
    <p>2026 оны 6 дугаар сарын 29–30-ны өдрүүдэд зохион байгуулагдах Монголын Эдийн Засгийн Форум 2026 арга хэмжээнд оролцох бүртгэлээ баталгаажуулсан танд талархал илэрхийлье.</p>
    <p>Таны нэвтрэх мандат хэвлэгдэн бэлэн болмогц бид тантай холбогдох болно. Уг мандат нь иргэний үнэмлэх эсхүл гадаад паспорт зэрэг хүчин төгөлдөр бичиг баримтын хамт хүчинтэй болохыг анхаарна уу. Иймд арга хэмжээний үеэр холбогдох бичиг баримтаа биедээ авч явахыг зөвлөж байна.</p>
    <p>Форумын байршил, хөтөлбөр, хэлэлцэх асуудал болон илтгэгчдийн талаарх дэлгэрэнгүй мэдээллийг <a href="https://www.meforum.mn">www.meforum.mn</a> цахим хуудас, албан ёсны сошиал сувгууд болон MEF2026 гар утасны аппликейшнаас авна уу.</p>
    <p>Бүртгэлтэй холбоотой асууж тодруулах зүйлсийг <a href="mailto:registration@meforum.mn">registration@meforum.mn</a> цахим хаягаар бидэнтэй холбогдоно уу.</p>
    <p>Хүндэтгэсэн,<br/>Монголын Эдийн Засгийн Форум 2026<br/>Зохион байгуулах комисс</p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

    <!-- English -->
    <p>Dear ${name},</p>
    <p>Thank you for confirming your registration to participate in the Mongolia Economic Forum 2026, which will be held on June 29–30, 2026.</p>
    <p>You will be contacted once your entry badge has been printed and is ready for collection. Please note that the badge will be valid only when presented together with a government-issued identification document, such as a national ID card or passport. We kindly advise you to carry your identification document with you throughout the Forum.</p>
    <p>Detailed information regarding the venue, program, discussion topics, and speakers is available on our official website at <a href="https://www.meforum.mn">www.meforum.mn</a>, through our official social media channels, and via the MEF2026 mobile application.</p>
    <p>Should you have any questions regarding your registration, please do not hesitate to contact us at <a href="mailto:registration@meforum.mn">registration@meforum.mn</a>.</p>
    <p>Sincerely,<br/>Mongolia Economic Forum 2026<br/>Organizing Committee</p>
  </div>

  <div style="border-top: 2px solid #f0f0f0; padding: 20px 0; text-align: center; font-size: 13px; color: #999;">
    <p style="margin: 0;">Mongolia Economic Forum 2026 | <a href="https://www.meforum.mn" style="color: #999;">www.meforum.mn</a></p>
  </div>
</body>
</html>`

  const text = `Эрхэм хүндэт ${name},

2026 оны 6 дугаар сарын 29–30-ны өдрүүдэд зохион байгуулагдах Монголын Эдийн Засгийн Форум 2026 арга хэмжээнд оролцох бүртгэлээ баталгаажуулсан танд талархал илэрхийлье.

Таны нэвтрэх мандат хэвлэгдэн бэлэн болмогц бид тантай холбогдох болно. Уг мандат нь иргэний үнэмлэх эсхүл гадаад паспорт зэрэг хүчин төгөлдөр бичиг баримтын хамт хүчинтэй болохыг анхаарна уу.

Форумын дэлгэрэнгүй мэдээлэл: www.meforum.mn
Асуулт: registration@meforum.mn

Хүндэтгэсэн,
Монголын Эдийн Засгийн Форум 2026
Зохион байгуулах комисс

---

Dear ${name},

Thank you for confirming your registration to participate in the Mongolia Economic Forum 2026, which will be held on June 29–30, 2026.

You will be contacted once your entry badge has been printed and is ready for collection. Please note that the badge will be valid only when presented together with a government-issued identification document.

More info: www.meforum.mn
Questions: registration@meforum.mn

Sincerely,
Mongolia Economic Forum 2026
Organizing Committee`

  await sesClient.send(
    new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: [registration.email],
      },
      Message: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          Html: { Data: html, Charset: "UTF-8" },
          Text: { Data: text, Charset: "UTF-8" },
        },
      },
    })
  )
}

// ---------------------------------------------------------------------------
// 2. Invoice email with PDF attachment (sent when registration is created)
// ---------------------------------------------------------------------------

let invoicePdfBase64: string | null = null

function getInvoicePdfBase64(): string {
  if (!invoicePdfBase64) {
    const pdfPath = join(process.cwd(), "assets", "invoice.pdf")
    invoicePdfBase64 = readFileSync(pdfPath).toString("base64")
  }
  return invoicePdfBase64
}

export async function sendInvoiceEmail(
  registration: RegistrationRecord,
  locale: string = "en"
) {
  const name = `${registration.firstname} ${registration.lastname}`
  const to = registration.email

  const subject =
    "Монголын Эдийн Засгийн Форум 2026 - Нэхэмжлэх / Invoice"

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; padding: 30px 0; border-bottom: 2px solid #f0f0f0;">
    <h1 style="margin: 0; font-size: 24px; color: #111;">
      Монголын Эдийн Засгийн Форум 2026
    </h1>
    <p style="margin: 5px 0 0; font-size: 14px; color: #666;">Mongolia Economic Forum 2026</p>
  </div>

  <div style="padding: 30px 0;">
    <!-- Mongolian -->
    <p>Эрхэм хүндэт ${name},</p>
    <p>2026 оны 6 дугаар сарын 29–30-ны өдрүүдэд зохион байгуулагдах Монголын Эдийн Засгийн Форум 2026 арга хэмжээнд оролцох бүртгэлээ баталгаажуулахад нэг алхам үлдээд байна.</p>
    <p>Иймд хавсралтаар илгээсэн нэхэмжлэхийн дагуу оролцооны төлбөрийг шилжүүлж өгөхийг хүсье.</p>
    <p>Төлбөр баталгаажсаны дараа оролцогчийн мандаттай холбоотой мэдээллийг танд хүргэх болно.</p>
    <p>Форумын байршил, хөтөлбөр, хэлэлцэх асуудал болон илтгэгчдийн талаарх дэлгэрэнгүй мэдээллийг <a href="https://www.meforum.mn">www.meforum.mn</a> цахим хуудас, албан ёсны сошиал сувгууд болон MEF2026 гар утасны аппликейшнаас авах боломжтой.</p>
    <p>Бүртгэлтэй холбоотой асууж тодруулах зүйлс байвал <a href="mailto:registration@meforum.mn">registration@meforum.mn</a> цахим хаягаар бидэнтэй холбогдоно уу.</p>
    <p>Хүндэтгэсэн,<br/>Монголын Эдийн Засгийн Форум 2026<br/>Зохион байгуулах комисс</p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

    <!-- English -->
    <p>Dear ${name},</p>
    <p>Mongolia Economic Forum 2026 will be held on June 29–30, 2026. Only one step remains to finalize your registration for participation in the forum.</p>
    <p>Kindly proceed with the payment according to the attached invoice.</p>
    <p>Once the payment is confirmed, we will provide you with further information regarding the participant accreditation badge.</p>
    <p>For more details regarding the venue, program, discussion topics, and speakers of the forum, please visit <a href="https://www.meforum.mn">www.meforum.mn</a>, follow our official social media channels, or access the MEF2026 mobile application.</p>
    <p>Should you have any questions regarding the registration process, please feel free to contact us at <a href="mailto:registration@meforum.mn">registration@meforum.mn</a>.</p>
    <p>Sincerely,<br/>Mongolia Economic Forum 2026<br/>Organizing Committee</p>
  </div>

  <div style="border-top: 2px solid #f0f0f0; padding: 20px 0; text-align: center; font-size: 13px; color: #999;">
    <p style="margin: 0;">Mongolia Economic Forum 2026 | <a href="https://www.meforum.mn" style="color: #999;">www.meforum.mn</a></p>
  </div>
</body>
</html>`

  const textBody = `Эрхэм хүндэт ${name},

2026 оны 6 дугаар сарын 29–30-ны өдрүүдэд зохион байгуулагдах Монголын Эдийн Засгийн Форум 2026 арга хэмжээнд оролцох бүртгэлээ баталгаажуулахад нэг алхам үлдээд байна.

Иймд хавсралтаар илгээсэн нэхэмжлэхийн дагуу оролцооны төлбөрийг шилжүүлж өгөхийг хүсье.

Форумын дэлгэрэнгүй мэдээлэл: www.meforum.mn
Асуулт: registration@meforum.mn

Хүндэтгэсэн,
Монголын Эдийн Засгийн Форум 2026
Зохион байгуулах комисс

---

Dear ${name},

Mongolia Economic Forum 2026 will be held on June 29-30, 2026. Only one step remains to finalize your registration.

Kindly proceed with the payment according to the attached invoice.

More info: www.meforum.mn
Questions: registration@meforum.mn

Sincerely,
Mongolia Economic Forum 2026
Organizing Committee`

  // Build MIME message with PDF attachment
  const boundary = `----=_Part_${Date.now()}`
  const pdfBase64 = getInvoicePdfBase64()

  const rawMessage = [
    `From: ${FROM_EMAIL}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    `Content-Type: multipart/alternative; boundary="${boundary}_alt"`,
    "",
    `--${boundary}_alt`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(textBody).toString("base64"),
    "",
    `--${boundary}_alt`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(html).toString("base64"),
    "",
    `--${boundary}_alt--`,
    "",
    `--${boundary}`,
    "Content-Type: application/pdf",
    "Content-Transfer-Encoding: base64",
    `Content-Disposition: attachment; filename="MEF2026_Invoice.pdf"`,
    "",
    pdfBase64,
    "",
    `--${boundary}--`,
  ].join("\r\n")

  await sesClient.send(
    new SendRawEmailCommand({
      Source: FROM_EMAIL,
      Destinations: [to],
      RawMessage: {
        Data: Buffer.from(rawMessage),
      },
    })
  )
}
