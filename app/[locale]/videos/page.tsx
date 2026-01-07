import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/lib/i18n"
import { fetchLegacyVideosByYear, LEGACY_VIDEO_YEARS } from "@/lib/meforum-videos"
import Link from "next/link"
import { Play } from "lucide-react"

const fallbackVideoYears = [
  { year: 2025, videoCount: 7 },
  { year: 2024, videoCount: 3 },
  { year: 2023, videoCount: 10 },
  { year: 2022, videoCount: 1 },
  { year: 2019, videoCount: 1 },
  { year: 2018, videoCount: 4 },
  { year: 2016, videoCount: 2 },
  { year: 2015, videoCount: 9 },
  { year: 2014, videoCount: 5 },
  { year: 2013, videoCount: 7 },
  { year: 2012, videoCount: 5 },
  { year: 2011, videoCount: 4 },
  { year: 2010, videoCount: 4 },
]

export default async function VideosPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  const fallbackCountByYear = new Map(fallbackVideoYears.map((x) => [x.year, x.videoCount]))

  const legacyCounts = await Promise.all(
    LEGACY_VIDEO_YEARS.map(async (year) => {
      try {
        const videos = await fetchLegacyVideosByYear(year)
        return { year: Number(year), videoCount: videos.length }
      } catch {
        return { year: Number(year), videoCount: fallbackCountByYear.get(Number(year)) ?? 0 }
      }
    })
  )

  const videoYears = [{ year: 2025, videoCount: fallbackCountByYear.get(2025) ?? 0 }, ...legacyCounts].sort(
    (a, b) => b.year - a.year
  )

  return (
    <main className="min-h-screen">
      <Header locale={locale} dict={dict} />
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              Videos
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {locale === "mn" ? "Бичлэгүүд" : "Video Archive"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {locale === "mn"
                ? "Монголын Эдийн Засгийн Чуулганы бичлэгүүд"
                : "Mongolia Economic Forum video recordings"}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoYears.map((item) => (
              <Link
                key={item.year}
                href={`/${locale}/videos/${item.year}`}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-8 hover:border-primary/40 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Play className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">MEF {item.year}</h3>
                <p className="text-muted-foreground">
                  {item.videoCount} {locale === "mn" ? "бичлэг" : "videos"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer dict={dict} locale={locale} />
    </main>
  )
}
