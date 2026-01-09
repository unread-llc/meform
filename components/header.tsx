"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronDown, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import type { Locale } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const anchorSectionIds = [
  "about",
  "agenda",
  "timeline",
  "why-participate",
  "gallery",
  "partners",
  "faq",
  "contact",
] as const
type AnchorSectionId = (typeof anchorSectionIds)[number]
type NavItem = {
  label: string
  href: string
  sectionId?: AnchorSectionId
}

interface HeaderProps {
  locale: Locale
  dict: any
}

export function Header({ locale, dict }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<AnchorSectionId>("about")

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries.filter((entry) => entry.isIntersecting)
        if (!visibleSections.length) return
        const mostVisible = visibleSections.reduce((prev, current) =>
          current.intersectionRatio > prev.intersectionRatio ? current : prev
        )
        setActiveSection(mostVisible.target.id as AnchorSectionId)
      },
      {
        rootMargin: "-35% 0px -65% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    )

    anchorSectionIds.forEach((id) => {
      const section = document.getElementById(id)
      if (section) {
        observer.observe(section)
      }
    })

    return () => observer.disconnect()
  }, [])

  const galleryYears = [2025, 2024, 2023, 2022, 2018, 2016, 2012, 2011, 2010]
  const videoYears = [2025, 2024, 2023, 2022, 2019, 2018, 2016, 2015, 2014, 2013, 2012, 2011, 2010]

  const navItems: NavItem[] = [
    { label: dict.nav.about, href: `/${locale}#about`, sectionId: "about" },
    { label: dict.nav.agenda, href: `/${locale}#agenda`, sectionId: "agenda" },
    { label: dict.nav.history, href: `/${locale}#timeline`, sectionId: "timeline" },
    {
      label: dict.nav.whyParticipate,
      href: `/${locale}#why-participate`,
      sectionId: "why-participate",
    },
    { label: dict.nav.press, href: `/${locale}/press` },
    { label: dict.nav.partners, href: `/${locale}#partners`, sectionId: "partners" },
    { label: dict.nav.faq, href: `/${locale}#faq`, sectionId: "faq" },
    { label: dict.nav.mongolia, href: `/${locale}/mongolia` },
    { label: dict.nav.contact, href: `/${locale}#contact`, sectionId: "contact" },
  ]

  const getDesktopLinkClasses = (sectionId?: AnchorSectionId) =>
    cn(
      "text-sm font-medium hover:text-primary transition-colors",
      sectionId === activeSection ? "text-primary font-semibold" : "text-muted-foreground"
    )

  const getDropdownTriggerClasses = (isActive: boolean) =>
    cn(
      "text-sm font-medium hover:text-primary transition-colors inline-flex items-center gap-1",
      isActive ? "text-primary font-semibold" : "text-muted-foreground"
    )

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b transition-colors",
        isScrolled
          ? "bg-white/95 border-border shadow-lg"
          : "bg-white/70 border-transparent shadow-none"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${locale}`} className="flex items-center gap-2" aria-label="Mongolia Economic Forum home">
            <img
              src="/Logo/logo.png"
              alt="Mongolia Economic Forum"
              className="h-10 w-auto"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.slice(0, 4).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={getDesktopLinkClasses(item.sectionId)}
              >
                {item.label}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={getDropdownTriggerClasses(activeSection === "gallery")}>
                  {dict.nav.gallery}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/gallery`}>{locale === "mn" ? "Бүх он" : "All years"}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {galleryYears.map((year) => (
                  <DropdownMenuItem key={year} asChild>
                    <Link href={`/${locale}/gallery/${year}`}>MEF {year}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                  {dict.nav.videos}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/videos`}>{locale === "mn" ? "Бүх бичлэг" : "All videos"}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {videoYears.map((year) => (
                  <DropdownMenuItem key={year} asChild>
                    <Link href={`/${locale}/videos/${year}`}>MEF {year}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {navItems.slice(4).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={getDesktopLinkClasses(item.sectionId)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher currentLocale={locale} />
            <Button asChild className="hidden sm:inline-flex">
              <Link href={`/${locale}#contact`}>{dict.nav.register}</Link>
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
      </div >

      {isOpen && (
        <div className="lg:hidden bg-white border-t border-border">
          <nav className="flex flex-col py-4 px-4">
            {navItems.slice(0, 4).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "py-3 text-foreground hover:text-primary transition-colors",
                  item.sectionId === activeSection && "text-primary font-semibold"
                )}
              >
                {item.label}
              </Link>
            ))}

            <div className="py-2">
              <div
                className={cn(
                  "text-sm font-medium py-2",
                  activeSection === "gallery" ? "text-primary font-semibold" : "text-muted-foreground"
                )}
              >
                {dict.nav.gallery}
              </div>
              <div className="pl-4 flex flex-col">
                <Link
                  href={`/${locale}/gallery`}
                  onClick={() => setIsOpen(false)}
                  className="py-2 text-foreground hover:text-primary transition-colors"
                >
                  {locale === "mn" ? "Бүх он" : "All years"}
                </Link>
                {galleryYears.map((year) => (
                  <Link
                    key={year}
                    href={`/${locale}/gallery/${year}`}
                    onClick={() => setIsOpen(false)}
                    className="py-2 text-foreground hover:text-primary transition-colors"
                  >
                    MEF {year}
                  </Link>
                ))}
              </div>
            </div>

            <div className="py-2">
              <div className="text-sm font-medium text-muted-foreground py-2">{dict.nav.videos}</div>
              <div className="pl-4 flex flex-col">
                <Link
                  href={`/${locale}/videos`}
                  onClick={() => setIsOpen(false)}
                  className="py-2 text-foreground hover:text-primary transition-colors"
                >
                  {locale === "mn" ? "Бүх бичлэг" : "All videos"}
                </Link>
                {videoYears.map((year) => (
                  <Link
                    key={year}
                    href={`/${locale}/videos/${year}`}
                    onClick={() => setIsOpen(false)}
                    className="py-2 text-foreground hover:text-primary transition-colors"
                  >
                    MEF {year}
                  </Link>
                ))}
              </div>
            </div>

            {navItems.slice(4).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "py-3 text-foreground hover:text-primary transition-colors",
                  item.sectionId === activeSection && "text-primary font-semibold"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild className="mt-4">
              <Link href={`/${locale}#contact`}>{dict.nav.register}</Link>
            </Button>
          </nav>
        </div>
      )
      }
    </header >
  )
}
