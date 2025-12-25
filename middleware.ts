import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { locales, defaultLocale, isValidLocale } from "@/lib/i18n"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return NextResponse.next()

  // Skip static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // static files like .ico, .jpg, etc.
  ) {
    return NextResponse.next()
  }

  // Redirect to default locale
  const locale = getLocaleFromRequest(request) || defaultLocale
  
  return NextResponse.redirect(
    new URL(`/${locale}${pathname}`, request.url)
  )
}

function getLocaleFromRequest(request: NextRequest): string | null {
  // Check for cookie preference first
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get("accept-language")
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().substring(0, 2))
      .find((lang) => isValidLocale(lang))
    
    if (preferredLocale) {
      return preferredLocale
    }
  }

  return null
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api)
    "/((?!_next|api|.*\\..*).*)",
  ],
}
