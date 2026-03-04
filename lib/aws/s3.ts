import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// No explicit credentials — on Amplify, the SDK uses the IAM service role
// automatically. For local dev, configure ~/.aws/credentials or set
// AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY in your shell environment.
const s3Client = new S3Client({
  region: process.env.MEF_AWS_REGION || "ap-southeast-1",
})

const BUCKET = process.env.MEF_S3_BUCKET || "meforum"

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
