"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Document, Page, pdfjs } from "react-pdf"
import { motion, AnimatePresence } from "framer-motion"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { Loader2 } from "lucide-react"

// Ensure worker version matches the bundled pdfjs version.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const PDF_OPTIONS = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  wasmUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/wasm/`,
}

type Variant = "inline" | "fullscreen"

export default function AgendaPdfViewerClient({
  pdfUrl,
  locale,
  variant,
}: {
  pdfUrl: string
  locale: string
  variant: Variant
}) {
  const [numPages, setNumPages] = useState(0)
  const [pageAspectRatio, setPageAspectRatio] = useState(0.707) // A4 portrait-ish fallback
  const [currentPage, setCurrentPage] = useState(1) // Always the left-most page index

  // Responsive state
  const [isDesktop, setIsDesktop] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const spreadStep = isDesktop ? 2 : 1
  const pdfFile = useMemo(() => ({ url: encodeURI(pdfUrl) }), [pdfUrl])

  // Resize Observer
  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    let timeoutId: number
    const ro = new ResizeObserver((entries) => {
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => {
        const entry = entries[0]
        if (!entry) return
        const width = entry.contentRect.width
        const height = entry.contentRect.height
        setContainerWidth(Math.floor(width))
        setContainerHeight(Math.floor(height))
        setIsDesktop(window.innerWidth >= 1024)
      }, 50)
    })

    ro.observe(node)

    // Initial check
    setIsDesktop(window.innerWidth >= 1024)
    if (node) {
      setContainerWidth(node.getBoundingClientRect().width)
      setContainerHeight(node.getBoundingClientRect().height)
    }

    return () => {
      ro.disconnect()
      window.clearTimeout(timeoutId)
    }
  }, [])

  // Navigation
  const canGoPrev = currentPage > 1
  const canGoNext = numPages > 0 && currentPage + (isDesktop ? 1 : 0) < numPages

  const goPrev = () => {
    if (!canGoPrev) return
    setCurrentPage((prev) => Math.max(1, prev - spreadStep))
  }

  const goNext = () => {
    if (!canGoNext) return
    setCurrentPage((prev) => Math.min(numPages, prev + spreadStep))
  }

  // Dimension Calculations
  const { pageWidth, pageHeight } = useMemo(() => {
    // Default fallback
    if (!containerWidth) return { pageWidth: 300, pageHeight: 400 }

    const gutter = isDesktop ? 24 : 0
    const padding = variant === "inline" ? 48 : 32 // Approximate padding inside container

    const availableWidth = Math.max(300, containerWidth - padding)
    const availableHeight = Math.max(300, containerHeight - padding)

    if (variant === "inline") {
      // Inline: Width constrained
      const maxColWidth = isDesktop ? (availableWidth - gutter) / 2 : availableWidth
      return {
        pageWidth: Math.floor(maxColWidth),
        pageHeight: undefined // Auto height
      }
    } else {
      // Fullscreen: Fit within box
      // Target is spread layout
      const targetSpreadWidth = availableWidth
      const targetSingleWidth = isDesktop ? (targetSpreadWidth - gutter) / 2 : targetSpreadWidth

      const ratio = pageAspectRatio || 0.707

      // Check if limited by height
      // h = w / ratio
      let w = targetSingleWidth
      let h = w / ratio

      if (h > availableHeight) {
        h = availableHeight
        w = h * ratio
      }

      return {
        pageWidth: Math.floor(w),
        pageHeight: Math.floor(h)
      }
    }
  }, [containerWidth, containerHeight, isDesktop, variant, pageAspectRatio])

  const PageShell = ({ children, pageNum }: { children: React.ReactNode, pageNum: number }) => (
    <div
      className={cn(
        "relative overflow-hidden bg-white shadow-sm transition-all",
        variant === "fullscreen" ? "rounded-sm" : "rounded-xl border border-border/50"
      )}
      style={{
        width: pageWidth,
        height: pageHeight ? pageHeight : undefined,
        aspectRatio: pageHeight ? undefined : pageAspectRatio,
      }}
    >
        {children}
        {/* Page Number Indicator for print feel */}
        <div className="absolute bottom-2 right-3 text-[10px] text-gray-400 font-medium select-none z-10 mix-blend-multiply">
            {pageNum}
        </div>
    </div>
  )

  const LoadingSkeleton = () => (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center animate-pulse">
        <Loader2 className="w-8 h-8 text-gray-200 animate-spin" />
    </div>
  )

  return (
    <div className={cn("flex flex-col", variant === "fullscreen" ? "h-full" : "w-full")}>
      {/* Header / Controls */}
      <div className={cn(
          "flex items-center justify-between gap-4 select-none",
          variant === "inline" ? "px-6 py-4" : "mb-4 shrink-0"
        )}>
           <div className={cn(variant === "inline" ? "text-sm text-muted-foreground" : "text-white/80 text-sm")}>
            {numPages > 0 ? (
                <span className="font-medium">
                {locale === "mn" ? "Хуудас" : "Page"} {currentPage}
                {isDesktop && currentPage + 1 <= numPages ? `–${currentPage + 1}` : ""}
                <span className="opacity-50 mx-1">/</span> {numPages}
                </span>
            ) : (
                <span>{locale === "mn" ? "Ачаалж байна…" : "Loading…"}</span>
            )}
            </div>

            <div className="flex items-center gap-2">
            <button
                onClick={goPrev}
                disabled={!canGoPrev}
                className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:active:scale-100 disabled:opacity-50",
                variant === "inline"
                    ? "bg-white hover:bg-gray-50 text-foreground border border-gray-200 shadow-sm"
                    : "bg-white/10 hover:bg-white/20 text-white disabled:hover:bg-white/10"
                )}
            >
                {locale === "mn" ? "Өмнөх" : "Prev"}
            </button>
            <button
                onClick={goNext}
                disabled={!canGoNext}
                className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:active:scale-100 disabled:opacity-50",
                variant === "inline"
                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                    : "bg-white/10 hover:bg-white/20 text-white disabled:hover:bg-white/10"
                )}
            >
                {locale === "mn" ? "Дараах" : "Next"}
            </button>
            </div>
      </div>

      {/* Main Content Area */}
      <div
        ref={containerRef}
        className={cn(
            "relative flex-1 min-h-0 flex items-center justify-center overflow-hidden",
            variant === "inline" ? "p-4 md:p-8 bg-gray-50/50 rounded-2xl border border-gray-100" : ""
        )}
      >
        <Document
          file={pdfFile}
          options={PDF_OPTIONS}
          onLoadSuccess={async (pdf) => {
            setNumPages(pdf.numPages)
            try {
              const first = await pdf.getPage(1)
              const vp = first.getViewport({ scale: 1 })
              if (vp?.width && vp?.height) setPageAspectRatio(vp.width / vp.height)
            } catch {}
          }}
          loading={
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {locale === "mn" ? "Ачаалж байна…" : "Loading…"}
            </div>
           }
           error={<div className="text-red-500 text-sm">Error loading PDF.</div>}
           className="flex items-center justify-center w-full h-full"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={cn(
                        "grid gap-4 md:gap-8 mx-auto",
                        isDesktop ? "grid-cols-2" : "grid-cols-1"
                    )}
                >
                    {/* Left Page */}
                    <div className="flex justify-center">
                        <PageShell pageNum={currentPage}>
                             <Page
                                key={`page_${currentPage}`}
                                pageNumber={currentPage}
                                width={pageWidth}
                                height={pageHeight}
                                className="block"
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                loading={<LoadingSkeleton />}
                                devicePixelRatio={Math.min(window.devicePixelRatio, 2)}
                             />
                        </PageShell>
                    </div>

                    {/* Right Page (Desktop Only) */}
                    {isDesktop && currentPage + 1 <= numPages && (
                        <div className="flex justify-center">
                            <PageShell pageNum={currentPage + 1}>
                                <Page
                                    key={`page_${currentPage + 1}`}
                                    pageNumber={currentPage + 1}
                                    width={pageWidth}
                                    height={pageHeight}
                                    className="block"
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    loading={<LoadingSkeleton />}
                                    devicePixelRatio={Math.min(window.devicePixelRatio, 2)}
                                />
                            </PageShell>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Hidden Preloader for Next Page to warm up cache */}
            <div className="hidden" aria-hidden="true">
                {currentPage + spreadStep <= numPages && (
                     <Page
                        pageNumber={currentPage + spreadStep}
                        width={100} // Small render just to trigger fetch
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                     />
                )}
            </div>

        </Document>
      </div>
    </div>
  )
}
