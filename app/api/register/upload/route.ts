import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { rateLimit } from "@/lib/rate-limit"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const s3Client = new S3Client({
  region: process.env.MEF_AWS_REGION || "ap-southeast-1",
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
})
const BUCKET = process.env.MEF_S3_BUCKET || "meforum"

// Max 10 upload requests per IP per 15 minutes
const RATE_LIMIT = { maxRequests: 10, windowMs: 15 * 60 * 1000 }

export async function POST(request: NextRequest) {
  try {
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

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const field = formData.get("field") as string | null

    if (!file || !field) {
      return NextResponse.json(
        { error: "Missing file or field" },
        { status: 400 }
      )
    }

    if (!["passport_img", "img"].includes(field)) {
      return NextResponse.json(
        { error: "Invalid field" },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP" },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 5MB." },
        { status: 400 }
      )
    }

    const ext = file.name.split(".").pop() || "jpg"
    const key = `registrations/${field}/${uuidv4()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    )

    return NextResponse.json({ key })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    )
  }
}
