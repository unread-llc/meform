// Safety net if every live FX source fails — never block a registration
const FALLBACK_USD_MNT_RATE = 3569.33

// Reject obviously bogus API responses
const MIN_PLAUSIBLE_RATE = 2500
const MAX_PLAUSIBLE_RATE = 5500

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour
const FETCH_TIMEOUT_MS = 5000

export type RateSource = "khanbank" | "market" | "fallback"

interface RateInfo {
  rate: number
  source: RateSource
  fetchedAt: string
}

let cached: RateInfo | null = null
let cachedAtMs = 0

function plausible(rate: number): boolean {
  return (
    Number.isFinite(rate) &&
    rate >= MIN_PLAUSIBLE_RATE &&
    rate <= MAX_PLAUSIBLE_RATE
  )
}

async function fetchJson(url: string): Promise<any | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      // Next.js would otherwise cache this fetch indefinitely in prod
      cache: "no-store",
    })
    if (!res.ok) return null
    return await res.json()
  } catch (err: any) {
    console.error("Exchange rate fetch failed:", url, err?.message)
    return null
  } finally {
    clearTimeout(timer)
  }
}

// Khan Bank's public daily rates — a real Mongolian bank quote (mid rate)
async function fetchKhanBankRate(): Promise<number | null> {
  const json = await fetchJson("https://www.khanbank.com/api/back/rates")
  const usd = Array.isArray(json)
    ? json.find((r: any) => r?.currency === "USD")
    : null
  const rate = Number(usd?.midRate)
  return plausible(rate) ? rate : null
}

// Generic market rate as backup
async function fetchMarketRate(): Promise<number | null> {
  const json = await fetchJson("https://open.er-api.com/v6/latest/USD")
  const rate = Number(json?.rates?.MNT)
  return plausible(rate) ? rate : null
}

/**
 * Current USD-MNT rate with provenance: Khan Bank's published mid rate,
 * else a market FX rate, else a stale cached value, else the hardcoded
 * fallback. Cached for an hour. The rate is only sampled when a registration
 * is created — each registration then locks its converted MNT amount.
 */
export async function getUsdMntRateInfo(): Promise<RateInfo> {
  const now = Date.now()
  if (cached && now - cachedAtMs < CACHE_TTL_MS) {
    return cached
  }

  const khan = await fetchKhanBankRate()
  const live: RateInfo | null = khan
    ? { rate: khan, source: "khanbank", fetchedAt: new Date().toISOString() }
    : await fetchMarketRate().then((rate) =>
        rate
          ? {
              rate,
              source: "market" as const,
              fetchedAt: new Date().toISOString(),
            }
          : null
      )

  if (live) {
    cached = live
    cachedAtMs = now
    return live
  }

  // Prefer a stale cached rate over the hardcoded fallback
  return (
    cached ?? {
      rate: FALLBACK_USD_MNT_RATE,
      source: "fallback",
      fetchedAt: new Date().toISOString(),
    }
  )
}

export async function getUsdMntRate(): Promise<number> {
  return (await getUsdMntRateInfo()).rate
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
