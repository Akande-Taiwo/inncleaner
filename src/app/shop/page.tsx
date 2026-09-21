import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, PRODUCTS } from "@/lib/products";
import type { Category } from "@/lib/types";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Epoxy and UV resin, mica pigments, silicone moulds, tools and safety gear.",
};

function isCategory(value: string | undefined): value is Category {
  return CATEGORIES.some((category) => category.id === value);
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const active = isCategory(params.category) ? params.category : undefined;
  const query = (params.q ?? "").trim().toLowerCase();

  const products = PRODUCTS.filter((product) => {
    if (active && product.category !== active) return false;
    if (!query) return true;
    return `${product.name} ${product.tagline} ${product.description}`
      .toLowerCase()
      .includes(query);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Shop</h1>
      <p className="mt-2 text-muted">
        {products.length} {products.length === 1 ? "product" : "products"}
        {active && ` in ${CATEGORIES.find((c) => c.id === active)?.label}`}
      </p>

      <form action="/shop" className="mt-6 flex max-w-md gap-2">
        {active && <input type="hidden" name="category" value={active} />}
        <input
          type="search"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search products"
          aria-label="Search products"
          className="flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-brand"
        />
        <button
          type="submit"
          className="rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand"
        >
          Search
        </button>
      </form>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/shop"
          className={`rounded-full border px-4 py-1.5 text-sm transition ${
            active
              ? "border-line bg-surface hover:border-brand/50"
              : "border-brand bg-brand-soft font-medium text-brand-dark"
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.id}`}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              active === category.id
                ? "border-brand bg-brand-soft font-medium text-brand-dark"
                : "border-line bg-surface hover:border-brand/50"
            }`}
          >
            {category.label}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-16 rounded-2xl border border-dashed border-line p-10 text-center text-muted">
          Nothing matched that search.{" "}
          <Link href="/shop" className="text-brand underline underline-offset-2">
            Clear filters
          </Link>
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
