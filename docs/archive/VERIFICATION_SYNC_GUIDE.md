# 🔍 VERIFICATION & SYNC GUIDE

This guide helps verify that **web and mobile apps sync perfectly** with fake data from Supabase.

---

## ✅ PRE-VERIFICATION CHECKLIST

Before running, ensure:

- [ ] Supabase URL is correct
- [ ] Supabase Anon Key is correct
- [ ] 3 accounts created in Supabase Auth
- [ ] Seed script completed successfully
- [ ] Both web & mobile use same Supabase config

---

## 🔄 DATA SYNC VERIFICATION

### Step 1: Verify Web App

```bash
# Terminal 1
npm run dev:web

# Open http://localhost:5173
# Login with: creator@demo.email / password
```

**Check:**
- [ ] Dashboard loads (should show campaigns)
- [ ] See "Campaigns" section with 3 campaigns
- [ ] See "Wallet" section with balance
  - Available: ₹145,250
  - Pending: ₹50,000
  - Locked: ₹125,000
- [ ] See "Contracts" section with 3 contracts
- [ ] Console shows no errors (F12 → Console)

### Step 2: Verify Mobile App

```bash
# Terminal 2
cd mobile
npm start

# Press 'i' for iOS simulator or 'a' for Android
# Login with: creator@demo.email / password
```

**Check:**
- [ ] Home screen loads
- [ ] See campaigns section
- [ ] See wallet with same balance as web
- [ ] See contracts section
- [ ] No console errors

### Step 3: Compare Data Side-by-Side

Open **two screens** with web on left, mobile on right:

| Field | Web | Mobile | Match? |
|-------|-----|--------|---------|
| Creator Name | Aisha Sharma | Aisha Sharma | ✅ |
| Available Balance | ₹145,250 | ₹145,250 | ✅ |
| Pending Balance | ₹50,000 | ₹50,000 | ✅ |
| Locked Balance | ₹125,000 | ₹125,000 | ✅ |
| # Campaigns | 3 | 3 | ✅ |
| # Contracts | 3 | 3 | ✅ |
| # Transactions | 5 | 5 | ✅ |

---

## 🧪 FEATURE VERIFICATION

### Creator Account Feature Test

**Web Only First:**

1. **Dashboard**
   - [ ] Shows total earnings
   - [ ] Shows campaign applications
   - [ ] Shows pending contracts

2. **Campaigns**
   - [ ] Can see all 3 campaigns
   - [ ] Can click to view campaign details
   - [ ] Can apply to campaign
   - [ ] Shows application status

3. **Contracts**
   - [ ] Can see all 3 contracts with status
   - [ ] Can click to view contract details
   - [ ] Can review delivery requirements
   - [ ] Can see payment amount

4. **Contract Signing**
   - [ ] Click "Sign Contract"
   - [ ] Canvas appears for signature
   - [ ] Can draw signature with mouse
   - [ ] Can submit signature
   - [ ] Contract status changes to "Signed"
   - [ ] Can download PDF
   - [ ] PDF opens/downloads correctly

5. **Wallet**
   - [ ] Shows balance breakdown
   - [ ] Shows transaction history (5 transactions)
   - [ ] Can click "Add Funds" button
   - [ ] Payment modal appears (Fake Razorpay)
   - [ ] Can select payment method
   - [ ] Can process payment
   - [ ] Balance updates after payment
   - [ ] New transaction appears in history

6. **Profile**
   - [ ] All fields populated
   - [ ] Social links visible
   - [ ] Niche tags shown
   - [ ] Creator score visible

**Now Test on Mobile:**

Repeat all above on mobile app:

- [ ] All features visible
- [ ] All buttons clickable
- [ ] Touch interactions work
- [ ] Signature canvas responsive to touch
- [ ] Payment flow works
- [ ] Data matches web version

### Brand Account Feature Test

Switch to brand account (`brand@demo.email`):

1. **Dashboard**
   - [ ] Shows campaign overview
   - [ ] Shows applications received
   - [ ] Shows payment metrics

2. **Campaigns**
   - [ ] Can see all 3 campaigns created
   - [ ] Can view campaign details
   - [ ] Can see applications for each campaign
   - [ ] Can create new campaign

3. **Applications**
   - [ ] Can see creator applications
   - [ ] Can view creator profiles
   - [ ] Can approve/reject applications

4. **Contracts**
   - [ ] Can see all contracts created
   - [ ] Can view contract details
   - [ ] Can see payment status

---

## 📱 MOBILE-SPECIFIC CHECKS

### Touch Interactions
- [ ] Buttons responsive to touch
- [ ] Signature canvas works with finger
- [ ] Scrolling smooth
- [ ] Forms properly formatted

### Performance
- [ ] App launches < 3 seconds
- [ ] Pages load < 2 seconds
- [ ] No lag on navigation
- [ ] Smooth animations

### Data Persistence
- [ ] Close app completely
- [ ] Reopen app
- [ ] Still logged in (session persisted)
- [ ] All data still visible

### Offline Awareness
- [ ] Works when online
- [ ] Shows appropriate message if offline
- [ ] Retries when online

---

## 🔐 BROWSER CONSOLE CHECKS

**Both Web and Mobile should show NO errors:**

