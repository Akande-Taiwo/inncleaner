"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatNaira } from "@/lib/money";
import type { PaymentMethod } from "@/lib/types";

interface Props {
  states: readonly string[];
  cardEnabled: boolean;
  lagosDeliveryKobo: number;
  nationwideDeliveryKobo: number;
  freeAboveKobo: number;
}

const FIELD_CLASS =
  "w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-brand";

export function CheckoutForm({
  states,
  cardEnabled,
  lagosDeliveryKobo,
  nationwideDeliveryKobo,
  freeAboveKobo,
}: Props) {
  const router = useRouter();
  const { lines, resolved, subtotalKobo, hydrated, clear } = useCart();

  const [state, setState] = useState("Lagos");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("opay_transfer");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mirrors deliveryKoboFor on the server; the server total is authoritative.
  const deliveryKobo = useMemo(() => {
    if (subtotalKobo >= freeAboveKobo) return 0;
    return state.toLowerCase() === "lagos"
      ? lagosDeliveryKobo
      : nationwideDeliveryKobo;
  }, [state, subtotalKobo, lagosDeliveryKobo, nationwideDeliveryKobo, freeAboveKobo]);

  const totalKobo = subtotalKobo + deliveryKobo;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      lines,
      paymentMethod,
      customer: {
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        address: form.get("address"),
        city: form.get("city"),
        state: form.get("state"),
        note: form.get("note"),
      },
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as {
        reference?: string;
        authorizationUrl?: string;
        error?: string;
      };

      if (!response.ok || !body.reference) {
        setError(body.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      // The order is saved server-side now, so the local cart has done its job.
      clear();

      if (body.authorizationUrl) {
        window.location.href = body.authorizationUrl;
        return;
      }
      router.push(`/order/${body.reference}`);
    } catch {
      setError("We couldn't reach the server. Check your connection and retry.");
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return <p className="text-muted">Loading your order…</p>;
  }

  if (resolved.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-12 text-center">
        <p className="text-muted">There is nothing in your cart to check out.</p>
        <Link
          href="/shop"
          className="mt-5 inline-block rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-8">
        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-semibold">Delivery details</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">Full name</span>
              <input name="name" required autoComplete="name" className={`mt-1.5 ${FIELD_CLASS}`} />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className={`mt-1.5 ${FIELD_CLASS}`}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Phone</span>
              <input
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="08031234567"
                className={`mt-1.5 ${FIELD_CLASS}`}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">Delivery address</span>
              <textarea
                name="address"
                required
                rows={3}
                autoComplete="street-address"
                className={`mt-1.5 ${FIELD_CLASS}`}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">City</span>
              <input
                name="city"
                required
                autoComplete="address-level2"
                className={`mt-1.5 ${FIELD_CLASS}`}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">State</span>
              <select
                name="state"
                value={state}
                onChange={(event) => setState(event.target.value)}
                className={`mt-1.5 ${FIELD_CLASS}`}
              >
                {states.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">
                Delivery note <span className="text-muted">(optional)</span>
              </span>
              <textarea
                name="note"
                rows={2}
                placeholder="Landmark, gate colour, best time to deliver…"
                className={`mt-1.5 ${FIELD_CLASS}`}
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-semibold">How would you like to pay?</h2>

          <div className="mt-5 space-y-3">
            <label
              className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                paymentMethod === "opay_transfer"
                  ? "border-brand bg-brand-soft"
                  : "border-line hover:border-brand/40"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="opay_transfer"
                checked={paymentMethod === "opay_transfer"}
                onChange={() => setPaymentMethod("opay_transfer")}
                className="mt-1 accent-[#c2410c]"
              />
              <span>
                <span className="block font-medium">Bank transfer to our OPay account</span>
                <span className="mt-1 block text-sm text-muted">
                  We show you the account number on the next screen. Transfer from any
                  bank app, then tell us you&apos;ve paid.
                </span>
              </span>
            </label>

            <label
              className={`flex gap-3 rounded-xl border p-4 transition ${
                !cardEnabled
                  ? "cursor-not-allowed border-line opacity-60"
                  : paymentMethod === "card"
                    ? "cursor-pointer border-brand bg-brand-soft"
                    : "cursor-pointer border-line hover:border-brand/40"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                disabled={!cardEnabled}
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
                className="mt-1 accent-[#c2410c]"
              />
              <span>
                <span className="block font-medium">
                  Pay by card
                  {!cardEnabled && (
                    <span className="ml-2 text-sm font-normal text-muted">
                      (not set up yet)
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-sm text-muted">
                  Verve, Mastercard and Visa, processed securely by Paystack.
                  Confirms instantly.
                </span>
              </span>
            </label>
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-semibold">Order summary</h2>

          <ul className="mt-4 space-y-3 border-b border-line pb-4">
            {resolved.map((line) => (
              <li key={line.sku} className="flex justify-between gap-3 text-sm">
                <span>
                  <span className="font-medium">{line.name}</span>
                  <span className="block text-muted">
                    {line.variantLabel} × {line.quantity}
                  </span>
                </span>
                <span className="shrink-0 font-medium">
                  {formatNaira(line.lineTotalKobo)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatNaira(subtotalKobo)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery to {state}</dt>
              <dd>{deliveryKobo === 0 ? "Free" : formatNaira(deliveryKobo)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatNaira(totalKobo)}</dd>
            </div>
          </dl>

          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand-dark">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Placing your order…"
              : paymentMethod === "card"
                ? `Pay ${formatNaira(totalKobo)} by card`
                : `Place order — ${formatNaira(totalKobo)}`}
          </button>

          <p className="mt-3 text-center text-xs text-muted">
            You&apos;ll get an order reference to track and quote.
          </p>
        </div>
      </aside>
    </form>
  );
}
