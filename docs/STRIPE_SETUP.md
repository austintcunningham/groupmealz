# Stripe Setup Guide

Step-by-step setup for **Group Meals** payments in **test mode**.

## Part 1 — Create a Stripe account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Create an account (use test mode — toggle in the top-right should say **Test mode**)
3. You do not need to complete full business verification for testing

---

## Part 2 — Get your API keys

1. In Stripe Dashboard, go to **Developers → API keys**
2. Copy these two keys:

| Key | Where it goes in `.env.local` |
|-----|-------------------------------|
| **Publishable key** (`pk_test_...`) | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| **Secret key** (`sk_test_...`) | `STRIPE_SECRET_KEY` |

Your `.env.local` should now look like:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Restart your dev server** after adding keys (`Ctrl+C`, then `npm run dev:clean`).

---

## Part 3 — Install Stripe CLI (for local webhooks)

Stripe needs to tell your app when payment succeeds. Locally, use the Stripe CLI.

### macOS (Homebrew)

```bash
brew install stripe/stripe-cli/stripe
```

### Log in

```bash
stripe login
```

This opens a browser to link the CLI to your Stripe account.

---

## Part 4 — Forward webhooks to your app

With your Next.js app running on port 3000, open a **second terminal** and run:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see output like:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

Copy that `whsec_...` value into `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

Restart `npm run dev:clean` again.

**Keep the `stripe listen` terminal running** while testing payments.

---

## Part 5 — Test a payment

1. As **admin**: create restaurant, office, menu, weekly template, generate schedules, open a schedule
2. As **admin**: assign yourself (or another account) as an **employee** on the office
3. Go to `/order` (public) or log in as employee → `/app/order`
4. Add items → checkout → pay with embedded Stripe form
5. Use Stripe's test card:

| Field | Value |
|-------|-------|
| Card number | `4242 4242 4242 4242` |
| Expiry | Any future date (e.g. `12/34`) |
| CVC | Any 3 digits (e.g. `123`) |
| ZIP | Any 5 digits |

6. Complete payment

Group Meals creates **card-only** PaymentIntents (no Klarna/redirect wallets) so checkout stays on your site. The pay button always sends Stripe a `return_url` to `/checkout/success`.

### Verify it worked

- **`stripe listen` terminal** should show `payment_intent.succeeded`
- **Employee** `/app/orders` — order status should become **paid** (may take 1–2 seconds)
- **Restaurant manager** `/restaurant/production` — order appears on production sheet
- **Admin** `/admin/orders` — order shows as paid with totals

---

## Part 6 — Production (later)

When deploying to production:

1. Switch Stripe to **Live mode** and get live keys
2. In Stripe Dashboard → **Developers → Webhooks → Add endpoint**
3. URL: `https://your-domain.com/api/webhooks/stripe`
4. Events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed` (optional)
5. Copy the **signing secret** into your production env as `STRIPE_WEBHOOK_SECRET`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Order stays `pending_payment` after paying | Is `stripe listen` running? Is `STRIPE_WEBHOOK_SECRET` set? Did you restart the dev server? |
| "Missing STRIPE_SECRET_KEY" on checkout | Add `STRIPE_SECRET_KEY` to `.env.local` and restart |
| Webhook signature error | `STRIPE_WEBHOOK_SECRET` must match the secret from `stripe listen` (not the Dashboard webhook secret during local dev) |
| Employee can't order | Schedule must be **Open**, ordering window open (default 48h ahead), employee assigned to office |
| Unstyled pages / CSS 404 | Run `npm run dev:clean` and use only one dev server on port 3000 |

---

## Other test cards (optional)

| Card | Behavior |
|------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0025 0000 3155` | Requires 3D Secure |

More: [Stripe test cards](https://docs.stripe.com/testing)
