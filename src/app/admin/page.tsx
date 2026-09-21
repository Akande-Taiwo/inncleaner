import Link from "next/link";
import { adminConfigured, isAdminRequest } from "@/lib/admin";
import { formatNaira } from "@/lib/money";
import { STATUS_LABELS } from "@/lib/orders";
import { store, usingDatabase } from "@/lib/store";
import type { Order } from "@/lib/types";
import { LoginForm } from "./LoginForm";
import { logout, setOrderStatus } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders", robots: { index: false } };

export default async function AdminPage() {
  if (!(await isAdminRequest())) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Order admin</h1>
        {adminConfigured() ? (
          <LoginForm />
        ) : (
          <p className="mt-6 rounded-xl border border-dashed border-line bg-surface p-5 text-sm text-muted">
            Set <code className="font-mono">ADMIN_PASSWORD</code> and{" "}
            <code className="font-mono">ADMIN_SESSION_SECRET</code> in your
            environment variables to enable this page.
          </p>
        )}
      </div>
    );
  }

  const orders = await store.list();
  const needsAttention = orders.filter((o) => o.status === "transfer_claimed");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-1 text-muted">
            {orders.length} total
            {needsAttention.length > 0 &&
              ` · ${needsAttention.length} waiting on you to confirm a transfer`}
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium transition hover:border-brand/50"
          >
            Sign out
          </button>
        </form>
      </div>

      {!usingDatabase && (
        <p className="mt-6 rounded-xl border border-dashed border-line bg-surface px-4 py-3 text-sm text-muted">
          No <code className="font-mono">DATABASE_URL</code> set, so orders are
          saved to a local file. That works in development but not on Vercel —
          add a Postgres database before taking real orders.
        </p>
      )}

      {orders.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-line p-12 text-center text-muted">
          No orders yet.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => (
            <OrderRow key={order.reference} order={order} />
          ))}
        </ul>
      )}
    </div>
  );
}

const NEXT_ACTIONS: { status: Order["status"]; label: string }[] = [
  { status: "paid", label: "Mark paid" },
  { status: "shipped", label: "Mark shipped" },
  { status: "cancelled", label: "Cancel" },
];

function OrderRow({ order }: { order: Order }) {
  return (
    <li className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/order/${order.reference}`}
            className="font-semibold transition hover:text-brand"
          >
            {order.reference}
          </Link>
          <p className="mt-0.5 text-sm text-muted">
            {new Date(order.createdAt).toLocaleString("en-NG")} ·{" "}
            {order.paymentMethod === "card" ? "Card" : "OPay transfer"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">{formatNaira(order.totalKobo)}</p>
          <p className="text-sm text-muted">{STATUS_LABELS[order.status]}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 border-t border-line pt-4 text-sm sm:grid-cols-2">
        <div>
          <p className="font-medium">{order.customer.name}</p>
          <p className="text-muted">{order.customer.phone}</p>
          <p className="text-muted">{order.customer.email}</p>
          <p className="mt-1 text-muted">
            {order.customer.address}, {order.customer.city}, {order.customer.state}
          </p>
          {order.customer.note && (
            <p className="mt-1 italic text-muted">“{order.customer.note}”</p>
          )}
        </div>
        <ul className="space-y-1 text-muted">
          {order.items.map((item) => (
            <li key={item.sku}>
              {item.quantity} × {item.name} — {item.variantLabel}
            </li>
          ))}
        </ul>
      </div>

      {order.transferNote && (
        <p className="mt-3 rounded-xl bg-brand-soft px-4 py-2.5 text-sm text-brand-dark">
          Customer note on transfer: “{order.transferNote}”
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {NEXT_ACTIONS.filter((action) => action.status !== order.status).map(
          (action) => (
            <form key={action.status} action={setOrderStatus}>
              <input type="hidden" name="reference" value={order.reference} />
              <input type="hidden" name="status" value={action.status} />
              <button
                type="submit"
                className="rounded-lg border border-line px-3.5 py-1.5 text-sm font-medium transition hover:border-brand/50 hover:text-brand"
              >
                {action.label}
              </button>
            </form>
          ),
        )}
      </div>
    </li>
  );
}
