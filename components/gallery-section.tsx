import Link from "next/link"
import { ExternalLink } from "lucide-react"

interface GallerySectionProps {
  dict: any
  expanded?: boolean
}

const galleryYears = [
  { year: 2024, image: "/3,4.jpg" },
  { year: 2023, image: "/5,6.jpg" },
  { year: 2022, image: "/1,2 .jpg" },
  { year: 2018, image: "/3,4.jpg" },
  { year: 2016, image: "/5,6.jpg" },
  { year: 2012, image: "/1,2 .jpg" },
]

const playlistEmbedUrl = "https://www.youtube.com/embed/videoseries?list=PLF1ZFusRHmEnWxd_bOtxDirgTuGQXXJFL" // 2025 playlist embed

const videos2025 = [
  {
    title: "MEF 2025 \"Стратегийн нөөц ба нийлүүлэлтийн гинжин хэлхээ\"",
    duration: "2:53:55",
    url: "https://youtu.be/jUUeA4WLfn8",
  },
  {
    title: "MEF 2025 \"ДИЖИТАЛ ЭРИН: Хиймэл оюун ба дэд бүтэц\"",
    duration: "1:33:18",
    url: "https://youtu.be/D4JdyhvW2-o",
  },
  {
    title: "MEF 2025 \"Тогтвортой хөгжил ба шинэ эдийн засаг (COP17)\"",
    duration: "36:56",
    url: "https://youtu.be/-Ik8zL1suYg",
  },
  {
    title: "MEF 2025 \"Урт хугацааны баялгийн удирдлага\"",
    duration: "1:33:48",
    url: "https://youtu.be/LmZ0bQu3X0s",
  },
  {
    title: "MEF 2025 \"Бизнест ээлтэй Монгол\"",
    duration: "1:22:47",
    url: "https://youtu.be/3ReCADY6Bbk",
  },
  {
    title: "MEF 2025 \"Хот төлөвлөлт, хотын эдийн засаг\"",
    duration: "1:24:21",
    url: "https://youtu.be/9oO8fZYfOJk",
  },
  {
    title: "MEF 2025 \"Хөрөнгө оруулагчдын итгэлийг даах нь\"",
    duration: "49:09",
    url: "https://youtu.be/tmDMLRM-vSA",
  },
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

        <div className="mt-12 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">Videos 2025</p>
              <p className="text-xl font-bold text-foreground">MEF 2025 Playlist</p>
              <p className="text-sm text-muted-foreground">Watch all seven sessions on this page or open on YouTube.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="https://youtube.com/playlist?list=PLF1ZFusRHmEnWxd_bOtxDirgTuGQXXJFL"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 text-primary font-semibold hover:border-primary/60 hover:text-primary/80 transition-colors"
              >
                Open playlist
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden bg-white border border-secondary/60 shadow-sm">
            <div className="aspect-video bg-black">
              <iframe
                title="MEF 2025 playlist"
                src={playlistEmbedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="p-4 border-t border-secondary/40 text-sm text-muted-foreground">
              Tip: Play inline here, or open individual sessions below.
            </div>
          </div>

          <div className="grid gap-6">
            {videos2025.map((video) => {
              const embedUrl = video.url.replace("https://youtu.be/", "https://www.youtube.com/embed/")
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
                    <span className="text-xs font-semibold text-primary/90 bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">
                      {video.duration}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-2 pt-4 border-t border-secondary/40">
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
      </div>
    </section>
  )
}
