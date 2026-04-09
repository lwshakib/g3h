import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

/**
 * Get the encryption key from environment variable.
 * The key must be a 32-byte (256-bit) hex string or will be derived from the provided secret.
 */
function getEncryptionKey(): Buffer {
  const secretKey = process.env.CREDENTIALS_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "CREDENTIALS_SECRET_KEY environment variable is not set. Please set a secure 64-character hex string."
    );
  }

  // If the key is already 64 hex characters (32 bytes), use it directly
  if (/^[a-fA-F0-9]{64}$/.test(secretKey)) {
    return Buffer.from(secretKey, "hex");
  }

  // Otherwise, derive a 256-bit key from the secret using SHA-256
  return crypto.createHash("sha256").update(secretKey).digest();
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a base64-encoded string containing: IV + AuthTag + Ciphertext
 *
 * @param plaintext - The string to encrypt
 * @returns The encrypted string in base64 format
 */
export function encryptCredential(plaintext: string): string {
  const key = getEncryptionKey();

  // Generate a random initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create cipher with AES-256-GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  // Encrypt the plaintext
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  // Get the authentication tag
  const authTag = cipher.getAuthTag();

  // Combine IV + AuthTag + Ciphertext into a single buffer
  const combined = Buffer.concat([iv, authTag, encrypted]);

  // Return as base64 string for storage
  return combined.toString("base64");
}

/**
 * Decrypt an encrypted credential string using AES-256-GCM.
 *
 * @param encryptedData - The base64-encoded encrypted string
 * @returns The decrypted plaintext string
 */
export function decryptCredential(encryptedData: string): string {
  const key = getEncryptionKey();

  // Decode from base64
  const combined = Buffer.from(encryptedData, "base64");

  // Extract IV, AuthTag, and Ciphertext
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  // Create decipher with AES-256-GCM
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  // Set the authentication tag
  decipher.setAuthTag(authTag);

  // Decrypt and return the plaintext
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * Check if a string appears to be encrypted (base64 encoded with correct length).
 * This is a heuristic check and not a guarantee.
 *
 * @param value - The string to check
 * @returns True if the string appears to be encrypted
 */
export function isEncrypted(value: string): boolean {
  // Minimum length: IV (16) + AuthTag (16) + at least 1 byte of data = 33 bytes
  // Base64 encoding adds ~33% overhead
  if (!value || value.length < 44) {
    return false;
  }

  // Check if it's valid base64
  try {
    const decoded = Buffer.from(value, "base64");
    // Verify it has at least IV + AuthTag length
    return decoded.length >= IV_LENGTH + AUTH_TAG_LENGTH;
  } catch {
    return false;
  }
}

/**
 * Generate a secure random key for CREDENTIALS_SECRET_KEY.
 * This can be used to generate a new key for .env file.
 *
 * @returns A 64-character hex string suitable for CREDENTIALS_SECRET_KEY
 */
export function generateSecretKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString("hex");
}

