/**
 * All money in this app is stored and computed as an integer number of kobo
 * (1 naira = 100 kobo). Floats are never used for money — 0.1 + 0.2 problems
 * turn into real cash discrepancies at checkout.
 */

export const KOBO_PER_NAIRA = 100;

export function formatNaira(kobo: number): string {
  const naira = kobo / KOBO_PER_NAIRA;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: naira % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(naira);
}

export function nairaToKobo(naira: number): number {
  return Math.round(naira * KOBO_PER_NAIRA);
}
