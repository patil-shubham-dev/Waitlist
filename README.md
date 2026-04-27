# LifeOS Waitlist

Premium waitlist and launch-control app for **LifeOS Social**.

It includes:
- A fully responsive public landing page for mobile and desktop
- A public questions / suggestions wall with visible admin replies
- An admin control panel at `/admin7276`
- A Supabase schema for waitlist, questions, phases, content, visits, and audit logs
- A single-root Vercel deployment that serves both the public site and admin app

## Stack

- `apps/public`: Vite + React public launch site
- `apps/admin`: Vite + React admin control panel
- `api`: Vercel serverless functions for secure admin actions
- `supabase/schema.sql`: database setup for the `WaitlistApp` Supabase project

## Required environment variables

### Public app
File: `apps/public/.env`

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Admin app
File: `apps/admin/.env`

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_PASSWORD=change_this_strong_password
```

### Root Vercel project
File: `.env` or Vercel project env vars

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=change_this_strong_password
```

The root env vars are required because the admin panel now uses secure Vercel API routes for protected actions.

## Supabase setup

1. Create or use the Supabase project you want for this app.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the SQL editor.
3. Make sure Realtime is enabled for:
   - `waitlist`
   - `suggestions`
   - `page_visits`
   - `timeline_entries`
   - `site_content`

## Local development

```bash
npm install
npm run dev:public
npm run dev:admin
```

## Production build

```bash
npm run build
```

This produces:
- `dist/index.html` for the public site
- `dist/admin7276` for the admin app

## Deploy to Vercel

Deploy the repository root.

Vercel settings:
- Build command: `npm run build`
- Output directory: `dist`

Recommended free project names:
- `lifeos-waitlist`
- `lifeoswaitlist`
- `lifeos-launch`

The admin panel will be available at:

```txt
https://your-project-name.vercel.app/admin7276
```

## Notes

- Public visitors can join the waitlist and post questions or suggestions.
- Admin replies inherit the reply logo set in `site_content`.
- The public page copy, phases, and branding are editable from the admin panel.
