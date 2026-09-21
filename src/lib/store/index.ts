import { fileStore } from "./file";
import { postgresStore } from "./postgres";
import type { OrderStore } from "./types";

export type { OrderStore } from "./types";

/**
 * Postgres whenever DATABASE_URL is configured, otherwise a local JSON file.
 * On Vercel the filesystem is read-only, so a missing DATABASE_URL in
 * production is a configuration error rather than something to fall back from.
 */
export const store: OrderStore = process.env.DATABASE_URL
  ? postgresStore
  : fileStore;

export const usingDatabase = Boolean(process.env.DATABASE_URL);
