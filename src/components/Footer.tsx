import Link from "next/link";
import { CATEGORIES } from "@/lib/products";
import { storeConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <h2 className="text-base font-semibold">{storeConfig.name}</h2>
          <p className="mt-2 max-w-xs text-sm text-muted">
            {storeConfig.tagline}. Nationwide delivery, 2–5 working days.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Shop</h3>
          <ul className="mt-3 space-y-2">
            {CATEGORIES.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/shop?category=${category.id}`}
                  className="text-sm text-muted transition hover:text-ink"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <a className="transition hover:text-ink" href={`mailto:${storeConfig.email}`}>
                {storeConfig.email}
              </a>
            </li>
            <li>{storeConfig.phone}</li>
            {storeConfig.whatsapp && (
              <li>
                <a
                  className="transition hover:text-ink"
                  href={`https://wa.me/${storeConfig.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp us
                </a>
              </li>
            )}
            {storeConfig.instagram && (
              <li>
                <a
                  className="transition hover:text-ink"
                  href={`https://instagram.com/${storeConfig.instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>
              </li>
            )}
            <li className="pt-2">
              <Link href="/track" className="transition hover:text-ink">
                Track an order
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line px-4 py-5 text-center text-xs text-muted sm:px-6">
        © {new Date().getFullYear()} {storeConfig.name}. Pay by OPay transfer or card.
      </div>
    </footer>
  );
}
