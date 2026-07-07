import { NextResponse } from "next/server"
import { getUsdMntRateInfo } from "@/lib/exchange-rate"

export async function GET() {
  try {
    const { rate, source, fetchedAt } = await getUsdMntRateInfo()
    return NextResponse.json({ rate, currency: "USD/MNT", source, fetchedAt })
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch exchange rate", details: error?.message },
      { status: 500 }
    )
  }
}
