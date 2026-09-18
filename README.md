# Group Meals

Scheduled corporate lunch platform — offices get a weekly restaurant rotation, employees order up to 48 hours ahead, pay with embedded Stripe checkout, and restaurants receive consolidated order emails.

## Stack

- Next.js 15 · TypeScript · Tailwind CSS
- Supabase (Postgres, Auth, RLS)
- Stripe Payment Element (embedded checkout + saved cards)
- Resend (restaurant order emails)

## Quick start

```bash
cd office-lunch   # or your clone path
cp .env.example .env.local
npm install
npm run dev:clean
```

Open http://localhost:3000

### Supabase migrations (run in order)

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_geaux_eats_phase2.sql`
3. `supabase/migrations/003_guest_orders_office_slug.sql`

Promote first admin after signup:

```sql
update public.profiles set role = 'admin' where email = 'you@company.com';
```

### Stripe webhooks

Listen for `payment_intent.succeeded`:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Add `STRIPE_WEBHOOK_SECRET` to `.env.local`.

### Restaurant emails

Set `RESEND_API_KEY` and `EMAIL_FROM` in `.env.local`. When an admin **closes** a schedule, Group Meals emails the restaurant contact with full order details and prices.

## Key flows

| Flow | Route |
|------|-------|
| Public order (no account — office link) | `/order` or `/order/{office-slug}` |
| Employee this week | `/app/week` |
| Employee order + embedded Stripe | `/app/order` |
| Admin weekly templates | `/admin/schedules` |
| Restaurant production | `/restaurant/production` |

## Weekly scheduling

1. Admin sets **weekly templates** (office × day → restaurant)
2. Click **Generate next 2 weeks from templates**
3. Open schedules — ordering window opens **48 hours** before lunch (configurable in `/admin/settings`)

## Security

- Card data never touches Group Meals servers (Stripe Elements only)
- Only safe Stripe references stored (`stripe_customer_id`, `stripe_payment_intent_id`, etc.)
- RLS on all tables · service role server-only

## Scripts

```bash
npm run dev:clean   # clear cache + dev (use if styles break)
npm run build
npm run typecheck
```
