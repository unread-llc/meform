"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BookOpen,
  Upload,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react"

const MAX_BYTES = 60 * 1024 * 1024

interface Pointer {
  key: string
  title: string
  version: number
  updated_at: string
  size?: number
  original_filename?: string
}

function formatBytes(n?: number) {
  if (!n) return ""
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

// Direct-to-S3 PUT with upload progress (fetch has no upload progress events).
function putWithProgress(
  url: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", url)
    xhr.setRequestHeader("Content-Type", "application/pdf")
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`S3 rejected the upload (HTTP ${xhr.status}).`))
    }
    xhr.onerror = () =>
      reject(
        new Error(
          "Upload was blocked by the browser (likely S3 CORS). Ensure the bucket allows PUT from this site."
        )
      )
    xhr.send(file)
  })
}

export default function HandbookAdmin({ password }: { password: string }) {
  const [pointer, setPointer] = useState<Pointer | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [title, setTitle] = useState("")
  const [titleTouched, setTitleTouched] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<string>("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const loadStatus = useCallback(async () => {
    setLoadingStatus(true)
    try {
      const res = await fetch("/api/admin/handbook", {
        headers: { "x-admin-password": password },
        cache: "no-store",
      })
      if (res.ok) {
        const data = await res.json()
        setPointer(data.pointer || null)
        if (!titleTouched) {
          setTitle(data.pointer?.title || "Mongolia Handbook 2026")
        }
      }
    } catch {
      /* non-fatal */
    } finally {
      setLoadingStatus(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  const pickFile = (f: File | null) => {
    setError("")
    setSuccess(false)
    if (!f) return
    if (f.type !== "application/pdf") {
      setError("Please choose a PDF file.")
      return
    }
    if (f.size > MAX_BYTES) {
      setError("File is too large. Maximum size is 60MB.")
      return
    }
    setFile(f)
  }

  const publish = async () => {
    if (!file) return
    setBusy(true)
    setError("")
    setSuccess(false)
    setProgress(0)
    try {
      setPhase("Preparing upload…")
      const presignRes = await fetch("/api/admin/handbook/presign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ contentType: "application/pdf", size: file.size }),
      })
      if (!presignRes.ok) {
        const err = await presignRes.json().catch(() => ({}))
        throw new Error(err.error || "Could not start the upload.")
      }
      const { url, key } = await presignRes.json()

      setPhase("Uploading…")
      await putWithProgress(url, file, setProgress)

      setPhase("Publishing…")
      const publishRes = await fetch("/api/admin/handbook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          key,
          title: title.trim() || "Mongolia Handbook 2026",
          size: file.size,
          filename: file.name,
        }),
      })
      if (!publishRes.ok) {
        const err = await publishRes.json().catch(() => ({}))
        throw new Error(err.error || "Could not publish the handbook.")
      }

      setSuccess(true)
      setFile(null)
      if (inputRef.current) inputRef.current.value = ""
      await loadStatus()
    } catch (e: any) {
      setError(e?.message || "Something went wrong.")
    } finally {
      setBusy(false)
      setPhase("")
    }
  }

  return (
    <Card className="rounded-2xl mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="w-5 h-5 text-primary" />
          Mongolia Handbook 2026
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current status */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {loadingStatus ? (
            <span className="text-muted-foreground inline-flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading status…
            </span>
          ) : pointer ? (
            <>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Published
              </span>
              <span className="text-foreground font-medium">{pointer.title}</span>
              <span className="text-muted-foreground">
                {pointer.original_filename ? `${pointer.original_filename} · ` : ""}
                {formatBytes(pointer.size)}
                {pointer.updated_at
                  ? ` · updated ${new Date(pointer.updated_at).toLocaleString()}`
                  : ""}
              </span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> Showing placeholder — no file uploaded yet
            </span>
          )}
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Title</label>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setTitleTouched(true)
            }}
            placeholder="Mongolia Handbook 2026"
            disabled={busy}
          />
        </div>

        {/* File picker */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Handbook PDF</label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (busy) return
              pickFile(e.dataTransfer.files?.[0] || null)
            }}
            onClick={() => !busy && inputRef.current?.click()}
            className="flex items-center gap-3 rounded-xl border border-dashed border-input px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {file ? (
                <FileText className="w-4 h-4 text-primary" />
              ) : (
                <Upload className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              {file ? (
                <p className="text-sm font-medium truncate">
                  {file.name}{" "}
                  <span className="text-muted-foreground font-normal">
                    ({formatBytes(file.size)})
                  </span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click to choose or drop a PDF (max 60MB)
                </p>
              )}
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* Progress */}
        {busy && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{phase}</span>
              {phase === "Uploading…" && <span>{progress}%</span>}
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: phase === "Uploading…" ? `${progress}%` : "100%" }}
              />
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Published. The public page now shows the new handbook.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button onClick={publish} disabled={!file || busy}>
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Working…
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-1.5" /> Upload & Publish
              </>
            )}
          </Button>
          <a
            href="/YGL/mongoliahandbook2026"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            Open public page <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
