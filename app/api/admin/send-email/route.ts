import { NextRequest, NextResponse } from "next/server"
import { getRegistration } from "@/lib/aws/dynamodb"
import { sendRegistrationEmail, sendInvoiceEmail } from "@/lib/aws/ses"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mef2026admin"

export async function POST(request: NextRequest) {
  const password = request.headers.get("x-admin-password")
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id, type } = await request.json()

    if (!id || !type) {
      return NextResponse.json(
        { error: "Missing id or type" },
        { status: 400 }
      )
    }

    const registration = await getRegistration(id)
    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      )
    }

    const locale = registration.locale || "en"

    if (type === "confirmation") {
      await sendRegistrationEmail(registration, locale)
    } else if (type === "invoice") {
      await sendInvoiceEmail(registration, locale)
    } else {
      return NextResponse.json(
        { error: "Invalid email type. Use 'confirmation' or 'invoice'" },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, type, email: registration.email })
  } catch (error: any) {
    console.error("Admin send email error:", error)
    return NextResponse.json(
      { error: "Failed to send email", details: error?.message },
      { status: 500 }
    )
  }
}
