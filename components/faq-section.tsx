import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Locale } from "@/lib/i18n"

interface FAQSectionProps {
  dict: any
  locale: Locale
}

const faqKeys = [
  "what",
  "who",
  "importance",
  "topics",
  "where",
  "register",
  "fee",
  "foreigners",
  "language",
  "contribute",
  "sponsor",
  "nextYear",
  "results",
  "government"
]

function BulletList({ items }: { items: string[] }) {
  return (
    <div className="space-y-2">
      {items.map((text, i) => (
        <div key={i} className="flex gap-3">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-muted-foreground/60" />
          <p className="leading-relaxed">{text}</p>
        </div>
      ))}
    </div>
  )
}

export function FAQSection({ dict, locale }: FAQSectionProps) {
  return (
    <section id="faq" className="py-20 lg:py-32 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="mb-8">
            <Button size="lg" className="w-full sm:w-auto font-semibold px-8" asChild>
              <Link href={`/${locale}/register`}>{dict?.hero?.registerNow}</Link>
            </Button>
          </div>

          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            {dict?.faq?.label}
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {dict?.faq?.title}
          </h2>

          <p className="text-lg text-muted-foreground">
            {dict?.faq?.description}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqKeys.map((key, index) => {
            const faq = dict?.faq?.questions?.[key]
            if (!faq) return null

            const isArrayAnswer = Array.isArray(faq.answer)

            return (
              <AccordionItem key={key} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  <span className="font-semibold text-foreground">
                    {faq.question}
                  </span>
                </AccordionTrigger>

                <AccordionContent className="text-muted-foreground">
                  {faq.answerIntro ? (
                    <p className="leading-relaxed mb-3">{faq.answerIntro}</p>
                  ) : null}

                  {isArrayAnswer ? (
                    <BulletList items={faq.answer} />
                  ) : (
                    <p className="leading-relaxed">{faq.answer}</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </section>
  )
}
