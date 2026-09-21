"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  ADMIN_COOKIE,
  adminConfigured,
  checkPassword,
  isAdminRequest,
  issueSessionToken,
} from "@/lib/admin";
import { store } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";

export async function login(
  _prev: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  if (!adminConfigured()) {
    return "Admin access isn't set up. Add ADMIN_PASSWORD and ADMIN_SESSION_SECRET.";
  }

  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    return "That password isn't right.";
  }

  const token = issueSessionToken();
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: token.maxAge,
  });

  revalidatePath("/admin");
  return undefined;
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.delete({ name: ADMIN_COOKIE, path: "/admin" });
  revalidatePath("/admin");
}

const ALLOWED: OrderStatus[] = [
  "awaiting_payment",
  "transfer_claimed",
  "paid",
  "shipped",
  "cancelled",
];

export async function setOrderStatus(formData: FormData): Promise<void> {
  // Server actions are publicly callable endpoints — re-check the session here
  // rather than relying on the page having rendered the form.
  if (!(await isAdminRequest())) return;

  const reference = String(formData.get("reference") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (!reference || !ALLOWED.includes(status)) return;

  await store.update(reference, {
    status,
    ...(status === "paid" ? { paidAt: new Date().toISOString() } : {}),
  });

  revalidatePath("/admin");
}
