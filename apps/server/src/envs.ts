import dotenv from "dotenv";

// Load environment variables from the .env file into process.env
dotenv.config({
  path: "./.env",
});

/**
 * Utility function to retrieve an environment variable.
 * @param key - The name of the environment variable (e.g., "DATABASE_URL")
 * @param required - Whether the variable must be present (default: true)
 * @param defaultValue - Optional value to return if the variable is missing
 * @returns The value of the environment variable, the default value, or an empty string
 * @throws Error if a required variable is missing and no default is provided
 */
function getEnv(key: string, required = true, defaultValue?: string): string {
  const value = process.env[key];
  if (required && !value && defaultValue === undefined) {
    // Halt everything if a critical configuration is missing
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value || defaultValue || "";
}

// --- SERVER INSTANCE CONFIGURATION ---
export const NODE_ENV = getEnv("NODE_ENV");
export const PORT = parseInt(getEnv("PORT", true, "8080"), 10);
export const WEB_URL = getEnv("WEB_URL");

// --- POSTGRESQL (MAIN DB) CONFIGURATION ---
export const DATABASE_URL = getEnv("DATABASE_URL");

// --- GOOGLE OAUTH CONFIGURATION ---
export const GOOGLE_CLIENT_ID = getEnv("GOOGLE_CLIENT_ID");
export const GOOGLE_CLIENT_SECRET = getEnv("GOOGLE_CLIENT_SECRET");
export const GOOGLE_CALLBACK_URL = getEnv("GOOGLE_CALLBACK_URL");

// --- GITHUB OAUTH CONFIGURATION ---
export const GITHUB_CLIENT_ID = getEnv("GITHUB_CLIENT_ID");
export const GITHUB_CLIENT_SECRET = getEnv("GITHUB_CLIENT_SECRET");
export const GITHUB_CALLBACK_URL = getEnv("GITHUB_CALLBACK_URL");
export const RESEND_API_KEY = getEnv("RESEND_API_KEY");

// --- MEDIA STORAGE (AWS S3 / CLOUDFLARE R2) ---
export const AWS_REGION = getEnv("AWS_REGION", false, "auto");
export const AWS_ENDPOINT = getEnv("AWS_ENDPOINT", false);
export const AWS_ACCESS_KEY_ID = getEnv("AWS_ACCESS_KEY_ID");
export const AWS_SECRET_ACCESS_KEY = getEnv("AWS_SECRET_ACCESS_KEY");
export const AWS_S3_BUCKET_NAME = getEnv("AWS_S3_BUCKET_NAME");

