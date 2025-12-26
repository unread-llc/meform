import Link from "next/link"

interface GallerySectionProps {
  dict: any
  expanded?: boolean
}

const galleryYears = [
  { year: 2025, image: "/Gallery/2025/516240243_1089178199942479_5869937902651617405_n.jpg" },
  { year: 2024, image: "/Gallery/2024/phpUNu3ul-1723361660.jpg" },
  { year: 2023, image: "/Gallery/2023/phpD7GrWW-1703233863.jpg" },
  { year: 2022, image: "/Gallery/2022/phpdMgqvC-1703487647.jpg" },
  { year: 2018, image: "/Gallery/2018/phpCePUwy-1718771911.jpg" },
  { year: 2016, image: "/Gallery/2016/phpliKtoL-1703233460.jpeg" },
  { year: 2012, image: "/Gallery/2012/phpD3ipkU-1703235594.jpeg" },
  { year: 2011, image: "/Gallery/2011/phpJCWq63-1703233213.jpeg" },
  { year: 2010, image: "/Gallery/2010/phpV2R3y6-1703235742.jpeg" },
]

export function GallerySection({ dict, expanded }: GallerySectionProps) {
  return (
    <section id="gallery" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            {dict.gallery.label}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">{dict.gallery.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {dict.gallery.description}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryYears.map((item) => (
            <Link
              key={item.year}
              href={`/gallery/${item.year}`}
              className="group relative overflow-hidden rounded-2xl aspect-[3/2]"
            >
              <img
                src={item.image}
                alt={`MEF ${item.year} Gallery`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-white font-bold text-2xl">MEF {item.year}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
