import type { Product } from "@/lib/types";

/**
 * Stand-in product imagery: a pour-shaped gradient built from each product's
 * swatch. Drop real photographs in here later — the layout won't change.
 */
export function ProductMedia({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const [from, to] = product.swatch;
  // Deterministic per product, so a tile looks the same on every render.
  const seed = product.slug.length * 7;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(140deg, ${from}, ${to})` }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id={`gloss-${product.slug}`} cx="30%" cy="22%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse
          cx={100 + (seed % 18)}
          cy={118}
          rx={66}
          ry={44}
          fill="#ffffff"
          opacity="0.24"
        />
        <ellipse cx={86 - (seed % 10)} cy={96} rx={40} ry={28} fill={from} opacity="0.55" />
        <circle cx={132} cy={72} r={13} fill="#ffffff" opacity="0.4" />
        <circle cx={62} cy={140} r={8} fill="#ffffff" opacity="0.35" />
        <rect width="200" height="200" fill={`url(#gloss-${product.slug})`} />
      </svg>
    </div>
  );
}
