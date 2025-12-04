export const locales = ["en", "mn"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

export const localeNames: Record<Locale, string> = {
  en: "English",
  mn: "Монгол",
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}
