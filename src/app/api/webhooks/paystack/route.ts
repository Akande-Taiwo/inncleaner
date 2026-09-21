import { NextResponse } from "next/server";
import { paystackConfigured, verifyWebhookSignature } from "@/lib/paystack";
import { settlePaystackPayment } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Paystack's server-to-server notification. This is the reliable path — the
 * browser callback can be closed before it fires, this cannot.
 */
export async function POST(request: Request) {
  if (!paystackConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  // The signature is over the exact bytes sent, so read the body as text and
  // parse it only after the signature checks out.
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.event !== "charge.success" || !event.data?.reference) {
    // Acknowledge everything else so Paystack stops retrying it.
    return NextResponse.json({ received: true });
  }

  const result = await settlePaystackPayment(event.data.reference);
  if (!result.ok && result.reason === "amount_mismatch") {
    console.error(
      "Paystack amount mismatch for reference",
      event.data.reference,
    );
  }

  // Always 200: a non-2xx makes Paystack retry, and a genuine mismatch won't
  // resolve itself on retry — it needs a human.
  return NextResponse.json({ received: true });
}
