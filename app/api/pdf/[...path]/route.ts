import fs from "node:fs"
import path from "node:path"

export const runtime = "nodejs"

const DEFAULT_GITHUB_REPO = "unread-llc/meform"
const DEFAULT_GITHUB_REF = "main"

function getGithubMediaBase() {
  const repo = process.env.GITHUB_REPO || DEFAULT_GITHUB_REPO
  const ref = process.env.GITHUB_REF || DEFAULT_GITHUB_REF
  // GitHub raw returns LFS pointer text for LFS-managed files; media serves the real bytes.
  return `https://media.githubusercontent.com/media/${repo}/${ref}/public`
}

function encodePathSegments(relPath: string) {
  return relPath
    .split("/")
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join("/")
}

async function isGitLfsPointer(fileAbsPath: string) {
  try {
    const handle = await fs.promises.open(fileAbsPath, "r")
    try {
      const buf = Buffer.alloc(128)
      const { bytesRead } = await handle.read(buf, 0, buf.length, 0)
      const head = buf.subarray(0, bytesRead).toString("utf8")
      return head.startsWith("version https://git-lfs.github.com/spec/v1")
    } finally {
      await handle.close()
    }
  } catch {
    return false
  }
}

function parseRangeHeader(rangeHeader: string | null, size: number) {
  if (!rangeHeader) return null
  const m = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim())
  if (!m) return null

  const startRaw = m[1]
  const endRaw = m[2]

  // Suffix range: bytes=-500
  if (startRaw === "" && endRaw !== "") {
    const suffixLength = Number(endRaw)
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) return null
    const start = Math.max(0, size - suffixLength)
    const end = size - 1
    return { start, end }
  }

  const start = Number(startRaw)
  const end = endRaw === "" ? size - 1 : Number(endRaw)
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null
  if (start < 0 || end < start || start >= size) return null
  return { start, end: Math.min(end, size - 1) }
}

async function proxyFromGitHub(request: Request, fileRelPath: string, fileName: string) {
  const upstreamUrl = `${getGithubMediaBase()}/${encodePathSegments(fileRelPath)}`
  const range = request.headers.get("range")

  const upstream = await fetch(upstreamUrl, {
    headers: range ? { range } : undefined,
  })

  if (!upstream.ok || !upstream.body) {
    return new Response("Not found", { status: 404 })
  }

  const headers = new Headers()
  headers.set("Content-Type", "application/pdf")
  headers.set("Cache-Control", "public, max-age=86400")
  headers.set("Content-Disposition", `inline; filename="${fileName}"`)

  const contentLength = upstream.headers.get("content-length")
  const acceptRanges = upstream.headers.get("accept-ranges")
  const contentRange = upstream.headers.get("content-range")
  if (contentLength) headers.set("Content-Length", contentLength)
  if (acceptRanges) headers.set("Accept-Ranges", acceptRanges)
  if (contentRange) headers.set("Content-Range", contentRange)

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  })
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: parts } = await context.params

  if (!Array.isArray(parts) || parts.length === 0) {
    return new Response("Not found", { status: 404 })
  }

  // Prevent path traversal.
  if (parts.some((p) => p === ".." || p.includes("..") || p.includes("\\"))) {
    return new Response("Bad request", { status: 400 })
  }

  const fileRelPath = parts.join("/")
  if (!fileRelPath.toLowerCase().endsWith(".pdf")) {
    return new Response("Not found", { status: 404 })
  }
  const fileAbsPath = path.join(process.cwd(), "public", fileRelPath)

  const fileName = parts[parts.length - 1]

  // Try local filesystem first.
  let stat: fs.Stats | null = null
  try {
    const s = await fs.promises.stat(fileAbsPath)
    stat = s.isFile() ? s : null
  } catch {
    stat = null
  }

  // If missing OR is an LFS pointer, proxy from GitHub media.
  if (!stat || (await isGitLfsPointer(fileAbsPath))) {
    return proxyFromGitHub(request, fileRelPath, fileName)
  }

  const range = parseRangeHeader(request.headers.get("range"), stat.size)
  if (range) {
    const stream = fs.createReadStream(fileAbsPath, { start: range.start, end: range.end })
    return new Response(stream as any, {
      status: 206,
      headers: {
        "Content-Type": "application/pdf",
        "Accept-Ranges": "bytes",
        "Content-Range": `bytes ${range.start}-${range.end}/${stat.size}`,
        "Content-Length": String(range.end - range.start + 1),
        "Cache-Control": "public, max-age=86400",
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    })
  }

  const stream = fs.createReadStream(fileAbsPath)
  return new Response(stream as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(stat.size),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=86400",
      "Content-Disposition": `inline; filename="${fileName}"`,
    },
  })
}
