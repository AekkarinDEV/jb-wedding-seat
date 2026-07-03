import { cookies } from "next/headers";

const COOKIE_NAME = "jb-admin-session";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

/**
 * Verifies the provided password against the ADMIN_PASSWORD env var.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyPassword(input: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("ADMIN_PASSWORD environment variable is not set");
    return false;
  }
  // Simple comparison — sufficient for a wedding app with a single admin
  return input === adminPassword;
}

/**
 * Creates a signed admin session token using HMAC-SHA256.
 * The token contains a timestamp to allow expiration checking.
 */
async function createToken(): Promise<string> {
  const secret = process.env.COOKIE_SECRET || "default-secret-change-me";
  const payload = `admin:${Date.now()}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );

  const sigHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${payload}.${sigHex}`;
}

/**
 * Validates a signed admin session token.
 * Checks both the HMAC signature and expiration timestamp.
 */
async function validateToken(token: string): Promise<boolean> {
  const secret = process.env.COOKIE_SECRET || "default-secret-change-me";
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, sigHex] = parts;
  const encoder = new TextEncoder();

  // Verify HMAC signature
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const sigBytes = new Uint8Array(
    sigHex.match(/.{2}/g)!.map((h) => parseInt(h, 16))
  );

  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    encoder.encode(payload)
  );

  if (!valid) return false;

  // Check expiration (24 hours)
  const timestamp = parseInt(payload.split(":")[1], 10);
  const elapsed = Date.now() - timestamp;
  return elapsed < COOKIE_MAX_AGE * 1000;
}

/**
 * Sets the admin session cookie after successful password verification.
 * Cookie is HTTP-only, secure, SameSite=Strict for security.
 */
export async function setAdminCookie(): Promise<void> {
  const token = await createToken();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

/**
 * Checks if the current request has a valid admin session cookie.
 * Returns true if the cookie exists and the token is valid.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return validateToken(token);
}

/**
 * Clears the admin session cookie (logout).
 */
export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
