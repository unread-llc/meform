import { z } from "zod"

export const sectorOptions = [
  "government",
  "media",
  "private",
  "international",
  "political_party",
  "moderator",
  "panelist",
  "organizing_team",
] as const

export const genderOptions = ["male", "female", "other"] as const
export const visaOptions = ["yes", "no"] as const

export const registrationSchema = z.object({
  sector: z.enum(sectorOptions),
  lastname: z.string().min(1),
  firstname: z.string().min(1),
  gender: z.enum(genderOptions),
  birth: z.string().min(1),
  nation: z.string().min(1),
  residence: z.string().min(1),
  company: z.string().min(1),
  company_register: z.string().min(1),
  position: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  passportno: z.string().min(1),
  visa: z.enum(visaOptions),
  passport_img: z.string().min(1),
  img: z.string().min(1),
})

export type RegistrationData = z.infer<typeof registrationSchema>

// Mongolian register number: 2 Cyrillic letters + 8 digits (e.g. АБ12345678)
const MN_REGISTER_REGEX = /^[А-ЯЁӨҮа-яёөү]{2}\d{8}$/

export function isValidMnRegisterNo(value: string): boolean {
  return MN_REGISTER_REGEX.test(value)
}

export function calculateFee(nation: string): { amount: number; currency: string } {
  const isMongolian =
    nation.toLowerCase() === "mongolia" ||
    nation.toLowerCase() === "mn" ||
    nation.toLowerCase() === "монгол"
  return isMongolian
    ? { amount: 1_000_000, currency: "MNT" }
    : { amount: 500, currency: "USD" }
}

export function generateQRString(registrationId: string): string {
  return `MEF2026:${registrationId}`
}
