# Resin Store

An online shop for selling resin materials in Nigeria. Customers browse, add to
a cart, and pay either by **bank transfer to your OPay account** or **by card
through Paystack**. You confirm transfers from a built-in admin page.

Built with Next.js (App Router) and Tailwind CSS, designed to deploy on Vercel.

---

## Getting it running on your own machine

```bash
npm install
cp .env.example .env.local   # then fill it in — see below
npm run dev
```

Open http://localhost:3000.

With no configuration at all the shop still runs: you can browse, add to the
cart and place a transfer order. Orders are saved to a local `data/orders.json`
file so you can try the whole flow before setting up a database.

---

## Going live: the four things to set up

### 1. Your OPay account details

In `.env.local` (and later in Vercel), set:

```
OPAY_ACCOUNT_NAME="Your Business Name"
OPAY_ACCOUNT_NUMBER="9012345678"
OPAY_BANK_NAME="OPay"
```

This is the account shown to customers on the payment page. Until you set it
they'll see a placeholder number, and the page will warn you about it.

**How transfer orders work:** the customer sees your account number and the
exact amount, transfers from their bank app, then taps *"I've sent the
transfer"*. The order moves to **Transfer reported** and appears at the top of
your admin page. You check your OPay app, and when the money is there you press
**Mark paid**. Nothing is ever marked paid automatically on the transfer route —
a customer saying they paid is only a claim until you confirm it.

### 2. A database (required for Vercel)

Vercel's filesystem is read-only, so the local JSON file won't work in
production — orders would vanish. You need a Postgres connection string.

The quickest route: in your Vercel project, go to **Storage → Create Database →
Postgres**. Vercel sets `DATABASE_URL` for you. [Neon](https://neon.tech) and
[Supabase](https://supabase.com) both have free tiers and work identically —
just paste their connection string as `DATABASE_URL`.

The `orders` table is created automatically on first use. There's no migration
step to run.

### 3. Admin access

```
ADMIN_PASSWORD="something-long-and-private"
ADMIN_SESSION_SECRET="<paste output of: openssl rand -hex 32>"
```

Then sign in at `/admin` to see orders, read customers' delivery details, and
mark orders paid, shipped or cancelled. Sessions last 8 hours.

### 4. Card payments through Paystack (optional)

Create a free account at [paystack.com](https://paystack.com), then from
**Settings → API Keys & Webhooks** copy your **secret key**:

```
PAYSTACK_SECRET_KEY="sk_test_..."   # sk_live_... when you go live
```

Leave it blank and the card option is hidden — transfers keep working on their
own. Set it and a "Pay by card" option appears, covering Verve, Mastercard and
Visa.

**Also add the webhook.** On the same Paystack settings page, set the webhook URL to:

```
https://your-domain.com/api/webhooks/paystack
```

This matters: it's how a payment still gets confirmed if the customer closes
their browser mid-redirect. Requests are rejected unless they carry a valid
Paystack signature.

Test with Paystack's test card `4084 0840 8408 4081`, any future expiry, CVV
`408`, OTP `123456`. Do one live transaction for real before you announce the shop.

---

## Deploying to Vercel

1. Push this repository to GitHub.
2. At [vercel.com/new](https://vercel.com/new), import the repository. It
   detects Next.js — no build settings to change.
3. Add every variable from `.env.example` under **Settings → Environment
   Variables**.
4. Deploy, then add your Paystack webhook URL using the live domain.

Adding or changing an environment variable needs a redeploy to take effect.

---

## Changing what you sell

The catalogue lives in one file: **`src/lib/products.ts`**. Each product looks
like this:

```ts
{
  slug: "uv-resin",                    // the URL: /product/uv-resin
  name: "Fast-Cure UV Resin",
  category: "resin",                   // see CATEGORIES at the top of the file
  tagline: "Hard in 90 seconds under a UV lamp",
  description: "...",                  // shown on the product page
  details: ["No mixing required", ...], // the specifications list
  swatch: ["#d9c2ff", "#f0e6ff"],      // the two tile colours
  featured: true,                      // shows on the home page
  variants: [
    { sku: "RES-UV-100", label: "100g bottle", priceKobo: 850000, inStock: true },
  ],
}
```

Two things to watch:

- **Prices are in kobo**, not naira. ₦8,500 is written `850000`. This avoids
  rounding errors on money. Multiply your naira price by 100.
- **Every `sku` must be unique** across the whole catalogue. It's what a cart
  and an order store, so don't reuse or renumber one that customers may already
  have in their cart.

Set `inStock: false` to show something as sold out — it stays visible but can't
be ordered.

### Product photos

Products currently show a generated colour tile rather than a photograph, so the
shop looks complete before you've shot anything. When you have real images,
replace `src/components/ProductMedia.tsx` with an `<Image>` — the layout around
it won't need to change.

### Delivery fees and other settings

`src/lib/config.ts` holds delivery pricing:

```ts
lagosKobo: 250000,        // ₦2,500 within Lagos
nationwideKobo: 450000,   // ₦4,500 everywhere else
freeAboveKobo: 15000000,  // free delivery over ₦150,000
```

---

## How the money side is protected

Worth knowing, since this part handles real payments:

- **Prices are never taken from the browser.** The checkout only sends product
  codes and quantities; every price, delivery fee and total is recalculated on
  the server from `products.ts`. Editing prices in browser tools changes nothing.
- **Card payments are verified with Paystack directly**, not trusted from the
  redirect. The amount paid is checked against the order total before anything
  is marked paid.
- **Webhooks are signature-checked** and compared in constant time, so a forged
  "payment successful" call is rejected.
- **Confirming a payment twice is safe** — whichever of the webhook or the
  browser redirect arrives first settles the order; the other does nothing.
- **Transfer orders are never auto-confirmed.** Only you, in the admin page,
  can mark one paid.

---

## Project layout

```
src/
  app/
    page.tsx                  home page
    shop/                     product listing, search and category filters
    product/[slug]/           product detail
    cart/                     cart
    checkout/                 delivery details and payment choice
    checkout/verify/          where Paystack returns the customer
    order/[reference]/        order status + OPay transfer instructions
    track/                    look up an order by reference
    admin/                    your order dashboard
    api/orders/               creates orders, starts card payments
    api/webhooks/paystack/    Paystack's confirmation callback
  components/                 header, footer, cart, product cards
  lib/
    products.ts               YOUR CATALOGUE — edit this
    config.ts                 shop details, OPay account, delivery fees
    orders.ts                 order building and input validation
    paystack.ts               Paystack API and signature checks
    payments.ts               marking orders paid
    store/                    saving orders (Postgres or local file)
```

---

## Commands

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # run the production build locally
npm run typecheck  # check types
```

### A note on `npm audit`

`npm audit` reports two advisories in packages that Next.js itself depends on
(`postcss` and `sharp`). They can't be fixed without downgrading Next.js to an
older, less secure version, so they're left as-is. They'll clear when Next.js
updates its own dependencies.
