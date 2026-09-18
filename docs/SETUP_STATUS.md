# Setup status (auto-generated checklist)

Run anytime:

```bash
npm run setup:check
```

## Current state (last verified)

| Step | Status |
|------|--------|
| Supabase project + API keys in `.env.local` | Done |
| Stripe keys + webhook secret | Done |
| Migration **001** | Done |
| Migration **002** | **Not applied** — required for ordering |
| Admin (`austintcunningham@gmail.com`) | Done |
| Restaurant, office, menu item | Done |
| Open schedule | Done |
| `npm install` | Done |

## Apply migration 002 (pick one)

### Option A — SQL Editor (fastest, no extra env)

1. Supabase Dashboard → **SQL Editor** → New query
2. Paste entire contents of `supabase/migrations/002_geaux_eats_phase2.sql`
3. **Run**
4. Verify: `npm run setup:check` (both 002 lines should be ✅)

### Option B — CLI script (repeatable)

1. Supabase → **Project Settings → Database → Connection string → URI**
2. Add to `.env.local` (do not commit):

   ```env
   SUPABASE_DB_URL=postgresql://postgres.[ref]:[PASSWORD]@....supabase.com:5432/postgres
   ```

3. Run:

   ```bash
   npm run db:apply:002
   ```

## After 002 is applied

1. **Restart dev:** `npm run dev:clean`
2. **Stripe webhook** (separate terminal):  
   `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. **Test order:** `/order` or `/app/order` → pay with `4242 4242 4242 4242`
4. Optional: assign yourself as **employee** on your office if ordering fails RLS

**Note:** Your admin account is not linked to any office yet (`office_users` is empty). For employee-style ordering as yourself, go to **Admin → Offices** and assign `austintcunningham@gmail.com` as **employee** (or sign up a separate test employee).

## Step 4 seed data (you may already be done)

If `setup:check` shows open schedule + menu item, skip to payment test.

If ordering says “not open yet”, either wait for the 48h window or raise **Advance order hours** in `/admin/settings` (after 002).
