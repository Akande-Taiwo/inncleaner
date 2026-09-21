import Link from "next/link";
import { redirect } from "next/navigation";
import { settlePaystackPayment } from "@/lib/payments";

export const dynamic = "force-dynamic";
export const metadata = { title: "Confirming payment" };

/**
 * Where Paystack sends the customer's browser after checkout. It re-verifies
 * server-side rather than believing the query string, then hands off to the
 * order page.
 */
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const params = await searchParams;
  const reference = params.reference ?? params.trxref;

  if (!reference) {
    return (
      <Problem
        title="No payment to confirm"
        body="We didn't get a payment reference back from Paystack."
      />
    );
  }

  const result = await settlePaystackPayment(reference);

  // redirect() signals by throwing, so it must sit outside any try/catch.
  if (result.ok) {
    redirect(`/order/${result.order.reference}`);
  }

  if (result.reason === "not_found") {
    return (
      <Problem
        title="We couldn't find that order"
        body="The payment reference doesn't match any order. If money left your account, send us the reference and we'll sort it out."
      />
    );
  }

  if (result.reason === "amount_mismatch") {
    return (
      <Problem
        title="Payment amount didn't match"
        body="The amount paid doesn't match the order total, so we've held it for review. Please contact us with your reference — nothing is lost."
      />
    );
  }

  return (
    <Problem
      title="Payment not completed"
      body="Paystack hasn't confirmed this payment. If you were charged, give it a minute and refresh — otherwise you can try again."
    />
  );
}

function Problem({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-muted">{body}</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/track"
          className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Track your order
        </Link>
        <Link
          href="/shop"
          className="rounded-xl border border-line px-6 py-3 text-sm font-semibold transition hover:border-brand/50"
        >
          Back to shop
        </Link>
      </div>
    </div>
  );
}
