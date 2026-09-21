import Link from "next/link";
import { formatNaira } from "@/lib/money";
import { priceRangeKobo } from "@/lib/products";
import type { Product } from "@/lib/types";
import { ProductMedia } from "./ProductMedia";

export function ProductCard({ product }: { product: Product }) {
  const [low, high] = priceRangeKobo(product);
  const soldOut = product.variants.every((variant) => !variant.inStock);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg"
    >
      <div className="relative">
        <ProductMedia product={product} className="aspect-4/3 w-full" />
        {soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-2.5 py-1 text-xs font-medium text-white">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold leading-snug transition group-hover:text-brand">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted">{product.tagline}</p>
        <p className="mt-3 text-sm font-semibold">
          {low === high
            ? formatNaira(low)
            : `${formatNaira(low)} – ${formatNaira(high)}`}
        </p>
      </div>
    </Link>
  );
}
