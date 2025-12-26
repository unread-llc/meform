"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import type { Locale } from "@/lib/i18n"

interface HeaderProps {
  locale: Locale
  dict: any
}

export function Header({ locale, dict }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { label: dict.nav.about, href: `/${locale}/about` },
    { label: dict.nav.agenda, href: `/${locale}/agenda` },
    { label: dict.nav.history, href: `/${locale}/history` },
    { label: dict.nav.whyParticipate, href: `/${locale}#why-participate` },
    { label: dict.nav.gallery, href: `/${locale}/gallery` },
    { label: dict.nav.videos, href: `/${locale}/videos` },
    { label: dict.nav.partners, href: `/${locale}/partners` },
    { label: dict.nav.faq, href: `/${locale}/faq` },
    { label: dict.nav.mongolia, href: `/${locale}/mongolia` },
    { label: dict.nav.contact, href: `/${locale}/contact` },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">M</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-foreground">MEF</span>
              <span className="text-muted-foreground text-sm ml-1">2025</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher currentLocale={locale} />
            <Button asChild className="hidden sm:inline-flex">
              <Link href={`/${locale}/contact`}>{dict.nav.register}</Link>
            </Button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-white border-t border-border">
          <nav className="flex flex-col py-4 px-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="py-3 text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild className="mt-4">
              <Link href={`/${locale}/contact`}>{dict.nav.register}</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
