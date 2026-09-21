import Link from "next/link";
import { notFound } from "next/navigation";
import { opayConfig, opayConfigured, storeConfig } from "@/lib/config";
import { formatNaira } from "@/lib/money";
import { STATUS_LABELS } from "@/lib/orders";
import { store } from "@/lib/store";
import type { Order } from "@/lib/types";
import { TransferPanel } from "./TransferPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your order" };

const STATUS_STYLES: Record<Order["status"], string> = {
  awaiting_payment: "bg-brand-soft text-brand-dark",
  transfer_claimed: "bg-brand-soft text-brand-dark",
  paid: "bg-accent-soft text-accent",
  shipped: "bg-accent-soft text-accent",
  cancelled: "bg-line text-muted",
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const order = await store.get(reference);
  if (!order) notFound();

  const awaitingTransfer =
    order.paymentMethod === "opay_transfer" &&
    (order.status === "awaiting_payment" || order.status === "transfer_claimed");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Order reference</p>
          <h1 className="text-3xl font-semibold tracking-tight">{order.reference}</h1>
        </div>
        <span
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${STATUS_STYLES[order.status]}`}
        >
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <p className="mt-3 text-muted">
        Save this reference — it&apos;s how you track the order and how we find it
        if you call.
      </p>

      {order.status === "paid" && (
        <div className="mt-8 rounded-2xl border border-accent/30 bg-accent-soft p-6">
          <h2 className="text-lg font-semibold text-accent">Payment confirmed</h2>
          <p className="mt-1 text-sm text-accent">
            We&apos;re packing your order now. You&apos;ll hear from us when it
            ships.
          </p>
        </div>
      )}

      {order.status === "shipped" && (
        <div className="mt-8 rounded-2xl border border-accent/30 bg-accent-soft p-6">
          <h2 className="text-lg font-semibold text-accent">On its way</h2>
          <p className="mt-1 text-sm text-accent">
            Your order has been dispatched to {order.customer.city},{" "}
            {order.customer.state}.
          </p>
        </div>
      )}

      {awaitingTransfer && (
        <div className="mt-8 space-y-4">
          {!opayConfigured() && (
            <p className="rounded-xl border border-dashed border-line bg-surface px-4 py-3 text-sm text-muted">
              <strong>Store owner:</strong> set OPAY_ACCOUNT_NUMBER,
              OPAY_ACCOUNT_NAME and OPAY_BANK_NAME in your environment variables
              — customers are currently seeing a placeholder account.
            </p>
          )}
          <TransferPanel
            orderReference={order.reference}
            accountName={opayConfig.accountName}
            accountNumber={opayConfig.accountNumber}
            bankName={opayConfig.bankName}
            amountLabel={formatNaira(order.totalKobo)}
            alreadyClaimed={order.status === "transfer_claimed"}
          />
        </div>
      )}

      {order.paymentMethod === "card" && order.status === "awaiting_payment" && (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-semibold">Payment not completed</h2>
          <p className="mt-1 text-sm text-muted">
            We haven&apos;t received a card payment for this order. If you were
            charged, contact us at {storeConfig.email} with this reference.
          </p>
        </div>
      )}

      <section className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-lg font-semibold">What you ordered</h2>
        <ul className="mt-4 space-y-3 border-b border-line pb-4">
          {order.items.map((item) => (
            <li key={item.sku} className="flex justify-between gap-3 text-sm">
              <span>
                <Link
                  href={`/product/${item.slug}`}
                  className="font-medium transition hover:text-brand"
                >
                  {item.name}
                </Link>
                <span className="block text-muted">
                  {item.variantLabel} × {item.quantity}
                </span>
              </span>
              <span className="shrink-0 font-medium">
                {formatNaira(item.unitPriceKobo * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>{formatNaira(order.subtotalKobo)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Delivery</dt>
            <dd>
              {order.deliveryKobo === 0 ? "Free" : formatNaira(order.deliveryKobo)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatNaira(order.totalKobo)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-lg font-semibold">Delivering to</h2>
        <address className="mt-3 text-sm not-italic text-muted">
          <span className="block font-medium text-ink">{order.customer.name}</span>
          {order.customer.address}
          <span className="block">
            {order.customer.city}, {order.customer.state}
          </span>
          <span className="mt-2 block">{order.customer.phone}</span>
          <span className="block">{order.customer.email}</span>
          {order.customer.note && (
            <span className="mt-2 block italic">“{order.customer.note}”</span>
          )}
        </address>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className="rounded-xl border border-line bg-surface px-6 py-3 text-sm font-semibold transition hover:border-brand/50"
        >
          Continue shopping
        </Link>
        <a
          href={`mailto:${storeConfig.email}?subject=Order%20${order.reference}`}
          className="rounded-xl border border-line bg-surface px-6 py-3 text-sm font-semibold transition hover:border-brand/50"
        >
          Ask about this order
        </a>
      </div>
    </div>
  );
}
