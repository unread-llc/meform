"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { Loader2 } from "lucide-react"

// Keep the worker version aligned with the bundled pdfjs version.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const PDF_OPTIONS = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  wasmUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/wasm/`,
}

// Cap page width on large screens for readability; on mobile this is the full
// viewport width so each page fits exactly — no zoom, no horizontal scroll.
const MAX_PAGE_WIDTH = 820

export default function ProgramPdfViewerClient({ pdfUrl }: { pdfUrl: string }) {
  const [numPages, setNumPages] = useState(0)
  const [width, setWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const file = useMemo(() => ({ url: encodeURI(pdfUrl) }), [pdfUrl])
  const dpr = useMemo(() => Math.min(window.devicePixelRatio || 1, 2), [])

  // Track the container width and size every page to fit it.
  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const update = () => setWidth(Math.min(node.clientWidth, MAX_PAGE_WIDTH))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(node)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen w-full flex-col items-center gap-2 bg-neutral-100 py-2"
    >
      <Document
        file={file}
        options={PDF_OPTIONS}
        onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}
        loading={
          <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        }
        error={
          <div className="flex min-h-screen items-center justify-center text-sm text-red-500">
            Error loading PDF.
          </div>
        }
        className="flex w-full flex-col items-center gap-2"
      >
        {width > 0 &&
          Array.from({ length: numPages }, (_, i) => (
            <Page
              key={i}
              pageNumber={i + 1}
              width={width}
              devicePixelRatio={dpr}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-sm"
              loading={
                <div
                  style={{ width, height: width * 1.41 }}
                  className="animate-pulse bg-neutral-200"
                />
              }
            />
          ))}
      </Document>
    </div>
  )
}
