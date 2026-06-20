import { z } from "zod"

export const registrationTypeOptions = ["organization", "individual"] as const

export const paidSectorOptions = [
  "government",
  "media",
  "private",
  "international",
  "other",
] as const

export const inviteSectorOptions = [
  "government",
  "media",
  "private",
  "international",
  "political_party",
  "moderator",
  "panelist",
  "organizing_team",
  "other",
] as const

export const sectorOptions = inviteSectorOptions

export const genderOptions = ["male", "female", "other"] as const
export const visaOptions = ["yes", "no"] as const

export const registrationSchema = z.object({
  registration_type: z.enum(registrationTypeOptions),
  sector: z.enum(sectorOptions),
  lastname: z.string().min(1),
  firstname: z.string().min(1),
  gender: z.enum(genderOptions),
  birth: z.string().min(1),
  nation: z.string().min(1),
  residence: z.string().min(1),
  company: z.string().optional(),
  company_register: z.string().optional(),
  position: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(1),
  passportno: z.string().min(1),
  visa: z.enum(visaOptions).optional().or(z.string().optional()),
  passport_img: z.string().min(1),
  img: z.string().min(1),
})

export type RegistrationData = z.infer<typeof registrationSchema>

// Mongolian register number: 2 Cyrillic letters + 8 digits (e.g. АБ12345678)
const MN_REGISTER_REGEX = /^[А-ЯЁӨҮа-яёөү]{2}\d{8}$/

export function isValidMnRegisterNo(value: string): boolean {
  return MN_REGISTER_REGEX.test(value)
}

export function calculateFee(
  nation: string,
  priceUsdOverride?: number
): { amount: number; currency: string } {
  // Fixed-price tiers (e.g. VIP) charge a flat USD amount for everyone.
  if (priceUsdOverride && priceUsdOverride > 0) {
    return { amount: priceUsdOverride, currency: "USD" }
  }
  const isMongolian =
    nation.toLowerCase() === "mongolia" ||
    nation.toLowerCase() === "mn" ||
    nation.toLowerCase() === "монгол"
  return isMongolian
    ? { amount: 1000000, currency: "MNT" }
    : { amount: 500, currency: "USD" }
}

export function generateQRString(registrationId: string): string {
  return `MEF2026:${registrationId}`
}
