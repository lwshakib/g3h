import pg from "pg";
const { Pool } = pg;
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
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

/**
 * Centralized Postgres Service for Authentication and Database Operations.
 * Houses all high-level CRUD for user, account, session, and verification.
 */
export class PostgresService {
  public pool = pool;

  // --- USER OPERATIONS ---

  public async findUserByEmail(email: string) {
    const { rows } = await this.pool.query('SELECT * FROM "user" WHERE email = $1', [email]);
    return rows[0] || null;
  }

  public async findUserById(id: string) {
    const { rows } = await this.pool.query('SELECT * FROM "user" WHERE id = $1', [id]);
    return rows[0] || null;
  }

  public async createUser(data: { name: string; email: string; image?: string | null }) {
    const id = uuidv4();
    const { rows } = await this.pool.query(
      'INSERT INTO "user" (id, name, email, image) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, data.name, data.email, data.image || null]
    );
    logger.info(`[PostgresService] Created User: ${data.email} (${id})`);
    return rows[0];
  }

  public async verifyUserEmail(userId: string) {
    await this.pool.query('UPDATE "user" SET "emailVerified" = TRUE WHERE id = $1', [userId]);
    logger.info(`[PostgresService] User ${userId} email verified.`);
  }

  public async updateUser(userId: string, data: { name?: string; image?: string | null }) {
    const fields = [];
    const values = [];
    let i = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${i++}`);
      values.push(data.name);
    }
    if (data.image !== undefined) {
      fields.push(`image = $${i++}`);
      values.push(data.image);
    }

    if (fields.length === 0) return null;

    values.push(userId);
    const query = `UPDATE "user" SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`;
    const { rows } = await this.pool.query(query, values);
    
    logger.info(`[PostgresService] Updated User ${userId}: ${Object.keys(data).join(", ")}`);
    return rows[0];
  }

  // --- ACCOUNT OPERATIONS ---

  public async findAccount(providerId: string, accountId: string) {
    const { rows } = await this.pool.query(
      'SELECT * FROM account WHERE "providerId" = $1 AND "accountId" = $2',
      [providerId, accountId]
    );
    return rows[0] || null;
  }

  public async createAccount(data: {
    userId: string;
    providerId: string;
    accountId: string;
    password?: string;
    accessToken?: string;
    refreshToken?: string;
  }) {
    const id = uuidv4();
    let hashedPassword = null;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    const { rows } = await this.pool.query(
      'INSERT INTO account (id, "userId", "providerId", "accountId", password, "accessToken", "refreshToken") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, data.userId, data.providerId, data.accountId, hashedPassword, data.accessToken || null, data.refreshToken || null]
    );
    logger.info(`[PostgresService] Created Account: ${data.providerId} for User: ${data.userId}`);
    return rows[0];
  }

  public async validatePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  public async updateAccountPassword(email: string, newPasswordRaw: string) {
    const hashedPassword = await bcrypt.hash(newPasswordRaw, 10);
    await this.pool.query(
      'UPDATE account SET password = $1 WHERE "providerId" = $2 AND "accountId" = $3',
      [hashedPassword, 'credentials', email]
    );
    logger.info(`[PostgresService] Updated password for credentials account: ${email}`);
  }

  // --- SESSION OPERATIONS ---

  public async createSession(userId: string, userAgent?: string, ipAddress?: string) {
    const id = uuidv4();
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const { rows } = await this.pool.query(
      'INSERT INTO session (id, "userId", token, "expiresAt", "userAgent", "ipAddress") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, userId, token, expiresAt, userAgent || null, ipAddress || null]
    );
    logger.info(`[PostgresService] Created Session for User: ${userId}`);
    return rows[0];
  }

  // --- VERIFICATION OPERATIONS ---

  public async createVerification(identifier: string) {
    const id = uuidv4();
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const { rows } = await this.pool.query(
      'INSERT INTO verification (id, identifier, value, "expiresAt") VALUES ($1, $2, $3, $4) RETURNING *',
      [id, identifier, token, expiresAt]
    );
    logger.info(`[PostgresService] Created Verification Token for: ${identifier}`);
    return rows[0];
  }

  public async findVerificationByToken(token: string) {
    const { rows } = await this.pool.query(
      'SELECT * FROM verification WHERE value = $1 AND "expiresAt" > CURRENT_TIMESTAMP',
      [token]
    );
    return rows[0] || null;
  }

  public async deleteVerification(id: string) {
    await this.pool.query('DELETE FROM verification WHERE id = $1', [id]);
  }

  // --- WORKFLOW OPERATIONS ---

  public async createWorkflow(data: { name: string; userId: string; data?: any }) {
    const id = uuidv4();
    const { rows } = await this.pool.query(
      'INSERT INTO workflow (id, name, "userId", data) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, data.name, data.userId, data.data || {}]
    );
    logger.info(`[PostgresService] Created Workflow: ${data.name} for User: ${data.userId}`);
    return rows[0];
  }

  public async createWorkflowWithAutoName(userId: string, baseName = "My Workflow", data: any = {}) {
    const escapedBaseName = baseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existingNamesResult = await this.pool.query(
      'SELECT name FROM workflow WHERE "userId" = $1 AND (name = $2 OR name ~ $3)',
      [userId, baseName, `^${escapedBaseName} [0-9]+$`]
    );

    const existingNames = new Set(existingNamesResult.rows.map((row) => row.name as string));
    let candidate = baseName;
    let suffix = 2;

    while (existingNames.has(candidate)) {
      candidate = `${baseName} ${suffix}`;
      suffix += 1;
    }

    return this.createWorkflow({
      name: candidate,
      userId,
      data,
    });
  }

  public async findWorkflowsByUserId(userId: string) {
    const { rows } = await this.pool.query(
      'SELECT * FROM workflow WHERE "userId" = $1 ORDER BY "updatedAt" DESC',
      [userId]
    );
    return rows;
  }

  public async findWorkflowByIdForUser(id: string, userId: string) {
    const { rows } = await this.pool.query(
      'SELECT * FROM workflow WHERE id = $1 AND "userId" = $2',
      [id, userId]
    );
    return rows[0] || null;
  }

  public async updateWorkflowForUser(
    id: string,
    userId: string,
    updates: { name?: string; data?: unknown }
  ) {
    const fields: string[] = [];
    const values: unknown[] = [];
    let index = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${index++}`);
      values.push(updates.name);
    }

    if (updates.data !== undefined) {
      fields.push(`data = $${index++}`);
      values.push(updates.data);
    }

    if (fields.length === 0) {
      return this.findWorkflowByIdForUser(id, userId);
    }

    values.push(id);
    values.push(userId);

    const { rows } = await this.pool.query(
      `UPDATE workflow SET ${fields.join(", ")} WHERE id = $${index++} AND "userId" = $${index} RETURNING *`,
      values
    );

    return rows[0] || null;
  }

  public async deleteWorkflowForUser(id: string, userId: string) {
    const result = await this.pool.query(
      'DELETE FROM workflow WHERE id = $1 AND "userId" = $2',
      [id, userId]
    );
    logger.info(`[PostgresService] Deleted Workflow: ${id} for user ${userId}`);
    return (result.rowCount ?? 0) > 0;
  }
}

export const postgresService = new PostgresService();
export default pool;
