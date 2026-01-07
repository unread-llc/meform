"use client"

import { motion } from "framer-motion"

interface StructureDiagramProps {
  dict: any
}

interface OrgCardProps {
  text: string
  subtext?: string
  variant?: "solid" | "outline" | "muted"
  className?: string
}

function OrgCard({ text, subtext, variant = "outline", className = "" }: OrgCardProps) {
  const base = "rounded-xl px-4 py-3 sm:px-6 sm:py-4 shadow-sm border transition-all duration-300 flex flex-col items-center justify-center text-center relative z-10 bg-card";

  const variants = {
    solid: "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20",
    outline: "text-card-foreground border-border hover:border-primary/50 hover:shadow-md",
    muted: "bg-secondary/50 text-secondary-foreground border-transparent hover:bg-secondary/80",
  } as const

  return (
    <div className={`${base} ${variants[variant]} ${className}`}>
      <p className="font-semibold leading-snug text-balance text-sm sm:text-base">{text}</p>
      {subtext && <p className="text-xs opacity-80 mt-1">{subtext}</p>}
    </div>
  )
}

export function StructureDiagram({ dict }: StructureDiagramProps) {
  const lineColor = "bg-border"

  const departments = [
    dict.structure.departments.finance,
    dict.structure.departments.projects,
    dict.structure.departments.partnerships,
    dict.structure.departments.communications,
  ]

  return (
    <section id="structure" className="py-24 lg:py-32 bg-background overflow-hidden px-4 md:px-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-primary font-bold text-sm uppercase tracking-wider mb-4 px-3 py-1 rounded-full bg-primary/10">
              {dict.structure.label}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance tracking-tight">
              {dict.structure.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg sm:text-xl">
              {dict.structure.description}
            </p>
          </motion.div>
        </div>

        {/* --- Mobile/Tablet View (Strict Vertical Stack < 768px) --- */}
        <div className="md:hidden flex flex-col items-center w-full max-w-[340px] mx-auto">
          {/* Forum */}
          <OrgCard
            text={dict.structure.forum}
            variant="solid"
            className="w-full bg-primary/95 text-base py-4 px-4"
          />

          <div className={`h-8 w-[2px] ${lineColor}`} />

          {/* Board */}
          <OrgCard
            text={dict.structure.board}
            variant="outline"
            className="w-full text-base py-4 px-4"
          />

          <div className={`h-8 w-[2px] ${lineColor}`} />

          {/* Think Tank (Advisory) */}
          <div className="relative w-full">
            <div className={`absolute top-0 bottom-0 left-1/2 w-[2px] ${lineColor} -translate-x-1/2 z-0`} />
            <OrgCard
              text={dict.structure.thinkTank}
              variant="muted"
              className="w-[90%] mx-auto text-sm py-3 px-3 relative z-10 border-dashed border-border mb-0"
            />
          </div>

          <div className={`h-8 w-[2px] ${lineColor}`} />

          {/* Director */}
          <OrgCard
            text={dict.structure.director}
            variant="outline"
            className="w-full border-primary/40 text-base py-4 px-4 relative z-10 bg-background"
          />

          <div className={`h-10 w-[2px] ${lineColor}`} />

          {/* Departments Stack */}
          <div className="w-full flex flex-col gap-5 relative">
            {/* Main Spine */}
            <div className={`absolute top-0 bottom-8 left-6 w-[2px] ${lineColor}`} />

            {departments.map((dept: string, index: number) => (
              <div key={index} className="relative pl-14">
                {/* Horizontal branch */}
                <div className={`absolute top-1/2 left-6 w-8 h-[2px] ${lineColor} -translate-y-1/2`} />
                <OrgCard
                  text={dept}
                  variant="outline"
                  className="w-full text-sm sm:text-base py-4 px-4 leading-tight bg-card"
                />

                {/* Volunteer for last item */}
                {index === 3 && (
                  <div className="mt-5 relative -ml-8">
                    <div className="absolute top-[-28px] left-[32px] h-7 border-l-2 border-dashed border-border/50" />
                    <OrgCard
                      text={dict.structure.volunteer}
                      variant="muted"
                      className="text-sm py-3 w-full border-dashed border-border"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- Desktop View (Responsive Grid >= 768px) --- */}
        <div className="hidden md:flex flex-col items-center">
          {/* Forum Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="z-20 relative w-full flex justify-center"
          >
            <div className="inline-flex flex-col items-center px-8 py-4 rounded-2xl bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-xl shadow-primary/25 mb-0 border border-white/10 max-w-[80%]">
              <span className="text-lg font-bold text-center leading-tight">{dict.structure.forum}</span>
            </div>
            {/* Main vertical line from Forum */}
            <div className={`absolute top-full left-1/2 w-[2px] h-12 ${lineColor} -translate-x-1/2`} />
          </motion.div>

          {/* Spacer for the line */}
          <div className="h-12" />

          {/* Level 1: Board & Think Tank */}
          <div className="relative w-full max-w-3xl">
            {/* Horizontal Connector Line */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className={`absolute top-0 left-[20%] right-[20%] h-[2px] ${lineColor}`}
            />

            <div className="grid grid-cols-2 gap-16 relative">
              {/* Board */}
              <div className="flex flex-col items-center relative">
                {/* Vertical connector to top */}
                <div className={`absolute bottom-full left-1/2 w-[2px] h-8 ${lineColor} -translate-x-1/2`} />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="w-full h-full"
                >
                  <OrgCard text={dict.structure.board} variant="solid" className="w-full h-full flex items-center justify-center min-h-[90px]" />
                </motion.div>
              </div>

              {/* Think Tank */}
              <div className="flex flex-col items-center relative">
                {/* Vertical connector to top */}
                <div className={`absolute bottom-full left-1/2 w-[2px] h-8 ${lineColor} -translate-x-1/2`} />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.35 }}
                  className="w-full h-full"
                >
                  <OrgCard text={dict.structure.thinkTank} variant="muted" className="w-full h-full flex items-center justify-center min-h-[90px]" />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Connector to Director */}
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: 48 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className={`w-[2px] ${lineColor} h-12`}
            aria-hidden
          />

          {/* Level 2: Director */}
          <div className="relative w-full max-w-sm z-10 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <OrgCard text={dict.structure.director} variant="outline" className="w-full border-primary/40 bg-background" />
            </motion.div>
          </div>

          {/* Connector to Departments */}
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: 48 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className={`w-[2px] ${lineColor} h-12`}
            aria-hidden
          />

          {/* Level 3: Departments */}
          <div className="relative w-full max-w-7xl px-4">
            {/* Horizontal Line for Departments */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className={`absolute top-0 left-[12.5%] right-[12.5%] h-[2px] ${lineColor}`}
            />

            <div className="grid grid-cols-4 gap-6 pt-8">
              {departments.map((dept: string, index: number) => (
                <div key={index} className="flex flex-col items-center relative">
                  {/* Vertical line from top horizontal bar */}
                  <div className={`absolute bottom-full left-1/2 w-[2px] h-8 ${lineColor} -translate-x-1/2`} />

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + (index * 0.1) }}
                    className="w-full h-full"
                  >
                    <OrgCard
                      text={dept}
                      variant="outline"
                      className="w-full h-full min-h-[110px] flex flex-col justify-center text-sm md:text-base leading-tight"
                    />
                  </motion.div>

                  {/* Volunteer: attached to 4th item */}
                  {index === 3 && (
                    <motion.div
                      className="absolute top-full left-0 right-0 flex flex-col items-center z-10"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 }}
                    >
                      <div className="h-6 border-l-2 border-dashed border-border" />
                      <OrgCard
                        text={dict.structure.volunteer}
                        variant="muted"
                        className="text-sm py-2 px-3 w-4/5 shadow-none border-dashed border-border bg-background/50 backdrop-blur-sm"
                      />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
            {/* Spacer for Volunteer */}
            <div className="h-32" />
          </div>
        </div>
      </div>
    </section>
  )
}
