import { Users, MessageSquare, Globe, TrendingUp, FileText, Network, Target } from "lucide-react"

interface WhyParticipateSectionProps {
  dict: any
}

const icons = [Users, MessageSquare, Globe, TrendingUp, FileText, Network, Target]

export function WhyParticipateSection({ dict }: WhyParticipateSectionProps) {
  const photos = [
    "/Gallery/Why%20participate/1,2%20.jpg",
    "/Gallery/Why%20participate/3,4.jpg",
    "/Gallery/Why%20participate/5,6.jpg",
  ]

  // Group reasons into pairs for split layout
  const reasonPairs = [
    { keys: ["1", "2"], photo: photos[0], imageLeft: true },
    { keys: ["3", "4"], photo: photos[1], imageLeft: false },
    { keys: ["5", "6", "7"], photo: photos[2], imageLeft: true },
  ]

  return (
    <section id="why-participate" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            {dict.whyParticipate.label}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">{dict.whyParticipate.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {dict.whyParticipate.description}
          </p>
        </div>

        {/* Split Layout Sections */}
        <div className="space-y-0">
          {reasonPairs.map((pair, pairIndex) => (
            <div
              key={pairIndex}
              className={`flex flex-col lg:flex-row ${pair.imageLeft ? "" : "lg:flex-row-reverse"}`}
            >
              {/* Image Side */}
              <div className="lg:w-1/2 h-64 lg:h-auto lg:min-h-[400px]">
                <img
                  src={pair.photo}
                  alt={`Why participate ${pairIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content Side with Background Image */}
              <div
                className="lg:w-1/2 relative"
                style={{
                  backgroundImage: `url('${pair.photo}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Blue Overlay */}
                <div className={`absolute inset-0 ${
                  pairIndex % 2 === 0 ? "bg-[#0d6efd]/90" : "bg-[#0a58ca]/90"
                }`} />

                {/* Content */}
                <div className="relative z-10 p-8 lg:p-12 flex flex-col justify-center h-full min-h-[300px] lg:min-h-[400px]">
                  <div className="space-y-6">
                    {pair.keys.map((key) => {
                      const reason = dict.whyParticipate.reasons[key]
                      const Icon = icons[parseInt(key) - 1]
                      return (
                        <div key={key} className="flex gap-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1">{reason.title}</h3>
                            <p className="text-white/80 text-sm">{reason.description}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
