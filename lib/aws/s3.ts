import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.AWS_S3_BUCKET || "mef-registrations"

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  maxSizeBytes: number = 5 * 1024 * 1024
): Promise<{ url: string; key: string }> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    // Enforce max file size at the S3 level — uploads larger than this
    // will be rejected by S3 even though the presigned URL is valid.
    ContentLength: maxSizeBytes,
  })

  const url = await getSignedUrl(s3Client, command, { expiresIn: 600 })
  return { url, key }
}
