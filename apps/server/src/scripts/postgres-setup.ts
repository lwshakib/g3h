import pool from "../services/postgres.services.js";
import logger from "../logger/winston.logger.js";

/**
 * Setup script to initialize the complete database schema.
 * includes auth + workflow automation tables.
 */
async function setup() {
  const client = await pool.connect();
  try {
    logger.info("Starting PostgreSQL complete schema setup...");

    // Create Role Enum
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE role_enum AS ENUM ('USER', 'ADMIN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    logger.info("Enum 'role_enum' verified/created.");

    // Create User table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        "emailVerified" BOOLEAN DEFAULT FALSE,
        image TEXT,
        role role_enum NOT NULL DEFAULT 'USER',
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

    // Create Workflow table
    await client.query(`
      CREATE TABLE IF NOT EXISTS workflow (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        data JSONB NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "userId" VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
      );
    `);
    await client.query(`ALTER TABLE workflow ADD COLUMN IF NOT EXISTS description TEXT;`);
    logger.info("Table 'workflow' verified/created.");

    // Create Node table
    await client.query(`
      CREATE TABLE IF NOT EXISTS node (
        id VARCHAR(255) PRIMARY KEY,
        "workflowId" VARCHAR(255) NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        data JSONB NOT NULL DEFAULT '{}',
        position JSONB NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE node
        ALTER COLUMN type TYPE VARCHAR(100) USING type::text;
      EXCEPTION
        WHEN undefined_table THEN null;
        WHEN undefined_column THEN null;
      END $$;
    `);
    logger.info("Table 'node' verified/created.");

    // Create Connection table
    await client.query(`
      CREATE TABLE IF NOT EXISTS connection (
        id VARCHAR(255) PRIMARY KEY,
        "workflowId" VARCHAR(255) NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
        "sourceNodeId" VARCHAR(255) NOT NULL REFERENCES node(id) ON DELETE CASCADE,
        "targetNodeId" VARCHAR(255) NOT NULL REFERENCES node(id) ON DELETE CASCADE,
        "sourceOutput" VARCHAR(255) NOT NULL,
        "targetInput" VARCHAR(255) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info("Table 'connection' verified/created.");

    // Create Credential table
    await client.query(`
      CREATE TABLE IF NOT EXISTS credential (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        "nodeType" VARCHAR(100) NOT NULL,
        "apiKey" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("userId", name)
      );
    `);
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE credential
        ALTER COLUMN "nodeType" TYPE VARCHAR(100) USING "nodeType"::text;
      EXCEPTION
        WHEN undefined_table THEN null;
        WHEN undefined_column THEN null;
      END $$;
    `);
    logger.info("Table 'credential' verified/created.");

    // Create Execution table
    await client.query(`
      CREATE TABLE IF NOT EXISTS execution (
        id VARCHAR(255) PRIMARY KEY,
        "workflowId" VARCHAR(255) NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'RUNNING',
        "startedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "completedAt" TIMESTAMP,
        error TEXT,
        result JSONB,
        "triggerType" VARCHAR(100),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE execution
        ALTER COLUMN status TYPE VARCHAR(50) USING status::text;
      EXCEPTION
        WHEN undefined_table THEN null;
        WHEN undefined_column THEN null;
      END $$;
    `);
    logger.info("Table 'execution' verified/created.");

    // Add indexes
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_session_userId" ON session("userId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_account_userId" ON account("userId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_verification_identifier" ON verification(identifier);`);
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_workflow_userId" ON workflow("userId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_node_workflowId" ON node("workflowId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_connection_workflowId" ON connection("workflowId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_connection_sourceNodeId" ON connection("sourceNodeId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_connection_targetNodeId" ON connection("targetNodeId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_credential_userId" ON credential("userId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_credential_nodeType" ON credential("nodeType");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_execution_workflowId" ON execution("workflowId");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_execution_status" ON execution(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS "idx_execution_startedAt" ON execution("startedAt");`);

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
