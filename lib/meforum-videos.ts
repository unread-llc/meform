export interface LegacyVideo {
  title: string
  youtubeId: string
}

export const LEGACY_VIDEO_YEARS = [
  "2010",
  "2011",
  "2012",
  "2013",
  "2014",
  "2015",
  "2016",
  "2018",
  "2019",
  "2022",
  "2023",
  "2024",
] as const

const htmlEntityMap: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
}

function decodeHtmlEntities(input: string) {
  return input.replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (m) => htmlEntityMap[m] ?? m)
}

function stripTags(input: string) {
  return input.replace(/<[^>]*>/g, "")
}

function normalizeWhitespace(input: string) {
  return input.replace(/\s+/g, " ").trim()
}

export function youtubeIdToUrl(youtubeId: string) {
  return `https://youtu.be/${youtubeId}`
}

export function youtubeIdToEmbedUrl(youtubeId: string) {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`
}

export function extractLegacyVideosFromHtml(html: string): LegacyVideo[] {
  // Legacy page structure looks like:
  // <h4>Title</h4>
  // <iframe src="https://www.youtube.com/embed/<id>"></iframe>
  const videos: LegacyVideo[] = []
  const seen = new Set<string>()

  const pattern = /<h4[^>]*>([\s\S]*?)<\/h4>[\s\S]*?<iframe[^>]*src="([^"]*youtube\.com\/embed\/[^"?&/]+)[^"]*"/gi

  let match: RegExpExecArray | null
  while ((match = pattern.exec(html)) !== null) {
    const rawTitle = match[1] ?? ""
    const embedUrl = match[2] ?? ""

    const idMatch = /youtube\.com\/embed\/([^"?&/]+)/i.exec(embedUrl)
    const youtubeId = idMatch?.[1]
    if (!youtubeId || seen.has(youtubeId)) continue

    const title = normalizeWhitespace(stripTags(decodeHtmlEntities(rawTitle))) || `YouTube • ${youtubeId}`

    seen.add(youtubeId)
    videos.push({ title, youtubeId })
  }

  // Fallback: if the structure changes and we didn’t get any titles,
  // still try to extract embed IDs.
  if (videos.length === 0) {
    const embedPattern = /youtube\.com\/embed\/([^"?&/]+)/gi
    let embedMatch: RegExpExecArray | null
    while ((embedMatch = embedPattern.exec(html)) !== null) {
      const youtubeId = embedMatch[1]
      if (!youtubeId || seen.has(youtubeId)) continue
      seen.add(youtubeId)
      videos.push({ title: `YouTube • ${youtubeId}`, youtubeId })
    }
  }

  return videos
}

export async function fetchLegacyVideosByYear(year: string): Promise<LegacyVideo[]> {
  const url = `https://meforum.mn/videos/${year}`
  const res = await fetch(url, {
    next: { revalidate: 60 * 60 * 24 },
    headers: {
      // Some origins serve different HTML based on UA.
      "user-agent": "meform-bot/1.0 (+https://meforum.mn)",
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`)
  }

  const html = await res.text()
  return extractLegacyVideosFromHtml(html)
}
