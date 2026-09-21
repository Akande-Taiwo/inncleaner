export type Category =
  | "resin"
  | "pigments"
  | "moulds"
  | "tools"
  | "safety"
  | "kits";

export interface Variant {
  /** Stable, unique across the whole catalogue — this is what a cart line stores. */
  sku: string;
  label: string;
  priceKobo: number;
  inStock: boolean;
}

export interface Product {
  slug: string;
  name: string;
  category: Category;
  tagline: string;
  description: string;
  details: string[];
  variants: Variant[];
  /** Two hex colours used to render the product tile gradient. */
  swatch: [string, string];
  featured?: boolean;
}

export type PaymentMethod = "opay_transfer" | "card";

export type OrderStatus =
  | "awaiting_payment"
  | "transfer_claimed"
  | "paid"
  | "shipped"
  | "cancelled";

export interface OrderItem {
  sku: string;
  slug: string;
  name: string;
  variantLabel: string;
  /** Unit price at the time the order was placed, in kobo. */
  unitPriceKobo: number;
  quantity: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  note?: string;
}

export interface Order {
  /** Public, human-quotable id, e.g. "RSN-7QK4M2". Used in URLs. */
  reference: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customer: Customer;
  items: OrderItem[];
  subtotalKobo: number;
  deliveryKobo: number;
  totalKobo: number;
  /** What the customer typed in after sending an OPay transfer. */
  transferNote?: string;
  /** Paystack's transaction reference, once a card payment is initialised. */
  paystackReference?: string;
  paidAt?: string;
}
