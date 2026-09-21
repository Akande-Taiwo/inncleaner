import { redirect } from "next/navigation";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Track your order" };

async function findOrder(formData: FormData) {
  "use server";
  const reference = String(formData.get("reference") ?? "")
    .trim()
    .toUpperCase();

  if (!reference) redirect("/track?error=empty");

  const order = await store.get(reference);
  if (!order) redirect(`/track?error=missing&reference=${encodeURIComponent(reference)}`);

  redirect(`/order/${order.reference}`);
}

const MESSAGES: Record<string, string> = {
  empty: "Enter your order reference to look it up.",
  missing: "We couldn't find an order with that reference. Check it and try again.",
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reference?: string }>;
}) {
  const params = await searchParams;
  const message = params.error ? MESSAGES[params.error] : undefined;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Track your order</h1>
      <p className="mt-2 text-muted">
        Enter the reference from your order confirmation, e.g. RSN-7QK4M2.
      </p>

      <form action={findOrder} className="mt-8 flex gap-2">
        <input
          name="reference"
          required
          defaultValue={params.reference ?? ""}
          placeholder="RSN-XXXXXX"
          aria-label="Order reference"
          className="flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-sm uppercase outline-none transition focus:border-brand"
        />
        <button
          type="submit"
          className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Find it
        </button>
      </form>

      {message && (
        <p role="alert" className="mt-4 rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand-dark">
          {message}
        </p>
      )}
    </div>
  );
}
