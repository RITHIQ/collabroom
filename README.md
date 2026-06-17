# Collabroom: Creator & Brand Marketplace

Collabroom connects brands with creators for marketing campaigns — campaign management, contracts, messaging, and payouts.

## Tech stack

- **Web:** React, TypeScript, Vite (`web/`)
- **Mobile:** React Native, Expo (`mobile/`)
- **Backend:** Supabase (`supabase/`)
- **Tests:** Selenium, Appium, DAST (`collabroom-tests/`)

## Quick start

```bash
npm install
npx ts-node scripts/seed_complete_presentation.ts   # populate demo data
npm run dev:web                                      # http://localhost:3000
npm run dev:mobile                                   # Expo
```

**Demo accounts**

| Role | Email | Password |
|------|-------|----------|
| Creator | `collabroomoperations+creator@gmail.com` | `Project2027#` |
| Brand | `collabroomoperations+brand@gmail.com` | `Project2027#` |

Full guides: [docs/](docs/)

## Project layout

```
├── docs/              Documentation
├── scripts/           Seed and utility scripts
├── web/               React web app
├── mobile/            Expo mobile app
├── collabroom-tests/  E2E test suites
└── supabase/          SQL schema, seeds, edge functions
```

## Run tests

```bash
cd collabroom-tests
npm run test:all
```

See [docs/TESTING.md](docs/TESTING.md) for Selenium, Appium, and DAST details.

## Documentation

| Guide | Description |
|-------|-------------|
| [docs/QUICK_START.md](docs/QUICK_START.md) | Get running in ~15 minutes |
| [docs/SETUP.md](docs/SETUP.md) | Supabase seeding and RLS |
| [docs/TESTING.md](docs/TESTING.md) | Automated test suites |
| [docs/MOBILE.md](docs/MOBILE.md) | Mobile app reference |
