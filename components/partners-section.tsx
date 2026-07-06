import Image from "next/image"

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
    key: "partnerOrganization",
    partners: [
      {
        name: "EDB Business Friendly Mongolia",
        logo: "/Logo/Partners/2026/edb.png",
        url: "",
      },
      {
        name: "Ulaanbaatar Chamber of Commerce",
        logo: "/Logo/Partners/2026/ubcc.png",
        url: "",
      },
      {
        name: "Ubcab Holding",
        logo: "/Logo/Partners/2026/ubcab.png",
        url: "",
      },
      {
        name: "GR",
        logo: "/Logo/Partners/2026/gr.png",
        url: "",
      },
      {
        name: "CEO Club",
        logo: "/Logo/Partners/2026/ceo-club.png",
        url: "",
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
  // 2025/2026 strategic, supporting, media and logistic partners
  {
    name: "Breitling",
    logo: "/Partners/strategic/breitling.png",
    url: "https://www.breitling.com/us-en/",
  },
  {
    name: "AIG",
    logo: "/Partners/strategic/aig.png",
    url: "",
  },
  {
    name: "EBRD",
    logo: "/Logo/Partners/2025/Supporting organization/EBRD/EBRDlogo (004) (1).png",
    url: "https://www.ebrd.com/home",
  },
  {
    name: "ADB",
    logo: "/Logo/Partners/2025/Supporting organization/ADB/ADB_logoBLUE_PNG (2).png",
    url: "https://www.adb.org/",
  },
  {
    name: "EU Global Gateway",
    logo: "/Logo/Partners/2025/Supporting organization/EU/Global-Gateway-logo-EU-emblem-dark blue-1200x800.jpg",
    url: "https://commission.europa.eu/strategy-and-policy/priorities-2019-2024/stronger-europe-world/global-gateway_en",
  },
  {
    name: "Pinut Amongolia",
    logo: "/Logo/Partners/2025/Supporting organization/PINUTA/Logo/viber_image_2025-06-27_16-30-58-925.jpg",
    url: "https://www.facebook.com/pinutamongolia/",
  },
  {
    name: "Unitel",
    logo: "/Logo/Partners/2025/Supporting organization/unitel/Unitel_Logo.png",
    url: "https://www.unitel.mn/unitel/",
  },
  {
    name: "TikTok",
    logo: "/Logo/Partners/2025/Supporting organization/Tik Tok/Tik.jpg",
    url: "https://www.tiktok.com/",
  },
  {
    name: "Economic Journalists Club",
    logo: "/Logo/Partners/2025/Supporting organization/МЭЗСК/photo_2025-07-05_13-23-51.jpg",
    url: "https://www.facebook.com/EconomicJournalistsClub",
  },
  {
    name: "Lemonpress",
    logo: "/Logo/Partners/2025/Supporting organization/Lemon Press/logo_har.png",
    url: "https://lemonpress.mn/",
  },
  {
    name: "Tsoilog Soz",
    logo: "/Logo/Partners/2025/Supporting organization/TsoilogsoZ logo/TsoilogsoZ logo_black.png",
    url: "https://www.facebook.com/tsoilogsoz/",
  },
  {
    name: "Unread Today",
    logo: "/Logo/Partners/2025/Supporting organization/Unread/photo_2025-07-05 13.00.31.jpeg",
    url: "https://unread.today/category/english",
  },
  {
    name: "Tngr",
    logo: "/Logo/Partners/2025/Supporting organization/Tenger TV/photo_2025-07-05 13.00.22.jpeg",
    url: "https://www.tngr.tv/",
  },
  {
    name: "Mongol Post",
    logo: "/logistic_partners/logo ENG1 PNG.png",
    url: "https://mongolpost.mn/en",
  },
  {
    name: "Royal Enfield",
    logo: "/logistic_partners/royal_enfield.jpeg",
    url: "https://www.royalenfield.com/in/en/home/",
  },
  {
    name: "EMC Mongolia",
    logo: "/logistic_partners/Copy of EMC Logo.png",
    url: "https://www.emcmongolia.mn/",
  },
  // Moved from the 2025/2026 corporate and partner-organization categories
  {
    name: "StoneX",
    logo: "/Logo/Partners/2025/Corporate partners/StoneX_Dark.png",
    url: "https://www.stonex.com/en/",
  },
  {
    name: "Emart",
    logo: "/Logo/Partners/2025/Corporate partners/Emart logo.png",
    url: "https://emartmall.mn/",
  },
  {
    name: "ARD Holdings",
    logo: "/ardcoin.png",
    url: "https://ardholdings.com/mn/?home",
  },
  // (GTN already appears below as "Global Trading Network (GTN)")
  {
    name: "Badrakh Energy",
    logo: "/Logo/Partners/2025/Partner organization/Badrakh energy.png",
    url: "https://badrakhenergy.com/en/home-en/",
  },
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
  const isLocalLogo = partner.logo?.startsWith("/")

  const inner = (
    <div className="bg-white rounded-xl p-5 flex items-center justify-center h-28 hover:shadow-md transition-shadow">
      {partner.logo ? (
        isLocalLogo ? (
          <Image
            src={partner.logo}
            alt={partner.name}
            width={200}
            height={80}
            className={`object-contain ${partner.logoClassName ?? "max-h-20 max-w-48"}`}
          />
        ) : (
          <img
            src={partner.logo}
            alt={partner.name}
            className={`object-contain ${partner.logoClassName ?? "max-h-20 max-w-48"}`}
          />
        )
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
              <div className="flex flex-wrap justify-center gap-4">
                {category.partners.map((partner) => (
                  <div key={`${category.key}-${partner.name}`} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.75rem)] lg:w-[calc(25%-0.75rem)]">
                    <PartnerCard partner={partner} />
                  </div>
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

            <div className="flex flex-wrap justify-center gap-6">
              {previousPartners.map((partner) => (
                <div key={partner.name} className="w-[calc(50%-0.75rem)] md:w-[calc(25%-1.125rem)]">
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
