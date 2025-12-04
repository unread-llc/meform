"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { locales, localeNames, type Locale } from "@/lib/i18n"

interface LanguageSwitcherProps {
    currentLocale: Locale
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
    const pathname = usePathname()
    const router = useRouter()

    const switchLocale = (newLocale: Locale) => {
        // Remove current locale from pathname and add new locale
        const segments = pathname.split("/")
        segments[1] = newLocale
        const newPath = segments.join("/")

        // Set cookie for locale preference
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`

        router.push(newPath)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">{localeNames[currentLocale]}</span>
                    <span className="sm:hidden">{currentLocale.toUpperCase()}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {locales.map((locale) => (
                    <DropdownMenuItem
                        key={locale}
                        onClick={() => switchLocale(locale)}
                        className={currentLocale === locale ? "bg-accent" : ""}
                    >
                        <span className="mr-2">{locale === "mn" ? "🇲🇳" : "🇬🇧"}</span>
                        {localeNames[locale]}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
