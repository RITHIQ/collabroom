# Setup Guide

Populate Supabase with demo data for web and mobile.

## Seed script

**Canonical script:** [`scripts/seed_complete_presentation.ts`](../scripts/seed_complete_presentation.ts)

```bash
npm install
npx ts-node scripts/seed_complete_presentation.ts
```

The script reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from environment (or `web/.env.local` if loaded manually).

## RLS during seeding

If inserts fail with Row Level Security errors:

1. Open Supabase Dashboard → SQL Editor
2. Run the disable section in [`supabase/disable_rls_for_seeding.sql`](../supabase/disable_rls_for_seeding.sql) (lines 1–20)
3. Re-run the seed script
4. Re-enable RLS using the commented section at the bottom of the same file

For message-table testing policies, see [`supabase/policies/messages_testing.sql`](../supabase/policies/messages_testing.sql).

## Database schema

Apply in order:

1. [`supabase/schema.sql`](../supabase/schema.sql) — base schema
2. [`supabase/schema_v2.sql`](../supabase/schema_v2.sql) — additive migrations

See [`supabase/README.md`](../supabase/README.md) for edge functions and GitHub Actions.

## Data created

The seed script populates profiles, wallets, campaigns, contracts, notifications, and transactions for creator, brand, and admin demo accounts.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| RLS policy errors | Disable RLS temporarily (see above) |
| Auth login fails | Confirm emails/passwords match seed script |
| Empty dashboard | Re-run seed after RLS fix |
| Web on wrong port | App uses port **3000** (`web/vite.config.ts`) |
