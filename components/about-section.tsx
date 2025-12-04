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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
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
        </div>

        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl p-8 lg:p-12">
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
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h4 className="font-semibold text-foreground mb-4">{dict.about.missionMn.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {dict.about.missionMn.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
