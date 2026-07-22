import {
  getJsonObject,
  putJsonObject,
  getPresignedViewUrl,
} from "@/lib/aws/s3"

// Identifier for the "Participant Handbook 2026" book. The id/URL slug stays
// "mongoliahandbook2026" for stable links even though the display title changed.
export const HANDBOOK_ID = "mongoliahandbook2026"

// S3 prefix that holds uploaded handbook PDFs (versioned by uuid).
export const HANDBOOK_PREFIX = `handbook/${HANDBOOK_ID}`

// S3 key of the pointer JSON that records the currently published version.
export const HANDBOOK_POINTER_KEY = `handbook/${HANDBOOK_ID}.pointer.json`

// Bundled placeholder shown until a real handbook is uploaded.
export const PLACEHOLDER_URL = "/handbook-placeholder.pdf"

export const DEFAULT_TITLE = "Participant Handbook 2026"

// Filename presented when a visitor downloads the handbook.
export const DOWNLOAD_FILENAME = "Participant-Handbook-2026.pdf"

// Max upload size for the handbook PDF (uploaded direct-to-S3 via presigned PUT).
export const HANDBOOK_MAX_BYTES = 60 * 1024 * 1024 // 60 MB

// Presigned view URLs live long enough for a full reading session.
const VIEW_URL_TTL = 6 * 60 * 60 // 6 hours

export interface HandbookPointer {
  /** S3 key of the current PDF. */
  key: string
  title: string
  /** Epoch ms of the last publish — used for cache-busting on the client. */
  version: number
  updated_at: string
  size?: number
  original_filename?: string
}

export interface HandbookState {
  source: "uploaded" | "placeholder"
  /** A directly loadable URL (presigned S3 URL, or the bundled placeholder). */
  url: string
  /** Same object, but forces a file download (Content-Disposition: attachment). */
  downloadUrl: string
  title: string
  version: number
  updatedAt: string | null
}

export async function getHandbookPointer(): Promise<HandbookPointer | null> {
  return getJsonObject<HandbookPointer>(HANDBOOK_POINTER_KEY)
}

export async function putHandbookPointer(pointer: HandbookPointer): Promise<void> {
  await putJsonObject(HANDBOOK_POINTER_KEY, pointer)
}

// Validate that a key looks like one of our uploaded handbook objects. Guards
// the publish endpoint from being pointed at an arbitrary bucket object.
export function isValidHandbookKey(key: unknown): key is string {
  return (
    typeof key === "string" &&
    key.startsWith(`${HANDBOOK_PREFIX}/`) &&
    key.endsWith(".pdf") &&
    !key.includes("..")
  )
}

export const placeholderState: HandbookState = {
  source: "placeholder",
  url: PLACEHOLDER_URL,
  downloadUrl: PLACEHOLDER_URL,
  title: DEFAULT_TITLE,
  version: 0,
  updatedAt: null,
}

// Resolve the current handbook into a viewable state. Falls back to the bundled
// placeholder only when nothing has been published. Genuine lookup errors
// (throttling, permissions, timeouts) are NOT swallowed here — they propagate so
// the caller can log them and decide how to fail soft.
export async function resolveHandbook(): Promise<HandbookState> {
  const pointer = await getHandbookPointer()
  if (!pointer?.key) return placeholderState

  const [url, downloadUrl] = await Promise.all([
    getPresignedViewUrl(pointer.key, VIEW_URL_TTL),
    getPresignedViewUrl(pointer.key, VIEW_URL_TTL, DOWNLOAD_FILENAME),
  ])
  return {
    source: "uploaded",
    url,
    downloadUrl,
    title: pointer.title || DEFAULT_TITLE,
    version: pointer.version || 0,
    updatedAt: pointer.updated_at || null,
  }
}
