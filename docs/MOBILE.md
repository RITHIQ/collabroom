# Mobile App

Expo / React Native app in [`mobile/`](../mobile/).

## Run

```bash
cd mobile
npm install
npx expo start
```

Or from root: `npm run dev:mobile`

## Structure

```
mobile/src/app/
├── (tabs)/          # Bottom nav: home, campaigns, discover, messages, profile, ai-brief
├── campaigns/[id]   # Campaign detail
├── contracts/       # Contract list and detail
├── messages/[id]    # Chat thread
├── auth.tsx         # Login / register
├── wallet.tsx
├── notifications.tsx
└── profile-edit.tsx
```

## Services

Mobile mirrors web Supabase services:

- `src/services/authService.ts`
- `src/services/campaignService.ts`
- `src/services/contractService.ts`
- `src/services/walletService.ts`
- `src/services/userService.ts`

## Feature parity

Web and mobile share the same Supabase backend. After seeding (see [SETUP.md](SETUP.md)), both apps show identical data for the same logged-in account.

## E2E tests

See [TESTING.md](TESTING.md) for Appium setup in `collabroom-tests/appium/`.
