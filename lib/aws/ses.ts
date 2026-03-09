import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import type { RegistrationRecord } from "./dynamodb"

const sesClient = new SESClient({
  region: process.env.MEF_AWS_REGION || "ap-southeast-1",
})

const FROM_EMAIL = process.env.SES_FROM_EMAIL || "noreply@mef.mn"

export async function sendRegistrationEmail(
  registration: RegistrationRecord,
  locale: string = "en"
) {
  const qrData = `MEF2026:${registration.id}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`

  const isMn = locale === "mn"

  const subject = isMn
    ? "Монголын Эдийн Засгийн Форум 2026 - Бүртгэл баталгаажлаа"
    : "Mongolia Economic Forum 2026 - Registration Confirmed"

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; padding: 30px 0; border-bottom: 2px solid #f0f0f0;">
    <h1 style="margin: 0; font-size: 24px; color: #111;">
      ${isMn ? "Монголын Эдийн Засгийн Форум 2026" : "Mongolia Economic Forum 2026"}
    </h1>
  </div>

  <div style="padding: 30px 0;">
    <h2 style="color: #16a34a; font-size: 20px;">
      ${isMn ? "Бүртгэл амжилттай!" : "Registration Confirmed!"}
    </h2>

    <p>${isMn
      ? `Сайн байна уу, ${registration.firstname}. Таны бүртгэл амжилттай баталгаажлаа.`
      : `Hello ${registration.firstname}, your registration has been confirmed.`
    }</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 0; color: #666; width: 40%;">${isMn ? "Нэр" : "Name"}</td>
        <td style="padding: 10px 0; font-weight: 500;">${registration.firstname} ${registration.lastname}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 0; color: #666;">${isMn ? "Байгууллага" : "Organization"}</td>
        <td style="padding: 10px 0; font-weight: 500;">${registration.company}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 0; color: #666;">${isMn ? "Албан тушаал" : "Position"}</td>
        <td style="padding: 10px 0; font-weight: 500;">${registration.position}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 0; color: #666;">${isMn ? "Бүртгэлийн дугаар" : "Registration ID"}</td>
        <td style="padding: 10px 0; font-family: monospace; font-size: 13px;">${registration.id}</td>
      </tr>
    </table>

    <div style="text-align: center; padding: 20px; background: #f9fafb; border-radius: 12px; margin: 20px 0;">
      <p style="margin: 0 0 15px; font-weight: 500; color: #666;">
        ${isMn ? "Таны QR код" : "Your QR Code"}
      </p>
      <img src="${qrUrl}" alt="QR Code" width="200" height="200" style="border-radius: 8px;" />
      <p style="margin: 15px 0 0; font-size: 13px; color: #999;">
        ${isMn
          ? "Энэ QR кодыг форумд ирэхдээ үзүүлнэ үү."
          : "Please present this QR code at the forum entrance."
        }
      </p>
    </div>
  </div>

  <div style="border-top: 2px solid #f0f0f0; padding: 20px 0; text-align: center; font-size: 13px; color: #999;">
    <p style="margin: 0;">Mongolia Economic Forum 2026</p>
  </div>
</body>
</html>`

  const text = isMn
    ? `Монголын Эдийн Засгийн Форум 2026\n\nСайн байна уу, ${registration.firstname}.\nТаны бүртгэл амжилттай баталгаажлаа.\n\nБүртгэлийн дугаар: ${registration.id}\n\nФорумд ирэхдээ энэ имэйлийг үзүүлнэ үү.`
    : `Mongolia Economic Forum 2026\n\nHello ${registration.firstname},\nYour registration has been confirmed.\n\nRegistration ID: ${registration.id}\n\nPlease present this email at the forum entrance.`

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
