import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/lib/i18n"
import { fetchLegacyVideosByYear, LEGACY_VIDEO_YEARS, youtubeIdToEmbedUrl, youtubeIdToUrl } from "@/lib/meforum-videos"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"

interface Video {
  title: string
  url: string
  duration?: string
}

const videosByYear: Record<string, Video[]> = {
  "2010": [
    { title: "Mongolia Economic Forum 2010, Part 1", url: "https://youtu.be/aDKamW2S_2g" },
    { title: "Mongolia Economic Forum 2010, Part 2", url: "https://youtu.be/IDQXOc-Wf1w" },
    { title: "Mongolia Economic Forum 2010, Part 3", url: "https://youtu.be/s5rMA5BO56o" },
    { title: "Mongolia Economic Forum 2010, Part 4", url: "https://youtu.be/1d2XtooCk8c" },
  ],
  "2011": [
    { title: "Mongolia Economic Forum 2011, Part 1", url: "https://youtu.be/fo8ypWuStAY" },
    { title: "Mongolia Economic Forum 2011, Part 2", url: "https://youtu.be/TB4lwrRkROw" },
    { title: "Mongolia Economic Forum 2011, Part 3", url: "https://youtu.be/bed4QZ0wGMk" },
    { title: "Mongolia Economic Forum 2011, Part 4", url: "https://youtu.be/B1-YV4LafK8" },
  ],
  "2012": [
    { title: "Mongolia Economic Forum 2012 MNB Interview Part 1", url: "https://youtu.be/7X9goLoVuik" },
    { title: "Mongolia Economic Forum 2012 MNB Interview Part 2", url: "https://youtu.be/VisX0zTZ1Ls" },
    { title: "Mongolia Economic Forum 2012 MNB Interview Part 3-1", url: "https://youtu.be/rCElKM-19YU" },
    { title: "Mongolia Economic Forum 2012 MNB Interview Part 3-2", url: "https://youtu.be/ioYv5h5sL98" },
    { title: "Mongolia Economic Forum 2012 MNB Interview Part 3-3", url: "https://youtu.be/Vg3-PYCBfLc" },
  ],
  "2013": [
    { title: "МЭЗЧ 2013 - Хөгжлийн санхүүжилт", url: "https://youtu.be/8eglY2NtQkA" },
    { title: "Mongolia Economic Forum 2013, Part 1", url: "https://youtu.be/TSpsnVA-_tk" },
    { title: "Mongolia Economic Forum 2013, Part 2", url: "https://youtu.be/mz-D9ZawDXc" },
    { title: "Mongolia Economic Forum 2013, Part 3", url: "https://youtu.be/Sd8bEhjhYyY" },
    { title: "Mongolia Economic Forum 2013, Part 4", url: "https://youtu.be/pbysUjJAHqw" },
    { title: "Mongolia Economic Forum 2013, Part 5", url: "https://youtu.be/H9XLHYu2AS4" },
    { title: "Mongolia Economic Forum 2013, Part 6", url: "https://youtu.be/_dZ3H60SlXE" },
  ],
  "2014": [
    { title: "Top five risks of 2014", url: "https://youtu.be/E6lkTTpHuwY" },
    { title: "Top five risks of 2014, Part 2", url: "https://youtu.be/DrxLu4_ZcKI" },
    { title: "Green economy session", url: "https://youtu.be/GFiqGg9iMS0" },
    { title: "Judiciary reform and business", url: "https://youtu.be/De9TRHEfwqA" },
    { title: "Mining Legal Environment and Wealth Creators", url: "https://youtu.be/a7J3bbseUxY" },
  ],
  "2015": [
    { title: "Төрийн хяналт шалгалт, түүний эдийн засагт үзүүлэх нөлөө", url: "https://youtu.be/OWZnfTRvmxs" },
    { title: "Macroeconomic Current Affairs 2015", url: "https://youtu.be/vYn1pQLgTKE" },
    { title: "Where will the mining go?", url: "https://youtu.be/SLfgr27EMTQ" },
    { title: "Investment environment and ways to improve", url: "https://youtu.be/_KR50HBmFs0" },
    { title: "Institutional governance and cooperation", url: "https://youtu.be/Wnlk3qwYhTM" },
    { title: "Development strategy of Ulaanbaatar city", url: "https://youtu.be/hhp-QoHMm0s" },
    { title: "Legal stability, clarity and business", url: "https://youtu.be/8TA1VykfMA8" },
    { title: "Development of Mongolia's tourism industry", url: "https://youtu.be/V_TmKIUXlgM" },
    { title: "Pension and health care systems", url: "https://youtu.be/iieaqiUOkyY" },
  ],
  "2016": [
    { title: "Mongol dream", url: "https://youtu.be/sn5kykGWdsg" },
    { title: "Business environment", url: "https://youtu.be/lHGjswBWttQ" },
  ],
  "2018": [
    { title: "Mongolia Economic Forum 2018, Part 1", url: "https://youtu.be/sEHdwGAsx2M" },
    { title: "Mongolia Economic Forum 2018, Part 2", url: "https://youtu.be/EOqeYVj_2FU" },
    { title: "Mongolia Economic Forum 2018, Part 3", url: "https://youtu.be/FN0dkTKir7Q" },
    { title: "Mongolia Economic Forum 2018", url: "https://youtu.be/2gBuzNXAHD4" },
  ],
  "2019": [
    { title: "Mongolia Economic Forum 2019", url: "https://youtu.be/rQYxCGArumI" },
  ],
  "2022": [
    { title: "Mongolian Economic Forum 2022", url: "https://youtu.be/bISJCWGHjOI" },
  ],
  "2023": [
    { title: "Mongolia Economic Forum 2023 | Special Discussion", url: "https://youtu.be/seEdUCKiRhc" },
    { title: "MEF 2023 | Sub-session #1", url: "https://youtu.be/cJZCO7VYFoE" },
    { title: "MEF 2023 | Sub-session #2", url: "https://youtu.be/7QBXmHVnbQQ" },
    { title: "MEF 2023 | Interview", url: "https://youtu.be/WcQcqPTmalI" },
    { title: "Mongolia Economic Forum 2023, Day 1", url: "https://youtu.be/FrzGwRpDHdc" },
    { title: "Mongolia Economic Forum 2023, Day 2", url: "https://youtu.be/BbwLxwcvNj0" },
    { title: "MEF 2023 | Sub-session #3", url: "https://youtu.be/OUt9CYyRSPg" },
    { title: "MEF 2023 | Sub-session #4", url: "https://youtu.be/g7uOtetQglI" },
    { title: "MEF 2023 | Sub-session #5", url: "https://youtu.be/mgiZiFI1zQA" },
    { title: "MEF 2023 | Sub-session #6", url: "https://youtu.be/HLxS154K74w" },
  ],
  "2024": [
    { title: "Mongolia Economic Forum Youth 2024", url: "https://youtu.be/TEFnfK87Zkk" },
    { title: "Mongolia Economic Forum 2024, Day 1", url: "https://youtu.be/Q3NWOz_bDoI" },
    { title: "Mongolia Economic Forum 2024, Day 2", url: "https://youtu.be/O1W7q3NWRaY" },
  ],
  "2025": [
    { title: "MEF 2025 \"Стратегийн нөөц ба нийлүүлэлтийн гинжин хэлхээ\"", url: "https://youtu.be/jUUeA4WLfn8", duration: "2:53:55" },
    { title: "MEF 2025 \"ДИЖИТАЛ ЭРИН: Хиймэл оюун ба дэд бүтэц\"", url: "https://youtu.be/D4JdyhvW2-o", duration: "1:33:18" },
    { title: "MEF 2025 \"Тогтвортой хөгжил ба шинэ эдийн засаг (COP17)\"", url: "https://youtu.be/-Ik8zL1suYg", duration: "36:56" },
    { title: "MEF 2025 \"Урт хугацааны баялгийн удирдлага\"", url: "https://youtu.be/LmZ0bQu3X0s", duration: "1:33:48" },
    { title: "MEF 2025 \"Бизнест ээлтэй Монгол\"", url: "https://youtu.be/3ReCADY6Bbk", duration: "1:22:47" },
    { title: "MEF 2025 \"Хот төлөвлөлт, хотын эдийн засаг\"", url: "https://youtu.be/9oO8fZYfOJk", duration: "1:24:21" },
    { title: "MEF 2025 \"Хөрөнгө оруулагчдын итгэлийг даах нь\"", url: "https://youtu.be/tmDMLRM-vSA", duration: "49:09" },
  ],
}

