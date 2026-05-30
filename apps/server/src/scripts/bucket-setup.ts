import { CreateBucketCommand, PutBucketCorsCommand, PutPublicAccessBlockCommand } from "@aws-sdk/client-s3"
import { s3Service } from "../services/s3.services.js"
import { AWS_S3_BUCKET_NAME } from "../envs.js"
import logger from "../logger/winston.logger.js"

/**
 * Script to programmatically create and configure the storage bucket.
 * 
 * Sets up:
 * 1. Bucket Creation
 * 2. Public Access Block (Relaxed for public assets)
 * 3. CORS Configuration for Cloudflare R2 / AWS S3
 */
async function setupBucket() {
  const client = s3Service.getClient()
  const bucket = AWS_S3_BUCKET_NAME

  try {
    logger.info(`[BucketSetup] Initializing bucket: ${bucket}...`)

    // 1. Create Bucket
    try {
      await client.send(new CreateBucketCommand({
        Bucket: bucket,
      }))
      logger.info(`[BucketSetup] ✅ Bucket created successfully.`)
    } catch (error: any) {
      if (error.name === "BucketAlreadyOwnedByYou" || error.name === "BucketAlreadyExists") {
        logger.warn(`[BucketSetup] ℹ️ Bucket "${bucket}" already exists. Proceeding with configuration.`)
      } else {
        throw error
      }
    }

    // 2. Configure Public Access Block (Ensure we can serve images)
    try {
      await client.send(new PutPublicAccessBlockCommand({
        Bucket: bucket,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: false,
          IgnorePublicAcls: false,
          BlockPublicPolicy: false,
          RestrictPublicBuckets: false,
        },
      }))
      logger.info(`[BucketSetup] ✅ Public access blocks configured.`)
    } catch (error: any) {
      if (error.name === "NotImplemented" || error.message?.includes("not implemented")) {
        logger.warn(`[BucketSetup] ℹ️ Public Access Block not supported by this provider (R2). Skipping.`)
      } else {
        throw error
      }
    }

    // 3. Configure CORS
    await client.send(new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            AllowedOrigins: ["*"], // Restrict this in production to your WEB_URL
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    }))
    logger.info(`[BucketSetup] ✅ CORS rules applied.`)

    logger.info(`[BucketSetup] 🚀 Infrastructure ready.`)
  } catch (error: any) {
    logger.error(`[BucketSetup] ❌ Failed to setup bucket:`, error)
    process.exit(1)
  }
}

setupBucket()
