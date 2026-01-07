"use client"

import { useState } from "react"
import { Calendar, FileText, Download, Maximize2, X } from "lucide-react"
import dynamic from "next/dynamic"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const AgendaPdfViewerClient = dynamic(() => import("@/components/agenda-pdf-viewer-client"), {
  ssr: false,
  loading: () => <div className="text-muted-foreground p-6">Loading…</div>,
})

interface AgendaSectionProps {
  dict: any
  locale?: string
}

export function AgendaSection({ dict, locale = "en" }: AgendaSectionProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [year, setYear] = useState("2025")

  const getPdfUrl = (selectedYear: string, currentLocale: string) => {
    if (selectedYear === "2025") {
      return "/api/pdf/booklet_mef2025.pdf"
    }
    if (selectedYear === "2024") {
      return currentLocale === "mn"
        ? "/api/pdf/mef-mon-4.pdf"
        : "/api/pdf/mef-eng-4.pdf"
    }
    // Fallback to 2023
    return currentLocale === "mn"
      ? "/api/pdf/Meforum 2023 Agenda mon.pdf"
      : "/api/pdf/Meforum 2023 Agenda eng.pdf"
  }

  const pdfUrl = getPdfUrl(year, locale)
  const title = `MEF ${year} Agenda`

  return (
    <section id="agenda" className="min-h-screen">
      {/* Fullscreen PDF Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-black/50">
            <h3 className="text-white font-medium">
              {title} - {locale === "mn" ? "Монгол" : "English"}
            </h3>
            <div className="flex items-center gap-2">
              <a
                href={pdfUrl}
                download
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{dict.agenda?.download || "Download"}</span>
              </a>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-hidden">
            <div className="max-w-6xl mx-auto h-full flex flex-col">
              <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                <div className="h-full p-4">
                  <AgendaPdfViewerClient pdfUrl={pdfUrl} locale={locale} variant="fullscreen" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative py-32 bg-gradient-to-br from-foreground via-foreground to-primary/90 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6 border border-white/20">
            <Calendar className="w-4 h-4" />
            {dict.agenda?.label || "Forum Agenda"}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {dict.agenda?.title || "MEF 2025 Agenda"}
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            {dict.agenda?.description || "Explore the agenda."}
          </p>
        </div>
      </section>

      {/* PDF Actions */}
      <section className="sticky top-16 z-40 bg-white border-b border-secondary shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <FileText className="w-4 h-4 text-primary" />
                <span>PDF</span>
              </div>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-[100px] h-9 text-xs">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={pdfUrl}
                download
                className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary text-foreground rounded-xl font-medium text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{dict.agenda?.download || "Download"}</span>
              </a>
              <button
                onClick={() => setIsFullscreen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium text-sm transition-colors hover:bg-primary/90"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">{dict.agenda?.fullscreen || "Fullscreen"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PDF View */}
      <section className="py-8 bg-gradient-to-b from-white to-secondary/30 min-h-[80vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg border border-secondary/50 overflow-hidden">
            <div className="bg-secondary/30 px-6 py-4 border-b border-secondary/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {locale === "mn" ? "Монгол хэл дээр" : "English version"}
                  </p>
                </div>
              </div>
              <div />
            </div>

            <div className="bg-gray-100">
              <AgendaPdfViewerClient pdfUrl={pdfUrl} locale={locale} variant="inline" />
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {dict.agenda?.pdfNote || "Can't see the PDF? "}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {dict.agenda?.openNewTab || "Open in new tab"}
            </a>
          </p>
        </div>
      </section>
    </section>
  )
}
