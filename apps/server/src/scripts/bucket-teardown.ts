import { DeleteBucketCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3"
import { s3Service } from "../services/s3.services.js"
import { AWS_S3_BUCKET_NAME } from "../envs.js"
import logger from "../logger/winston.logger.js"

/**
 * Script to programmatically delete the storage bucket and its contents.
 * 
 * ⚠️ WARNING: THIS WILL PERMANENTLY DELETE ALL BUCKET OBJECTS.
 */
async function teardownBucket() {
  const client = s3Service.getClient()
  const bucket = AWS_S3_BUCKET_NAME

  try {
    logger.info(`[BucketTeardown] Starting teardown for bucket: ${bucket}...`)

    // 1. Empty Bucket First (Required before deletion)
    const listObjects = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
    }))

    if (listObjects.Contents && listObjects.Contents.length > 0) {
      logger.info(`[BucketTeardown] Found ${listObjects.Contents.length} objects. Deleting...`)
      
      const deleteParams = {
        Bucket: bucket,
        Delete: {
          Objects: listObjects.Contents.map(({ Key }) => ({ Key })),
        },
      }

      await client.send(new DeleteObjectsCommand(deleteParams))
      logger.info(`[BucketTeardown] ✅ Bucket contents emptied.`)
    } else {
      logger.info(`[BucketTeardown] ℹ️ Bucket already empty.`)
    }

    // 2. Delete Bucket
    await client.send(new DeleteBucketCommand({
      Bucket: bucket,
    }))
    logger.info(`[BucketTeardown] 💥 Bucket "${bucket}" destroyed.`)

  } catch (error: any) {
    if (error.name === "NoSuchBucket") {
      logger.warn(`[BucketTeardown] ℹ️ Bucket "${bucket}" does not exist. Skipping teardown.`)
    } else {
      logger.error(`[BucketTeardown] ❌ Failed to teardown bucket:`, error)
      process.exit(1)
    }
  }
}

teardownBucket()
