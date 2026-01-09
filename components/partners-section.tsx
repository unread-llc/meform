interface PartnersSectionProps {
  dict: any
  expanded?: boolean
}

type Partner = {
  name: string
  logo?: string
  url?: string // empty string allowed
  logoClassName?: string
}

type PartnerCategoryKey =
  | "strategic"
  | "corporate"
  | "partnerOrganization"
  | "supporting"
  | "media"
  | "logistics"

const partnerCategories: Array<{ key: PartnerCategoryKey; partners: Partner[] }> = [
  {
    key: "strategic",
    partners: [
      {
        name: "Breitling",
        logo: "https://meforum.mn/storage/app/public/phpn3bIRd-1751439777.svg",
        url: "https://www.breitling.com/us-en/",
      },
      {
        name: "ARD Holdings",
        logo: "https://meforum.mn/storage/app/public/phpeub6RX-1751448812.png",
        url: "https://ardholdings.com/en/?home",
      },
    ],
  },
  {
    key: "corporate",
    partners: [
      {
        name: "StoneX",
        logo: "https://meforum.mn/storage/app/public/php3JGOMg-1751440952.png",
        url: "https://www.stonex.com/en/",
      },
      {
        name: "Emart",
        logo: "https://meforum.mn/storage/app/public/phpFig3T6-1751441447.svg",
        url: "https://emartmall.mn/",
      },
      {
        name: "ARD Holdings",
        logo: "https://meforum.mn/storage/app/public/php8MQVAh-1751442262.png",
        url: "https://ardholdings.com/mn/?home",
      },
    ],
  },
  {
    key: "partnerOrganization",
    partners: [
      {
        name: "GTN",
        logo: "https://meforum.mn/storage/app/public/phpzFHIpf-1719400733.png",
        url: "https://gtngroup.com/europe/home/",
      },
      {
        name: "Badrakh Energy",
        logo: "https://meforum.mn/storage/app/public/php5LPaCS-1751442178.png",
        url: "https://badrakhenergy.com/en/home-en/",
      },
    ],
  },
  {
    key: "supporting",
    partners: [
      {
        name: "EBRD",
        logo: "https://meforum.mn/storage/app/public/phpacCI3t-1719888669.png",
        url: "https://www.ebrd.com/home",
      },
      {
        name: "ADB",
        logo: "https://meforum.mn/storage/app/public/phpUxjUqk-1751442800.png",
        url: "https://www.adb.org/",
      },
      {
        name: "EU Global Gateway",
        logo: "https://meforum.mn/storage/app/public/phpP6ZJ9H-1751443644.jpg",
        url: "https://commission.europa.eu/strategy-and-policy/priorities-2019-2024/stronger-europe-world/global-gateway_en",
      },
      {
        name: "Pinut Amongolia",
        logo: "https://meforum.mn/storage/app/public/phpcuJsL1-1751442501.png",
        url: "https://www.facebook.com/pinutamongolia/",
      },
      {
        name: "Economic Journalism Club",
        logo: "https://meforum.mn/storage/app/public/phpgRoci3-1751819353.png",
        url: "https://www.facebook.com/profile.php?id=61574363563476",
      },
      {
        name: "Unitel",
        logo: "https://meforum.mn/storage/app/public/phpXSUd9Q-1719394259.png",
        url: "https://www.unitel.mn/unitel/",
      },
    ],
  },
  {
    key: "media",
    partners: [
      {
        name: "TikTok",
        logo: "https://meforum.mn/storage/app/public/phpKcJ5qh-1751448965.png",
        url: "https://www.tiktok.com/",
      },
      {
        name: "Economic Journalists Club",
        logo: "https://meforum.mn/storage/app/public/php5H1Gzm-1751448835.png",
        url: "https://www.facebook.com/EconomicJournalistsClub",
      },
      {
        name: "Lemonpress",
        logo: "https://meforum.mn/storage/app/public/phpz6grD6-1751448675.png",
        url: "https://lemonpress.mn/",
      },
      {
        name: "Tsoilog Soz",
        logo: "https://meforum.mn/storage/app/public/phphrzA1N-1751449003.png",
        url: "https://www.facebook.com/tsoilogsoz/",
      },
      {
        name: "Unread Today",
        logo: "https://meforum.mn/storage/app/public/php8NHhnl-1751449107.png",
        url: "https://unread.today/category/english",
      },
      {
        name: "Tngr",
        logo: "https://meforum.mn/storage/app/public/phpmIWxYI-1751468640.png",
        url: "https://www.tngr.tv/",
      },
    ],
  },
  {
    key: "logistics",
    partners: [
      {
        name: "Mongol Post",
        logo: "https://meforum.mn/storage/app/public/phpFthfiV-1751448782.png",
        url: "https://mongolpost.mn/en",
      },
      {
        name: "Royal Enfield",
        logo: "https://meforum.mn/storage/app/public/phpSpizZF-1751468609.png",
        url: "https://www.royalenfield.com/in/en/home/",
      },
      {
        name: "EMC Mongolia",
        logo: "https://meforum.mn/storage/app/public/phpefxbfw-1751819140.png",
        url: "https://www.emcmongolia.mn/",
      },
    ],
  },
]

