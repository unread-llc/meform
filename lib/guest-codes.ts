import { rateLimit } from "@/lib/rate-limit"

// Secret codes that unlock complimentary (free) YGL Learning Journey
// registration at /register/vip/guest/<code>. Comma-separated in the
// VIP_INVITE_CODES env var, kept separate from INVITE_CODES so guest links can
// be issued and revoked independently of the forum invite links.
//
// This fails CLOSED in production: with nothing configured, every code is
// rejected and the free path is disabled. Never add a production fallback — a
// guessable default would hand out $3,000 comps, and clearing the env var to
// close registration would silently re-enable it instead of revoking access.
const configured = (process.env.VIP_INVITE_CODES ?? "")
  .split(",")
  .map((c) => c.trim())
  .filter(Boolean)

// Local-development convenience only; never applies in production.
const devFallback = process.env.NODE_ENV === "production" ? [] : ["ygl2026"]

const VIP_GUEST_CODES = new Set(
  configured.length > 0 ? configured : devFallback
)

export function isValidVipGuestCode(code: unknown): boolean {
  return typeof code === "string" && VIP_GUEST_CODES.has(code)
}

// Global budget for failed code attempts. Deliberately NOT keyed on the client
// IP: X-Forwarded-For is client-supplied behind the CDN, so a per-IP bucket
// alone does not slow guessing. Only failures consume budget, so a guest with a
// valid link is never blocked by someone else's attempts.
const CODE_FAIL_BUDGET = { maxRequests: 20, windowMs: 15 * 60 * 1000 }

export function recordFailedGuestCodeAttempt(): { throttled: boolean } {
  const { allowed } = rateLimit("vip-guest-code-fail", CODE_FAIL_BUDGET)
  return { throttled: !allowed }
}
