# Deploy Group Meals (Vercel + your domain)

## One-time setup (~20 minutes)

### 1. Push code to GitHub

If this repo has no remote yet:

```bash
cd ~/office-lunch
git add -A
git commit -m "Group Meals: guest ordering, calendar schedules, Stripe checkout"
# Create empty repo on GitHub, then:
git remote add origin git@github.com:YOUR_USER/groupmealz.git
git push -u origin main
```

### 2. Import into Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → import your GitHub repo.
2. Framework: **Next.js** (auto-detected).
3. **Environment variables** — add every key from your local `.env.local`:

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only — mark sensitive |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Use **live** `pk_live_...` for real charges |
| `STRIPE_SECRET_KEY` | Use **live** `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | From step 4 below (after first deploy) |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.com` (no trailing slash) |
| `RESEND_API_KEY` | Optional |
| `EMAIL_FROM` | Optional |

4. **Deploy**. Note the `*.vercel.app` URL.

### 3. Custom domain

1. Vercel project → **Settings → Domains** → add `yourdomain.com` (and `www` if you use it).
2. At your DNS host, add the records Vercel shows (usually `A` + `CNAME`).
3. Wait for SSL (often a few minutes).
4. Update **`NEXT_PUBLIC_APP_URL`** to `https://yourdomain.com` and **Redeploy**.

### 4. Stripe live webhook

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://yourdomain.com/api/webhooks/stripe`
3. Events: **`payment_intent.succeeded`**
4. Copy signing secret → Vercel env **`STRIPE_WEBHOOK_SECRET`** → **Redeploy**

Do **not** use `stripe listen` in production; that is local dev only.

### 5. Supabase

Use the **same** Supabase project as dev (or a prod project with migrations 001–003 run).

In Supabase → **Authentication → URL configuration**, add:

- Site URL: `https://yourdomain.com`
- Redirect URLs: `https://yourdomain.com/**`

### 6. Go live with partner

1. Log in as admin on **production** URL.
2. **Offices** → copy employee order link.
3. **Lunch calendar** → set partner restaurant → **Open** test day.
4. Incognito → order link → small **live** card charge.
5. Admin → Orders → **paid**; **Close** day to test restaurant email (if Resend set).

## After each code change

Push to `main` — Vercel redeploys automatically if GitHub is connected.
