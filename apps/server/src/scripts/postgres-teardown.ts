import pool from "../services/postgres.services.js";
import logger from "../logger/winston.logger.js";

/**
 * Teardown script to safely clean up the complete database schema.
 */
async function teardown() {
  const client = await pool.connect();
  try {
    logger.info("Starting PostgreSQL complete schema teardown...");

    // Drop tables in reverse dependency order
    await client.query(`DROP TABLE IF EXISTS execution CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS connection CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS node CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS credential CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS workflow CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS session CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS account CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS verification CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS "user" CASCADE;`);

    // Drop Enum type
    await client.query(`DROP TYPE IF EXISTS role_enum;`);

    logger.info("All tables and types dropped successfully.");
    logger.info("PostgreSQL complete teardown completed.");
  } catch (error) {
    logger.error("Error during PostgreSQL teardown:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

teardown();
