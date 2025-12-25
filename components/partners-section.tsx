interface PartnersSectionProps {
  dict: any
  expanded?: boolean
}

const partners = [
  {
    name: "Badrakh Energy",
    logo: "/Logo/Partners/2025/Partner%20organization/Badrakh%20energy.png",
  },
  {
    name: "GTN",
    logo: "/Logo/Partners/2025/Partner%20organization/GTN_Logo.jpg",
  },
  {
    name: "StoneX",
    logo: "/Logo/Partners/2025/Corporate%20partners/StoneX_Dark.png",
  },
  {
    name: "Emart",
    logo: "/Logo/Partners/2025/Corporate%20partners/Emart%20logo.png",
  },
  {
    name: "ADB",
    logo: "/Logo/Partners/2025/Supporting%20organization/ADB/ADB_logoBLUE_PNG%20(2).png",
  },
  {
    name: "EBRD",
    logo: "/Logo/Partners/2025/Supporting%20organization/EBRD/EBRDlogo%20(004)%20(1).png",
  },
  {
    name: "EU Global Gateway",
    logo: "/Logo/Partners/2025/Supporting%20organization/EU/Global-Gateway-logo-EU-emblem-dark%20blue-1200x800.jpg",
  },
  {
    name: "Business Friendly Mongolia",
    logo: "/Logo/Partners/2025/Supporting%20organization/Business%20Friendly%20Mongolia/edb%20logo.png",
  },
]

const previousPartners = [
  {
    name: "Gobi Cashmere",
    logo: "/Logo/Previous%20years%20partners%20logo/GOBI%20Cashmere_Logo_1.png",
  },
  {
    name: "GTN",
    logo: "/Logo/Previous%20years%20partners%20logo/GTN_idkNTJ3cDK_2.jpeg",
  },
  {
    name: "Trafigura",
    logo: "/Logo/Previous%20years%20partners%20logo/Trafigura_company_logo.svg.png",
  },
  {
    name: "APU",
    logo: "/Logo/Previous%20years%20partners%20logo/APU%20RED@4x.png",
  },
  {
    name: "MCS Group",
    logo: "/Logo/Previous%20years%20partners%20logo/MCS%20Group_id9wPPwFOI_0.png",
  },
  {
    name: "Rio Tinto",
    logo: "/Logo/Previous%20years%20partners%20logo/Rio_Tinto_(corporation)-Logo.wine.svg",
  },
  {
    name: "Envision Group",
    logo: "/Logo/Previous%20years%20partners%20logo/envision-group-seeklogo.png",
  },
  {
    name: "BNB",
    logo: "/Logo/Previous%20years%20partners%20logo/b07fac100c97416684d217e617b2d1d0%20(1).png",
  },
  {
    name: "Dark Logo",
    logo: "/Logo/Previous%20years%20partners%20logo/logo-dark.webp",
  },
  {
    name: "Generic",
    logo: "/Logo/Previous%20years%20partners%20logo/download.jpg",
  },
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
              key={partner.name}
              className="bg-white rounded-xl p-4 flex items-center justify-center h-24 hover:shadow-md transition-shadow"
            >
              {partner.logo ? (
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-16 max-w-[160px] object-contain"
                />
              ) : (
                <span className="text-muted-foreground font-medium text-center text-sm">{partner.name}</span>
              )}
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

        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground">Previous Years Partners</h3>
            <p className="text-muted-foreground">Selected partners from earlier MEF editions</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {previousPartners.map((partner) => (
              <div
                key={partner.name}
                className="bg-white rounded-xl p-4 flex items-center justify-center h-24 hover:shadow-md transition-shadow"
              >
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-h-16 max-w-[160px] object-contain"
                  />
                ) : (
                  <span className="text-muted-foreground font-medium text-center text-sm">{partner.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
