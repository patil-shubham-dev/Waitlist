# LifeOS Waitlist — Monorepo

Two Vite + React + TypeScript apps, one Supabase backend.

| App | Deploy as | Purpose |
|-----|-----------|---------|
| `apps/public` | `lifeos.vercel.app` | Public waitlist site |
| `apps/admin` | `lifeos-admin.vercel.app` | Password-protected admin dashboard |

**Design system:** Inter font · `#0B0B0C` background · `#E6E6E6` text · `#FF5A1F` accent · Zero emojis · CSS custom properties only (no Tailwind)

---

## 1. Supabase Setup

Run `supabase/schema.sql` in your Supabase SQL editor, then enable Realtime for:
- `waitlist`
- `suggestions`  
- `page_visits`

_(Dashboard → Database → Replication → toggle each table on)_

---

## 2. Environment Variables

Both `.env` files are pre-filled with your credentials.

**`apps/public/.env`**
```
VITE_SUPABASE_URL=https://teranqxkhvxzxxvskhtj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**`apps/admin/.env`**
```
VITE_SUPABASE_URL=https://teranqxkhvxzxxvskhtj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_ADMIN_PASSWORD=lifeos_admin_2025
```

> Change `VITE_ADMIN_PASSWORD` before going live. `.env` is in `.gitignore`.

---

## 3. Local Development

```bash
npm install
npm run dev:public   # localhost:5173
npm run dev:admin    # localhost:5174
```

---

## 4. Deploy to Vercel

### Public site
- Root directory: `apps/public`
- Framework: Vite
- Add both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Admin panel (separate Vercel project)
- Root directory: `apps/admin`
- Framework: Vite
- Add all three env vars including a strong `VITE_ADMIN_PASSWORD`

The admin app has `noindex, nofollow` — search engines won't find it.

---

## 5. Page Structure

### Public site
1. **Hero** — headline, subtext, email signup, live waitlist count
2. **What** — 3 outcome-focused bullet points
3. **How it works** — 5-step numbered flow
4. **Use cases** — Students / Founders / Creators
5. **Waitlist** — 2-step form (email → optional details)
6. **Contact** — lifeossocial01@gmail.com (mailto link)
7. **Footer** — logo + copyright

### Admin panel
- **Overview** — stat cards, 14-day signups chart, unanswered alert
- **Waitlist** — searchable/filterable table + CSV export
- **Suggestions** — moderation: feature toggle, admin reply, edit/delete
- **Visits** — live active count, hourly chart, traffic sources, recent log

---

## 6. Contact

**lifeossocial01@gmail.com** — shown on the public site as a mailto link.
