import { Pool } from "pg";
import type { Order } from "../types";
import type { OrderStore } from "./types";

/**
 * Production store. Works with any Postgres connection string — Vercel Postgres,
 * Neon, Supabase, Railway. The order body is kept as JSONB because orders are
 * always read whole by reference; the columns that exist are the ones we query on.
 */

let pool: Pool | undefined;
let ready: Promise<void> | undefined;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    pool = new Pool({
      connectionString,
      // Managed Postgres providers terminate non-TLS connections; their certs are
      // not in Node's default trust store, so verification is relaxed here only.
      ssl: connectionString.includes("sslmode=disable")
        ? false
        : { rejectUnauthorized: false },
      max: 3,
    });
  }
  return pool;
}

/** Creates the table on first use so there is no separate migration step to forget. */
function ensureSchema(): Promise<void> {
  if (!ready) {
    ready = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS orders (
           reference           TEXT PRIMARY KEY,
           paystack_reference  TEXT UNIQUE,
           status              TEXT NOT NULL,
           created_at          TIMESTAMPTZ NOT NULL,
           updated_at          TIMESTAMPTZ NOT NULL,
           body                JSONB NOT NULL
         )`,
      )
      .then(() => undefined)
      .catch((err) => {
        // Let the next call retry rather than caching a failed bootstrap forever.
        ready = undefined;
        throw err;
      });
  }
  return ready;
}

interface Row {
  body: Order;
}

export const postgresStore: OrderStore = {
  async create(order) {
    await ensureSchema();
    await getPool().query(
      `INSERT INTO orders (reference, paystack_reference, status, created_at, updated_at, body)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        order.reference,
        order.paystackReference ?? null,
        order.status,
        order.createdAt,
        order.updatedAt,
        JSON.stringify(order),
      ],
    );
    return order;
  },

  async get(reference) {
    await ensureSchema();
    const { rows } = await getPool().query<Row>(
      `SELECT body FROM orders WHERE reference = $1`,
      [reference],
    );
    return rows[0]?.body ?? null;
  },

  async findByPaystackReference(paystackReference) {
    await ensureSchema();
    const { rows } = await getPool().query<Row>(
      `SELECT body FROM orders WHERE paystack_reference = $1`,
      [paystackReference],
    );
    return rows[0]?.body ?? null;
  },

  async update(reference, patch) {
    await ensureSchema();
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      // Lock the row so a webhook and a verify callback arriving together can't
      // both read the pre-payment order and write conflicting versions of it.
      const { rows } = await client.query<Row>(
        `SELECT body FROM orders WHERE reference = $1 FOR UPDATE`,
        [reference],
      );
      const existing = rows[0]?.body;
      if (!existing) {
        await client.query("ROLLBACK");
        return null;
      }
      const updated: Order = {
        ...existing,
        ...patch,
        reference: existing.reference,
        updatedAt: new Date().toISOString(),
      };
      await client.query(
        `UPDATE orders
            SET paystack_reference = $2, status = $3, updated_at = $4, body = $5
          WHERE reference = $1`,
        [
          reference,
          updated.paystackReference ?? null,
          updated.status,
          updated.updatedAt,
          JSON.stringify(updated),
        ],
      );
      await client.query("COMMIT");
      return updated;
    } catch (err) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  },

  async list() {
    await ensureSchema();
    const { rows } = await getPool().query<Row>(
      `SELECT body FROM orders ORDER BY created_at DESC LIMIT 500`,
    );
    return rows.map((r) => r.body);
  },
};
