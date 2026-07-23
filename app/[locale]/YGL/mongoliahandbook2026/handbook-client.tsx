"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { BookOpen, Download, Maximize2, X, Loader2 } from "lucide-react"

const FlipbookViewer = dynamic(() => import("@/components/handbook/flipbook-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span>Loading…</span>
    </div>
  ),
})

interface HandbookState {
  source: "uploaded" | "placeholder"
  url: string
  downloadUrl: string
  title: string
  version: number
  updatedAt: string | null
}

export default function HandbookClient({ locale }: { locale: string }) {
  const isMn = locale === "mn"
  const [state, setState] = useState<HandbookState | null>(null)
  const [error, setError] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch("/api/handbook", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("failed")
        return res.json()
      })
      .then((data: HandbookState) => {
        if (!cancelled) setState(data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Lock body scroll while the fullscreen reader is open.
  useEffect(() => {
    if (!isFullscreen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [isFullscreen])

  const title = state?.title || "Participant Handbook 2026"
  const pdfUrl = state?.url
  const downloadUrl = state?.downloadUrl || state?.url

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1220] via-[#0e1a33] to-[#0b1220]">
      {/* Fullscreen reader */}
      {isFullscreen && pdfUrl && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-black/40">
            <h3 className="text-white font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-300" />
              {title}
            </h3>
            <div className="flex items-center gap-2">
              <a
                href={downloadUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="inline">{isMn ? "Татах" : "Download"}</span>
              </a>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                aria-label={isMn ? "Хаах" : "Close"}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 p-2 sm:p-4">
            <FlipbookViewer key={`fs-${pdfUrl}`} pdfUrl={pdfUrl} locale={locale} variant="fullscreen" />
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative pt-28 pb-10 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-10 left-1/4 w-72 h-72 bg-amber-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-amber-200 text-sm font-medium mb-5 border border-white/15">
            <BookOpen className="w-4 h-4" />
            {isMn ? "YGL Learning Journey" : "YGL Learning Journey"}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 text-balance">
            {title}
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto">
            {isMn
              ? "Хуудсыг эргүүлж, номыг уншиж танилцана уу."
              : "Turn the pages and read through the handbook like a real book."}
          </p>
        </div>
      </section>

      {/* Book */}
      <section className="relative z-10 px-3 sm:px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-end gap-2 mb-3">
            {pdfUrl && (
              <>
                <a
                  href={downloadUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-sm transition-colors border border-white/10"
                >
                  <Download className="w-4 h-4" />
                  <span className="inline">{isMn ? "Татах" : "Download"}</span>
                </a>
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-[#0b1220] rounded-xl font-medium text-sm transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="inline">{isMn ? "Бүтэн дэлгэц" : "Fullscreen"}</span>
                </button>
              </>
            )}
          </div>

          <div className="rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl overflow-hidden backdrop-blur-sm">
            <div className="h-[70vh] min-h-[460px]">
              {error ? (
                <div className="h-full flex items-center justify-center text-white/70 text-center px-6">
                  {isMn
                    ? "Одоогоор номыг ачаалж чадсангүй. Дараа дахин оролдоно уу."
                    : "The handbook could not be loaded right now. Please try again later."}
                </div>
              ) : !pdfUrl ? (
                <div className="h-full flex items-center justify-center text-white/70 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isMn ? "Ном ачаалж байна…" : "Loading book…"}
                </div>
              ) : isFullscreen ? (
                // Unmount the inline reader while the fullscreen reader is open, so
                // there is only ever one live viewer (one PDF load, one key handler).
                <div className="h-full flex items-center justify-center text-white/40 gap-2">
                  <BookOpen className="w-5 h-5" />
                  {isMn ? "Бүтэн дэлгэцэд нээгдсэн" : "Opened in fullscreen"}
                </div>
              ) : (
                <FlipbookViewer key={pdfUrl} pdfUrl={pdfUrl} locale={locale} variant="fullscreen" />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
