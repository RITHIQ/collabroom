# ⚡ STEP-BY-STEP EXECUTION GUIDE

Complete instructions to populate fake data and run both web/mobile with all features working.

---

## 📋 BEFORE YOU START

✅ Verify you have:
- Node.js installed
- 3 Supabase accounts created (creator, brand, admin)
- Git cloned the project
- `.env` files configured with Supabase URL & keys

---

## STEP 1: Configure Seed Script (2 minutes)

### Edit: `seed_complete_presentation.ts`

Find this section (around line 18):
```typescript
const ACCOUNTS = {
  creator: {
    email: 'your-creator-email@gmail.com',     // ← CHANGE THIS
    password: 'YourPassword123!',               // ← CHANGE THIS
  },
  brand: {
    email: 'your-brand-email@gmail.com',        // ← CHANGE THIS
    password: 'YourPassword123!',               // ← CHANGE THIS
  },
  admin: {
    email: 'your-admin-email@gmail.com',        // ← CHANGE THIS
    password: 'YourPassword123!',               // ← CHANGE THIS
  },
};
```

**Replace with your actual Supabase account emails/passwords.**

Example:
```typescript
const ACCOUNTS = {
  creator: {
    email: 'john.creator@gmail.com',
    password: 'MyPassword2024!',
  },
  brand: {
    email: 'brand.team@company.com',
    password: 'MyPassword2024!',
  },
  admin: {
    email: 'admin@colabroom.com',
    password: 'AdminPassword2024!',
  },
};
```

---

## STEP 2: Run Seed Script (3 minutes)

### Terminal 1:

```bash
# Navigate to project root
cd d:/BTECH-IT/PROJECT\ PDD

# Install dependencies (if not done)
npm install

# Run the seed script
npx ts-node seed_complete_presentation.ts
```

### Expected Output:

```
🚀 Starting complete presentation data seeding...

📝 Step 1: Authenticating accounts...
✅ CREATOR: 12345678-1234-1234-1234-123456789012
✅ BRAND: 87654321-4321-4321-4321-210987654321
✅ ADMIN: aabbccdd-aabb-ccdd-aabb-ccddaabbccdd

👤 Step 2: Populating Creator Profile...
✅ Creator profile saved

🏢 Step 3: Populating Brand Profile...
✅ Brand profile saved

🛡️  Step 4: Setting up Admin Account...
✅ Admin account configured

💰 Step 5: Setting up Wallets...
✅ CREATOR wallet created
✅ BRAND wallet created
✅ ADMIN wallet created

📊 Step 6: Adding Wallet Transactions...
✅ Added 5 transactions

📢 Step 7: Creating Campaigns...
✅ boAt Summer Audio Collection
✅ Fitness Month Challenge
✅ Holiday Gift Guide

... [more output] ...

═══════════════════════════════════════════════════════════════
✨ SEEDING COMPLETE! ✨
═══════════════════════════════════════════════════════════════

📋 ACCOUNT SUMMARY:

🎬 CREATOR ACCOUNT:
   Email: john.creator@gmail.com
   Password: MyPassword2024!
   Name: Aisha Sharma
   Wallet: ₹145,250 available + ₹50,000 pending + ₹125,000 locked
   Verified: ✅

🏢 BRAND ACCOUNT:
   Email: brand.team@company.com
   Password: MyPassword2024!
   Company: boAt Lifestyle
   Wallet: ₹850,000 available
   Verified: ✅

🛡️  ADMIN ACCOUNT:
   Email: admin@colabroom.com
   Password: admin@123
   Role: Administrator
   Full access to all features

📊 DATA CREATED:
   • 3 Campaigns
   • 3 Contracts
   • 2 Milestones
   • 5 Wallet Transactions
   • 5 Notifications
   • 3 Wallets (creator, brand, admin)
```

✅ If you see "✨ SEEDING COMPLETE! ✨" **→ Proceed to Step 3**

⚠️ If error: Check email/password match your Supabase accounts

---

## STEP 3: Start Web Dev Server (2 minutes)

### Terminal 2:

```bash
# Still in project root
npm run dev:web
```

### Expected Output:

```
  VITE v5.0.3  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

✅ Server running on `http://localhost:5173`

---

## STEP 4: Test Web App (3 minutes)

### In Your Browser:

1. **Open:** `http://localhost:5173`

