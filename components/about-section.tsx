interface AboutSectionProps {
  dict: any
}

export function AboutSection({ dict }: AboutSectionProps) {
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

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4">{dict.about.vision.title}</h3>
            <p className="text-white/90 leading-relaxed mb-4">
              {dict.about.vision.paragraph1}
            </p>
            <p className="text-white/90 leading-relaxed">
              {dict.about.vision.paragraph2}
            </p>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4">{dict.about.missionMn.title}</h3>
            <p className="text-white/90 leading-relaxed">
              {dict.about.missionMn.description}
            </p>
          </div>
        </div>

        {/* Organizational Chart */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">{dict.about.orgChart.title}</h3>
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm overflow-x-auto">
            <div className="min-w-[800px] flex flex-col items-center gap-0">
              {/* Board of Directors */}
              <div className="bg-[#6366f1] text-white px-8 py-3 rounded-lg font-semibold text-center whitespace-nowrap">
                {dict.about.orgChart.boardOfDirectors}
              </div>

              {/* Line from Board down with branch to Research Team */}
              <div className="relative w-full flex justify-center" style={{ height: '60px' }}>
                {/* Vertical line from Board */}
                <div className="absolute left-1/2 top-0 w-0.5 h-full bg-[#6366f1]" />
                {/* Horizontal line to Research Team */}
                <div className="absolute top-1/2 left-1/2 h-0.5 bg-[#6366f1]" style={{ width: '25%' }} />
                {/* Research Team */}
                <div className="absolute right-[10%] top-1/2 -translate-y-1/2">
                  <div className="bg-[#38bdf8] text-white px-4 py-2 rounded-lg font-medium text-center text-sm">
                    {dict.about.orgChart.researchTeam}
                  </div>
                </div>
              </div>

              {/* Director */}
              <div className="bg-[#38bdf8] text-white px-8 py-3 rounded-lg font-semibold text-center min-w-[180px]">
                {dict.about.orgChart.director}
              </div>

              {/* Line from Director to Departments */}
              <div className="relative w-full" style={{ height: '50px' }}>
                {/* Vertical line down from Director */}
                <div className="absolute left-1/2 top-0 w-0.5 h-1/2 bg-[#38bdf8]" />
                {/* Horizontal line across */}
                <div className="absolute top-1/2 left-[12%] right-[12%] h-0.5 bg-[#38bdf8]" />
                {/* Vertical lines to each department */}
                <div className="absolute top-1/2 left-[12%] w-0.5 h-1/2 bg-[#38bdf8]" />
                <div className="absolute top-1/2 left-[37%] w-0.5 h-1/2 bg-[#38bdf8]" />
                <div className="absolute top-1/2 left-[63%] w-0.5 h-1/2 bg-[#38bdf8]" />
                <div className="absolute top-1/2 right-[12%] w-0.5 h-1/2 bg-[#38bdf8]" />
              </div>

              {/* Departments */}
              <div className="w-full px-[5%]">
                <div className="grid grid-cols-4 gap-4 items-start">
                  <div className="bg-[#38bdf8] text-white px-3 py-3 rounded-lg font-medium text-center text-sm h-fit">
                    {dict.about.orgChart.finance}
                  </div>
                  <div className="bg-[#38bdf8] text-white px-3 py-3 rounded-lg font-medium text-center text-sm h-fit">
                    {dict.about.orgChart.projects}
                  </div>
                  <div className="bg-[#38bdf8] text-white px-3 py-3 rounded-lg font-medium text-center text-sm h-fit">
                    {dict.about.orgChart.partnerships}
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-[#38bdf8] text-white px-3 py-3 rounded-lg font-medium text-center text-sm w-full">
                      {dict.about.orgChart.communications}
                    </div>
                    {/* Line to Volunteer */}
                    <div className="w-0.5 h-8 bg-[#2dd4bf]" />
                    {/* Volunteer Program */}
                    <div className="bg-[#2dd4bf] text-white px-3 py-2 rounded-lg font-medium text-center text-sm">
                      {dict.about.orgChart.volunteer}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
