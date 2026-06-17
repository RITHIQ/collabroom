# Quick Start

Get Collabroom running with demo data on web and mobile.

## Prerequisites

- Node.js 20+
- Supabase project with creator and brand accounts created
- `.env` in `web/` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## 1. Configure seed script

Edit [`scripts/seed_complete_presentation.ts`](../scripts/seed_complete_presentation.ts) if your demo emails differ from:

- Creator: `collabroomoperations+creator@gmail.com`
- Brand: `collabroomoperations+brand@gmail.com`
- Password: `Project2027#`

Or set credentials via environment variables in a root `.env`.

## 2. Seed demo data

```bash
# From project root
npm install
npx ts-node scripts/seed_complete_presentation.ts
```

If RLS blocks inserts, follow the RLS steps in [SETUP.md](SETUP.md) first.

## 3. Run web app

```bash
npm run dev:web
# or: cd web && npm install && npm run dev
```

Open **http://localhost:3000** and log in with a demo account.

## 4. Run mobile app

```bash
npm run dev:mobile
# or: cd mobile && npm install && npx expo start
```

Use Expo Go or an emulator. Log in with the same demo credentials.

## Verify

- Dashboard loads after login
- Campaigns, contracts, wallet, and messages are populated
- Mobile shows the same data as web (same Supabase backend)
