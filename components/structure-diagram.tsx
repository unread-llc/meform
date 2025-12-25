interface StructureDiagramProps {
  dict: any
}

interface OrgCardProps {
  en: string
  mn: string
  variant?: "solid" | "outline" | "muted"
}

function OrgCard({ en, mn, variant = "outline" }: OrgCardProps) {
  const base = "rounded-2xl px-5 py-4 shadow-sm border transition-all";
  const variants = {
    solid: "bg-primary text-white border-primary/80",
    outline: "bg-white text-foreground border-primary/15",
    muted: "bg-secondary/60 text-foreground border-transparent",
  } as const
  const mnTone = variant === "solid" ? "text-white/85" : "text-muted-foreground"

  return (
    <div className={`${base} ${variants[variant]}`}>
      <p className="text-sm font-semibold leading-snug">{en}</p>
      <p className={`text-xs leading-snug mt-1 ${mnTone}`}>{mn}</p>
    </div>
  )
}

export function StructureDiagram({ dict }: StructureDiagramProps) {
  const lineColor = "bg-muted-foreground/30"

  const departments = [
    dict.structure.departments.finance,
    dict.structure.departments.projects,
    dict.structure.departments.partnerships,
    dict.structure.departments.communications,
  ]

  return (
    <section id="structure" className="py-20 lg:py-32 bg-gradient-to-b from-secondary/50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            {dict.structure.label}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            {dict.structure.title}
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            {dict.structure.description}
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="inline-flex flex-col items-center px-6 py-3 rounded-full bg-primary/10 text-primary">
            <span className="text-sm font-semibold">{dict.structure.forum.en}</span>
            <span className="text-xs text-primary/80">{dict.structure.forum.mn}</span>
          </div>

          <div className={`h-6 w-px ${lineColor}`} aria-hidden />

          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex items-center justify-center gap-6 w-full">
              <OrgCard en={dict.structure.board.en} mn={dict.structure.board.mn} variant="solid" />
              <div className="hidden sm:flex items-center gap-3">
                <div className={`w-12 h-px ${lineColor}`} aria-hidden />
                <OrgCard
                  en={dict.structure.thinkTank.en}
                  mn={dict.structure.thinkTank.mn}
                  variant="muted"
                />
              </div>
            </div>

            <div className="sm:hidden flex flex-col items-center gap-3">
              <div className={`w-10 h-px ${lineColor}`} aria-hidden />
              <OrgCard
                en={dict.structure.thinkTank.en}
                mn={dict.structure.thinkTank.mn}
                variant="muted"
              />
            </div>

            <div className={`h-6 w-px ${lineColor}`} aria-hidden />
            <OrgCard en={dict.structure.director.en} mn={dict.structure.director.mn} variant="outline" />
          </div>

          <div className={`h-6 w-px ${lineColor}`} aria-hidden />

          <div className="w-full max-w-5xl flex flex-col items-center gap-6">
            <div className="hidden md:block relative w-full" aria-hidden>
              <div className={`absolute left-[12.5%] right-[12.5%] top-3 h-px ${lineColor}`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {departments.map((dept: { en: string; mn: string }, index: number) => (
                <div key={dept.en} className="flex flex-col items-center gap-3">
                  <div className={`hidden md:block h-3 w-px ${lineColor}`} aria-hidden />
                  <OrgCard en={dept.en} mn={dept.mn} variant="outline" />
                  {index === 3 && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 border-l border-dashed border-primary/60" aria-hidden />
                      <OrgCard
                        en={dict.structure.volunteer.en}
                        mn={dict.structure.volunteer.mn}
                        variant="muted"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