```javascript
// Open DevTools: F12 (Web) or Flipper (Mobile)
// Go to Console tab
// Should see: 0 errors, 0 warnings (except third-party)
```

**Good signs:**
- ✅ Auth successful message
- ✅ Data loaded successfully
- ✅ No "undefined" errors
- ✅ No "404" errors
- ✅ No CORS errors

**Bad signs (fix if seen):**
- ❌ "Cannot read property of undefined"
- ❌ "Failed to fetch"
- ❌ CORS errors
- ❌ "Supabase connection failed"

---

## 📊 DATABASE VERIFICATION

**In Supabase Dashboard**, verify data exists:

### Check Profiles Table
```sql
SELECT * FROM profiles;
-- Should show 3 rows (creator, brand, admin)
```

### Check Wallets Table
```sql
SELECT * FROM wallets;
-- Should show 3 rows with correct balances
```

### Check Campaigns Table
```sql
SELECT * FROM campaigns;
-- Should show 3 rows
```

### Check Contracts Table
```sql
SELECT * FROM contracts;
-- Should show 3 rows
```

### Check Wallet Transactions
```sql
SELECT * FROM wallet_transactions 
WHERE user_id = 'creator_user_id';
-- Should show 5+ transactions
```

---

## 🔄 SYNC VERIFICATION SCRIPT

Run this to auto-verify sync:

```bash
# Create verify_sync.sh
chmod +x verify_sync.sh
./verify_sync.sh
```

This script will:
1. ✅ Query Supabase for creator wallet
2. ✅ Query Supabase for campaigns
3. ✅ Query Supabase for contracts
4. ✅ Output all values
5. ✅ Confirm data exists

---

## 📋 FINAL CHECKLIST

### Data Verification
- [ ] 3 accounts fully populated
- [ ] Creator balance = ₹320,250 total
- [ ] Brand balance = ₹850,000
- [ ] 3 campaigns visible
- [ ] 3 contracts visible
- [ ] 5+ wallet transactions
- [ ] Creator profile complete
- [ ] Brand profile complete

### Web App Verification
- [ ] All pages load
- [ ] No console errors
- [ ] All features work
- [ ] Data displays correctly
- [ ] Can sign contract
- [ ] Can add funds
- [ ] Can download PDF
- [ ] Performance: < 2 sec load

### Mobile App Verification
- [ ] All pages load
- [ ] No console errors
- [ ] All features work
- [ ] Data matches web
- [ ] Touch interactions work
- [ ] Signature canvas works
- [ ] Can add funds
- [ ] Performance: < 2 sec load

### Feature Parity
- [ ] Set of features identical
- [ ] Data shows same values
- [ ] UI responsive
- [ ] Navigation consistent
- [ ] Wallet sync real-time
- [ ] Contracts sync real-time

### Performance Verification
- [ ] Page load: < 2 seconds
- [ ] Transaction confirmation: < 1 second
- [ ] Image loading: smooth
- [ ] Animation: 60fps
- [ ] No memory leaks

### Error Handling
- [ ] No crashes on errors
- [ ] Shows user-friendly errors
- [ ] Can retry failed operations
- [ ] Network errors handled

---

## ✅ SUCCESS CRITERIA

You've successfully verified sync when:

1. ✅ Web and mobile show identical data
2. ✅ All balances match exactly
3. ✅ All campaigns visible in both
4. ✅ All contracts visible in both
5. ✅ No console errors in either
6. ✅ All buttons work identically
7. ✅ Page load < 2 seconds
8. ✅ Performance smooth
9. ✅ No crashes
10. ✅ Ready for presentation

---

## 🆘 TROUBLESHOOTING SYNC ISSUES

### Mobile shows different data than Web

**Problem:** Data not syncing

**Solution:**
1. Check Supabase URL matches in both:
   - `web/src/services/supabaseClient.ts`
   - `mobile/src/lib/supabase.ts`
2. Check Anon keys match
3. Hard refresh web: Ctrl+Shift+R
4. Clear mobile app cache:
   - iOS: Settings → App → Offload App → Reinstall
   - Android: Settings → Apps → ColabRoom → Clear Cache
5. Restart dev servers
6. Re-run seed script

### Web shows data but Mobile doesn't

**Problem:** Only web working

**Solution:**
1. Verify mobile has internet connection
2. Check mobile supabase config
3. Try with Android emulator first (simpler)
4. Check mobile console logs
5. Restart Expo dev server

### Balances don't match

**Problem:** Amounts different between apps

**Solution:**
1. Could be caching issue
2. Clear localStorage (web)
3. Clear AsyncStorage (mobile)
4. Re-run seed script
5. Restart apps

### Contracts not showing

**Problem:** No contracts visible

**Solution:**
1. Check contracts table in Supabase
2. Verify RLS policies allow read
3. Clear cache and refresh
4. Verify creator_id matches user_id
5. Check console for SQL errors

---

## 📞 NEXT STEPS

Once verified:

1. ✅ You're ready for presentation
2. ✅ Demo both web and mobile
3. ✅ Highlight feature parity
4. ✅ Show real-time sync in action
5. ✅ Impress stakeholders!

---

**Status: VERIFICATION READY**

Follow this guide to confirm everything syncs perfectly! 🎉
