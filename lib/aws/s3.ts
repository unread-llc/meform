import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// No explicit credentials — on Amplify, the SDK uses the IAM service role
// automatically. For local dev, configure ~/.aws/credentials or set
// AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY in your shell environment.
const s3Client = new S3Client({
  region: process.env.MEF_AWS_REGION || "ap-southeast-1",
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
})

const BUCKET = process.env.MEF_S3_BUCKET || "mef-registrations"

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  _maxSizeBytes: number = 5 * 1024 * 1024
): Promise<{ url: string; key: string }> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    // NOTE: Do NOT set ContentLength here — it forces the upload to be
    // exactly that size, breaking browser uploads. File size is validated
    // client-side before upload. S3 bucket lifecycle rules can clean up
    // oversized objects if needed.
  })

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 600,
    // Only sign the host header — minimizes CORS issues with browsers
    unhoistableHeaders: new Set(["content-type"]),
  })
  return { url, key }
}

export async function getPresignedViewUrl(
  key: string,
  expiresIn: number = 3600,
  downloadFilename?: string
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    // When set, the browser downloads (rather than inline-renders) the object,
    // which is the only way to force a download for a cross-origin S3 URL.
    ...(downloadFilename
      ? { ResponseContentDisposition: `attachment; filename="${downloadFilename}"` }
      : {}),
  })
  return getSignedUrl(s3Client, command, { expiresIn })
}

// --- Small JSON object helpers (used for the handbook pointer) ---

export async function putJsonObject(key: string, data: unknown): Promise<void> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
      CacheControl: "no-store",
    })
  )
}

export async function getJsonObject<T = unknown>(key: string): Promise<T | null> {
  try {
    const res = await s3Client.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: key })
    )
    const body = await res.Body?.transformToString()
    if (!body) return null
    return JSON.parse(body) as T
  } catch (err: any) {
    if (
      err?.name === "NoSuchKey" ||
      err?.Code === "NoSuchKey" ||
      err?.$metadata?.httpStatusCode === 404
    ) {
      return null
    }
    throw err
  }
}

// Returns the object's size in bytes, or null if it does not exist.
export async function getObjectContentLength(key: string): Promise<number | null> {
  try {
    const res = await s3Client.send(
      new HeadObjectCommand({ Bucket: BUCKET, Key: key })
    )
    return typeof res.ContentLength === "number" ? res.ContentLength : null
  } catch (err: any) {
    if (err?.name === "NotFound" || err?.$metadata?.httpStatusCode === 404) {
      return null
    }
    throw err
  }
}

export async function deleteObject(key: string): Promise<void> {
  await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}
