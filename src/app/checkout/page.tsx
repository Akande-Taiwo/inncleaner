import type { Metadata } from "next";
import { CheckoutForm } from "./CheckoutForm";
import { DELIVERY, NIGERIAN_STATES } from "@/lib/config";
import { paystackConfigured } from "@/lib/paystack";

export const metadata: Metadata = { title: "Checkout" };

/** Reads env at request time, so the card option reflects live configuration. */
export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
      <p className="mt-2 text-muted">
        Delivery is 2–5 working days nationwide, same day in Lagos before 2pm.
      </p>

      <div className="mt-8">
        <CheckoutForm
          states={NIGERIAN_STATES}
          cardEnabled={paystackConfigured()}
          lagosDeliveryKobo={DELIVERY.lagosKobo}
          nationwideDeliveryKobo={DELIVERY.nationwideKobo}
          freeAboveKobo={DELIVERY.freeAboveKobo}
        />
      </div>
    </div>
  );
}
