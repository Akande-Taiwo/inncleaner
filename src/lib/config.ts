/**
 * Everything you'd want to change without touching component code.
 * Values fall back to sensible placeholders so the site runs before you've
 * filled in your .env file — the transfer page warns when it's still on them.
 */

export const OPAY_PLACEHOLDER_ACCOUNT = "0000000000";

export const storeConfig = {
  name: process.env.STORE_NAME || "Inn Resin Supply",
  tagline: "Resin, pigments and moulds for Nigerian makers",
  email: process.env.STORE_EMAIL || "hello@example.com",
  phone: process.env.STORE_PHONE || "+234 000 000 0000",
  whatsapp: process.env.STORE_WHATSAPP || "",
  instagram: process.env.STORE_INSTAGRAM || "",
} as const;

export const opayConfig = {
  accountName: process.env.OPAY_ACCOUNT_NAME || "Your Business Name",
  accountNumber: process.env.OPAY_ACCOUNT_NUMBER || OPAY_PLACEHOLDER_ACCOUNT,
  bankName: process.env.OPAY_BANK_NAME || "OPay",
} as const;

export function opayConfigured(): boolean {
  return opayConfig.accountNumber !== OPAY_PLACEHOLDER_ACCOUNT;
}

/** Delivery is a flat fee by zone, waived above a threshold. */
export const DELIVERY = {
  lagosKobo: 250000,
  nationwideKobo: 450000,
  freeAboveKobo: 15000000,
} as const;

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "Federal Capital Territory", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
  "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun",
  "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe",
  "Zamfara",
] as const;

export function deliveryKoboFor(state: string, subtotalKobo: number): number {
  if (subtotalKobo >= DELIVERY.freeAboveKobo) return 0;
  return state.trim().toLowerCase() === "lagos"
    ? DELIVERY.lagosKobo
    : DELIVERY.nationwideKobo;
}
