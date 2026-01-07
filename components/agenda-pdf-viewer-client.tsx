"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

// Ensure worker version matches the bundled pdfjs version.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

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
  const [shownStart, setShownStart] = useState(1)
  const [pendingStart, setPendingStart] = useState<number | null>(null)
  const [pendingRenderedCount, setPendingRenderedCount] = useState(0)
  const pendingRenderedPagesRef = useRef<Set<number>>(new Set())

  const [isDesktop, setIsDesktop] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null)
  const [fullscreenContainerWidth, setFullscreenContainerWidth] = useState(0)
  const [fullscreenContainerHeight, setFullscreenContainerHeight] = useState(0)

  const spreadStep = isDesktop ? 2 : 1

  const pdfFile = useMemo(() => ({ url: encodeURI(pdfUrl) }), [pdfUrl])

  useEffect(() => {
    setShownStart(1)
    setPendingStart(null)
    setPendingRenderedCount(0)
    pendingRenderedPagesRef.current.clear()
  }, [pdfUrl])

  useEffect(() => {
    const onResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
      setViewportWidth(window.innerWidth)
      setViewportHeight(window.innerHeight)
    }
    onResize()
    window.addEventListener("resize", onResize, { passive: true })
    return () => window.removeEventListener("resize", onResize)
  }, [])

  useEffect(() => {
    if (variant !== "inline") return
    const node = containerRef.current
    if (!node) return

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      const width = entry?.contentRect?.width ?? 0
      setContainerWidth(Math.floor(width))
    })

    ro.observe(node)
    return () => ro.disconnect()
  }, [variant])

  useEffect(() => {
    if (variant !== "fullscreen") return
    const node = fullscreenContainerRef.current
    if (!node) return

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      const width = entry?.contentRect?.width ?? 0
      const height = entry?.contentRect?.height ?? 0
      setFullscreenContainerWidth(Math.floor(width))
      setFullscreenContainerHeight(Math.floor(height))
    })

    ro.observe(node)
    return () => ro.disconnect()
  }, [variant])

  const pendingExists = pendingStart !== null

  const pendingRequiredCount = useMemo(() => {
    if (!pendingExists) return 0
    if (!numPages) return 0
    if (!isDesktop) return 1
    return pendingStart! + 1 <= numPages ? 2 : 1
  }, [isDesktop, numPages, pendingExists, pendingStart])

  const pendingReady = pendingExists && pendingRenderedCount >= pendingRequiredCount

  const targetStart = pendingStart ?? shownStart

  const canGoPrev = shownStart > 1 && !pendingExists
  const canGoNext = numPages > 0 && shownStart + (isDesktop ? 1 : 0) < numPages && !pendingExists

  const inlinePageWidth = useMemo(() => {
    if (!containerWidth) return undefined
    const gutter = isDesktop ? 24 : 0
    const max = isDesktop ? Math.floor((containerWidth - gutter) / 2) : containerWidth
    return Math.max(280, max)
  }, [containerWidth, isDesktop])

  const fullscreenPageHeight = useMemo(() => {
    const availableHeight = fullscreenContainerHeight || viewportHeight || 800
    const availableWidth = fullscreenContainerWidth || viewportWidth || 1024

    const padding = 32
    const gap = isDesktop ? 24 : 0

    const maxHeight = Math.max(320, Math.floor(availableHeight - padding))
    const maxWidthPerPage = Math.max(
      280,
      isDesktop
        ? Math.floor((availableWidth - padding - gap) / 2)
        : Math.floor(availableWidth - padding)
    )

    const ratio = pageAspectRatio || 0.707

    // Choose a height that guarantees width <= maxWidthPerPage.
    // width = ratio * height => height <= maxWidthPerPage / ratio
    const heightByWidth = Math.floor(maxWidthPerPage / ratio)
    return Math.max(280, Math.min(maxHeight, heightByWidth))
  }, [fullscreenContainerHeight, fullscreenContainerWidth, isDesktop, pageAspectRatio, viewportHeight, viewportWidth])

  const requestStartPage = (nextStart: number) => {
    if (!numPages) return
    if (pendingExists) return
    if (nextStart === shownStart) return

    pendingRenderedPagesRef.current.clear()
    setPendingRenderedCount(0)
    setPendingStart(nextStart)
  }

  const goPrev = () => requestStartPage(Math.max(1, shownStart - spreadStep))
  const goNext = () => {
    if (!numPages) return
    const maxStart = isDesktop ? Math.max(1, numPages - 1) : numPages
    requestStartPage(Math.min(maxStart, shownStart + spreadStep))
  }

  useEffect(() => {
    if (!pendingReady || pendingStart === null) return
    const t = window.setTimeout(() => {
      setShownStart(pendingStart)
      setPendingStart(null)
      setPendingRenderedCount(0)
      pendingRenderedPagesRef.current.clear()
    }, 80)
    return () => window.clearTimeout(t)
  }, [pendingReady, pendingStart])

  const onPendingRenderSuccess = (renderedPage: number) => {
    if (pendingStart === null) return
    if (renderedPage !== pendingStart && renderedPage !== pendingStart + 1) return
    if (pendingRenderedPagesRef.current.has(renderedPage)) return
    pendingRenderedPagesRef.current.add(renderedPage)
    setPendingRenderedCount((c) => c + 1)
  }

  const PageShell = ({ children }: { children: React.ReactNode }) => (
    <div className={cn(variant === "fullscreen" ? "bg-white rounded-xl shadow-lg overflow-hidden" : "bg-white rounded-xl shadow-md overflow-hidden")}>
      {children}
    </div>
  )

  const pageProps = useMemo(() => {
    if (variant === "fullscreen") {
      return {
        height: fullscreenPageHeight,
      }
    }
    return {
      width: inlinePageWidth,
    }
  }, [fullscreenPageHeight, inlinePageWidth, variant])

  const pagesLayout = isDesktop ? "grid grid-cols-2 gap-6" : "flex justify-center"

  return (
    <div className={cn(variant === "inline" ? "" : "h-full min-h-0 flex flex-col")}>
      <div
        className={cn(
          "flex items-center justify-between gap-3",
          variant === "inline" ? "px-6 py-4" : "mb-4 shrink-0"
        )}
      >
        <div className={cn(variant === "inline" ? "text-sm text-muted-foreground" : "text-white/80 text-sm")}>
          {numPages > 0 ? (
            <span>
              {locale === "mn" ? "Хуудас" : "Page"} {targetStart}
              {isDesktop && targetStart + 1 <= numPages ? `–${targetStart + 1}` : ""} / {numPages}
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
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50",
              variant === "inline"
                ? "bg-white hover:bg-white/90 text-foreground border border-secondary/60"
                : "bg-white/10 hover:bg-white/20 text-white disabled:hover:bg-white/10"
            )}
          >
            {locale === "mn" ? "Өмнөх" : "Prev"}
          </button>
          <button
            onClick={goNext}
            disabled={!canGoNext}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50",
              variant === "inline"
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-white/10 hover:bg-white/20 text-white disabled:hover:bg-white/10"
            )}
          >
            {locale === "mn" ? "Дараах" : "Next"}
          </button>
        </div>
      </div>

      <div
        ref={variant === "inline" ? containerRef : fullscreenContainerRef}
        className={cn(variant === "inline" ? "p-6" : "flex-1 min-h-0")}
      >
        <Document
          file={pdfFile}
          onLoadSuccess={async (pdf) => {
            setNumPages(pdf.numPages)
            try {
              const first = await pdf.getPage(1)
              const vp = first.getViewport({ scale: 1 })
              if (vp?.width && vp?.height) setPageAspectRatio(vp.width / vp.height)
            } catch {
              // ignore
            }
          }}
          loading={<div className={cn(variant === "inline" ? "text-muted-foreground" : "text-white/70")}>{locale === "mn" ? "Ачаалж байна…" : "Loading…"}</div>}
          error={<div className={cn(variant === "inline" ? "text-muted-foreground" : "text-white/70")}>{locale === "mn" ? "PDF ачаалж чадсангүй" : "Failed to load PDF"}</div>}
        >
          <div className={cn("relative", variant === "fullscreen" ? "h-full min-h-0 p-4" : "")}>
            <div
              className={cn(
                pagesLayout,
                pendingExists ? "opacity-70" : "opacity-100",
                "transition-opacity duration-200"
              )}
            >
              <PageShell>
                <Page
                  pageNumber={shownStart}
                  {...pageProps}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </PageShell>

              {isDesktop && shownStart + 1 <= numPages && (
                <PageShell>
                  <Page
                    pageNumber={shownStart + 1}
                    {...pageProps}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </PageShell>
              )}
            </div>

            {pendingExists && pendingStart !== null && (
              <div
                className={cn(
                  "absolute inset-0",
                  pendingReady ? "opacity-100" : "opacity-0",
                  "transition-opacity duration-200"
                )}
              >
                <div className={pagesLayout}>
                  <PageShell>
                    <Page
                      pageNumber={pendingStart}
                      {...pageProps}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      onRenderSuccess={() => onPendingRenderSuccess(pendingStart)}
                    />
                  </PageShell>

                  {isDesktop && pendingStart + 1 <= numPages && (
                    <PageShell>
                      <Page
                        pageNumber={pendingStart + 1}
                        {...pageProps}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        onRenderSuccess={() => onPendingRenderSuccess(pendingStart + 1)}
                      />
                    </PageShell>
                  )}
                </div>
              </div>
            )}
          </div>
        </Document>
      </div>
    </div>
  )
}
