"use client";

import Link from "next/link";
import { useState } from "react";
import { formatNaira } from "@/lib/money";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const firstAvailable =
    product.variants.find((variant) => variant.inStock) ?? product.variants[0];
  const [sku, setSku] = useState(firstAvailable.sku);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selected =
    product.variants.find((variant) => variant.sku === sku) ?? firstAvailable;

  function handleAdd() {
    if (!selected.inStock) return;
    add(selected.sku, quantity);
    setAdded(true);
  }

  return (
    <div className="space-y-5">
      {product.variants.length > 1 && (
        <fieldset>
          <legend className="text-sm font-medium">Choose an option</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.variants.map((variant) => {
              const isSelected = variant.sku === sku;
              return (
                <button
                  key={variant.sku}
                  type="button"
                  disabled={!variant.inStock}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSku(variant.sku);
                    setAdded(false);
                  }}
                  className={`rounded-xl border px-3.5 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-45 ${
                    isSelected
                      ? "border-brand bg-brand-soft font-medium text-brand-dark"
                      : "border-line bg-surface hover:border-brand/50"
                  }`}
                >
                  {variant.label}
                  {!variant.inStock && " — sold out"}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <p className="text-3xl font-semibold tracking-tight">
        {formatNaira(selected.priceKobo)}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-xl border border-line bg-surface">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3.5 py-2.5 text-lg leading-none text-muted transition hover:text-ink"
          >
            −
          </button>
          <span aria-live="polite" className="w-10 text-center text-sm font-medium">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => Math.min(50, q + 1))}
            className="px-3.5 py-2.5 text-lg leading-none text-muted transition hover:text-ink"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!selected.inStock}
          className="flex-1 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
        >
          {selected.inStock ? "Add to cart" : "Sold out"}
        </button>
      </div>

      {added && (
        <p
          role="status"
          className="flex flex-wrap items-center gap-2 rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent"
        >
          <span className="font-medium">Added to your cart.</span>
          <Link href="/cart" className="underline underline-offset-2">
            View cart
          </Link>
          <Link href="/checkout" className="underline underline-offset-2">
            Checkout
          </Link>
        </p>
      )}
    </div>
  );
}