const validYears = ["2010", "2011", "2012", "2013", "2014", "2015", "2016", "2018", "2019", "2022", "2023", "2024", "2025"]

export default async function VideosYearPage({
  params,
}: {
  params: Promise<{ locale: Locale; year: string }>
}) {
  const { locale, year } = await params
  const dict = await getDictionary(locale)

  if (!validYears.includes(year)) {
    notFound()
  }

  const videos = await (async () => {
    // Keep 2025 as the curated list currently used on the site.
    if (year === "2025") return videosByYear[year] || []

    if (LEGACY_VIDEO_YEARS.includes(year as (typeof LEGACY_VIDEO_YEARS)[number])) {
      try {
        const legacy = await fetchLegacyVideosByYear(year)
        if (legacy.length > 0) {
          return legacy.map((v) => ({ title: v.title, url: youtubeIdToUrl(v.youtubeId) }))
        }
      } catch {
        // fall back below
      }
    }

    return videosByYear[year] || []
  })()

  return (
    <main className="min-h-screen">
      <Header locale={locale} dict={dict} />
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href={`/${locale}/videos`}
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {locale === "mn" ? "Буцах" : "Back to Videos"}
            </Link>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              MEF {year} {locale === "mn" ? "Бичлэгүүд" : "Videos"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {videos.length} {locale === "mn" ? "бичлэг" : "videos"}
            </p>
          </div>

          <div className="space-y-6">
            {videos.map((video) => {
              const idMatch = /youtu\.be\/([^?&/]+)/.exec(video.url)
              const youtubeId = idMatch?.[1]
              const embedUrl = youtubeId ? youtubeIdToEmbedUrl(youtubeId) : video.url
              return (
                <div
                  key={video.url}
                  className="rounded-2xl border border-secondary/60 bg-white shadow-sm overflow-hidden"
                >
                  <div className="aspect-video bg-black">
                    <iframe
                      title={video.title}
                      src={embedUrl}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground leading-snug line-clamp-2">{video.title}</p>
                      <p className="text-xs text-muted-foreground">YouTube • TenGer TV</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {video.duration && (
                        <span className="text-xs font-semibold text-primary/90 bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">
                          {video.duration}
                        </span>
                      )}
                      <Link
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {year === "2025" && (
            <div className="mt-8 text-center">
              <Link
                href="https://youtube.com/playlist?list=PLF1ZFusRHmEnWxd_bOtxDirgTuGQXXJFL"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                {locale === "mn" ? "YouTube дээр бүгдийг үзэх" : "Watch all on YouTube"}
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer dict={dict} locale={locale} />
    </main>
  )
}
