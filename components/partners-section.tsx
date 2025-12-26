interface PartnersSectionProps {
  dict: any
  expanded?: boolean
}

type Partner = {
  name: string
  logo?: string
  url?: string // empty string allowed
}

const partners: Partner[] = [
  {
    name: "Badrakh Energy",
    logo: "/Logo/Partners/2025/Partner%20organization/Badrakh%20energy.png",
    url: "https://badrakhenergy.com/",
  },
  {
    name: "GTN",
    logo: "/Logo/Partners/2025/Partner%20organization/GTN_Logo.jpg",
    url: "https://gtngroup.com/global/home/",
  },
  {
    name: "StoneX",
    logo: "/Logo/Partners/2025/Corporate%20partners/StoneX_Dark.png",
    url: "https://www.stonex.com/", // TODO
  },
  {
    name: "Emart",
    logo: "/Logo/Partners/2025/Corporate%20partners/Emart%20logo.png",
    url: "https://emartmall.mn/",
  },
  {
    name: "ADB",
    logo: "/Logo/Partners/2025/Supporting%20organization/ADB/ADB_logoBLUE_PNG%20(2).png",
    url: "https://www.adb.org/",
  },
  {
    name: "EBRD",
    logo: "/Logo/Partners/2025/Supporting%20organization/EBRD/EBRDlogo%20(004)%20(1).png",
    url: "https://www.ebrd.com/",
  },
  {
    name: "EU Global Gateway",
    logo: "/Logo/Partners/2025/Supporting%20organization/EU/Global-Gateway-logo-EU-emblem-dark%20blue-1200x800.jpg",
    url: "https://international-partnerships.ec.europa.eu/policies/global-gateway_en",
  },
  {
    name: "Business Friendly Mongolia",
    logo: "/Logo/Partners/2025/Supporting%20organization/Business%20Friendly%20Mongolia/edb%20logo.png",
    url: "", // TODO
  },
]

const previousPartners: Partner[] = [
  { name: "IDAX", logo: "/Logo/Previous%20years%20partners%20logo/IDAX.png", url: "https://www.idax.exchange/" },
  { name: "Ulaanbaatar Securities Exchange", logo: "/Logo/Previous%20years%20partners%20logo/UBX.svg", url: "https://www.ubx.mn/" },
  { name: "MCS Group", logo: "/Logo/Previous%20years%20partners%20logo/MCS%20Group_id9wPPwFOI_0.png", url: "https://mcs.mn/mn/" },
  { name: "TDB", logo: "/Logo/Previous%20years%20partners%20logo/TDB.avif", url: "https://www.tdbm.mn/" },
  { name: "Tavan Bogd", logo: "/Logo/Previous%20years%20partners%20logo/TAVANBOGD.png", url: "https://tavanbogd.com/" },
  { name: "Global Trading Network (GTN)", logo: "/Logo/Previous%20years%20partners%20logo/GTN_idkNTJ3cDK_2.jpeg", url: "https://gtngroup.com/global/home/" },
  { name: "Envision", logo: "/Logo/Previous%20years%20partners%20logo/envision-group-seeklogo.png", url: "https://www.envision-group.com/" },
  { name: "Rio Tinto", logo: "/Logo/Previous%20years%20partners%20logo/Rio_Tinto_(corporation)-Logo.wine.svg", url: "https://www.riotinto.com/" },
  { name: "Khan Bank", logo: "/Logo/Previous%20years%20partners%20logo/KHANBANK.avif", url: "https://www.khanbank.com/business/home/" },
  { name: "APU", logo: "/Logo/Previous%20years%20partners%20logo/APU%20RED@4x.png", url: "https://www.apu.mn/" },
  { name: "Newcom Group", logo: "/Logo/Previous%20years%20partners%20logo/NEWCOM.png", url: "https://newcom.mn/?lang=mn" },
  { name: "Trafigura", logo: "/Logo/Previous%20years%20partners%20logo/Trafigura_company_logo.svg.png", url: "https://www.trafigura.com/" },
  { name: "Gobi Cashmere", logo: "/Logo/Previous%20years%20partners%20logo/GOBI%20Cashmere_Logo_1.png", url: "https://www.gobicashmere.com/" },
  { name: "Bodi International", logo: "/Logo/Previous%20years%20partners%20logo/BODI.avif", url: "https://bodigroup.mn/bodi-group/" },
]

function PartnerCard({ partner }: { partner: Partner }) {
  const inner = (
    <div className="bg-white rounded-xl p-4 flex items-center justify-center h-24 hover:shadow-md transition-shadow">
      {partner.logo ? (
        <img
          src={partner.logo}
          alt={partner.name}
          className="max-h-16 max-w-[160px] object-contain"
        />
      ) : (
        <span className="text-muted-foreground font-medium text-center text-sm">
          {partner.name}
        </span>
      )}
    </div>
  )

  const hasUrl = typeof partner.url === "string" && partner.url.trim().length > 0

  return hasUrl ? (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${partner.name} website`}
      className="block"
    >
      {inner}
    </a>
  ) : (
    <div className="block">{inner}</div>
  )
}

export function PartnersSection({ dict, expanded = true }: PartnersSectionProps) {
  return (
    <section id="partners" className="py-20 lg:py-32 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            {dict.partners.label}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {dict.partners.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {dict.partners.description}
          </p>
        </div>

        {/* 2025 Partners */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {partners.map((partner) => (
            <div key={partner.name}>
              <PartnerCard partner={partner} />
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

        {/* Previous years */}
        {expanded ? (
          <div className="mt-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground">
                {dict?.partners?.previousTitle ?? "Previous years sponsors and partners"}
              </h3>
              <p className="text-muted-foreground">
                {dict?.partners?.previousDesc ?? "Selected partners from earlier MEF editions"}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {previousPartners.map((partner) => (
                <div key={partner.name}>
                  <PartnerCard partner={partner} />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
