import { randomBytes } from "node:crypto";
import { deliveryKoboFor } from "./config";
import { findVariant } from "./products";
import type { Customer, Order, OrderItem, PaymentMethod } from "./types";

/** Unambiguous alphabet — no O/0, I/1 — because customers read these over the phone. */
const REF_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateReference(): string {
  const bytes = randomBytes(6);
  let out = "";
  for (const byte of bytes) out += REF_ALPHABET[byte % REF_ALPHABET.length];
  return `RSN-${out}`;
}

export interface CartLineInput {
  sku: string;
  quantity: number;
}

export type BuildResult =
  | { ok: true; order: Order }
  | { ok: false; error: string };

const MAX_QUANTITY_PER_LINE = 50;

function isNonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseCustomer(input: unknown): Customer | null {
  if (typeof input !== "object" || input === null) return null;
  const c = input as Record<string, unknown>;

  if (
    !isNonEmpty(c.name) ||
    !isNonEmpty(c.email) ||
    !isNonEmpty(c.phone) ||
    !isNonEmpty(c.address) ||
    !isNonEmpty(c.city) ||
    !isNonEmpty(c.state)
  ) {
    return null;
  }

  const email = c.email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;

  // Nigerian numbers, accepting 0803..., +234803... and 234803... forms.
  const phone = c.phone.trim();
  if (!/^(\+?234|0)[789]\d{9}$/.test(phone.replace(/[\s-]/g, ""))) return null;

  return {
    name: c.name.trim().slice(0, 120),
    email: email.slice(0, 160),
    phone: phone.slice(0, 20),
    address: c.address.trim().slice(0, 400),
    city: c.city.trim().slice(0, 80),
    state: c.state.trim().slice(0, 80),
    note: isNonEmpty(c.note) ? c.note.trim().slice(0, 500) : undefined,
  };
}

export function parseCartLines(input: unknown): CartLineInput[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > 50) {
    return null;
  }
  const lines: CartLineInput[] = [];
  for (const raw of input) {
    if (typeof raw !== "object" || raw === null) return null;
    const line = raw as Record<string, unknown>;
    if (typeof line.sku !== "string") return null;
    const quantity = Number(line.quantity);
    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY_PER_LINE
    ) {
      return null;
    }
    lines.push({ sku: line.sku, quantity });
  }
  return lines;
}

export function parsePaymentMethod(input: unknown): PaymentMethod | null {
  return input === "opay_transfer" || input === "card" ? input : null;
}

/**
 * Builds an order from cart lines. Prices come from the catalogue on the
 * server — the browser only ever sends SKUs and quantities, so a tampered
 * client cannot change what it is charged.
 */
export function buildOrder(
  lines: CartLineInput[],
  customer: Customer,
  paymentMethod: PaymentMethod,
): BuildResult {
  const merged = new Map<string, number>();
  for (const line of lines) {
    merged.set(line.sku, (merged.get(line.sku) ?? 0) + line.quantity);
  }

  const items: OrderItem[] = [];
  for (const [sku, quantity] of merged) {
    const found = findVariant(sku);
    if (!found) return { ok: false, error: `Unknown item: ${sku}` };
    if (!found.variant.inStock) {
      return {
        ok: false,
        error: `${found.product.name} (${found.variant.label}) is out of stock`,
      };
    }
    if (quantity > MAX_QUANTITY_PER_LINE) {
      return {
        ok: false,
        error: `Maximum ${MAX_QUANTITY_PER_LINE} of any single item per order`,
      };
    }
    items.push({
      sku,
      slug: found.product.slug,
      name: found.product.name,
      variantLabel: found.variant.label,
      unitPriceKobo: found.variant.priceKobo,
      quantity,
    });
  }

  const subtotalKobo = items.reduce(
    (sum, item) => sum + item.unitPriceKobo * item.quantity,
    0,
  );
  const deliveryKobo = deliveryKoboFor(customer.state, subtotalKobo);
  const now = new Date().toISOString();

  return {
    ok: true,
    order: {
      reference: generateReference(),
      createdAt: now,
      updatedAt: now,
      status: "awaiting_payment",
      paymentMethod,
      customer,
      items,
      subtotalKobo,
      deliveryKobo,
      totalKobo: subtotalKobo + deliveryKobo,
    },
  };
}

export const STATUS_LABELS: Record<Order["status"], string> = {
  awaiting_payment: "Awaiting payment",
  transfer_claimed: "Transfer reported — being confirmed",
  paid: "Payment confirmed",
  shipped: "Shipped",
  cancelled: "Cancelled",
};
