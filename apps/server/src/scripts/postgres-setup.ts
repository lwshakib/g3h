import pool from "../services/postgres.services.js";
import logger from "../logger/winston.logger.js";

/**
 * Setup script to initialize the complete database schema.
 * includes: user, session, account, and verification tables.
 */
async function setup() {
  const client = await pool.connect();
  try {
    logger.info("Starting PostgreSQL complete schema setup...");

    // Create User table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        "emailVerified" BOOLEAN DEFAULT FALSE,
        image TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info("Table 'user' verified/created.");

    // Create Session table
    await client.query(`
      CREATE TABLE IF NOT EXISTS session (
        id VARCHAR(255) PRIMARY KEY,
        "expiresAt" TIMESTAMP NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "ipAddress" VARCHAR(45),
        "userAgent" TEXT,
        "userId" VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
      );
    `);
    logger.info("Table 'session' verified/created.");

    // Create Account table
    await client.query(`
      CREATE TABLE IF NOT EXISTS account (
        id VARCHAR(255) PRIMARY KEY,
        "accountId" VARCHAR(255) NOT NULL,
        "providerId" VARCHAR(255) NOT NULL,
        "userId" VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        "accessToken" TEXT,
        "refreshToken" TEXT,
        "idToken" TEXT,
        "accessTokenExpiresAt" TIMESTAMP,
        "refreshTokenExpiresAt" TIMESTAMP,
        scope TEXT,
        password TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info("Table 'account' verified/created.");

    // Create Verification table
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification (
        id VARCHAR(255) PRIMARY KEY,
        identifier VARCHAR(255) NOT NULL,
        value TEXT NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info("Table 'verification' verified/created.");

    // Add indexes
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_session_userId" ON session("userId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_account_userId" ON account("userId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_verification_identifier" ON verification(identifier);`);

    logger.info("PostgreSQL complete schema setup completed successfully.");
  } catch (error) {
    logger.error("Error during PostgreSQL setup:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setup();
