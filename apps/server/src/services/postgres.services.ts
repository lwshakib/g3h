import pg from "pg";
const { Pool } = pg;
import { DATABASE_URL } from "../envs.js";
import logger from "../logger/winston.logger.js";

/**
 * PostgreSQL connection pool initialized using the DATABASE_URL.
 */
const pool = new Pool({
  connectionString: DATABASE_URL,
});

// Test the connection on initialization
pool.on("connect", () => {
  logger.info("Successfully connected to PostgreSQL");
});

pool.on("error", (err) => {
  logger.error("Unexpected error on idle PostgreSQL client", err);
  process.exit(-1);
});

export default pool;