2. **See:** Landing page or Login page

3. **Click:** "Login" button

4. **Enter Creator Credentials:**
   - Email: `john.creator@gmail.com` (or your creator email)
   - Password: `MyPassword2024!` (or your password)

5. **Click:** "Login" button

### Expected After Login:

✅ See Dashboard page  
✅ Header shows "Aisha Sharma"  
✅ See "Campaigns" section (should show 3 campaigns)  
✅ See "Contracts" section (should show 3 contracts)  
✅ See "Wallet" section showing:
   - Available: ₹145,250
   - Pending: ₹50,000
   - Locked: ₹125,000

**If you see all above → Web app working! ✅**

---

## STEP 5: Test Web Features (5 minutes)

### Navigate to Each Section:

1. **Campaigns**
   - Click "Browse Campaigns" or navigate to Campaigns
   - Should see: boAt Summer Audio Collection, Fitness Month, Holiday Gift
   - Click one → See campaign details

2. **Contracts**
   - Click "Contracts" in sidebar
   - Should see 3 contracts with different statuses
   - Click "boAt Summer Campaign Contract" → View details

3. **Sign Contract** (exciting!)
   - On contract detail page, click "Sign Contract"
   - Canvas appears at bottom
   - Draw signature with mouse
   - Click "Submit Signature"
   - Contract status changes to "Signed" ✅
   - Click "Download PDF" → PDF downloads ✅

4. **Wallet - Add Funds**
   - Click "Wallet" in sidebar
   - Click "Add Funds" button
   - Fake Razorpay payment modal appears
   - Enter amount (e.g., ₹10,000)
   - Click "Simulate Success"
   - Processing animation (2 seconds)
   - See "Payment Successful" message
   - Click "Back to Wallet"
   - Available balance increased! ✅

✅ **All features working on web!**

---

## STEP 6: Start Mobile Dev Server (2 minutes)

### Terminal 3:

```bash
# Navigate to mobile folder
cd mobile

# Install dependencies (if not done)
npm install

# Start Expo dev server
npm start
```

### Expected Output:

```
Entering Metro Bundler...

 ⚠️  MetroError Node version mismatch. You are using 20.x, but Yarn expects 16+.
   (or ignore if using Node 18+)

Expo DevTools is running at http://localhost:19000

Open this URL in Expo Go or Emulator:
  - Press 'i' to open iOS Simulator
  - Press 'a' to open Android Emulator  
  - Press 'w' to open web version
  - Press 'j' to open debugger
```

✅ Expo server running

---

## STEP 7: Test Mobile App (5 minutes)

### Option A: Android Emulator

```bash
# In same terminal where npm start is running
# Press 'a' 

# Wait for Android Emulator to start (30-60 seconds)
```

### Option B: iOS Simulator (Mac only)

```bash
# Press 'i'

# Wait for iOS Simulator to start
```

### Option C: Physical Device

```bash
# Install Expo Go app on phone
# In terminal: Press 'e' to open QR code
# Scan QR code with Expo Go app
```

### Expected After Opening App:

✅ See Login screen  
✅ Same as web login screen

### Login to Mobile:

1. **Enter:** Creator email + password
2. **Tap:** "Login" button
3. **Wait:** 2-3 seconds for app to load

### Expected After Mobile Login:

✅ See Home/Dashboard screen  
✅ Mobile UI (bottom tabs instead of sidebar)  
✅ Same data as web:
   - Name: Aisha Sharma
   - Wallet balance: ₹320,250
   - 3 campaigns visible
   - 3 contracts visible

**If you see all above → Mobile working! ✅**

---

## STEP 8: Test Mobile Features (5 minutes)

### Mobile Navigation:

Bottom of screen shows tabs:
- 🏠 Home
- 🔍 Discover
- 💼 Campaigns
- 💼 Contracts
- 👤 Profile

### Test Each Section:

1. **Home Tab**
   - See dashboard
   - See total earnings
   - See active campaigns

2. **Campaigns Tab**
   - See all 3 campaigns
   - Tap one to view details
   - See "Apply" button

3. **Contracts Tab**
   - See all 3 contracts
   - Tap one to view details

4. **Sign Contract**
   - On contract detail, tap "Sign"
   - Canvas appears
   - Draw signature with **finger** (not mouse!)
   - Tap "Submit"
   - Status changes to "Signed" ✅
   - Tap "Download PDF" ✅

