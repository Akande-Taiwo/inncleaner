import { promises as fs } from "node:fs";
import path from "node:path";
import type { Order } from "../types";
import type { OrderStore } from "./types";

/**
 * Development-only store. Vercel's filesystem is read-only and ephemeral, so
 * this exists purely so the app runs end-to-end with `npm run dev` before you
 * have a database. Production uses the Postgres store.
 */
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "orders.json");

/** Serialises writes so two concurrent orders can't clobber each other's file write. */
let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

async function readAll(): Promise<Order[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as Order[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function writeAll(orders: Order[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2), "utf8");
}

export const fileStore: OrderStore = {
  create: (order) =>
    enqueue(async () => {
      const orders = await readAll();
      orders.push(order);
      await writeAll(orders);
      return order;
    }),

  get: async (reference) => {
    const orders = await readAll();
    return orders.find((o) => o.reference === reference) ?? null;
  },

  findByPaystackReference: async (paystackReference) => {
    const orders = await readAll();
    return orders.find((o) => o.paystackReference === paystackReference) ?? null;
  },

  update: (reference, patch) =>
    enqueue(async () => {
      const orders = await readAll();
      const index = orders.findIndex((o) => o.reference === reference);
      if (index === -1) return null;
      const updated: Order = {
        ...orders[index],
        ...patch,
        reference: orders[index].reference,
        updatedAt: new Date().toISOString(),
      };
      orders[index] = updated;
      await writeAll(orders);
      return updated;
    }),

  list: async () => {
    const orders = await readAll();
    return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};
