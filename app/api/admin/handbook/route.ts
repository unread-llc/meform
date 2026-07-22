import { NextRequest, NextResponse } from "next/server"
import { getObjectContentLength, deleteObject } from "@/lib/aws/s3"
import {
  getHandbookPointer,
  putHandbookPointer,
  isValidHandbookKey,
  DEFAULT_TITLE,
  HANDBOOK_MAX_BYTES,
} from "@/lib/handbook"

export const dynamic = "force-dynamic"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mef2026admin"

function isAuthed(request: NextRequest): boolean {
  return request.headers.get("x-admin-password") === ADMIN_PASSWORD
}

// Returns the currently published pointer (or null) for the admin UI.
export async function GET(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const pointer = await getHandbookPointer()
    return NextResponse.json(
      { pointer },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (error) {
    console.error("Handbook admin GET error:", error)
    return NextResponse.json(
      { error: "Failed to load handbook status." },
      { status: 500 }
    )
  }
}

// Publishes a previously-uploaded PDF (by its S3 key) as the current handbook.
export async function POST(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { key, title, filename } = await request.json()

    if (!isValidHandbookKey(key)) {
      return NextResponse.json({ error: "Invalid file key." }, { status: 400 })
    }

    // Verify the upload actually landed (so a blocked/failed PUT can't publish a
    // broken 404 handbook) AND read its real size from S3 — the client-reported
    // size is not trusted, since the presigned PUT does not enforce a size cap.
    const size = await getObjectContentLength(key)
    if (size == null) {
      return NextResponse.json(
        { error: "Uploaded file was not found in storage. Please retry the upload." },
        { status: 400 }
      )
    }
    if (size > HANDBOOK_MAX_BYTES) {
      return NextResponse.json(
        { error: "Uploaded file exceeds the 60MB limit and was not published." },
        { status: 400 }
      )
    }

    // Capture the currently-published object so we can reclaim it after switching.
    const previous = await getHandbookPointer().catch(() => null)

    const now = new Date()
    await putHandbookPointer({
      key,
      title: (typeof title === "string" && title.trim()) || DEFAULT_TITLE,
      version: now.getTime(),
      updated_at: now.toISOString(),
      size,
      original_filename: typeof filename === "string" ? filename : undefined,
    })

    // Best-effort cleanup of the superseded object (never blocks publishing).
    if (previous?.key && previous.key !== key) {
      deleteObject(previous.key).catch((err) =>
        console.error("Failed to delete superseded handbook object:", err)
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Handbook publish error:", error)
    return NextResponse.json(
      { error: "Failed to publish handbook." },
      { status: 500 }
    )
  }
}
