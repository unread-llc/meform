import { ExternalLink } from "lucide-react"
import Link from "next/link"

interface MongoliaSectionProps {
  dict: any
  expanded?: boolean
}

const exports = [
  { name: "Coal", percentage: 54.1 },
  { name: "Copper ore & concentrate", percentage: 21.0 },
  { name: "Gold", percentage: 5.7 },
  { name: "Iron ore & concentrate", percentage: 3.8 },
  { name: "Other", percentage: 15.4 },
]

const videoEmbedUrl = "https://www.youtube.com/embed/videoseries?list=PLF1ZFusRHmEnWxd_bOtxDirgTuGQXXJFL" // Replace with final playlist/video URL
const videoPoster = "/3,4.jpg"

const videoPlaylist = [
  { title: "MEF 2025 \"Стратегийн нөөц ба нийлүүлэлтийн гинжин хэлхээ\"", duration: "2:53:55", url: "https://youtu.be/jUUeA4WLfn8" },
  { title: "MEF 2025 \"ДИЖИТАЛ ЭРИН: Хиймэл оюун ба дэд бүтэц\"", duration: "1:33:18", url: "https://youtu.be/D4JdyhvW2-o" },
  { title: "MEF 2025 \"Тогтвортой хөгжил ба шинэ эдийн засаг (COP17)\"", duration: "36:56", url: "https://youtu.be/-Ik8zL1suYg" },
  { title: "MEF 2025 \"Урт хугацааны баялгийн удирдлага\"", duration: "1:33:48", url: "https://youtu.be/LmZ0bQu3X0s" },
  { title: "MEF 2025 \"Бизнест ээлтэй Монгол\"", duration: "1:22:47", url: "https://youtu.be/3ReCADY6Bbk" },
  { title: "MEF 2025 \"Хот төлөвлөлт, хотын эдийн засаг\"", duration: "1:24:21", url: "https://youtu.be/9oO8fZYfOJk" },
  { title: "MEF 2025 \"Хөрөнгө оруулагчдын итгэлийг даах нь\"", duration: "49:09", url: "https://youtu.be/tmDMLRM-vSA" },
]

export function MongoliaSection({ dict, expanded }: MongoliaSectionProps) {
  const stats = [
    { label: dict.mongolia.gdp, value: "$4,615", year: "2024" },
    { label: dict.mongolia.gdpGrowth, value: "4.9%", year: "2024" },
    { label: dict.mongolia.population, value: "3.54M", year: "2024" },
    { label: dict.mongolia.workforce, value: "62.7%", year: "2025" },
  ]

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-secondary/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            {dict.mongolia.label}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">{dict.mongolia.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {dict.mongolia.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="relative rounded-2xl overflow-hidden aspect-video mb-6 bg-black">
              <div className="absolute inset-0">
                <img src={videoPoster} alt="Mongolia landscape" className="w-full h-full object-cover opacity-30" />
              </div>
              <iframe
                title="Mongolia Economic Forum video"
                src={videoEmbedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="relative z-10 w-full h-full"
              />
            </div>

            <div className="space-y-3">
              {videoPlaylist.map((video) => (
                <Link
                  key={video.url}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{video.title}</p>
                    <p className="text-sm text-muted-foreground">{video.duration}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xs text-muted-foreground/70">{stat.year}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-6">{dict.mongolia.exports}</h3>
            <div className="space-y-4 mb-8">
              {exports.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{item.name}</span>
                    <span className="text-muted-foreground">{item.percentage}%</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 rounded-2xl p-6">
              <h4 className="font-semibold text-foreground mb-4">{dict.mongolia.topPartners}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">China</span>
                  <span className="font-medium text-foreground">40.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Russia</span>
                  <span className="font-medium text-foreground">24.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Japan</span>
                  <span className="font-medium text-foreground">10.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">United States</span>
                  <span className="font-medium text-foreground">4.6%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">South Korea</span>
                  <span className="font-medium text-foreground">4.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Germany</span>
                  <span className="font-medium text-foreground">2.2%</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="https://www.mongoliatravel.guide/en"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Travel Guide <ExternalLink className="w-4 h-4" />
              </Link>
              <Link
                href="https://www.gomongolia.gov.mn/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Visit Mongolia <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
