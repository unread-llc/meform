import { NextRequest, NextResponse } from "next/server"
import { getPresignedViewUrl } from "@/lib/aws/s3"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mef2026admin"

export async function GET(request: NextRequest) {
  const password = request.headers.get("x-admin-password")
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const key = request.nextUrl.searchParams.get("key")
  if (!key) {
    return NextResponse.json({ error: "Missing key parameter" }, { status: 400 })
  }

  try {
    const url = await getPresignedViewUrl(key)
    return NextResponse.json({ url })
  } catch (error: any) {
    console.error("Admin image error:", error)
    return NextResponse.json(
      { error: "Failed to generate image URL" },
      { status: 500 }
    )
  }
}
