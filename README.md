
<p align="center">
  <img src="mobile/assets/icon.png" width="96" alt="ColabRoom Logo" />
</p>

<h1 align="center">ColabRoom</h1>

<p align="center">
  <strong>The Creator–Brand Collaboration Platform</strong><br/>
  Connect influencers with brands · Manage campaigns · Sign contracts · Get paid
</p>

<p align="center">
  <img alt="Expo SDK" src="https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white" />
  <img alt="React Native" src="https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=black" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Web-Vite%20%2B%20React-646CFF?logo=vite&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green" />
</p>

---

## ✨ Overview

**ColabRoom** is a full-stack influencer marketing platform built as a **monorepo** containing:

| Package | Stack | Purpose |
|---------|-------|---------|
| `web/` | Vite + React + TypeScript | Browser app (deployed on Vercel) |
| `mobile/` | Expo + React Native | Android & iOS app (APK via EAS) |
| `supabase/` | PostgreSQL + Row-Level Security | Shared backend & database |

Both apps share the **same Supabase database** — real-time data, same accounts, seamless experience across devices.

---

## 🚀 Features

### For Creators
- 📊 **Dashboard** — wallet balance, active campaigns, CreatorScore, delivery rate
- 🔍 **Discover** — browse & apply to brand campaigns with cover letter
- 📁 **My Campaigns** — track application statuses (pending / active / completed)
- 💬 **Campaign Room** — real-time collab chat with brand
- 📄 **Contracts** — view & sign digital contracts
- 💰 **Wallet** — track earnings, pending payouts, withdraw
- 🤖 **AI Brief** — generate campaign briefs using AI
- 🔔 **Notifications** — real-time alerts

### For Brands
- 📋 **Campaign Manager** — create, manage, track campaigns
- 👥 **Discover Creators** — search by niche, followers, score
- ✅ **Approve Applications** — review creator profiles
- 📊 **Analytics** — campaign performance metrics
- 💳 **Payments** — escrow & invoice management

---

## 🏗️ Architecture

```
project-pdd/
├── web/                    # Vite React web app
│   ├── src/
│   │   ├── pages/          # All page components
│   │   ├── components/ui/  # Shared UI components
│   │   ├── services/       # Supabase API calls
│   │   ├── store/          # Redux state
│   │   └── lib/            # Supabase client
│   └── package.json
│
├── mobile/                 # Expo React Native app
│   ├── src/
│   │   ├── app/            # Expo Router screens
│   │   │   ├── (tabs)/     # Bottom tab screens
│   │   │   ├── campaigns/  # Campaign detail
│   │   │   ├── contracts/  # Contract screens
│   │   │   └── messages/   # Message thread
│   │   ├── components/ui/  # Reusable RN components
│   │   ├── services/       # Auth & API services
│   │   ├── theme/          # Design tokens
│   │   └── lib/            # Supabase client
│   ├── eas.json            # EAS Build config
│   └── package.json
│
├── supabase/               # Database migrations & RLS policies
│   └── migrations/
│
├── .github/
│   └── workflows/
│       └── eas-build.yml   # Auto APK build on push
│
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- [Expo Go](https://expo.dev/go) app on your phone (for mobile testing)

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/colabroom.git
cd colabroom

# Install root dependencies
npm install

# Install web dependencies
cd web && npm install && cd ..

# Install mobile dependencies
cd mobile && npm install && cd ..
```

### 2. Environment Setup

The Supabase connection is already configured in `mobile/app.json` and `web/.env`.

For the web app, create `web/.env`:
```env
VITE_SUPABASE_URL=https://xcorhotvnayrboihsdvm.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_umiqwHBQxpE2ATCtfYiEMQ_NAl2nNRi
```

### 3. Run the Web App
```bash
cd web
npm run dev
# Opens at http://localhost:3000
```

### 4. Run the Mobile App (Expo Go)
```bash
cd mobile
npx expo start
# Scan the QR code with Expo Go on your phone
```

---

## 📦 Building the APK

We use **EAS Build** (Expo Application Services) to build the Android APK in the cloud.

### Setup (one-time)
```bash
npm install -g eas-cli
eas login    # Login with your expo.dev account
```

### Build Preview APK (installable .apk)
```bash
cd mobile
eas build -p android --profile preview
```
- ⏱️ Build takes ~15 minutes
- 📥 You get a download link for the `.apk` file
- 📲 Install directly on your Android device (enable "Install from unknown sources")

### Build Production AAB (for Play Store)
```bash
eas build -p android --profile production
```

---

## 🌐 Web Deployment (Vercel)

The web app is deployed automatically via Vercel.

1. Connect your GitHub repo to [vercel.com](https://vercel.com)
2. Set root directory to `web/`
3. Add environment variables in Vercel dashboard
4. Every push to `main` auto-deploys

---

## 🗄️ Database (Supabase)

| Table | Description |
|-------|-------------|
| `users` | Auth accounts (Supabase Auth) |
| `creators` | Creator profiles, niches, score |
| `brands` | Brand profiles, score |
| `campaigns` | Campaign listings |
| `campaign_applications` | Creator applications with cover letter |
| `contracts` | Digital contracts |
| `messages` | Real-time campaign messages |
| `wallets` | Creator wallet balances |
| `notifications` | Real-time alerts |
| `transactions` | Payment records |

---

## 🎨 Design System

Both apps share the **HashFame Dark Design System**:

| Token | Value |
|-------|-------|
| Background | `#0a0a0a` |
| Surface | `rgba(255,255,255,0.03)` |
| Text Primary | `#ffffff` |
| Text Secondary | `#aaaaaa` |
| Border | `rgba(255,255,255,0.08)` |
| Success | `#4ade80` |
| Warning | `#fbbf24` |
| Danger | `#f87171` |

---

## 🧑‍💻 Tech Stack

| Category | Web | Mobile |
|----------|-----|--------|
| Framework | React 19 + Vite | React Native + Expo 54 |
| Routing | React Router v7 | Expo Router v6 |
| Database | Supabase JS v2 | Supabase JS v2 |
| State | Redux Toolkit | React hooks |
| Animations | Framer Motion | Moti + Reanimated |
| Icons | Lucide React | Expo Vector Icons (Feather) |
| Auth | Supabase Auth | Supabase Auth |
| Styling | Tailwind CSS + CSS vars | StyleSheet + Design tokens |

---

## 📄 License

MIT © 2024 ColabRoom Team

---

<p align="center">
  Built with ❤️ for creators and brands across India
</p>
