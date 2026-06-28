import Image from "next/image"
import type { Locale } from "@/lib/i18n"

// The program is a large-format poster, served as a pre-rendered image (an <img>
// renders crisp and complete on every platform, unlike a live PDF canvas which
// iOS Safari degrades). One poster per language.
const PROGRAMS: Record<string, { src: string; alt: string }> = {
  en: { src: "/program-en.webp", alt: "Mongolia Economic Forum 2026 — Programme" },
  mn: { src: "/program-mn.webp", alt: "Монголын Эдийн Засгийн Форум 2026 — Хөтөлбөр" },
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const program = PROGRAMS[locale] ?? PROGRAMS.en

  return (
    <main className="flex min-h-screen w-full justify-center bg-neutral-100">
      <Image
        src={program.src}
        alt={program.alt}
        width={1080}
        height={1600}
        sizes="(max-width: 900px) 100vw, 900px"
        className="block h-auto w-full max-w-[900px]"
        priority
      />
    </main>
  )
}
