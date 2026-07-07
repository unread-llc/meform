// Safety net if the live FX fetch fails — never block a registration
const FALLBACK_USD_MNT_RATE = 3569.33

// Reject obviously bogus API responses
const MIN_PLAUSIBLE_RATE = 2500
const MAX_PLAUSIBLE_RATE = 5500

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour
const FETCH_TIMEOUT_MS = 5000

let cachedRate: number | null = null
let cachedAt = 0

async function fetchLiveRate(): Promise<number | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: controller.signal,
      // Next.js would otherwise cache this fetch indefinitely in prod
      cache: "no-store",
    })
    if (!res.ok) return null
    const json = await res.json()
    const rate = Number(json?.rates?.MNT)
    if (
      !Number.isFinite(rate) ||
      rate < MIN_PLAUSIBLE_RATE ||
      rate > MAX_PLAUSIBLE_RATE
    ) {
      console.error("Exchange rate out of plausible range, ignoring:", rate)
      return null
    }
    return rate
  } catch (err: any) {
    console.error("Live exchange rate fetch failed:", err?.message)
    return null
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Returns the current USD-MNT exchange rate: live market rate cached for an
 * hour, falling back to a fixed rate if the source is unavailable. The rate
 * is only sampled when a registration is created — each registration then
 * locks its converted MNT amount permanently.
 */
export async function getUsdMntRate(): Promise<number> {
  const now = Date.now()
  if (cachedRate && now - cachedAt < CACHE_TTL_MS) {
    return cachedRate
  }
  const live = await fetchLiveRate()
  if (live) {
    cachedRate = live
    cachedAt = now
    return live
  }
  // Keep serving a stale cached rate over the hardcoded fallback
  return cachedRate ?? FALLBACK_USD_MNT_RATE
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
