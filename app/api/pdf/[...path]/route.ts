import fs from "node:fs"
import path from "node:path"

export const runtime = "nodejs"

const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/unread-llc/meform/main/public"

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

export async function GET(
  _request: Request,
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

  try {
    const stat = await fs.promises.stat(fileAbsPath)
    if (!stat.isFile()) {
      return new Response("Not found", { status: 404 })
    }
  } catch {
    return new Response("Not found", { status: 404 })
  }

  const stream = fs.createReadStream(fileAbsPath)

  // If Amplify (or any CI) cloned without pulling Git LFS, the file on disk will be
  // a small text pointer. In that case, proxy the real PDF from GitHub raw.
  if (await isGitLfsPointer(fileAbsPath)) {
    const upstreamUrl = `${GITHUB_RAW_BASE}/${encodePathSegments(fileRelPath)}`
    const upstream = await fetch(upstreamUrl)
    if (!upstream.ok || !upstream.body) {
      return new Response("Not found", { status: 404 })
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/pdf",
        "Cache-Control": "public, max-age=86400",
        "Content-Disposition": `inline; filename="${parts[parts.length - 1]}"`,
      },
    })
  }

  return new Response(stream as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Cache-Control": "public, max-age=86400",
      "Content-Disposition": `inline; filename="${parts[parts.length - 1]}"`,
    },
  })
}
