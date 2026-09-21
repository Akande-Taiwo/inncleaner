import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export const runtime = "nodejs";

/**
 * The customer telling us they've sent the OPay transfer. This only moves the
 * order into "being confirmed" — money is never marked received until someone
 * checks the OPay app and confirms it in the admin area.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const note = (payload as Record<string, unknown>).note;
  const transferNote =
    typeof note === "string" && note.trim() ? note.trim().slice(0, 500) : undefined;

  const order = await store.get(reference);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.paymentMethod !== "opay_transfer") {
    return NextResponse.json(
      { error: "This order isn't being paid by transfer" },
      { status: 400 },
    );
  }

  if (order.status !== "awaiting_payment" && order.status !== "transfer_claimed") {
    return NextResponse.json(
      { error: "This order has already been processed" },
      { status: 409 },
    );
  }

  const updated = await store.update(reference, {
    status: "transfer_claimed",
    transferNote,
  });

  return NextResponse.json({ status: updated?.status ?? "transfer_claimed" });
}
