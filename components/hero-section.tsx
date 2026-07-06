"use client"

import { useEffect, useState } from "react"
import type { Locale } from "@/lib/i18n"

interface CountdownTimerProps {
  dict: any
}

function CountdownTimer({ dict }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    // MEF 2027 — July 3, 2027
    const targetDate = new Date("2027-07-03T09:00:00")

    const interval = setInterval(() => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex gap-4 justify-center">
      {[
        { value: timeLeft.days, label: dict.hero.days },
        { value: timeLeft.hours, label: dict.hero.hours },
        { value: timeLeft.minutes, label: dict.hero.minutes },
        { value: timeLeft.seconds, label: dict.hero.seconds },
      ].map((item) => (
        <div key={item.label} className="text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 min-w-[60px] sm:min-w-[80px]">
            <span className="text-2xl sm:text-4xl font-bold text-white">{String(item.value).padStart(2, "0")}</span>
          </div>
          <span className="text-xs sm:text-sm text-white/80 mt-2 block">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

interface HeroSectionProps {
  dict: any
  locale: Locale
}

// Use fresh 2025 hero visual from downloaded gallery assets
// const heroBackground = "/Gallery/Menu%20option%202.jpg"
const heroBackground = "/Menu.jpg"

export function HeroSection({ dict, locale }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 sm:pt-40">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${heroBackground}')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d6efd]/90 via-[#0d6efd]/80 to-[#0a58ca]/90" />

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 text-balance">
          {dict.hero.title}
        </h1>

        <div className="mb-10">
          <p className="text-white/80 text-sm sm:text-base mb-4 uppercase tracking-wider font-semibold">
            {dict.hero.countdown}
          </p>
          <CountdownTimer dict={dict} />
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
