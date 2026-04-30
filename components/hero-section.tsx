"use client"

import { Users } from "lucide-react"
import Image from "next/image"
import type { Locale } from "@/lib/i18n"

interface HeroSectionProps {
  dict: any
  locale: Locale
}

// Use fresh 2025 hero visual from downloaded gallery assets
// const heroBackground = "/Gallery/Menu%20option%202.jpg"
const heroBackground = "/Menu.jpg"

export function HeroSection({ dict, locale }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${heroBackground}')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d6efd]/90 via-[#0d6efd]/80 to-[#0a58ca]/90" />

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 text-balance">
          {dict.hero.title}
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl text-white/90 font-light mb-2">{dict.hero.titleMn}</p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-white/80 text-sm mb-8">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{dict.hero.participants}</span>
          </div>
          <div className="uppercase tracking-wider text-xs font-semibold text-white/80">
            {dict.hero.date} · {dict.hero.time}
          </div>
        </div>

        <div className="mb-10 flex justify-center">
          <Image
            src={locale === "mn" ? "/notice_mn.jpg" : "/notice_eng.jpg"}
            alt="Event cancellation notice"
            width={900}
            height={1200}
            priority
            className="rounded-lg shadow-2xl max-w-full h-auto w-full sm:w-[600px]"
          />
        </div>
      </div>

      {/* <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/80 rounded-full" />
        </div>
      </div> */}
    </section>
  )
}
