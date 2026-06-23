"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const ProgramPdfViewerClient = dynamic(
  () => import("@/components/program-pdf-viewer-client"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    ),
  }
)

export function ProgramPdf({ pdfUrl }: { pdfUrl: string }) {
  return <ProgramPdfViewerClient pdfUrl={pdfUrl} />
}
