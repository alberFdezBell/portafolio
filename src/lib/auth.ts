import crypto from "crypto";
import { generateSecret, verifySync } from "otplib";
import { getDb } from "./db";
import { cookies } from "next/headers";

const DEFAULT_AUTH_SECRET = "portfolio-secret-key-change-me-in-production-1886";

function getAuthSecret(): string {
  return process.env.AUTH_SECRET || DEFAULT_AUTH_SECRET;
}

// In-memory rate limiter for login attempts
interface RateLimitEntry {
  attempts: number;
  blockedUntil: number;
}
const loginRateLimit = new Map<string, RateLimitEntry>();

export function checkRateLimit(ip: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const entry = loginRateLimit.get(ip);
  if (!entry) return { allowed: true };

  if (entry.blockedUntil > now) {
    return {
      allowed: false,
      waitSeconds: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  if (entry.attempts >= 5) {
    entry.blockedUntil = now + 15 * 60 * 1000; // 15 mins block
    return {
      allowed: false,
      waitSeconds: 15 * 60,
    };
  }

  return { allowed: true };
}

export function recordFailedAttempt(ip: string) {
  const entry = loginRateLimit.get(ip) || { attempts: 0, blockedUntil: 0 };
  entry.attempts += 1;
  loginRateLimit.set(ip, entry);
}

export function resetRateLimit(ip: string) {
  loginRateLimit.delete(ip);
}

// Constant-time string comparison
export function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// Get effective admin credentials
export function getAdminCredentials() {
  const envUser = process.env.ADMIN_USER || "admin";
  const envPassword = process.env.ADMIN_PASSWORD || "admin1234";

  const db = getDb();
  const dbPasswordRow = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get() as { value: string } | undefined;
  const password = dbPasswordRow ? dbPasswordRow.value : envPassword;

  return {
    username: envUser,
    password: password,
  };
}

// TOTP Secret Management
export function getTotpSecret(): { secret: string; isConfigured: boolean } {
  if (process.env.TOTP_SECRET && process.env.TOTP_SECRET.trim() !== "") {
    return { secret: process.env.TOTP_SECRET.trim(), isConfigured: true };
  }

  const db = getDb();
  const row = db.prepare("SELECT value FROM settings WHERE key = 'totp_secret'").get() as { value: string } | undefined;
  if (row && row.value) {
    return { secret: row.value, isConfigured: true };
  }

  const newSecret = generateSecret();
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('totp_secret', ?)").run(newSecret);
  return { secret: newSecret, isConfigured: false };
}

export function verifyTotpToken(token: string, secret: string): boolean {
  try {
    const cleanToken = token.replace(/\s+/g, "");
    const result = verifySync({ token: cleanToken, secret });
    return !!result && result.valid === true;
  } catch {
    return false;
  }
}

// Session Management with HMAC-SHA256
export function createSessionToken(username: string): string {
  const secret = getAuthSecret();
  const payload = {
    username,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string): { valid: boolean; username?: string } {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return { valid: false };
    const [data, signature] = parts;
    const secret = getAuthSecret();
    const expectedSignature = crypto.createHmac("sha256", secret).update(data).digest("base64url");

    if (!safeCompare(signature, expectedSignature)) {
      return { valid: false };
    }

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) {
      return { valid: false };
    }

    return { valid: true, username: payload.username };
  } catch {
    return { valid: false };
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("portfolio_session")?.value;
  if (!token) return false;
  const result = verifySessionToken(token);
  return result.valid;
}
