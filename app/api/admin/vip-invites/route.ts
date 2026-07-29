import { NextRequest, NextResponse } from "next/server"
import {
  createVipInvite,
  listVipInvites,
  inviteState,
} from "@/lib/vip-invites"

export const dynamic = "force-dynamic"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mef2026admin"

function isAuthed(request: NextRequest): boolean {
  return request.headers.get("x-admin-password") === ADMIN_PASSWORD
}

export async function GET(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const invites = await listVipInvites()
    return NextResponse.json(
      { invites: invites.map((i) => ({ ...i, state: inviteState(i) })) },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (error) {
    console.error("VIP invites list error:", error)
    return NextResponse.json(
      { error: "Failed to load invitations." },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json().catch(() => ({}))
    const str = (v: unknown) =>
      typeof v === "string" && v.trim() ? v.trim().slice(0, 200) : undefined

    const invite = await createVipInvite({
      guest_name: str(body.guest_name),
      guest_email: str(body.guest_email),
      note: str(body.note),
      reusable: body.reusable === true,
    })

    return NextResponse.json({ invite: { ...invite, state: "active" } })
  } catch (error) {
    console.error("VIP invite create error:", error)
    return NextResponse.json(
      { error: "Failed to create invitation." },
      { status: 500 }
    )
  }
}
