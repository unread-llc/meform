/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Pass build-time env vars to the server runtime (Amplify Lambda).
  // Amplify injects env vars at build time but not at SSR runtime,
  // so we embed them into the bundle here.
  env: {
    MEF_AWS_REGION: process.env.MEF_AWS_REGION,
    MEF_S3_BUCKET: process.env.MEF_S3_BUCKET,
    MEF_DYNAMODB_TABLE: process.env.MEF_DYNAMODB_TABLE,
    BYL_API_TOKEN: process.env.BYL_API_TOKEN,
    BYL_PROJECT_ID: process.env.BYL_PROJECT_ID,
    BYL_WEBHOOK_SECRET: process.env.BYL_WEBHOOK_SECRET,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
}

export default nextConfig
