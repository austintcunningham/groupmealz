# Production launch checklist (real partner test)

## Before deploy

1. Run **`supabase/migrations/003_guest_orders_office_slug.sql`** in Supabase SQL Editor (if not already).
2. Visit **Admin → Offices** — confirm each office has an **order link** (slugs auto-generate).
3. **Admin → Lunch calendar** — set restaurants on days, click **Open** for test days.
4. Stripe **Live mode** keys in production env (not `pk_test_` / `sk_test_`).
5. Stripe Dashboard webhook: `https://YOUR_DOMAIN/api/webhooks/stripe` → event `payment_intent.succeeded`.
6. `NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN`
7. Optional: `RESEND_API_KEY` + verified `EMAIL_FROM` for restaurant emails on **Close**.

## Employee flow (Major Menus style)

Share the office link from **Admin → Offices** — e.g. `https://YOUR_DOMAIN/order/your-office-slug`.

No signup. Name + email + card only.

## Smoke test on production

1. Open office link → pick day → add item → checkout.
2. Pay with a **real card** (small amount) or Stripe live test if configured.
3. Confirm order **paid** in Admin → Orders.
4. Restaurant → Production sheet shows the order.
5. **Close** the day on calendar → restaurant receives email (if Resend configured).

## Rollback

Keep Stripe webhook secret and Supabase keys in sync when rotating. Use Stripe Dashboard to refund test live charges if needed.
