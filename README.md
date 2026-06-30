# Office Lunch

A scheduled corporate lunch ordering platform (Major Menus-style MVP). Offices get a **Restaurant of the Day**, employees order before cutoff, pay via **Stripe Checkout**, and restaurants receive a consolidated **production sheet**.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres, Auth, Row Level Security)
- Stripe Checkout + webhooks

## Quick start

### 1. Clone & install

```bash
cd office-lunch
cp .env.example .env.local
npm install
```

### 2. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the migration:

   `supabase/migrations/001_initial_schema.sql`

3. Copy project URL, anon key, and **service role key** into `.env.local`.
4. In **Authentication → Providers**, enable Email.
5. (Optional) Disable email confirmation for local dev.

#### Bootstrap your first admin

After signing up once via `/signup`:

```sql
update public.profiles
set role = 'admin'
where email = 'you@company.com';
```

### 3. Stripe setup

1. Create a Stripe account and get test keys.
2. Add to `.env.local`:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
3. Install Stripe CLI and forward webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

4. Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## End-to-end test flow

1. **Admin** (`/admin`): create restaurant, office, menu categories/items, schedule for today, click **Open**.
2. **Admin** (`/admin/offices`): assign employee user UUID to office.
3. **Employee** (`/app/today`): add items, checkout with Stripe test card `4242 4242 4242 4242`.
4. Confirm webhook marks order **paid** (`/app/orders`).
5. **Restaurant manager** (`/restaurant/production`): view grouped production sheet.
6. **Admin** (`/admin/orders`): view totals, platform fees, payout reporting.

## Roles

| Role | Routes |
|------|--------|
| admin | `/admin/*` |
| restaurant_manager | `/restaurant/*` |
| office_admin | `/office/*` |
| employee | `/app/*` |

## Security notes

- **Never** store card numbers or raw payment data.
- Checkout Sessions are created **server-side** only.
- Orders are marked paid only via **verified Stripe webhooks** (service role).
- `SUPABASE_SERVICE_ROLE_KEY` is server-only — never expose to the browser.
- RLS is enabled on all tables.

## Project structure

```
src/
  app/           # App Router pages & API routes
  components/    # UI & role dashboards
  lib/
    actions/     # Server actions (CRUD, checkout)
    auth/        # Session & role guards
    fees/        # Platform fee calculation
    stripe/      # Stripe client
    supabase/    # Browser, server, admin clients
  types/         # Shared TypeScript types
supabase/
  migrations/    # SQL schema + RLS
```

## Platform fees

Default: **$2.50 flat fee** per order (`platform_settings`). Admin can change fee type (flat / percentage / hybrid) at `/admin/settings`.

`payout_due_cents` = subtotal + tax − platform fee (reporting only in MVP; no Stripe Connect payouts yet).

## Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm run typecheck  # TypeScript check
npm run lint       # ESLint
```

## What's not in MVP

- Driver portal
- Stripe Connect / restaurant payouts
- Refunds, subsidies, PDF export, SMS
