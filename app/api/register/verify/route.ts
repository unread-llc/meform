import { NextRequest, NextResponse } from "next/server"
import { getRegistration } from "@/lib/aws/dynamodb"

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id")
  if (!id) {
    return NextResponse.json({ valid: false }, { status: 400 })
  }

  const registration = await getRegistration(id)
  if (!registration) {
    return NextResponse.json({ valid: false })
  }

  return NextResponse.json({
    valid: true,
    firstname: registration.firstname,
    lastname: registration.lastname,
    payment_status: registration.payment_status,
  })
}
