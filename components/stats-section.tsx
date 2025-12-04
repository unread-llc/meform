"use client"

import { useEffect, useState, useRef } from "react"
import { Users, Building, Globe, GraduationCap } from "lucide-react"

interface StatsSectionProps {
  dict: any
}

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [current, setCurrent] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCurrent(value)
        clearInterval(timer)
      } else {
        setCurrent(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible, value])

  return (
    <div ref={ref} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
      {current.toLocaleString()}
      {suffix}
    </div>
  )
}

export function StatsSection({ dict }: StatsSectionProps) {
  const stats = [
    { icon: Users, value: 500, suffix: "+", label: dict.stats.government },
    { icon: Building, value: 900, suffix: "+", label: dict.stats.privateSector },
    { icon: Globe, value: 700, suffix: "+", label: dict.stats.international },
    { icon: GraduationCap, value: 2000, suffix: "+", label: dict.stats.youth },
  ]

  return (
    <section className="py-20 bg-[#0d6efd] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              <p className="text-white font-medium mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
