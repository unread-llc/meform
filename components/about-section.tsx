import Image from "next/image"
import { BoardSection } from "./board-section"

interface AboutSectionProps {
  dict: any
  locale?: string
}

export function AboutSection({ dict, locale = "en" }: AboutSectionProps) {
  return (
    <section id="about" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-primary font-semibold text-bold text-6xl uppercase tracking-wider mb-4">
            {dict.about.label}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl  text-foreground mb-6 text-balance">
            {dict.about.title}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {dict.about.description}
          </p>
        </div>
        {/* 
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-10 lg:p-14">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 max-w-3xl mx-auto text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 rounded-2xl mb-8">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold mb-6">{dict.about.vision.title}</h3>
            <p className="text-lg text-white/90 leading-relaxed mb-5">
              {dict.about.vision.paragraph1}
            </p>
            <p className="text-lg text-white/90 leading-relaxed">
              {dict.about.vision.paragraph2}
            </p>
          </div>
        </div> */}
        <BoardSection dict={dict} />

        {/* Organizational Chart */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">{dict.about.orgChart.title}</h3>
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm flex justify-center">
            <Image
              src={locale === "mn" ? "/mongolian-structure.svg" : "/english-structure.svg"}
              alt={dict.about.orgChart.title}
              width={1200}
              height={600}
              className="w-full h-auto max-w-4xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
