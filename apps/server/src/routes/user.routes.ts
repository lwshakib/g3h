import { Router } from "express"
import { authMiddleware } from "../middlewares/auth.middlewares.js"
import { getUploadUrl, updateProfile } from "../controllers/user.controllers.js"

const router: Router = Router()

/**
 * Request Presigned Upload URL for Profile Image
 * 
 * Generates a secure PUT URL for direct client-side S3/R2 upload.
 */
router.post("/upload-url", authMiddleware, getUploadUrl)

/**
 * Update User Profile
 * 
 * Persists user metadata changes (name, image URL) to the PostgreSQL database.
 */
router.patch("/profile", authMiddleware, updateProfile)

export default router
