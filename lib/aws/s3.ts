import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
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

export async function getPresignedViewUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })
  return getSignedUrl(s3Client, command, { expiresIn: 3600 })
}
