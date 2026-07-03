import { drizzle } from "drizzle-orm/libsql";
import { createClient, type Client } from "@libsql/client";
import * as schema from "./schema";

/**
 * Lazily-initialized Turso database client and Drizzle ORM instance.
 * Uses TURSO_DATABASE_URL and TURSO_AUTH_TOKEN from environment variables.
 *
 * Why lazy initialization: Next.js may try to evaluate this module at build time
 * (e.g. for static page generation), when env vars are not available.
 * By deferring client creation to first use, we avoid build-time errors.
 */
let _client: Client | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (!_db) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) {
      throw new Error("TURSO_DATABASE_URL environment variable is not set");
    }
    _client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    _db = drizzle(_client, { schema });
  }
  return _db;
}

/**
 * Proxy that lazily initializes the Drizzle ORM instance on first access.
 * This prevents build-time errors when TURSO_DATABASE_URL is not set.
 */
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const instance = getDb();
    return (instance as unknown as Record<string | symbol, unknown>)[prop];
  },
});
