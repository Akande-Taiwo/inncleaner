import { createHmac, timingSafeEqual } from "node:crypto";

const PAYSTACK_API = "https://api.paystack.co";

export function paystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

interface InitialiseResponse {
  status: boolean;
  message: string;
  data?: { authorization_url: string; access_code: string; reference: string };
}

export interface VerifiedTransaction {
  status: "success" | "failed" | "abandoned" | "pending";
  amountKobo: number;
  currency: string;
  reference: string;
  paidAt: string | null;
}

/**
 * Creates a Paystack transaction and returns the hosted checkout URL.
 * `amountKobo` must match the order total exactly — it is re-checked on verify.
 */
export async function initialiseTransaction(params: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  orderReference: string;
}): Promise<{ authorizationUrl: string; reference: string }> {
  const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      currency: "NGN",
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: { order_reference: params.orderReference },
    }),
    cache: "no-store",
  });

  const body = (await response.json()) as InitialiseResponse;
  if (!response.ok || !body.status || !body.data) {
    throw new Error(body.message || "Could not start the card payment");
  }
  return {
    authorizationUrl: body.data.authorization_url,
    reference: body.data.reference,
  };
}

interface VerifyResponse {
  status: boolean;
  message: string;
  data?: {
    status: VerifiedTransaction["status"];
    amount: number;
    currency: string;
    reference: string;
    paid_at: string | null;
  };
}

export async function verifyTransaction(
  reference: string,
): Promise<VerifiedTransaction | null> {
  const response = await fetch(
    `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey()}` },
      cache: "no-store",
    },
  );

  const body = (await response.json()) as VerifyResponse;
  if (!response.ok || !body.status || !body.data) return null;

  return {
    status: body.data.status,
    amountKobo: body.data.amount,
    currency: body.data.currency,
    reference: body.data.reference,
    paidAt: body.data.paid_at,
  };
}

/**
 * Paystack signs webhooks with HMAC SHA-512 of the raw request body using the
 * secret key. Compared in constant time so the check can't be timed open.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!signature) return false;
  const expected = createHmac("sha512", secretKey()).update(rawBody).digest();
  let received: Buffer;
  try {
    received = Buffer.from(signature, "hex");
  } catch {
    return false;
  }
  if (received.length !== expected.length) return false;
  return timingSafeEqual(expected, received);
}
