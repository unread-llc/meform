import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { getPresignedUploadUrl } from "@/lib/aws/s3"
import { HANDBOOK_PREFIX, HANDBOOK_MAX_BYTES } from "@/lib/handbook"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mef2026admin"

// Issues a presigned PUT URL so the admin browser can upload the handbook PDF
// directly to S3 (bypassing Lambda request-body size limits for large files).
export async function POST(request: NextRequest) {
  const password = request.headers.get("x-admin-password")
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { contentType, size } = await request.json()

    if (contentType !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed." },
        { status: 400 }
      )
    }

    // Require a real size up front. This is advisory (S3 does not enforce it on a
    // presigned PUT), so the publish endpoint re-checks the actual object size —
    // but rejecting here gives a fast, clear error for the common case.
    if (typeof size !== "number" || !Number.isFinite(size) || size <= 0) {
      return NextResponse.json(
        { error: "A valid file size is required." },
        { status: 400 }
      )
    }

    if (size > HANDBOOK_MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 60MB." },
        { status: 400 }
      )
    }

    const key = `${HANDBOOK_PREFIX}/${uuidv4()}.pdf`
    const { url } = await getPresignedUploadUrl(
      key,
      "application/pdf",
      HANDBOOK_MAX_BYTES
    )

    return NextResponse.json({ url, key })
  } catch (error) {
    console.error("Handbook presign error:", error)
    return NextResponse.json(
      { error: "Failed to create upload URL." },
      { status: 500 }
    )
  }
}
