"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { findVariant } from "@/lib/products";

const STORAGE_KEY = "resin-cart-v1";

export interface CartLine {
  sku: string;
  quantity: number;
}

/** A cart line joined against the catalogue, ready to render. */
export interface ResolvedLine extends CartLine {
  slug: string;
  name: string;
  variantLabel: string;
  unitPriceKobo: number;
  lineTotalKobo: number;
  inStock: boolean;
}

interface CartContextValue {
  lines: CartLine[];
  resolved: ResolvedLine[];
  itemCount: number;
  subtotalKobo: number;
  /** False until localStorage has been read, so the server and first client render match. */
  hydrated: boolean;
  add(sku: string, quantity?: number): void;
  setQuantity(sku: string, quantity: number): void;
  remove(sku: string): void;
  clear(): void;
}

const CartContext = createContext<CartContextValue | null>(null);

const MAX_PER_LINE = 50;

function readStoredLines(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry): CartLine[] => {
      if (typeof entry !== "object" || entry === null) return [];
      const line = entry as Record<string, unknown>;
      const quantity = Number(line.quantity);
      // Drop anything no longer in the catalogue rather than showing a broken row.
      if (typeof line.sku !== "string" || !findVariant(line.sku)) return [];
      if (!Number.isInteger(quantity) || quantity < 1) return [];
      return [{ sku: line.sku, quantity: Math.min(quantity, MAX_PER_LINE) }];
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(readStoredLines());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Private browsing or a full quota — the cart still works for this session.
    }
  }, [lines, hydrated]);

  const add = useCallback((sku: string, quantity = 1) => {
    setLines((current) => {
      const existing = current.find((line) => line.sku === sku);
      if (existing) {
        return current.map((line) =>
          line.sku === sku
            ? { ...line, quantity: Math.min(line.quantity + quantity, MAX_PER_LINE) }
            : line,
        );
      }
      return [...current, { sku, quantity: Math.min(quantity, MAX_PER_LINE) }];
    });
  }, []);

  const setQuantity = useCallback((sku: string, quantity: number) => {
    setLines((current) =>
      quantity < 1
        ? current.filter((line) => line.sku !== sku)
        : current.map((line) =>
            line.sku === sku
              ? { ...line, quantity: Math.min(quantity, MAX_PER_LINE) }
              : line,
          ),
    );
  }, []);

  const remove = useCallback((sku: string) => {
    setLines((current) => current.filter((line) => line.sku !== sku));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const resolved = useMemo<ResolvedLine[]>(
    () =>
      lines.flatMap((line) => {
        const found = findVariant(line.sku);
        if (!found) return [];
        return [
          {
            ...line,
            slug: found.product.slug,
            name: found.product.name,
            variantLabel: found.variant.label,
            unitPriceKobo: found.variant.priceKobo,
            lineTotalKobo: found.variant.priceKobo * line.quantity,
            inStock: found.variant.inStock,
          },
        ];
      }),
    [lines],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      resolved,
      hydrated,
      itemCount: resolved.reduce((sum, line) => sum + line.quantity, 0),
      subtotalKobo: resolved.reduce((sum, line) => sum + line.lineTotalKobo, 0),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, resolved, hydrated, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside a CartProvider");
  return context;
}
