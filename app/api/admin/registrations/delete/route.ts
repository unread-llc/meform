import { NextRequest, NextResponse } from "next/server"
import { deleteRegistration } from "@/lib/aws/dynamodb"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mef2026admin"

export async function POST(request: NextRequest) {
  const password = request.headers.get("x-admin-password")
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    await deleteRegistration(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Admin delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete registration" },
      { status: 500 }
    )
  }
}
