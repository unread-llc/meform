import { redirect } from "next/navigation"
import { defaultLocale } from "@/lib/i18n"

// Convenience: the bare /YGL/mongoliahandbook2026 link (no locale prefix)
// redirects to the default-locale handbook page.
export default function YglHandbookRedirect() {
  redirect(`/${defaultLocale}/YGL/mongoliahandbook2026`)
}
