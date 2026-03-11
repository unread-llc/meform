const MONGOLBANK_API = "https://monxansh.appspot.com/xansh.json?currency=USD"

interface ExchangeRateCache {
  rate: number
  date: string // YYYY-MM-DD
  fetchedAt: number
}

let cache: ExchangeRateCache | null = null

// Cache for 1 hour
const CACHE_TTL_MS = 60 * 60 * 1000

/**
 * Fetches the current USD-MNT exchange rate from Mongolbank.
 * Caches the result for 1 hour.
 */
export async function getUsdMntRate(): Promise<number> {
  const now = Date.now()

  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.rate
  }

  try {
    const res = await fetch(MONGOLBANK_API, { next: { revalidate: 3600 } })
    if (!res.ok) {
      throw new Error(`Mongolbank API returned ${res.status}`)
    }

    const data = await res.json()
    // Response format: [{ code: "USD", rate: "3450.00", ... }]
    const usd = Array.isArray(data)
      ? data.find((item: any) => item.code === "USD")
      : null

    if (!usd || !usd.rate) {
      throw new Error("USD rate not found in Mongolbank response")
    }

    const rate = parseFloat(usd.rate)
    if (isNaN(rate) || rate <= 0) {
      throw new Error(`Invalid USD rate: ${usd.rate}`)
    }

    cache = {
      rate,
      date: new Date().toISOString().split("T")[0],
      fetchedAt: now,
    }

    return rate
  } catch (error) {
    console.error("Failed to fetch USD-MNT rate:", error)
    // Return cached rate if available, even if expired
    if (cache) {
      console.warn("Using stale cached USD-MNT rate:", cache.rate)
      return cache.rate
    }
    // Fallback rate if no cache available
    throw new Error("Unable to fetch USD-MNT exchange rate")
  }
}

/**
 * Converts USD amount to MNT using current exchange rate.
 * Returns the amount rounded to nearest whole number.
 */
export async function convertUsdToMnt(usdAmount: number): Promise<{
  mntAmount: number
  rate: number
}> {
  const rate = await getUsdMntRate()
  return {
    mntAmount: Math.round(usdAmount * rate),
    rate,
  }
}
