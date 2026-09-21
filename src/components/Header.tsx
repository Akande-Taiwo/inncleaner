import Link from "next/link";
import { storeConfig } from "@/lib/config";
import { CartBadge } from "./CartBadge";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=kits", label: "Starter Kits" },
  { href: "/track", label: "Track order" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-shell/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="h-8 w-8 rounded-lg bg-linear-to-br from-brand to-accent"
          />
          <span className="text-base font-semibold tracking-tight sm:text-lg">
            {storeConfig.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm text-muted transition hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <CartBadge />
      </div>

      {/* Same links on small screens, laid out as a scrollable strip. */}
      <nav className="flex gap-5 overflow-x-auto border-t border-line px-4 py-2 md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="shrink-0 text-sm text-muted transition hover:text-ink"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
