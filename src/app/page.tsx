import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, featuredProducts } from "@/lib/products";
import { DELIVERY } from "@/lib/config";
import { formatNaira } from "@/lib/money";

const STEPS = [
  {
    title: "Pick your materials",
    body: "Resin, pigments, moulds and the tools that go with them — sized for hobby pours and for production runs.",
  },
  {
    title: "Pay how you like",
    body: "Send a bank transfer to our OPay account, or pay by card, Verve included. Both confirm the same day.",
  },
  {
    title: "We dispatch",
    body: "Lagos orders go out same day when they land before 2pm. Everywhere else, 2–5 working days.",
  },
];

export default function HomePage() {
  const featured = featuredProducts();

  return (
    <div>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand-dark">
              Free delivery over {formatNaira(DELIVERY.freeAboveKobo)}
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Resin supplies that actually cure clear.
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted">
              Epoxy and UV resin, mica pigments, silicone moulds and finishing
              tools — stocked in Nigeria, shipped nationwide.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Shop everything
              </Link>
              <Link
                href="/product/beginner-starter-kit"
                className="rounded-xl border border-line bg-surface px-6 py-3 text-sm font-semibold transition hover:border-brand/50"
              >
                Start with a kit
              </Link>
            </div>
          </div>

          <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-linear-to-br from-[#ffd98a] via-[#ff9ecb] to-[#8ad5b4]">
            <div className="absolute inset-0 bg-linear-to-t from-black/15 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/85 p-4 backdrop-blur">
              <p className="text-sm font-medium">Pay with OPay transfer or card</p>
              <p className="mt-1 text-sm text-muted">
                Transfer straight from your bank app, or checkout by card.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Best sellers</h2>
            <p className="mt-1 text-muted">What our makers reorder most.</p>
          </div>
          <Link
            href="/shop"
            className="text-sm font-medium text-brand transition hover:text-brand-dark"
          >
            View all →
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Shop by category</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.id}`}
                className="rounded-2xl border border-line p-5 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
              >
                <h3 className="font-semibold">{category.label}</h3>
                <p className="mt-1 text-sm text-muted">{category.blurb}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">How ordering works</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-line bg-surface p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-dark">
                {index + 1}
              </span>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
