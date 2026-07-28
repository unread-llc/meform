import { NextRequest, NextResponse } from "next/server"
import { revokeVipInvite, deleteVipInvite } from "@/lib/vip-invites"

export const dynamic = "force-dynamic"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mef2026admin"

// Revokes an invitation (default) or deletes it outright when { remove: true }.
// Revoking keeps the audit trail, so it is the normal choice.
export async function POST(request: NextRequest) {
  if (request.headers.get("x-admin-password") !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { code, remove } = await request.json()
    if (typeof code !== "string" || !code) {
      return NextResponse.json({ error: "Missing code." }, { status: 400 })
    }

    if (remove === true) {
      await deleteVipInvite(code)
    } else {
      await revokeVipInvite(code)
    }
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error?.name === "ConditionalCheckFailedException") {
      return NextResponse.json(
        { error: "That invitation no longer exists." },
        { status: 404 }
      )
    }
    console.error("VIP invite revoke error:", error)
    return NextResponse.json(
      { error: "Failed to update invitation." },
      { status: 500 }
    )
  }
}
