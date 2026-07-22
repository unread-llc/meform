import { NextResponse } from "next/server"
import { resolveHandbook, placeholderState } from "@/lib/handbook"

// Runs live (as a Lambda) so newly published handbooks appear immediately,
// even though the pages under [locale] are statically generated.
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const state = await resolveHandbook()
    return NextResponse.json(state, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch (error) {
    console.error("Handbook fetch error:", error)
    // Fail soft to the placeholder so the reader always has something to show.
    return NextResponse.json(placeholderState, {
      headers: { "Cache-Control": "no-store" },
    })
  }
}
