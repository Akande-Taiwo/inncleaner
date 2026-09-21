import type { Category, Product, Variant } from "./types";

export const CATEGORIES: { id: Category; label: string; blurb: string }[] = [
  { id: "kits", label: "Starter Kits", blurb: "Everything in one box" },
  { id: "resin", label: "Resin", blurb: "Epoxy, UV and deep-pour" },
  { id: "pigments", label: "Pigments & Colour", blurb: "Mica, alcohol ink, glitter" },
  { id: "moulds", label: "Moulds", blurb: "Silicone shapes and trays" },
  { id: "tools", label: "Tools", blurb: "Mixing, curing and finishing" },
  { id: "safety", label: "Safety Gear", blurb: "Work clean, work safe" },
];

export const PRODUCTS: Product[] = [
  {
    slug: "clear-epoxy-resin-kit",
    name: "Crystal Clear Epoxy Resin",
    category: "resin",
    tagline: "Bubble-free 1:1 casting resin with a glass-hard finish",
    description:
      "Our workhorse 1:1 epoxy. Low odour, self-levelling and it cures to a genuinely glass-clear finish without yellowing. Good for coasters, jewellery, river tables and art pours.",
    details: [
      "Mix ratio 1:1 by volume",
      "Working time 40 minutes at 25°C",
      "Touch-dry in 8 hours, full cure in 72 hours",
      "UV-stabilised — resists yellowing",
    ],
    swatch: ["#bfe9ff", "#e8f7ff"],
    featured: true,
    variants: [
      { sku: "RES-CLR-500", label: "500g (250g + 250g)", priceKobo: 1350000, inStock: true },
      { sku: "RES-CLR-1000", label: "1kg (500g + 500g)", priceKobo: 2400000, inStock: true },
      { sku: "RES-CLR-3000", label: "3kg (1.5kg + 1.5kg)", priceKobo: 6500000, inStock: true },
    ],
  },
  {
    slug: "deep-pour-resin",
    name: "Deep Pour Casting Resin",
    category: "resin",
    tagline: "Pour up to 5cm in a single layer without overheating",
    description:
      "A slow-curing 2:1 system built for thick casts. Because it releases heat gently you can pour deep moulds and river tables in one go instead of stacking thin layers.",
    details: [
      "Mix ratio 2:1 by volume",
      "Pours up to 50mm per layer",
      "Working time 4 hours",
      "Full cure in 7 days",
    ],
    swatch: ["#a5c8ff", "#dbe8ff"],
    variants: [
      { sku: "RES-DEEP-1500", label: "1.5kg", priceKobo: 3200000, inStock: true },
      { sku: "RES-DEEP-4500", label: "4.5kg", priceKobo: 8900000, inStock: true },
    ],
  },
  {
    slug: "uv-resin",
    name: "Fast-Cure UV Resin",
    category: "resin",
    tagline: "Hard in 90 seconds under a UV lamp",
    description:
      "Single-component resin — no mixing, no measuring. Squeeze, shape and cure under a 36W lamp. Best for small jewellery pieces, keyrings and layered charms.",
    details: [
      "No mixing required",
      "Cures in 60–120 seconds under 36W UV",
      "Low viscosity, good for fine moulds",
      "Non-yellowing hard finish",
    ],
    swatch: ["#d9c2ff", "#f0e6ff"],
    featured: true,
    variants: [
      { sku: "RES-UV-100", label: "100g bottle", priceKobo: 850000, inStock: true },
      { sku: "RES-UV-500", label: "500g bottle", priceKobo: 3400000, inStock: true },
    ],
  },
  {
    slug: "mica-pigment-set",
    name: "Mica Pigment Powder Set",
    category: "pigments",
    tagline: "24 shimmer shades, 10g each",
    description:
      "Finely milled mica that disperses evenly without clumping. A little goes a long way — roughly a quarter teaspoon colours 100g of resin. Safe for skin-contact jewellery once cured.",
    details: [
      "24 jars × 10g",
      "Cosmetic grade, non-toxic",
      "Works in epoxy, UV resin, soap and candles",
      "Resealable jars",
    ],
    swatch: ["#ffd76e", "#ff9ecb"],
    featured: true,
    variants: [
      { sku: "PIG-MICA-12", label: "12-colour set", priceKobo: 1450000, inStock: true },
      { sku: "PIG-MICA-24", label: "24-colour set", priceKobo: 2600000, inStock: true },
    ],
  },
  {
    slug: "alcohol-ink-set",
    name: "Alcohol Ink Set",
    category: "pigments",
    tagline: "Translucent colour that blooms and marbles",
    description:
      "Highly concentrated alcohol-based ink. One drop spreads across a whole coaster, giving you those petri-dish blooms and marbled ocean effects.",
    details: [
      "12 bottles × 10ml",
      "Blends with isopropyl alcohol",
      "Intense, translucent colour",
      "Works on resin, yupo paper and ceramic",
    ],
    swatch: ["#57d6c4", "#2f7de1"],
    variants: [
      { sku: "PIG-INK-12", label: "12 × 10ml", priceKobo: 1750000, inStock: true },
      { sku: "PIG-INK-24", label: "24 × 10ml", priceKobo: 3200000, inStock: false },
    ],
  },
  {
    slug: "chunky-glitter-mix",
    name: "Chunky Glitter Mix",
    category: "pigments",
    tagline: "Solvent-resistant glitter that won't bleed in resin",
    description:
      "Polyester glitter in a mix of cuts from fine dust to 3mm hex. Solvent resistant, so the colour stays put instead of leaching into your pour.",
    details: [
      "6 jars × 20g",
      "Mixed cuts: 0.2mm – 3mm",
      "Solvent resistant — no colour bleed",
      "Cosmetic grade",
    ],
    swatch: ["#ff8fb1", "#ffd36e"],
    variants: [
      { sku: "PIG-GLT-6", label: "6-jar mix", priceKobo: 980000, inStock: true },
    ],
  },
  {
    slug: "silicone-coaster-moulds",
    name: "Silicone Coaster Mould Set",
    category: "moulds",
    tagline: "Four coasters plus a matching holder",
    description:
      "Thick, high-wall platinum silicone that holds its shape through hundreds of pours. The mirror-smooth interior means far less sanding afterwards.",
    details: [
      "4 × round coasters (100mm) + 1 holder",
      "Platinum-cure silicone",
      "Heat resistant to 220°C",
      "Reusable — 500+ pours",
    ],
    swatch: ["#9fe6c2", "#d8f7e6"],
    featured: true,
    variants: [
      { sku: "MLD-COA-RND", label: "Round set", priceKobo: 1250000, inStock: true },
      { sku: "MLD-COA-HEX", label: "Hexagon set", priceKobo: 1350000, inStock: true },
    ],
  },
  {
    slug: "jewellery-mould-pack",
    name: "Jewellery Mould Pack",
    category: "moulds",
    tagline: "58 cavities for pendants, earrings and rings",
    description:
      "A spread of small cavities in one pack — teardrops, circles, rectangles, hearts and ring bands in three sizes. The fastest way to work out which shapes actually sell.",
    details: [
      "58 cavities across 6 mats",
      "Includes 200 screw eye pins",
      "Flexible — pops out without cracking",
      "Suits UV and epoxy resin",
    ],
    swatch: ["#ffc2d1", "#ffe9f0"],
    variants: [
      { sku: "MLD-JWL-58", label: "58-cavity pack", priceKobo: 1650000, inStock: true },
    ],
  },
  {
    slug: "tray-mould-large",
    name: "Large Serving Tray Mould",
    category: "moulds",
    tagline: "38cm rectangular tray with handle cut-outs",
    description:
      "A big, rigid-walled mould for serving trays. Thick enough that it doesn't bow under a full 1.5kg pour, which is usually where cheap tray moulds fail.",
    details: [
      "380mm × 250mm × 12mm",
      "Built-in handle cut-outs",
      "Reinforced walls — no bowing",
      "Takes roughly 1.2kg of resin",
    ],
    swatch: ["#c9b393", "#eddfcb"],
    variants: [
      { sku: "MLD-TRY-38", label: "38cm rectangle", priceKobo: 2850000, inStock: true },
    ],
  },
  {
    slug: "resin-tool-kit",
    name: "Resin Finishing Tool Kit",
    category: "tools",
    tagline: "Mixing, measuring, sanding and polishing in one box",
    description:
      "The bits you end up buying one at a time anyway. Graduated cups so your ratios are actually right, plus a full wet-sanding ladder and polish for a glass finish off the mould.",
    details: [
      "20 graduated mixing cups + 30 sticks",
      "Wet sandpaper 400–3000 grit",
      "Polishing compound and cloth",
      "Silicone spatula and pipettes",
    ],
    swatch: ["#b9c4d4", "#e4e9f0"],
    variants: [
      { sku: "TOL-KIT-STD", label: "Standard kit", priceKobo: 1450000, inStock: true },
      { sku: "TOL-KIT-PRO", label: "Pro kit (adds rotary polisher)", priceKobo: 4900000, inStock: true },
    ],
  },
  {
    slug: "heat-gun",
    name: "Resin Heat Gun",
    category: "tools",
    tagline: "Pops surface bubbles without scorching your pour",
    description:
      "A low-airflow heat gun made for resin specifically. Ordinary paint-stripper guns blow so hard they ripple the surface — this one clears bubbles and leaves the pour flat.",
    details: [
      "Dual temperature: 200°C / 350°C",
      "Low airflow — won't ripple the pour",
      "300W, 2m cable",
      "Nigerian 3-pin plug",
    ],
    swatch: ["#ffb38a", "#ffe0cc"],
    variants: [
      { sku: "TOL-HEAT-300", label: "300W heat gun", priceKobo: 2200000, inStock: true },
    ],
  },
  {
    slug: "uv-curing-lamp",
    name: "36W UV Curing Lamp",
    category: "tools",
    tagline: "Cures a tray of charms in under two minutes",
    description:
      "Foldable 36W lamp with a removable base, so you can cure flat pieces on the mat or stand it over a taller mould. Timer stops it cooking your work.",
    details: [
      "36W, 365nm + 405nm dual wavelength",
      "30s / 60s / 90s timer",
      "Removable base for tall pieces",
      "Nigerian 3-pin plug",
    ],
    swatch: ["#c4b5ff", "#e8e2ff"],
    variants: [
      { sku: "TOL-UV-36", label: "36W lamp", priceKobo: 2650000, inStock: true },
    ],
  },
  {
    slug: "respirator-mask",
    name: "Organic Vapour Respirator",
    category: "safety",
    tagline: "Filters the fumes a paper mask does nothing about",
    description:
      "Half-face respirator with replaceable organic-vapour cartridges. A dust mask does not filter resin fumes — if you pour regularly in a small room, this is the one thing worth buying first.",
    details: [
      "Half-face silicone seal",
      "2 × A1P2 organic vapour cartridges",
      "Replaceable filters",
      "Adjustable head harness",
    ],
    swatch: ["#8fd3ff", "#d6efff"],
    variants: [
      { sku: "SAF-RSP-STD", label: "Respirator + 2 filters", priceKobo: 1850000, inStock: true },
      { sku: "SAF-RSP-FLT", label: "Replacement filters (pair)", priceKobo: 550000, inStock: true },
    ],
  },
  {
    slug: "nitrile-gloves",
    name: "Nitrile Gloves (100pk)",
    category: "safety",
    tagline: "Resin-resistant, powder-free, textured grip",
    description:
      "Uncured resin sensitises skin over time, and once you react to it you tend to react for good. Nitrile holds up where latex swells and tears.",
    details: [
      "Box of 100 (50 pairs)",
      "Powder-free, textured fingertips",
      "Sizes M, L, XL",
      "Chemical resistant",
    ],
    swatch: ["#a8b8ff", "#dde3ff"],
    variants: [
      { sku: "SAF-GLV-M", label: "Medium", priceKobo: 750000, inStock: true },
      { sku: "SAF-GLV-L", label: "Large", priceKobo: 750000, inStock: true },
      { sku: "SAF-GLV-XL", label: "Extra large", priceKobo: 780000, inStock: true },
    ],
  },
  {
    slug: "beginner-starter-kit",
    name: "Beginner Resin Starter Kit",
    category: "kits",
    tagline: "Your first ten pours, everything included",
    description:
      "Built for someone who has never poured before. Resin, colour, moulds, tools and gloves in proportions that actually match — so you don't run out of hardener with half a jar of resin left.",
    details: [
      "1kg crystal clear epoxy",
      "12 mica pigments",
      "Coaster and jewellery moulds",
      "Mixing cups, sticks, gloves",
      "Printed quick-start guide",
    ],
    swatch: ["#ffd98a", "#ffeec4"],
    featured: true,
    variants: [
      { sku: "KIT-BEG-STD", label: "Starter kit", priceKobo: 5900000, inStock: true },
    ],
  },
  {
    slug: "business-starter-kit",
    name: "Small Business Bulk Kit",
    category: "kits",
    tagline: "Stock for roughly 60 sellable pieces",
    description:
      "For anyone already selling. Bulk resin, the full pigment range and enough mould capacity to run several pieces at once, priced well below buying the parts separately.",
    details: [
      "4.5kg deep pour + 3kg clear epoxy",
      "24 mica pigments + glitter mix",
      "Coaster, tray and jewellery moulds",
      "Pro finishing kit and heat gun",
      "Priority dispatch",
    ],
    swatch: ["#8ad5b4", "#cdeee0"],
    variants: [
      { sku: "KIT-BIZ-STD", label: "Bulk kit", priceKobo: 24500000, inStock: true },
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

/** Look a variant up by SKU across the catalogue. This is the server's source of truth for price. */
export function findVariant(
  sku: string,
): { product: Product; variant: Variant } | undefined {
  for (const product of PRODUCTS) {
    const variant = product.variants.find((v) => v.sku === sku);
    if (variant) return { product, variant };
  }
  return undefined;
}

export function productsByCategory(category: Category): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function featuredProducts(): Product[] {
  return PRODUCTS.filter((p) => p.featured);
}

export function priceRangeKobo(product: Product): [number, number] {
  const prices = product.variants.map((v) => v.priceKobo);
  return [Math.min(...prices), Math.max(...prices)];
}
