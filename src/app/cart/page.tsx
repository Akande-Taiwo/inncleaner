"use client";

import Link from "next/link";
import { ProductMedia } from "@/components/ProductMedia";
import { useCart } from "@/components/CartProvider";
import { formatNaira } from "@/lib/money";
import { getProduct } from "@/lib/products";
import { DELIVERY } from "@/lib/config";

export default function CartPage() {
  const { resolved, subtotalKobo, setQuantity, remove, hydrated } = useCart();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p className="text-muted">Loading your cart…</p>
      </div>
    );
  }

  if (resolved.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>
        <div className="mt-8 rounded-2xl border border-dashed border-line p-12 text-center">
          <p className="text-muted">Your cart is empty.</p>
          <Link
            href="/shop"
            className="mt-5 inline-block rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Browse the shop
          </Link>
        </div>
      </div>
    );
  }

  const hasUnavailable = resolved.some((line) => !line.inStock);
  const shortOfFreeDelivery = DELIVERY.freeAboveKobo - subtotalKobo;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>

      <ul className="mt-8 space-y-4">
        {resolved.map((line) => {
          const product = getProduct(line.slug);
          return (
            <li
              key={line.sku}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-4"
            >
              {product && (
                <Link href={`/product/${line.slug}`} className="shrink-0">
                  <ProductMedia
                    product={product}
                    className="h-20 w-20 rounded-xl"
                  />
                </Link>
              )}

              <div className="min-w-40 flex-1">
                <Link
                  href={`/product/${line.slug}`}
                  className="font-medium transition hover:text-brand"
                >
                  {line.name}
                </Link>
                <p className="mt-0.5 text-sm text-muted">{line.variantLabel}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {formatNaira(line.unitPriceKobo)} each
                </p>
                {!line.inStock && (
                  <p className="mt-1 text-sm font-medium text-brand">
                    Out of stock — remove it to check out
                  </p>
                )}
              </div>

              <div className="flex items-center rounded-xl border border-line">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${line.name}`}
                  onClick={() => setQuantity(line.sku, line.quantity - 1)}
                  className="px-3 py-2 leading-none text-muted transition hover:text-ink"
                >
                  −
                </button>
                <span className="w-9 text-center text-sm font-medium">
                  {line.quantity}
                </span>
                <button
                  type="button"
                  aria-label={`Increase quantity of ${line.name}`}
                  onClick={() => setQuantity(line.sku, line.quantity + 1)}
                  className="px-3 py-2 leading-none text-muted transition hover:text-ink"
                >
                  +
                </button>
              </div>

              <div className="w-28 text-right">
                <p className="font-semibold">{formatNaira(line.lineTotalKobo)}</p>
                <button
                  type="button"
                  onClick={() => remove(line.sku)}
                  className="mt-1 text-sm text-muted underline underline-offset-2 transition hover:text-brand"
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <div className="flex items-center justify-between text-lg">
          <span className="font-medium">Subtotal</span>
          <span className="font-semibold">{formatNaira(subtotalKobo)}</span>
        </div>
        <p className="mt-2 text-sm text-muted">
          {shortOfFreeDelivery > 0
            ? `Add ${formatNaira(shortOfFreeDelivery)} more for free delivery. Otherwise delivery is calculated at checkout.`
            : "Your order qualifies for free delivery."}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/checkout"
            aria-disabled={hasUnavailable}
            className={`flex-1 rounded-xl px-6 py-3 text-center text-sm font-semibold text-white transition sm:flex-none ${
              hasUnavailable
                ? "pointer-events-none bg-ink/30"
                : "bg-brand hover:bg-brand-dark"
            }`}
          >
            Checkout
          </Link>
          <Link
            href="/shop"
            className="rounded-xl border border-line px-6 py-3 text-center text-sm font-semibold transition hover:border-brand/50"
          >
            Keep shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
