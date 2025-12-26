import { Target, Building2, Globe, Lightbulb } from "lucide-react"

interface AboutSectionProps {
  dict: any
}

export function AboutSection({ dict }: AboutSectionProps) {
  const features = [
    {
      icon: Target,
      title: dict.about.features.missionDriven.title,
      description: dict.about.features.missionDriven.description,
    },
    {
      icon: Building2,
      title: dict.about.features.multiStakeholder.title,
      description: dict.about.features.multiStakeholder.description,
    },
    {
      icon: Globe,
      title: dict.about.features.international.title,
      description: dict.about.features.international.description,
    },
    {
      icon: Lightbulb,
      title: dict.about.features.actionOriented.title,
      description: dict.about.features.actionOriented.description,
    },
  ]

  return (
    <section id="about" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            {dict.about.label}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            {dict.about.title}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {dict.about.description}
          </p>
        </div>

        {/* <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="text-center p-6 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div> */}

        <div className="flex flex-col gap-8">
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl p-8 lg:p-12 shadow-sm">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">{dict.about.vision.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {dict.about.vision.paragraph1}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {dict.about.vision.paragraph2}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-[0_12px_24px_rgba(0,0,0,0.12),0_6px_10px_rgba(0,0,0,0.08),0_-2px_6px_rgba(0,0,0,0.05)]">
            <h4 className="font-semibold text-foreground mb-4">{dict.about.missionMn.title}</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {dict.about.missionMn.description}
            </p>
          </div>
        </div>

        {/* Organizational Chart */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">{dict.about.orgChart.title}</h3>
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm overflow-x-auto">
            <div className="min-w-[900px] relative" style={{ height: '520px' }}>
              {/* SVG for all connecting lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                {/* Board to junction vertical line */}
                <line x1="50%" y1="52" x2="50%" y2="90" stroke="#6366f1" strokeWidth="2" />
                {/* Junction horizontal line to Research Team */}
                <line x1="50%" y1="90" x2="75%" y2="90" stroke="#6366f1" strokeWidth="2" />
                {/* Junction to Director vertical line */}
                <line x1="50%" y1="90" x2="50%" y2="140" stroke="#38bdf8" strokeWidth="2" />
                {/* Director to departments vertical line */}
                <line x1="50%" y1="192" x2="50%" y2="240" stroke="#38bdf8" strokeWidth="2" />
                {/* Horizontal line for departments */}
                <line x1="13%" y1="240" x2="87%" y2="240" stroke="#38bdf8" strokeWidth="2" />
                {/* Vertical lines to each department */}
                <line x1="22%" y1="240" x2="22%" y2="270" stroke="#38bdf8" strokeWidth="2" />
                <line x1="41%" y1="240" x2="41%" y2="270" stroke="#38bdf8" strokeWidth="2" />
                <line x1="59%" y1="240" x2="59%" y2="270" stroke="#38bdf8" strokeWidth="2" />
                <line x1="78%" y1="240" x2="78%" y2="270" stroke="#38bdf8" strokeWidth="2" />
                {/* Dotted line from Communications to Volunteer */}
                <line x1="78%" y1="355" x2="78%" y2="400" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="6,4" />
              </svg>

              {/* Board of Directors */}
              <div className="absolute left-1/2 -translate-x-1/2 top-0">
                <div className="bg-[#6366f1] text-white px-8 py-4 rounded-lg font-semibold text-center min-w-[280px]">
                  {dict.about.orgChart.boardOfDirectors}
                </div>
              </div>

              {/* Research Team */}
              <div className="absolute right-[5%] top-[65px]">
                <div className="bg-[#38bdf8] text-white px-4 py-3 rounded-lg font-medium text-center text-sm">
                  {dict.about.orgChart.researchTeam}
                </div>
              </div>

              {/* Director */}
              <div className="absolute left-1/2 -translate-x-1/2 top-[140px]">
                <div className="bg-[#38bdf8] text-white px-8 py-4 rounded-lg font-semibold text-center min-w-[200px]">
                  {dict.about.orgChart.director}
                </div>
              </div>

              {/* Departments */}
              <div className="absolute left-[5%] right-[5%] top-[270px]">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-[#38bdf8] text-white px-3 py-3 rounded-lg font-medium text-center text-sm">
                    {dict.about.orgChart.finance}
                  </div>
                  <div className="bg-[#38bdf8] text-white px-3 py-3 rounded-lg font-medium text-center text-sm">
                    {dict.about.orgChart.projects}
                  </div>
                  <div className="bg-[#38bdf8] text-white px-3 py-3 rounded-lg font-medium text-center text-sm">
                    {dict.about.orgChart.partnerships}
                  </div>
                  <div className="bg-[#38bdf8] text-white px-3 py-3 rounded-lg font-medium text-center text-sm">
                    {dict.about.orgChart.communications}
                  </div>
                </div>
              </div>

              {/* Volunteer Program */}
              <div className="absolute right-[5%] top-[400px]" style={{ width: 'calc(22.5% - 8px)' }}>
                <div className="bg-[#2dd4bf] text-white px-4 py-3 rounded-lg font-medium text-center text-sm">
                  {dict.about.orgChart.volunteer}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
