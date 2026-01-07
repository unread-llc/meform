import fs from "node:fs"
import path from "node:path"

export const runtime = "nodejs"

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

  return new Response(stream as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
