import Link from "next/link"
import { ExternalLink } from "lucide-react"

interface GallerySectionProps {
  dict: any
  expanded?: boolean
}

const galleryYears = [
  { year: 2024, image: "/mongolia-economic-forum-2024-conference-hall-with-.jpg" },
  { year: 2023, image: "/mongolia-economic-forum-2023-networking-event.jpg" },
  { year: 2022, image: "/mongolia-economic-forum-2022-panel-discussion.jpg" },
  { year: 2018, image: "/mongolia-economic-forum-2018-keynote-speaker.jpg" },
  { year: 2016, image: "/mongolia-economic-forum-2016-delegates-meeting.jpg" },
  { year: 2012, image: "/mongolia-economic-forum-2012-opening-ceremony.jpg" },
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
              href={`https://www.meforum.mn/pictures/${item.year}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl aspect-[3/2]"
            >
              <img
                src={item.image || "/placeholder.svg"}
                alt={`MEF ${item.year} Gallery`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold text-2xl">MEF {item.year}</span>
                  <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="https://www.meforum.mn/videos/2024"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            {dict.gallery.viewVideos}
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
