import { NextResponse } from "next/server";
import {
  buildOrder,
  parseCartLines,
  parseCustomer,
  parsePaymentMethod,
} from "@/lib/orders";
import { initialiseTransaction, paystackConfigured } from "@/lib/paystack";
import { store } from "@/lib/store";
import { getBaseUrl } from "@/lib/url";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;

  const lines = parseCartLines(body.lines);
  if (!lines) {
    return NextResponse.json({ error: "Your cart is empty or invalid" }, { status: 400 });
  }

  const customer = parseCustomer(body.customer);
  if (!customer) {
    return NextResponse.json(
      { error: "Please check your name, email, phone number and address" },
      { status: 400 },
    );
  }

  const paymentMethod = parsePaymentMethod(body.paymentMethod);
  if (!paymentMethod) {
    return NextResponse.json({ error: "Choose a payment method" }, { status: 400 });
  }

  if (paymentMethod === "card" && !paystackConfigured()) {
    return NextResponse.json(
      { error: "Card payments aren't available yet. Please pay by transfer." },
      { status: 400 },
    );
  }

  // Prices, delivery and totals are all computed here from the catalogue —
  // the request only contributes SKUs, quantities and the delivery address.
  const built = buildOrder(lines, customer, paymentMethod);
  if (!built.ok) {
    return NextResponse.json({ error: built.error }, { status: 400 });
  }

  const order = built.order;

  if (paymentMethod === "card") {
    try {
      const { authorizationUrl, reference } = await initialiseTransaction({
        email: order.customer.email,
        amountKobo: order.totalKobo,
        // Paystack references must be unique; reuse ours so the two line up.
        reference: order.reference,
        callbackUrl: `${getBaseUrl(request)}/checkout/verify`,
        orderReference: order.reference,
      });
      order.paystackReference = reference;
      await store.create(order);
      return NextResponse.json({ reference: order.reference, authorizationUrl });
    } catch (error) {
      console.error("Paystack initialise failed", error);
      return NextResponse.json(
        { error: "We couldn't start the card payment. Try a transfer instead." },
        { status: 502 },
      );
    }
  }

  await store.create(order);
  return NextResponse.json({ reference: order.reference });
}
