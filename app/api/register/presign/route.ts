import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { getPresignedUploadUrl } from "@/lib/aws/s3"
import { rateLimit } from "@/lib/rate-limit"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Max 10 presign requests per IP per 15 minutes (2 images per registration, some retries)
const RATE_LIMIT = { maxRequests: 10, windowMs: 15 * 60 * 1000 }

export async function POST(request: NextRequest) {
  try {
    // --- Rate limiting ---
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"
    const { allowed } = rateLimit(ip, RATE_LIMIT)
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    const { filename, contentType, field } = await request.json()

    if (!filename || !contentType || !field) {
      return NextResponse.json(
        { error: "Missing required fields: filename, contentType, field" },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP" },
        { status: 400 }
      )
    }

    if (!["passport_img", "img"].includes(field)) {
      return NextResponse.json(
        { error: "Invalid field. Must be passport_img or img" },
        { status: 400 }
      )
    }

    const ext = filename.split(".").pop() || "jpg"
    const key = `registrations/${field}/${uuidv4()}.${ext}`

    const { url } = await getPresignedUploadUrl(key, contentType, MAX_FILE_SIZE)

    return NextResponse.json({ url, key })
  } catch (error) {
    console.error("Presign error:", error)
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    )
  }
}
