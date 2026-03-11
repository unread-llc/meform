import { NextResponse } from "next/server"
import { getUsdMntRate } from "@/lib/exchange-rate"

export async function GET() {
  try {
    const rate = await getUsdMntRate()
    return NextResponse.json({ rate, currency: "USD/MNT" })
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch exchange rate", details: error?.message },
      { status: 500 }
    )
  }
}
