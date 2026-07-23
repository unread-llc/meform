"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Document, Page, pdfjs } from "react-pdf"
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type AnimationPlaybackControls,
} from "framer-motion"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

// Ensure the worker version matches the bundled pdfjs version.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const PDF_OPTIONS = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  wasmUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/wasm/`,
}

// Below this container width the book shows one page at a time.
const SPREAD_MIN_WIDTH = 680
const FLIP_DURATION = 0.75

type Variant = "inline" | "fullscreen"
type Dir = "next" | "prev"
type Mode = "single" | "spread"
type Spread = { left: number | null; right: number | null }

interface FlipDescriptor {
  dir: Dir
  mode: Mode
  // Page numbers rendered while the sheet turns.
  frontPage: number | null
  backPage: number | null
  staticLeft: number | null
  staticRight: number | null
  targetPage: number
}

// A real book: cover sits alone on the right, then pages pair up (2|3), (4|5)…
function buildSpreads(numPages: number): Spread[] {
  if (numPages <= 0) return []
  const spreads: Spread[] = [{ left: null, right: 1 }]
  for (let p = 2; p <= numPages; p += 2) {
    spreads.push({ left: p, right: p + 1 <= numPages ? p + 1 : null })
  }
  return spreads
}

function spreadIndexOf(page: number): number {
  return page <= 1 ? 0 : Math.floor(page / 2)
}

