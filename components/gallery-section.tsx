"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

interface GallerySectionProps {
  dict: any
  expanded?: boolean
  locale?: string
}

const galleryYears = [
  {
    year: 2025,
    images: [
      "/Gallery/2025/516240243_1089178199942479_5869937902651617405_n.jpg",
      "/Gallery/2025/516433285_1089178179942481_715227763267332783_n.jpg",
      "/Gallery/2025/516437725_1088969326630033_5963285892912779978_n.jpg",
      "/Gallery/2025/516454690_1088344493359183_7195071777167754141_n.jpg",
      "/Gallery/2025/516506138_1089160579944241_1756502182033702612_n.jpg",
      "/Gallery/2025/516533143_1088373273356305_3439496106374338652_n.jpg",
      "/Gallery/2025/516554481_1089298413263791_2107431621297428321_n.jpg",
      "/Gallery/2025/516607549_1088473140012985_3775240215583109297_n.jpg",
      "/Gallery/2025/516610032_1088344693359163_2726995658581648180_n.jpg",
      "/Gallery/2025/516649170_1089178216609144_7329188431966213307_n.jpg",
      "/Gallery/2025/516656549_1088348093358823_6026292828288458456_n.jpg",
      "/Gallery/2025/516677100_1088405736686392_1879191643413374670_n.jpg",
      "/Gallery/2025/516689766_1088348300025469_807207762489812156_n.jpg",
      "/Gallery/2025/516699925_1088348636692102_9196299737459657330_n.jpg",
      "/Gallery/2025/516699926_1088369193356713_67095172150373674_n.jpg",
      "/Gallery/2025/516716642_1088419130018386_4064332517420800983_n.jpg",
      "/Gallery/2025/516737809_1088419630018336_841021028069528790_n.jpg",
      "/Gallery/2025/516765867_1088187973374835_6090138725039650857_n.jpg",
      "/Gallery/2025/516768266_1088369233356709_8941637228050120139_n.jpg",
      "/Gallery/2025/516768312_1089059513287681_425191266559246867_n.jpg",
    ],
  },
  {
    year: 2024,
    images: [
      "/Gallery/2024/phpUNu3ul-1723361660.jpg",
      "/Gallery/2024/phpZTBmli-1723361799.jpg",
      "/Gallery/2024/phpJYXYLi-1723361916.jpg",
      "/Gallery/2024/php13revU-1723362323.jpg",
      "/Gallery/2024/php20pGFT-1723362364.jpg",
      "/Gallery/2024/php4vpJLS-1723362607.jpg",
      "/Gallery/2024/php4zjvKU-1723362582.jpg",
      "/Gallery/2024/phpAxTwlU-1723362661.jpg",
      "/Gallery/2024/phpDf4UZV-1723362549.jpg",
      "/Gallery/2024/phpFWXzcW-1723362219.jpg",
      "/Gallery/2024/phpJtJnHE-1723362187.jpg",
      "/Gallery/2024/phpLbTRyV-1723362296.jpg",
      "/Gallery/2024/phpRwJPRH-1723362089.jpg",
      "/Gallery/2024/phpTCNCYU-1723362716.jpg",
      "/Gallery/2024/phpW8JEPV-1723362437.jpg",
      "/Gallery/2024/phpYBScjl-1723362046.jpg",
      "/Gallery/2024/phpZVYGzi-1723361882.jpg",
      "/Gallery/2024/phpfBa7lV-1723362689.jpg",
      "/Gallery/2024/phpi3ZHAG-1723362141.jpg",
      "/Gallery/2024/phpkndEii-1723361714.jpg",
      "/Gallery/2024/phpmvyb1h-1723361854.jpg",
      "/Gallery/2024/phpownFYS-1723362470.jpg",
    ],
  },
  {
    year: 2023,
    images: [
      "/Gallery/2023/phpD7GrWW-1703233863.jpg",
      "/Gallery/2023/phpGl8D9n-1703233875.jpg",
      "/Gallery/2023/phpOITDBb-1703233926.jpg",
      "/Gallery/2023/php1N7EdD-1718776196.jpg",
      "/Gallery/2023/php5IGBgY-1718776324.jpg",
      "/Gallery/2023/php7B9AdK-1718776214.jpg",
      "/Gallery/2023/php9NZryk-1718776140.jpg",
      "/Gallery/2023/phpBGg7OQ-1718776173.jpg",
      "/Gallery/2023/phpBv2LVy-1718776186.jpg",
      "/Gallery/2023/phpDpo8Ym-1718776308.jpg",
      "/Gallery/2023/phpHxxHfq-1718776087.jpg",
      "/Gallery/2023/phpJR7xal-1718776290.jpg",
      "/Gallery/2023/phpLQFAeT-1718777984.jpg",
      "/Gallery/2023/phpLwBfNA-1718776160.jpg",
      "/Gallery/2023/phpNSvhSA-1718776117 (1).jpg",
      "/Gallery/2023/phpNSvhSA-1718776117.jpg",
      "/Gallery/2023/phpQlotLl-1703233903.jpg",
      "/Gallery/2023/phpR1WJ85-1703233895.jpg",
      "/Gallery/2023/phpT46Awe-1718776127.jpg",
      "/Gallery/2023/phpTILjWa-1718776233.jpg",
    ],
  },
  {
    year: 2022,
    images: [
      "/Gallery/2022/phpdMgqvC-1703487647.jpg",
      "/Gallery/2022/php02xh0N-1703487653.jpg",
      "/Gallery/2022/phpLN5OrK-1703487679.jpg",
      "/Gallery/2022/phpTGrDe5-1703487689.jpg",
      "/Gallery/2022/phpVUMYY0-1703487659.jpg",
      "/Gallery/2022/phpnH1Ave-1703487665.jpg",
      "/Gallery/2022/phpsJmydF-1703487705.jpg",
      "/Gallery/2022/phpvhjwSp-1703487698.jpg",
    ],
  },
  {
    year: 2018,
    images: [
      "/Gallery/2018/phpCePUwy-1718771911.jpg",
      "/Gallery/2018/phpCv5aFd-1718771931.jpg",
      "/Gallery/2018/phpJYREJJ-1718771948.jpg",
      "/Gallery/2018/php14HaMQ-1718771981.jpg",
      "/Gallery/2018/php17HU0n-1718772026.jpg",
      "/Gallery/2018/php1SoX4i-1703488036.jpg",
      "/Gallery/2018/php6xaD8V-1718775807.jpg",
      "/Gallery/2018/php8paQyj-1718772002.jpg",
      "/Gallery/2018/php9RTuHr-1718775952.jpg",
      "/Gallery/2018/phpBzZ0lJ-1718775819.jpg",
      "/Gallery/2018/phpFw91zX-1718775920.jpg",
      "/Gallery/2018/phpJCbonT-1718775986.jpg",
      "/Gallery/2018/phpKmYnA7-1718772016.jpg",
      "/Gallery/2018/phpLODCek-1718775869.jpg",
      "/Gallery/2018/phpP7MBDb-1718776015.jpg",
      "/Gallery/2018/phpPrwgry-1718775793.jpg",
      "/Gallery/2018/phpQ1dNBW-1718775938.jpg",
      "/Gallery/2018/phpQT5tfF-1718775766.jpg",
      "/Gallery/2018/phpRuDYqG-1718775894.jpg",
      "/Gallery/2018/phpTztxpD-1718775844.jpg",
      "/Gallery/2018/phpWQ57UL-1718775857.jpg",
    ],
  },
  {
    year: 2016,
    images: [
      "/Gallery/2016/phpliKtoL-1703233460.jpeg",
      "/Gallery/2016/php9GdO81-1703233468.jpeg",
      "/Gallery/2016/phpAcRX7B-1703233484.jpeg",
      "/Gallery/2016/php3B32bl-1703233533.jpeg",
      "/Gallery/2016/php4UeQ0O-1703233518.jpeg",
      "/Gallery/2016/phpCdTwMV-1703233550.jpeg",
      "/Gallery/2016/phpLqCW3f-1703233559.jpeg",
      "/Gallery/2016/phpM9uS5h-1703233475.jpeg",
      "/Gallery/2016/phpNDs1ia-1703233500.jpeg",
      "/Gallery/2016/phphKtyAR-1703233491.jpeg",
      "/Gallery/2016/phpktH8Hx-1703233511.jpeg",
    ],
  },
  {
    year: 2012,
    images: [
      "/Gallery/2012/phpD3ipkU-1703235594.jpeg",
      "/Gallery/2012/phpIYHRJX-1703235624.jpeg",
      "/Gallery/2012/phpKbPFJt-1703235639.jpeg",
      "/Gallery/2012/phpEf0YLu-1703235696.jpeg",
      "/Gallery/2012/phphLojzf-1703235632.jpeg",
      "/Gallery/2012/phphiNkwl-1703235607.jpeg",
      "/Gallery/2012/phpNx7ZiQ-1703235706.jpeg",
      "/Gallery/2012/phpjZhNR7-1703235714.jpeg",
      "/Gallery/2012/phprknQOI-1703235674.jpeg",
      "/Gallery/2012/phpt9riB9-1703235686.jpeg",
    ],
  },
  {
    year: 2011,
    images: [
      "/Gallery/2011/phpJCWq63-1703233213.jpeg",
      "/Gallery/2011/php1wT0de-1703235802.jpeg",
      "/Gallery/2011/phpOSUZQx-1703235811.jpeg",
      "/Gallery/2011/php5ccmYQ-1703235820.jpeg",
      "/Gallery/2011/phpSnp9DW-1703235794.jpeg",
      "/Gallery/2011/phpaoSId6-1703235827.jpeg",
      "/Gallery/2011/phppFGvkF-1703235843.jpeg",
      "/Gallery/2011/phpqxjlMT-1703235849.jpeg",
      "/Gallery/2011/phpvZcowl-1703235834.jpeg",
    ],
  },
  {
    year: 2010,
    images: [
      "/Gallery/2010/phpV2R3y6-1703235742.jpeg",
      "/Gallery/2010/php05DDdY-1703235766.jpeg",
      "/Gallery/2010/phpeAeQ9n-1703235750.jpeg",
      "/Gallery/2010/phpzrG86H-1703235759.jpeg",
    ],
  },
]