5. **Wallet**
   - Tap profile tab → See wallet section
   - See same balance as web: ₹320,250
   - See transactions
   - Tap "Add Funds" → Razorpay modal
   - Process payment (same as web)
   - Balance updates ✅

✅ **All features working on mobile!**

---

## STEP 9: Verify Web & Mobile Sync (3 minutes)

### Side-by-Side Comparison:

Open web on one monitor, mobile on another (or split screen):

| Metric | Web | Mobile | Match? |
|--------|-----|--------|---------|
| Creator Name | Aisha Sharma | Aisha Sharma | ✅ |
| Available Balance | ₹145,250 | ₹145,250 | ✅ |
| Pending Balance | ₹50,000 | ₹50,000 | ✅ |
| Locked Balance | ₹125,000 | ₹125,000 | ✅ |
| # Campaigns | 3 | 3 | ✅ |
| # Contracts | 3 | 3 | ✅ |

✅ **Perfect sync achieved!**

---

## STEP 10: Test Brand Account (Optional, 3 minutes)

### On Web:

1. **Logout:** Click logout button
2. **Login** with brand credentials:
   - Email: `brand.team@company.com`
   - Password: `MyPassword2024!`
3. **See:** Brand dashboard
4. **See:** 3 campaigns YOU created
5. **See:** Applications from creators

### On Mobile:

1. **Logout:** Tap profile → Settings → Logout
2. **Login** with brand credentials
3. **Same as web**

✅ **Brand features working!**

---

## STEP 11: Console Check (1 minute)

### On Web:

1. **Press:** F12 (DevTools)
2. **Go to:** Console tab
3. **Check:** No red errors (only warnings okay)
4. **Close:** F12

### On Mobile:

1. **Console output** in terminal showing `npm start`
2. **Check:** No red errors
3. **Look for:** "Connected to Supabase" message

✅ **No errors = all good!**

---

## 🎉 SUCCESS CHECKLIST

- [ ] Seed script completed (✨ message)
- [ ] Web app starts on http://localhost:5173
- [ ] Mobile app starts on http://localhost:19000
- [ ] Web login works with creator account
- [ ] Mobile login works with creator account
- [ ] Web shows all campaigns (3)
- [ ] Mobile shows all campaigns (3)
- [ ] Web shows all contracts (3)
- [ ] Mobile shows all contracts (3)
- [ ] Wallet balances match (both show ₹320,250)
- [ ] Contract signing works (both web & mobile)
- [ ] PDF download works (both)
- [ ] Add funds (Razorpay) works (both)
- [ ] Brand account accessible
- [ ] Admin account accessible
- [ ] No console errors
- [ ] Data synced between web & mobile

**If all ✅ → YOU'RE READY FOR PRESENTATION!**

---

## 📞 QUICK REFERENCE

```bash
# Seed data
npx ts-node seed_complete_presentation.ts

# Start web (Terminal 2)
npm run dev:web

# Start mobile (Terminal 3)
cd mobile && npm start

# Open web
http://localhost:5173

# Open mobile
Press 'i' or 'a' in terminal
```

---

## 🆘 COMMON ISSUES

| Issue | Solution |
|-------|----------|
| "Auth failed" | Check email/password in seed script match Supabase |
| "VITE not found" | Run `npm install` in project root |
| "Metro not found" | Run `npm install` in mobile folder |
| Mobile won't start | Restart Expo: Kill terminal, run `npm start` again |
| Data not showing | Hard refresh web (Ctrl+Shift+R), restart mobile |
| Different balance | Clear cache, restart apps |

---

## Expected Timeline

- ⏱️ Seed script: 2-3 minutes
- ⏱️ Web startup: 1 minute  
- ⏱️ Web testing: 5 minutes
- ⏱️ Mobile startup: 2-3 minutes
- ⏱️ Mobile testing: 5 minutes
- ⏱️ **Total: ~15-20 minutes**

---

## YOU'RE ALL SET! 🚀

Follow these steps exactly, and you'll have:

✅ 3 fully populated accounts  
✅ Web app working with all features  
✅ Mobile app with identical features  
✅ Perfect data sync between platforms  
✅ Ready for impressive demo to stakeholders!

**Happy presenting! 🎉**

