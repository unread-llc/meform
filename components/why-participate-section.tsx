import { Users, MessageSquare, Globe, TrendingUp, FileText, Network, Target } from "lucide-react"

interface WhyParticipateSectionProps {
  dict: any
}

const icons = [Users, MessageSquare, Globe, TrendingUp, FileText, Network, Target]

export function WhyParticipateSection({ dict }: WhyParticipateSectionProps) {
  const reasonKeys = ["1", "2", "3", "4", "5", "6", "7"]
  const photos = [
    "/Gallery/Why%20participate/1,2%20.jpg",
    "/Gallery/Why%20participate/3,4.jpg",
    "/Gallery/Why%20participate/5,6.jpg",
  ]

  return (
    <section id="why-participate" className="py-20 lg:py-32 bg-gradient-to-b from-white to-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            {dict.whyParticipate.label}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">{dict.whyParticipate.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {dict.whyParticipate.description}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {photos.map((src, idx) => (
            <div key={src} className="overflow-hidden rounded-2xl border border-secondary/50 bg-white shadow-sm">
              <img src={src} alt={`Why participate ${idx + 1}`} className="w-full h-48 object-cover" />
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasonKeys.map((key, index) => {
            const reason = dict.whyParticipate.reasons[key]
            const Icon = icons[index]
            return (
              <div
                key={key}
                className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow ${index === 6 ? "lg:col-start-2" : ""
                  }`}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{reason.title}</h3>
                <p className="text-muted-foreground text-sm">{reason.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
