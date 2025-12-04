interface PartnersSectionProps {
  dict: any
  expanded?: boolean
}

const partners = [
  "Asian Development Bank",
  "World Bank",
  "Rio Tinto",
  "Oyu Tolgoi",
  "Ard Financial Group",
  "Government of Mongolia",
  "UNDP Mongolia",
  "European Bank",
]

export function PartnersSection({ dict, expanded }: PartnersSectionProps) {
  return (
    <section id="partners" className="py-20 lg:py-32 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            {dict.partners.label}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">{dict.partners.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {dict.partners.description}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {partners.map((partner) => (
            <div
              key={partner}
              className="bg-white rounded-xl p-6 flex items-center justify-center h-24 hover:shadow-md transition-shadow"
            >
              <span className="text-muted-foreground font-medium text-center text-sm">{partner}</span>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="mailto:info@meforum.mn"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            {dict.nav.contact}
          </a>
        </div>
      </div>
    </section>
  )
}
