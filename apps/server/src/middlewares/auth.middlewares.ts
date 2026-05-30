import { Router, Request, Response, NextFunction } from "express"
import { postgresService } from "../services/postgres.services.js"
import logger from "../logger/winston.logger.js"

/**
 * Enhanced Authentication Middleware
 * 
 * Intercepts incoming requests to validate the session protocol via Authorization header.
 * Attaches the authenticated user object to the request context.
 */
export async function authMiddleware(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized: Missing session protocol." })
  }

  const token = authHeader.split(" ")[1]

  try {
    const { rows } = await postgresService.pool.query(
      'SELECT s.*, u.email, u.name, u.image, u."emailVerified" FROM session s JOIN "user" u ON s."userId" = u.id WHERE s.token = $1 AND s."expiresAt" > CURRENT_TIMESTAMP',
      [token]
    )

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired session." })
    }

    const sessionData = rows[0]
    req.user = {
      id: sessionData.userId,
      email: sessionData.email,
      name: sessionData.name,
      image: sessionData.image,
      emailVerified: sessionData.emailVerified,
    }
    
    next()
  } catch (error: any) {
    logger.error(`[AuthMiddleware] Session validation failed: ${error.message}`)
    res.status(500).json({ success: false, message: "Internal server error during authentication." })
  }
}