const fallbackCategoryLabels: Record<PartnerCategoryKey, string> = {
  strategic: "Strategic partners",
  corporate: "Corporate partners",
  partnerOrganization: "Partner organizations",
  supporting: "Supporting organizations",
  media: "Media partners",
  logistics: "Logistic partners",
}

const previousPartners: Partner[] = [
  { name: "IDAX", logo: "/Logo/Previous%20years%20partners%20logo/IDAX.png", url: "https://www.idax.exchange/" },
  { name: "Ulaanbaatar Securities Exchange", logo: "/Logo/Previous%20years%20partners%20logo/UBX.svg", url: "https://www.ubx.mn/" },
  { name: "MCS Group", logo: "/Logo/Previous%20years%20partners%20logo/MCS%20Group_id9wPPwFOI_0.png", url: "https://mcs.mn/mn/" },
  { name: "TDB", logo: "/Logo/Previous%20years%20partners%20logo/TDB.avif", url: "https://www.tdbm.mn/" },
  { name: "Tavan Bogd", logo: "/Logo/Previous%20years%20partners%20logo/TAVANBOGD.png", url: "https://tavanbogd.com/", logoClassName: "max-h-20 max-w-56" },
  { name: "Global Trading Network (GTN)", logo: "/Logo/Previous%20years%20partners%20logo/GTN_idkNTJ3cDK_2.jpeg", url: "https://gtngroup.com/global/home/" },
  { name: "Envision", logo: "/Logo/Previous%20years%20partners%20logo/envision-group-seeklogo.png", url: "https://www.envision-group.com/" },
  { name: "Rio Tinto", logo: "/Logo/Previous%20years%20partners%20logo/Rio_Tinto_(corporation)-Logo.wine.svg", url: "https://www.riotinto.com/" },
  { name: "Khan Bank", logo: "/Logo/Previous%20years%20partners%20logo/KHANBANK.avif", url: "https://www.khanbank.com/business/home/" },
  { name: "APU", logo: "/Logo/Previous%20years%20partners%20logo/APU%20RED@4x.png", url: "https://www.apu.mn/" },
  { name: "Newcom Group", logo: "/Logo/Previous%20years%20partners%20logo/NEWCOM.png", url: "https://newcom.mn/?lang=mn" },
  { name: "Trafigura", logo: "/Logo/Previous%20years%20partners%20logo/Trafigura_company_logo.svg.png", url: "https://www.trafigura.com/" },
  { name: "Gobi Cashmere", logo: "/Logo/Previous%20years%20partners%20logo/GOBI%20Cashmere_Logo_1.png", url: "https://www.gobicashmere.com/" },
  { name: "Bodi International", logo: "/Logo/Previous%20years%20partners%20logo/bodilogo.avif", url: "https://www.bodigroup.mn/bodi-group", logoClassName: "max-h-20 max-w-56" },
]

function PartnerCard({ partner }: { partner: Partner }) {
  const inner = (
    <div className="bg-white rounded-xl p-4 flex items-center justify-center h-24 hover:shadow-md transition-shadow">
      {partner.logo ? (
        <img
          src={partner.logo}
          alt={partner.name}
          className={`object-contain ${partner.logoClassName ?? "max-h-16 max-w-40"}`}
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
  const getCategoryLabel = (key: PartnerCategoryKey) =>
    dict.partners?.categories?.[key] ?? fallbackCategoryLabels[key]

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

        <div className="space-y-10">
          {partnerCategories.map((category) => (
            <div key={category.key} className="rounded-3xl border border-border bg-white/80 p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold text-foreground">
                  {getCategoryLabel(category.key)}
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {category.partners.map((partner) => (
                  <PartnerCard key={`${category.key}-${partner.name}`} partner={partner} />
                ))}
              </div>
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
                {dict?.partners?.previousDesc ?? ""}
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
