# 🔧 RLS FIX GUIDE - DISABLE RLS FOR SEEDING

## The Issue

The seed script hit **RLS (Row Level Security) policy errors**. The accounts were created successfully but data insertion was blocked by database security policies.

## Solution (2 steps)

### Step 1: Disable RLS Temporarily ⚡

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Open file: `supabase/disable_rls_for_seeding.sql`
6. Copy **all the code** from lines 1-20 (the "ALTER TABLE" commands)
7. Paste into Supabase SQL Editor
8. Click **Run** button
9. You should see: "All RLS policies temporarily disabled for seeding"

### Step 2: Run Seed Script Again ✨

```bash
npx ts-node seed_complete_presentation.ts
```

This time it will **populate all the data successfully**!

Expected output:
```
✨ SEEDING COMPLETE! ✨

📊 DATA CREATED:
   • 3 Campaigns ✅
   • 3 Contracts ✅
   • 2 Milestones ✅
   • 5 Wallet Transactions ✅
   • 5 Notifications ✅
   • 3 Wallets ✅
```

### Step 3: Re-enable RLS ✔️

After seeding completes successfully:

1. In Supabase SQL Editor, click **New Query**
2. Open `supabase/disable_rls_for_seeding.sql`
3. Copy **the commented section** (the "RE-ENABLE RLS" part) - starting from `/*` and ending with `*/`
4. **Remove the `/*` and `*/`** comment markers
5. Paste into SQL Editor
6. Click **Run**
7. You should see: "All RLS policies re-enabled after seeding"

---

## ✅ Quick Summary

```
1. Supabase Dashboard
   → SQL Editor
   → New Query
   → Run disable_rls_for_seeding.sql (lines 1-20)

2. Terminal
   → npx ts-node seed_complete_presentation.ts

3. Supabase Dashboard
   → SQL Editor
   → New Query
   → Run disable_rls_for_seeding.sql (re-enable section)
```

---

## 🎯 Why?

RLS policies protect your database in production by restricting who can read/write data. During seeding, we temporarily disable them so the script can populate initial test data. Then we re-enable them immediately after.

---

**Next: Follow the 3 steps above, then your data will be fully populated!** ✨