export default function FlipbookViewer({
  pdfUrl,
  locale,
  variant = "inline",
}: {
  pdfUrl: string
  locale: string
  variant?: Variant
}) {
  const isMn = locale === "mn"
  const [numPages, setNumPages] = useState(0)
  const [pageAspect, setPageAspect] = useState(0.707) // width / height
  const [loadError, setLoadError] = useState(false)

  // Single source of truth: the current left-most visible page (1-based).
  const [page, setPage] = useState(1)
  const [flip, setFlip] = useState<FlipDescriptor | null>(null)
  const flipRef = useRef<FlipDescriptor | null>(null)
  const animRef = useRef<AnimationPlaybackControls | null>(null)

  // Responsive sizing.
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  const progress = useMotionValue(0)

  const spreads = useMemo(() => buildSpreads(numPages), [numPages])
  const mode: Mode =
    containerWidth > 0 && containerWidth < SPREAD_MIN_WIDTH ? "single" : "spread"

  const pdfFile = useMemo(() => ({ url: pdfUrl }), [pdfUrl])

  // --- Resize observer -----------------------------------------------------
  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    let timeout: number
    const ro = new ResizeObserver((entries) => {
      window.clearTimeout(timeout)
      timeout = window.setTimeout(() => {
        const entry = entries[0]
        if (!entry) return
        setContainerWidth(Math.floor(entry.contentRect.width))
        setContainerHeight(Math.floor(entry.contentRect.height))
      }, 60)
    })
    ro.observe(node)
    const rect = node.getBoundingClientRect()
    setContainerWidth(Math.floor(rect.width))
    setContainerHeight(Math.floor(rect.height))
    return () => {
      ro.disconnect()
      window.clearTimeout(timeout)
    }
  }, [])

  // --- Page dimensions -----------------------------------------------------
  const { pageWidth, pageHeight } = useMemo(() => {
    if (!containerWidth || !containerHeight) return { pageWidth: 0, pageHeight: 0 }
    const padX = 32
    const padY = variant === "fullscreen" ? 24 : 56 // leave room for the control bar
    const availW = Math.max(160, containerWidth - padX)
    const availH = Math.max(160, containerHeight - padY)
    const slots = mode === "spread" ? 2 : 1
    // Constrain by both available width (per slot) and height.
    let w = Math.min(availW / slots, availH * pageAspect)
    w = Math.floor(w)
    const h = Math.round(w / pageAspect)
    return { pageWidth: w, pageHeight: h }
  }, [containerWidth, containerHeight, mode, pageAspect, variant])

  // --- Navigation ----------------------------------------------------------
  const k = spreadIndexOf(page)
  const canPrev = mode === "spread" ? k > 0 : page > 1
  const canNext =
    mode === "spread" ? k < spreads.length - 1 : page < numPages

  const commitFlip = useCallback(() => {
    const desc = flipRef.current
    if (desc) setPage(desc.targetPage)
    flipRef.current = null
    setFlip(null)
    progress.set(0)
  }, [progress])

  const startFlip = useCallback(
    (dir: Dir) => {
      if (flipRef.current || numPages === 0) return

      let desc: FlipDescriptor | null = null

      if (mode === "spread") {
        const cur = spreads[k]
        if (!cur) return
        if (dir === "next") {
          const nextSpread = spreads[k + 1]
          if (!nextSpread) return
          desc = {
            dir,
            mode,
            frontPage: cur.right,
            backPage: nextSpread.left,
            staticLeft: cur.left,
            staticRight: nextSpread.right,
            targetPage: nextSpread.left ?? nextSpread.right ?? page,
          }
        } else {
          const prevSpread = spreads[k - 1]
          if (!prevSpread) return
          desc = {
            dir,
            mode,
            frontPage: cur.left,
            backPage: prevSpread.right,
            staticLeft: prevSpread.left,
            staticRight: cur.right,
            targetPage: prevSpread.left ?? prevSpread.right ?? page,
          }
        }
      } else {
        // Single page mode.
        if (dir === "next") {
          if (page >= numPages) return
          desc = {
            dir,
            mode,
            frontPage: page,
            backPage: null,
            staticLeft: null,
            staticRight: page + 1, // revealed underneath
            targetPage: page + 1,
          }
        } else {
          if (page <= 1) return
          desc = {
            dir,
            mode,
            frontPage: page - 1,
            backPage: null,
            staticLeft: null,
            staticRight: page, // current page, covered as the previous one lands
            targetPage: page - 1,
          }
        }
      }

      if (!desc) return
      flipRef.current = desc
      setFlip(desc)

      // progress always runs 0 → 1; sheetRotate maps it to the right angle range.
      progress.set(0)
      animRef.current?.stop()
      animRef.current = animate(progress, 1, {
        duration: FLIP_DURATION,
        ease: [0.3, 0.1, 0.2, 1],
        onComplete: commitFlip,
      })
    },
    [mode, spreads, k, page, numPages, progress, commitFlip]
  )

  const goNext = useCallback(() => {
    if (canNext) startFlip("next")
  }, [canNext, startFlip])
  const goPrev = useCallback(() => {
    if (canPrev) startFlip("prev")
  }, [canPrev, startFlip])

  // Keyboard navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext()
      else if (e.key === "ArrowLeft") goPrev()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [goNext, goPrev])

  // Cancel any running flip on unmount.
  useEffect(() => () => animRef.current?.stop(), [])

  // If the layout mode flips (single <-> spread) while a page is turning — e.g.
  // a device rotation mid-animation — snap the flip to completion so the sheet's
  // captured geometry can't desync from the now-relaid-out static layers.
  useEffect(() => {
    if (flipRef.current) {
      animRef.current?.stop()
      commitFlip()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // Swipe / drag navigation.
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const onPointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const start = pointerStart.current
    pointerStart.current = null
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return
    if (dx < 0) goNext()
    else goPrev()
  }

  // --- Motion transforms (read the live descriptor via the ref) ------------
  const sheetRotate = useTransform(progress, (p) => {
    const desc = flipRef.current
    if (!desc) return 0
    if (desc.mode === "single") {
      // next: current page turns away 0 → -180.  prev: previous page unfolds -180 → 0.
      return desc.dir === "next" ? p * -180 : -180 + p * 180
    }
    // spread: right page turns left (0 → -180); left page turns right (0 → +180).
    return desc.dir === "next" ? p * -180 : p * 180
  })
  const shadeOpacity = useTransform(progress, (p) => Math.sin(p * Math.PI) * 0.5)

  // ------------------------------------------------------------------------

  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1

  const renderPage = useCallback(
    (pageNumber: number | null, key: string) => {
      if (pageNumber == null) return <BlankPage key={key} />
      return (
        <Page
          key={key}
          pageNumber={pageNumber}
          width={pageWidth}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          devicePixelRatio={dpr}
          loading={<PageSkeleton />}
          className="block"
        />
      )
    },
    [pageWidth, dpr]
  )

  const bookWidth = mode === "spread" ? pageWidth * 2 : pageWidth

  // Which pages the static layers show right now (during a flip they display the
  // revealed / soon-to-be-covered pages so the turn reads correctly).
  const cur = spreads[k] ?? { left: null, right: null }
  const staticLeftPage = flip ? flip.staticLeft : mode === "spread" ? cur.left : null
  const staticRightPage = flip
    ? flip.staticRight
    : mode === "spread"
      ? cur.right
      : page

  // Neighbours to pre-warm so the first flip has its faces ready.
  const preloadPages = useMemo(() => {
    const set = new Set<number>()
    const add = (n: number | null | undefined) => {
      if (n && n >= 1 && n <= numPages) set.add(n)
    }
    if (mode === "spread") {
      const nx = spreads[k + 1]
      const pv = spreads[k - 1]
      add(nx?.left); add(nx?.right); add(pv?.left); add(pv?.right)
    } else {
      add(page + 1); add(page - 1)
    }
    return Array.from(set)
  }, [mode, spreads, k, page, numPages])

  const pageIndicator =
    numPages > 0
      ? mode === "spread"
        ? (() => {
            const l = cur.left
            const r = cur.right
            const label = l && r ? `${l}–${r}` : `${l ?? r}`
            return `${isMn ? "Хуудас" : "Page"} ${label} / ${numPages}`
          })()
        : `${isMn ? "Хуудас" : "Page"} ${page} / ${numPages}`
      : isMn
        ? "Ачаалж байна…"
        : "Loading…"

  const isDark = variant === "fullscreen"

  return (
    <div className={cn("flex flex-col", variant === "fullscreen" ? "h-full" : "w-full")}>
      {/* Control bar */}
      <div
        className={cn(
          "flex items-center justify-between gap-4 select-none shrink-0",
          variant === "inline" ? "px-4 sm:px-6 py-3" : "px-2 pb-3"
        )}
      >
        <span
          className={cn(
            "text-sm font-medium tabular-nums",
            isDark ? "text-white/80" : "text-muted-foreground"
          )}
        >
          {pageIndicator}
        </span>
        <div className="flex items-center gap-2">
          <FlipButton dark={isDark} disabled={!canPrev || !!flip} onClick={goPrev} ariaLabel={isMn ? "Өмнөх" : "Previous"}>
            <ChevronLeft className="w-4 h-4" />
            <span className="inline">{isMn ? "Өмнөх" : "Prev"}</span>
          </FlipButton>
          <FlipButton dark={isDark} primary disabled={!canNext || !!flip} onClick={goNext} ariaLabel={isMn ? "Дараах" : "Next"}>
            <span className="inline">{isMn ? "Дараах" : "Next"}</span>
            <ChevronRight className="w-4 h-4" />
          </FlipButton>
        </div>
      </div>

      {/* Book stage */}
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        className={cn(
          "relative flex-1 min-h-0 flex items-center justify-center overflow-hidden",
          variant === "inline"
            ? "px-2 py-4 sm:py-8 bg-gradient-to-b from-gray-100 to-gray-200/70"
            : ""
        )}
        style={{ perspective: "2400px" }}
      >
        <Document
          file={pdfFile}
          options={PDF_OPTIONS}
          onLoadSuccess={async (pdf) => {
            setLoadError(false)
            setNumPages(pdf.numPages)
            setPage((p) => Math.min(Math.max(1, p), pdf.numPages))
            try {
              const first = await pdf.getPage(1)
              const vp = first.getViewport({ scale: 1 })
              if (vp?.width && vp?.height) setPageAspect(vp.width / vp.height)
            } catch {}
          }}
          onLoadError={() => setLoadError(true)}
          loading={
            <div className={cn("flex items-center gap-2 text-sm", isDark ? "text-white/80" : "text-muted-foreground")}>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isMn ? "Ном ачаалж байна…" : "Loading book…"}
            </div>
          }
          error={
            <div className="text-red-500 text-sm px-4 text-center">
              {isMn ? "PDF-г ачаалж чадсангүй." : "Could not load the PDF."}
            </div>
          }
          className="flex items-center justify-center"
        >
          {pageWidth > 0 && numPages > 0 && !loadError && (
            <div
              className="relative"
              style={{
                width: bookWidth,
                height: pageHeight,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Static left page (spread mode only) */}
              {mode === "spread" && (
                <PageShell
                  className="absolute top-0 left-0"
                  width={pageWidth}
                  height={pageHeight}
                  side="left"
                  pageNumber={staticLeftPage}
                >
                  {renderPage(staticLeftPage, `sl-${staticLeftPage}`)}
                </PageShell>
              )}

              {/* Static right page (also the sole page in single mode) */}
              <PageShell
                className="absolute top-0"
                style={{ left: mode === "spread" ? pageWidth : 0 }}
                width={pageWidth}
                height={pageHeight}
                side="right"
                pageNumber={staticRightPage}
              >
                {renderPage(staticRightPage, `sr-${staticRightPage}`)}
              </PageShell>

              {/* Center spine shadow (spread mode) */}
              {mode === "spread" && (
                <div
                  aria-hidden
                  className="absolute top-0 bottom-0 pointer-events-none z-[5]"
                  style={{
                    left: pageWidth - 22,
                    width: 44,
                    background:
                      "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.16) 48%, rgba(0,0,0,0.16) 52%, rgba(0,0,0,0) 100%)",
                  }}
                />
              )}

              {/* Flipping sheet */}
              {flip && (
                <motion.div
                  className="absolute top-0 z-[20]"
                  style={{
                    left:
                      flip.dir === "prev" || flip.mode === "single" ? 0 : pageWidth,
                    width: pageWidth,
                    height: pageHeight,
                    transformStyle: "preserve-3d",
                    transformOrigin:
                      flip.dir === "next" && flip.mode === "spread"
                        ? "left center"
                        : flip.mode === "single"
                          ? "left center"
                          : "right center",
                    rotateY: sheetRotate,
                    backfaceVisibility: "visible",
                  }}
                >
                  {/* Front face */}
                  <div
                    className="absolute inset-0"
                    style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                  >
                    <PageShell width={pageWidth} height={pageHeight} side={flip.dir === "next" ? "right" : "left"} pageNumber={flip.frontPage}>
                      {renderPage(flip.frontPage, `ff-${flip.frontPage}`)}
                    </PageShell>
                    <motion.div
                      aria-hidden
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        opacity: shadeOpacity,
                        background:
                          flip.dir === "next"
                            ? "linear-gradient(to left, rgba(0,0,0,0.55), rgba(0,0,0,0))"
                            : "linear-gradient(to right, rgba(0,0,0,0.55), rgba(0,0,0,0))",
                      }}
                    />
                  </div>
                  {/* Back face */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {flip.mode === "single" ? (
                      <BlankPage />
                    ) : (
                      <PageShell width={pageWidth} height={pageHeight} side={flip.dir === "next" ? "left" : "right"} pageNumber={flip.backPage}>
                        {renderPage(flip.backPage, `fb-${flip.backPage}`)}
                      </PageShell>
                    )}
                    <motion.div
                      aria-hidden
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        opacity: shadeOpacity,
                        background:
                          flip.dir === "next"
                            ? "linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0))"
                            : "linear-gradient(to left, rgba(0,0,0,0.4), rgba(0,0,0,0))",
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Click zones for turning pages */}
              {!flip && (
                <>
                  {canPrev && (
                    <button
                      type="button"
                      aria-label={isMn ? "Өмнөх хуудас" : "Previous page"}
                      onClick={goPrev}
                      className="absolute top-0 bottom-0 left-0 z-[15] w-[22%] cursor-w-resize focus:outline-none"
                      style={{ background: "transparent" }}
                    />
                  )}
                  {canNext && (
                    <button
                      type="button"
                      aria-label={isMn ? "Дараах хуудас" : "Next page"}
                      onClick={goNext}
                      className="absolute top-0 bottom-0 right-0 z-[15] w-[22%] cursor-e-resize focus:outline-none"
                      style={{ background: "transparent" }}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* Hidden pre-warm layer so flip faces are already rasterized */}
          <div className="absolute opacity-0 pointer-events-none -z-10" aria-hidden style={{ width: 0, height: 0, overflow: "hidden" }}>
            {pageWidth > 0 &&
              preloadPages.map((n) => (
                <Page
                  key={`pre-${n}`}
                  pageNumber={n}
                  width={pageWidth}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  devicePixelRatio={dpr}
                />
              ))}
          </div>
        </Document>
      </div>
    </div>
  )
}

// --- Presentational pieces -------------------------------------------------

function PageShell({
  children,
  width,
  height,
  side,
  pageNumber,
  className,
  style,
}: {
  children: React.ReactNode
  width: number
  height: number
  side: "left" | "right"
  pageNumber: number | null
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={cn("overflow-hidden bg-white", className)}
      style={{
        width,
        height,
        ...style,
        boxShadow:
          side === "left"
            ? "inset -14px 0 24px -14px rgba(0,0,0,0.28)"
            : "inset 14px 0 24px -14px rgba(0,0,0,0.28)",
        borderTopLeftRadius: side === "right" ? 2 : 6,
        borderBottomLeftRadius: side === "right" ? 2 : 6,
        borderTopRightRadius: side === "left" ? 2 : 6,
        borderBottomRightRadius: side === "left" ? 2 : 6,
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {children}
        {pageNumber != null && (
          <span
            className={cn(
              "absolute bottom-1.5 text-[10px] text-gray-400 font-medium select-none z-10 mix-blend-multiply",
              side === "left" ? "left-3" : "right-3"
            )}
          >
            {pageNumber}
          </span>
        )}
      </div>
    </div>
  )
}

function BlankPage() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#faf8f2] to-[#efe9dc]" />
  )
}

function PageSkeleton() {
  return (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center animate-pulse">
      <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
    </div>
  )
}

function FlipButton({
  children,
  onClick,
  disabled,
  primary,
  dark,
  ariaLabel,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  primary?: boolean
  dark?: boolean
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:active:scale-100 disabled:opacity-40 disabled:cursor-not-allowed",
        dark
          ? "bg-white/10 hover:bg-white/20 text-white"
          : primary
            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            : "bg-white hover:bg-gray-50 text-foreground border border-gray-200 shadow-sm"
      )}
    >
      {children}
    </button>
  )
}
