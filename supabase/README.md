# Supabase setup

## 1) Create a Supabase project
- Create a project in Supabase (free tier is fine).

## 2) Apply the DB schema
- Open **SQL Editor** and run: `supabase/schema.sql`

## 3) Configure the web app
- Copy `web/.env.example` to `web/.env.local`
- Fill:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## 4) Enable Email OTP
- In Supabase: **Authentication → Providers → Email**
- Turn on **Email OTP** (or Magic Link, depending on your preference).

## 5) Social stats sync (scheduled)
### Edge Function
- Deploy function: `supabase/functions/sync-social-stats/index.ts`
- Set env vars for the function:
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
  - `YOUTUBE_API_KEY` (optional; required for YouTube stats)

### GitHub Actions scheduler (free)
- Add repo secrets:
  - `SUPABASE_FUNCTION_URL`: your deployed edge function URL (e.g. `https://<project>.supabase.co/functions/v1/sync-social-stats`)
  - `SUPABASE_FUNCTION_BEARER`: **service role** or another secure bearer (recommended: a dedicated secret / JWT you check in the function)
- The workflow template is in `.github/workflows/sync-social-stats.yml`

