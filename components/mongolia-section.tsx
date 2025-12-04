import { ExternalLink, Play } from "lucide-react"
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
            <div className="relative rounded-2xl overflow-hidden aspect-video mb-8">
              <img src="/mongolia-landscape-with-traditional-ger-and-mounta.jpg" alt="Mongolia landscape" className="w-full h-full object-cover" />
              <Link
                href="https://www.youtube.com/watch?v=27J9Np5103E"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 text-primary ml-1" />
                </div>
              </Link>
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
