import Image from "next/image"

// The program is a single large-format poster. We serve it as a pre-rendered
// image rather than a live PDF canvas: iOS Safari degrades large/complex
// canvases (blurry output, dropped fills), whereas an <img> renders crisply
// and completely on every platform.
export default function ProgramPage() {
  return (
    <main className="flex min-h-screen w-full justify-center bg-neutral-100">
      <Image
        src="/program.webp"
        alt="MEF 2026 — Strategic Dialogue Agenda"
        width={2000}
        height={3585}
        sizes="(max-width: 900px) 100vw, 900px"
        className="block h-auto w-full max-w-[900px]"
        priority
      />
    </main>
  )
}
