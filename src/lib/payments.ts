import { store } from "./store";
import type { Order } from "./types";
import { verifyTransaction } from "./paystack";

export type SettleResult =
  | { ok: true; order: Order }
  | { ok: false; reason: "not_found" | "unpaid" | "amount_mismatch" };

/**
 * Confirms a Paystack transaction against Paystack itself and marks the order
 * paid. Called from both the browser callback and the webhook — whichever
 * arrives first wins and the other is a no-op, so it must stay idempotent.
 */
export async function settlePaystackPayment(
  paystackReference: string,
): Promise<SettleResult> {
  const order = await store.findByPaystackReference(paystackReference);
  if (!order) return { ok: false, reason: "not_found" };

  // Already settled by the other path — nothing to do.
  if (order.status === "paid" || order.status === "shipped") {
    return { ok: true, order };
  }

  // Never trust the callback's claim of success; ask Paystack directly.
  const transaction = await verifyTransaction(paystackReference);
  if (!transaction || transaction.status !== "success") {
    return { ok: false, reason: "unpaid" };
  }

  // Guard against a transaction being re-pointed at a cheaper order.
  if (
    transaction.amountKobo !== order.totalKobo ||
    transaction.currency !== "NGN"
  ) {
    return { ok: false, reason: "amount_mismatch" };
  }

  const updated = await store.update(order.reference, {
    status: "paid",
    paidAt: transaction.paidAt ?? new Date().toISOString(),
  });

  return updated
    ? { ok: true, order: updated }
    : { ok: false, reason: "not_found" };
}
