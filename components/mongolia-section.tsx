"use client"

import { ExternalLink, MapPin, Mountain, Sun, Users, Landmark, TrendingUp, Globe, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

interface MongoliaSectionProps {
  dict: any
  expanded?: boolean
}

const exports = [
  { name: "Coal", percentage: 54.1, color: "from-amber-500 to-amber-600" },
  { name: "Copper ore & concentrate", percentage: 21.0, color: "from-orange-500 to-orange-600" },
  { name: "Gold", percentage: 5.7, color: "from-yellow-400 to-yellow-500" },
  { name: "Iron ore & concentrate", percentage: 3.8, color: "from-red-500 to-red-600" },
  { name: "Other", percentage: 15.4, color: "from-gray-400 to-gray-500" },
]

const tradingPartners = [
  { name: "China", percentage: 40.2, flag: "🇨🇳" },
  { name: "Russia", percentage: 24.3, flag: "🇷🇺" },
  { name: "Japan", percentage: 10.1, flag: "🇯🇵" },
  { name: "United States", percentage: 4.6, flag: "🇺🇸" },
  { name: "South Korea", percentage: 4.2, flag: "🇰🇷" },
  { name: "Germany", percentage: 2.2, flag: "🇩🇪" },
]

const quickFacts = [
  { icon: MapPin, label: "Capital", value: "Ulaanbaatar" },
  { icon: Mountain, label: "Area", value: "1.56M km²" },
  { icon: Users, label: "Population", value: "3.54M" },
  { icon: Sun, label: "Sunny Days", value: "260/year" },
]

const galleryImages = [
  { src: "/mongolia-landscape-with-traditional-ger-and-mounta.jpg", alt: "Traditional Mongolian ger with mountains" },
  { src: "/ulaanbaatar-mongolia-cityscape-panorama-with-moder.jpg", alt: "Ulaanbaatar cityscape" },
]

export function MongoliaSection({ dict, expanded }: MongoliaSectionProps) {
  const [activeImage, setActiveImage] = useState(0)

  const stats = [
    { label: dict.mongolia.gdp, value: "$4,615", icon: TrendingUp, description: "Ranked 127th globally" },
    { label: dict.mongolia.gdpGrowth, value: "4.9%", icon: Landmark, description: "Strong recovery" },
    { label: dict.mongolia.population, value: "3.54M", icon: Users, description: "Youngest in Asia" },
    { label: dict.mongolia.workforce, value: "62.7%", icon: Globe, description: "Growing workforce" },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/mongolia-landscape-with-traditional-ger-and-mounta.jpg"
            alt="Mongolia landscape"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6 border border-white/20">
            {dict.mongolia.label}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            {dict.mongolia.title}
          </h1>
          <p className="text-xl sm:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            {dict.mongolia.description}
          </p>

          {/* Quick Facts */}
          <div className="flex flex-wrap justify-center gap-4 mt-12">
            {quickFacts.map((fact) => (
              <div
                key={fact.label}
                className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 transition-all"
              >
                <fact.icon className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="text-white/60 text-xs">{fact.label}</p>
                  <p className="text-white font-semibold">{fact.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-secondary/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-secondary/50 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
                <stat.icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-3xl lg:text-4xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Geography & Culture */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
                {dict.mongolia.geographyLabel || "Geography & Culture"}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                {dict.mongolia.geographyTitle || "Land of the Eternal Blue Sky"}
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  {dict.mongolia.geographyP1 || "Mongolia is a landlocked country in East Asia, bordered by Russia to the north and China to the south. With an area of 1,564,116 square kilometers, it is the world's 18th-largest country and the most sparsely populated sovereign nation."}
                </p>
                <p>
                  {dict.mongolia.geographyP2 || "Known for its vast steppes, the Gobi Desert, and nomadic culture, Mongolia offers a unique blend of ancient traditions and modern development. The country experiences over 260 sunny days per year, earning its nickname 'The Land of the Eternal Blue Sky.'"}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  href="https://www.mongoliatravel.guide/en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Travel Guide <ExternalLink className="w-4 h-4" />
                </Link>
                <Link
                  href="https://www.gomongolia.gov.mn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
                >
                  Visit Mongolia <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={galleryImages[activeImage].src}
                  alt={galleryImages[activeImage].alt}
                  fill
                  className="object-cover transition-all duration-500"
                />
              </div>
              <div className="flex gap-3 mt-4 justify-center">
                {galleryImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === index ? "border-primary shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img.src} alt={img.alt} width={80} height={56} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Economy Section */}
      <section className="py-20 bg-gradient-to-b from-secondary/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              {dict.mongolia.economyLabel || "Economy"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              {dict.mongolia.economyTitle || "A Growing Economy"}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {dict.mongolia.economyDescription || "Mongolia's economy is driven by mining, agriculture, and an emerging services sector, with strong growth potential."}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Exports Chart */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-secondary/50">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                {dict.mongolia.exports}
              </h3>
              <div className="space-y-5">
                {exports.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-foreground font-medium">{item.name}</span>
                      <span className="text-primary font-semibold">{item.percentage}%</span>
                    </div>
                    <div className="h-4 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trading Partners */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-secondary/50">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                {dict.mongolia.topPartners}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {tradingPartners.map((partner) => (
                  <div
                    key={partner.name}
                    className="flex items-center gap-3 p-4 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors"
                  >
                    <span className="text-2xl">{partner.flag}</span>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{partner.name}</p>
                      <p className="text-sm text-primary font-semibold">{partner.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 bg-foreground text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              MEF Videos
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              {dict.mongolia.videosTitle || "Watch MEF Sessions"}
            </h2>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-black shadow-2xl">
                <iframe
                  title="Mongolia Economic Forum video"
                  src="https://www.youtube.com/embed/videoseries?list=PLF1ZFusRHmEnWxd_bOtxDirgTuGQXXJFL"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {[
                { title: "MEF 2025 \"Стратегийн нөөц ба нийлүүлэлтийн гинжин хэлхээ\"", duration: "2:53:55", url: "https://youtu.be/jUUeA4WLfn8" },
                { title: "MEF 2025 \"ДИЖИТАЛ ЭРИН: Хиймэл оюун ба дэд бүтэц\"", duration: "1:33:18", url: "https://youtu.be/D4JdyhvW2-o" },
                { title: "MEF 2025 \"Тогтвортой хөгжил ба шинэ эдийн засаг\"", duration: "36:56", url: "https://youtu.be/-Ik8zL1suYg" },
                { title: "MEF 2025 \"Урт хугацааны баялгийн удирдлага\"", duration: "1:33:48", url: "https://youtu.be/LmZ0bQu3X0s" },
                { title: "MEF 2025 \"Бизнест ээлтэй Монгол\"", duration: "1:22:47", url: "https://youtu.be/3ReCADY6Bbk" },
                { title: "MEF 2025 \"Хот төлөвлөлт, хотын эдийн засаг\"", duration: "1:24:21", url: "https://youtu.be/9oO8fZYfOJk" },
              ].map((video) => (
                <Link
                  key={video.url}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                    <div className="w-0 h-0 border-l-[8px] border-l-primary border-y-[5px] border-y-transparent ml-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white/90 text-sm truncate">{video.title}</p>
                    <p className="text-xs text-white/50">{video.duration}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {dict.mongolia.ctaTitle || "Discover Mongolia"}
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            {dict.mongolia.ctaDescription || "Experience the beauty, culture, and opportunities of Mongolia firsthand."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="https://www.mongoliatravel.guide/en"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg"
            >
              Plan Your Visit <ExternalLink className="w-5 h-5" />
            </Link>
            <Link
              href="https://www.investmongolia.gov.mn/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20"
            >
              Investment Opportunities <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