function GalleryCard({
  year,
  images,
  locale,
}: {
  year: number
  images: string[]
  locale: string
}) {
  const safeImages = images.length > 0 ? images : ["/Gallery/2025/516240243_1089178199942479_5869937902651617405_n.jpg"]
  const [activeIndex, setActiveIndex] = useState(0)
  const intervalRef = useRef<number | null>(null)
  const preloadedRef = useRef<Set<string>>(new Set())

  const preload = (src: string) => {
    if (preloadedRef.current.has(src)) return
    const img = new Image()
    img.src = src
    preloadedRef.current.add(src)
  }

  const warmUp = () => {
    const limit = Math.min(6, safeImages.length)
    for (let i = 0; i < limit; i++) preload(safeImages[i])
  }

  const start = () => {
    if (safeImages.length < 2) return
    if (intervalRef.current !== null) return

    warmUp()

    intervalRef.current = window.setInterval(() => {
      setActiveIndex((i) => {
        const next = (i + 1) % safeImages.length
        preload(safeImages[next])
        return next
      })
    }, 900)
  }

  const stop = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setActiveIndex(0)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <Link
      href={`/${locale}/gallery/${year}`}
      onMouseEnter={start}
      onMouseLeave={stop}
      className="group relative overflow-hidden rounded-2xl aspect-[3/2]"
      aria-label={`MEF ${year} Gallery`}
    >
      <img
        src={safeImages[activeIndex]}
        alt={`MEF ${year} Gallery`}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <span className="text-white font-bold text-2xl">MEF {year}</span>
      </div>
    </Link>
  )
}

export function GallerySection({ dict, expanded, locale = "en" }: GallerySectionProps) {
  return (
    <section id="gallery" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            {dict.gallery.label}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6">{dict.gallery.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {dict.gallery.description}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryYears.map((item) => (
            <GalleryCard key={item.year} year={item.year} images={item.images} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  )
}
