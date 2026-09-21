"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  orderReference: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  amountLabel: string;
  alreadyClaimed: boolean;
}

export function TransferPanel({
  orderReference,
  accountName,
  accountNumber,
  bankName,
  amountLabel,
  alreadyClaimed,
}: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function copyAccountNumber() {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy automatically — please copy the number manually.");
    }
  }

  async function confirmTransfer() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderReference}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        setError(body.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      router.refresh();
    } catch {
      setError("We couldn't reach the server. Check your connection and retry.");
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-brand/30 bg-brand-soft p-6">
      <h2 className="text-lg font-semibold">Send {amountLabel} to this account</h2>
      <p className="mt-1 text-sm text-brand-dark">
        Transfer from any bank app. Use your order reference{" "}
        <strong>{orderReference}</strong> as the narration if your app allows it.
      </p>

      <dl className="mt-5 space-y-3 rounded-xl bg-surface p-5">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-muted">Bank</dt>
          <dd className="font-medium">{bankName}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-muted">Account name</dt>
          <dd className="text-right font-medium">{accountName}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
          <dt className="text-sm text-muted">Account number</dt>
          <dd className="flex items-center gap-3">
            <span className="text-xl font-semibold tracking-wider tabular-nums">
              {accountNumber}
            </span>
            <button
              type="button"
              onClick={copyAccountNumber}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium transition hover:border-brand/50"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
          <dt className="text-sm text-muted">Amount</dt>
          <dd className="text-xl font-semibold">{amountLabel}</dd>
        </div>
      </dl>

      {alreadyClaimed ? (
        <p className="mt-5 rounded-xl bg-surface px-4 py-3 text-sm">
          Thanks — we&apos;re checking for your transfer now. You&apos;ll get an
          email once it&apos;s confirmed. This page updates too.
        </p>
      ) : (
        <div className="mt-6">
          <label className="block">
            <span className="text-sm font-medium">
              Anything we should know? <span className="text-muted">(optional)</span>
            </span>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. sent from a different name, or your transfer reference"
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-brand"
            />
          </label>

          <button
            type="button"
            onClick={confirmTransfer}
            disabled={submitting}
            className="mt-4 w-full rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting ? "Letting them know…" : "I've sent the transfer"}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-brand-dark">
          {error}
        </p>
      )}
    </div>
  );
}
