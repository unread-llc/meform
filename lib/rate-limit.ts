// Simple in-memory rate limiter for API routes.
// Tracks request counts per IP within a sliding window.
// NOTE: This works per-process. If running multiple instances behind a load
// balancer, use Redis or similar. For a single Next.js server this is sufficient.

const store = new Map<string, { count: number; resetAt: number }>()

// Cleanup stale entries every 60 seconds to prevent memory leak
let lastCleanup = Date.now()
function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < 60_000) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}

export function rateLimit(
  ip: string,
  {
    maxRequests = 10,
    windowMs = 60_000,
  }: { maxRequests?: number; windowMs?: number } = {}
): { allowed: boolean; remaining: number } {
  cleanup()

  const now = Date.now()
  const key = ip
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  entry.count++
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  return { allowed: true, remaining: maxRequests - entry.count }
}
