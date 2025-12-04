interface TimelineSectionProps {
  dict: any
  fullHistory?: boolean
}

const timelineYears = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2018, 2022, 2023, 2024, 2025]

export function TimelineSection({ dict, fullHistory }: TimelineSectionProps) {
  const timelineData = timelineYears.map((year) => ({
    year,
    theme: dict.timeline.years[year]?.theme || "",
  }))

  return (
    <section id="timeline" className="py-20 lg:py-32 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            {dict.timeline.label}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">{dict.timeline.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {dict.timeline.description}
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 -translate-x-1/2" />

          <div className="space-y-8 lg:space-y-0">
            {timelineData.map((item, index) => (
              <div
                key={item.year}
                className={`lg:flex items-center ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
              >
                <div className={`lg:w-1/2 ${index % 2 === 0 ? "lg:pr-12 lg:text-right" : "lg:pl-12"}`}>
                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-primary font-bold text-2xl">{item.year}</span>
                    <h3 className="text-lg font-semibold text-foreground mt-2">{item.theme}</h3>
                  </div>
                </div>

                <div className="hidden lg:flex w-12 h-12 bg-primary rounded-full items-center justify-center flex-shrink-0 relative z-10 mx-auto">
                  <span className="text-primary-foreground text-xs font-bold">{item.year.toString().slice(-2)}</span>
                </div>

                <div className="lg:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
