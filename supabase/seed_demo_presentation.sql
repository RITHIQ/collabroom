-- ============================================================
-- ColabRoom Presentation Seed Data
-- Run this in Supabase SQL Editor AFTER schema_v2.sql
-- 
-- Demo accounts (create via Supabase Auth → Users or via app signup):
--   Creator: collabroomoperations+creator@gmail.com
--   Brand:   collabroomoperations+brand@gmail.com
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- STEP 1: Creator profile — Priya Sharma
-- ═══════════════════════════════════════════════════════════════

-- Base profile
INSERT INTO public.profiles (user_id, role, full_name, is_verified)
SELECT id, 'creator', 'Priya Sharma', true
FROM auth.users WHERE email = 'collabroomoperations+creator@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role='creator', full_name='Priya Sharma', is_verified=true;

-- Creator row with all required fields
INSERT INTO public.creators (
  user_id, display_name, username, bio, tagline, location, niches, languages,
  social_links, pricing_tiers, creator_score, creator_tier, availability,
  campaigns_completed, on_time_delivery_rate, completion_percentage
)
SELECT
  id,
  'Priya Sharma',
  'priya_creates',
  'Beauty and fashion creator based in Mumbai. I partner with authentic brands that align with my values and audience. Known for my monsoon skincare routines and festive makeup looks.',
  'Authentic creator · 450K+ reach · Top-rated on ColabRoom',
  'Mumbai, India',
  ARRAY['Fashion', 'Beauty', 'Lifestyle'],
  ARRAY['English', 'Hindi'],
  '[
    {"platform": "instagram", "handle": "@priya_creates", "followers": 280000, "engagementRate": 4.8},
    {"platform": "youtube", "handle": "Priya Sharma", "followers": 170000, "engagementRate": 3.9}
  ]'::jsonb,
  '[
    {"type": "story", "label": "Instagram Story", "minPrice": 15000, "maxPrice": 25000, "currency": "INR"},
    {"type": "reel", "label": "Instagram Reel", "minPrice": 45000, "maxPrice": 80000, "currency": "INR"},
    {"type": "youtube_video", "label": "YouTube Integration", "minPrice": 90000, "maxPrice": 180000, "currency": "INR"}
  ]'::jsonb,
  92,
  'elite',
  'available',
  38,
  97,
  87
FROM auth.users WHERE email = 'collabroomoperations+creator@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  display_name = 'Priya Sharma',
  username = 'priya_creates',
  bio = 'Beauty and fashion creator based in Mumbai. I partner with authentic brands that align with my values and audience. Known for my monsoon skincare routines and festive makeup looks.',
  tagline = 'Authentic creator · 450K+ reach · Top-rated on ColabRoom',
  niches = ARRAY['Fashion', 'Beauty', 'Lifestyle'],
  social_links = '[
    {"platform": "instagram", "handle": "@priya_creates", "followers": 280000, "engagementRate": 4.8},
    {"platform": "youtube", "handle": "Priya Sharma", "followers": 170000, "engagementRate": 3.9}
  ]'::jsonb,
  creator_score = 92,
  completion_percentage = 87;

-- ═══════════════════════════════════════════════════════════════
-- STEP 2: Brand profile — GlowCo India (Arjun Mehta)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.profiles (user_id, role, full_name, is_verified)
SELECT id, 'brand', 'Arjun Mehta', true
FROM auth.users WHERE email = 'collabroomoperations+brand@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role='brand', full_name='Arjun Mehta', is_verified=true;

INSERT INTO public.brands (
  user_id, company_name, handle, industry, company_size, website, description,
  preferred_niches, preferred_platforms, brand_score, brand_tier,
  avg_payment_time, campaigns_completed, on_time_payment_rate, completion_percentage
)
SELECT
  id,
  'GlowCo India',
  'glowco-india',
  'Beauty/Skincare',
  '51-200',
  'https://glowco.in',
  'GlowCo India is a clean D2C skincare brand focused on effective, affordable formulations for Indian skin types. Monsoon Glow is our flagship hydration line.',
  ARRAY['Beauty/Skincare', 'Lifestyle', 'Fashion'],
  ARRAY['instagram', 'youtube'],
  84,
  'trusted',
  2.1,
  18,
  96,
  91
FROM auth.users WHERE email = 'collabroomoperations+brand@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  company_name = 'GlowCo India',
  handle = 'glowco-india',
  industry = 'Beauty/Skincare',
  brand_score = 84;

-- ═══════════════════════════════════════════════════════════════
-- STEP 3: Wallets
-- ═══════════════════════════════════════════════════════════════

-- Creator wallet: ₹18,500
INSERT INTO public.wallets (user_id, available_balance, pending_balance, locked_balance, currency)
SELECT id, 18500, 7200, 0, 'INR'
FROM auth.users WHERE email = 'collabroomoperations+creator@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET available_balance=18500, pending_balance=7200, locked_balance=0;

-- Brand wallet
INSERT INTO public.wallets (user_id, available_balance, pending_balance, locked_balance, currency)
SELECT id, 250000, 0, 185000, 'INR'
FROM auth.users WHERE email = 'collabroomoperations+brand@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET available_balance=250000, locked_balance=185000;

-- ═══════════════════════════════════════════════════════════════
-- STEP 4: Wallet transactions for creator (min 3, one must be Nykaa)
-- ═══════════════════════════════════════════════════════════════

-- Delete old demo transactions to avoid duplication
DELETE FROM public.wallet_transactions
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'collabroomoperations+creator@gmail.com')
  AND method IS NULL OR method IN ('nykaa_demo', 'glow_demo', 'upi_demo');

-- Nykaa payment (required)
INSERT INTO public.wallet_transactions (user_id, type, amount, status, method, created_at)
SELECT id, 'credit', 18500, 'completed', 'nykaa_demo', now() - interval '3 days'
FROM auth.users WHERE email = 'collabroomoperations+creator@gmail.com';

-- Monsoon Glow escrow release
INSERT INTO public.wallet_transactions (user_id, type, amount, status, method, created_at)
SELECT id, 'credit', 12500, 'completed', 'glow_demo', now() - interval '7 days'
FROM auth.users WHERE email = 'collabroomoperations+creator@gmail.com';

-- Withdrawal
INSERT INTO public.wallet_transactions (user_id, type, amount, status, method, created_at)
SELECT id, 'withdrawal', 5000, 'completed', 'upi_demo', now() - interval '14 days'
FROM auth.users WHERE email = 'collabroomoperations+creator@gmail.com';

-- ═══════════════════════════════════════════════════════════════
-- STEP 5: Monsoon Glow campaign (owned by brand)
-- ═══════════════════════════════════════════════════════════════

-- Insert campaign with id 'room-001'
INSERT INTO public.campaigns (
  id, brand_user_id, title, description, niche, platforms, content_formats,
  start_date, end_date, budget, currency, status, visibility, type,
  deliverables, slots_total, slots_filled, brand_name, applications_count
)
SELECT
  'room-001',
  id,
  'Monsoon Glow',
  'GlowCo India flagship monsoon campaign. Seeking beauty and skincare creators to showcase our new hydration line. Authentic content, real results for Indian skin.',
  'Beauty/Skincare',
  ARRAY['instagram', 'youtube'],
  ARRAY['reel', 'story', 'feed_post'],
  now() - interval '30 days',
  now() + interval '45 days',
  350000,
  'INR',
  'active',
  'public',
  'sponsored_post',
  ARRAY['2 Instagram Reels', '3 Stories', '1 YouTube Short'],
  5,
  1,
  'GlowCo India',
  12
FROM auth.users WHERE email = 'collabroomoperations+brand@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  title = 'Monsoon Glow',
  status = 'active',
  brand_name = 'GlowCo India',
  deliverables = ARRAY['2 Instagram Reels', '3 Stories', '1 YouTube Short'];

-- ═══════════════════════════════════════════════════════════════
-- STEP 6: Campaign application for creator
-- ═══════════════════════════════════════════════════════════════

-- Get creator ID from creators table
DO $$
DECLARE
  v_creator_uid uuid;
  v_creator_id uuid;
BEGIN
  SELECT id INTO v_creator_uid FROM auth.users WHERE email = 'collabroomoperations+creator@gmail.com';
  SELECT id INTO v_creator_id FROM public.creators WHERE user_id = v_creator_uid;
  
  IF v_creator_id IS NOT NULL THEN
    INSERT INTO public.campaign_applications (campaign_id, creator_id, status, cover_letter, created_at)
    VALUES (
      'room-001',
      v_creator_id,
      'approved',
      'Hi GlowCo! I love your clean beauty approach and would love to showcase Monsoon Glow to my 280K Instagram followers who trust my skincare recommendations.',
      now() - interval '20 days'
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- STEP 7: Contract — Monsoon Glow (status: signed)
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_creator_uid uuid;
  v_brand_uid uuid;
BEGIN
  SELECT id INTO v_creator_uid FROM auth.users WHERE email = 'collabroomoperations+creator@gmail.com';
  SELECT id INTO v_brand_uid FROM auth.users WHERE email = 'collabroomoperations+brand@gmail.com';
  
  IF v_creator_uid IS NOT NULL AND v_brand_uid IS NOT NULL THEN
    INSERT INTO public.contracts (
      id, campaign_id, creator_id, brand_id,
      status, content, total_amount, currency,
      brand_name, creator_name,
      signed_by_brand_at, signed_by_creator_at, created_at
    ) VALUES (
      'contract_monsoon_glow_demo',
      'room-001',
      v_creator_uid,
      v_brand_uid,
      'signed',
      '{
        "parties": "GlowCo India Pvt. Ltd. (Client) and Priya Sharma (Creator)",
        "compensation": "₹1,85,000 held in ColabRoom Escrow. Released in two tranches: 40% on draft approval, 60% on final published content.",
        "scope": "Two (2) Instagram Reels showcasing GlowCo Hydration Serum, three (3) Instagram Stories with swipe-up links, and one (1) YouTube Short. DELIVERABLES: 2 Reels, 3 Stories, 1 YouTube Short. Mandatory hashtags: #MonsoonGlow #GlowCoIndia.",
        "liability": "Creator agrees to ASCI guidelines and must disclose paid partnership. GlowCo retains 3-month amplification rights.",
        "kill_fee": "25% kill fee applies if brand cancels after content brief is shared."
      }'::jsonb,
      185000,
      'INR',
      'GlowCo India',
      'Priya Sharma',
      now() - interval '18 days',
      now() - interval '17 days',
      now() - interval '19 days'
    )
    ON CONFLICT (id) DO UPDATE SET
      status = 'signed',
      brand_name = 'GlowCo India',
      creator_name = 'Priya Sharma';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- STEP 8: Milestones for room-001 campaign
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_creator_uid uuid;
BEGIN
  SELECT id INTO v_creator_uid FROM auth.users WHERE email = 'collabroomoperations+creator@gmail.com';
  
  -- Delete old milestones for this campaign
  DELETE FROM public.milestones WHERE campaign_id = 'room-001';
  
  -- Brief (completed)
  INSERT INTO public.milestones (campaign_id, title, due_date, assigned_to, status, payment_amount, completed_at)
  VALUES ('room-001', 'Brief', current_date - 15, v_creator_uid, 'completed', 0, now() - interval '14 days');
  
  -- Draft (in_progress)
  INSERT INTO public.milestones (campaign_id, title, due_date, assigned_to, status, payment_amount)
  VALUES ('room-001', 'Draft', current_date + 5, v_creator_uid, 'in_progress', 80000);
  
  -- Final (pending)
  INSERT INTO public.milestones (campaign_id, title, due_date, assigned_to, status, payment_amount)
  VALUES ('room-001', 'Final', current_date + 20, v_creator_uid, 'pending', 105000);
END $$;

-- ═══════════════════════════════════════════════════════════════
-- STEP 9: Notifications for creator (min 2, one must ref GlowCo)
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_creator_uid uuid;
BEGIN
  SELECT id INTO v_creator_uid FROM auth.users WHERE email = 'collabroomoperations+creator@gmail.com';
  
  IF v_creator_uid IS NOT NULL THEN
    -- GlowCo notification (required)
    INSERT INTO public.notifications (user_id, type, title, body, is_read, created_at)
    VALUES (
      v_creator_uid,
      'campaign',
      'GlowCo India approved your application!',
      'Congratulations! GlowCo India has accepted your application for the Monsoon Glow campaign. Your contract is ready for review.',
      false,
      now() - interval '1 day'
    );
    
    -- Payment notification
    INSERT INTO public.notifications (user_id, type, title, body, is_read, created_at)
    VALUES (
      v_creator_uid,
      'payment',
      'Payment received: ₹18,500 from Nykaa',
      'Your payment of ₹18,500 from the Nykaa Festive Glam campaign has been released to your wallet.',
      false,
      now() - interval '3 days'
    );
    
    -- Contract notification
    INSERT INTO public.notifications (user_id, type, title, body, is_read, created_at)
    VALUES (
      v_creator_uid,
      'contract',
      'Contract ready — Monsoon Glow',
      'GlowCo India has signed your contract for the Monsoon Glow campaign. Please review and countersign.',
      true,
      now() - interval '5 days'
    );
    
    -- Welcome announcement
    INSERT INTO public.notifications (user_id, type, title, body, is_read, created_at)
    VALUES (
      v_creator_uid,
      'announcement',
      'Welcome to ColabRoom!',
      'Complete your profile to get discovered by top brands and start collaborating today!',
      true,
      now() - interval '30 days'
    );
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- STEP 10: RLS — Enable on all required tables
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on tables (safe to re-run)
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creators          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones        ENABLE ROW LEVEL SECURITY;

-- wallets: user owns own wallet
DROP POLICY IF EXISTS "User views own wallet" ON public.wallets;
CREATE POLICY "User views own wallet" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "User updates own wallet" ON public.wallets;
CREATE POLICY "User updates own wallet" ON public.wallets
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- wallet_transactions: user owns own transactions
DROP POLICY IF EXISTS "User views own transactions" ON public.wallet_transactions;
CREATE POLICY "User views own transactions" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "User inserts own transactions" ON public.wallet_transactions;
CREATE POLICY "User inserts own transactions" ON public.wallet_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- creators: any authenticated can SELECT; user updates own
DROP POLICY IF EXISTS "Authenticated can view creators" ON public.creators;
CREATE POLICY "Authenticated can view creators" ON public.creators
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Creator updates own profile" ON public.creators;
CREATE POLICY "Creator updates own profile" ON public.creators
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Creator inserts own profile" ON public.creators;
CREATE POLICY "Creator inserts own profile" ON public.creators
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- brands: any authenticated can SELECT
DROP POLICY IF EXISTS "Authenticated can view brands" ON public.brands;
CREATE POLICY "Authenticated can view brands" ON public.brands
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Brand updates own profile" ON public.brands;
CREATE POLICY "Brand updates own profile" ON public.brands
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Brand inserts own profile" ON public.brands;
CREATE POLICY "Brand inserts own profile" ON public.brands
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- campaigns: any authenticated can SELECT; brand inserts own
DROP POLICY IF EXISTS "Authenticated can view campaigns" ON public.campaigns;
CREATE POLICY "Authenticated can view campaigns" ON public.campaigns
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Brand creates campaigns" ON public.campaigns;
CREATE POLICY "Brand creates campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (auth.uid() = brand_user_id);
DROP POLICY IF EXISTS "Brand updates own campaigns" ON public.campaigns;
CREATE POLICY "Brand updates own campaigns" ON public.campaigns
  FOR UPDATE USING (auth.uid() = brand_user_id);

-- contracts: creator or brand can view their own contracts
DROP POLICY IF EXISTS "Parties view own contracts" ON public.contracts;
CREATE POLICY "Parties view own contracts" ON public.contracts
  FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = brand_id);
DROP POLICY IF EXISTS "Parties update own contracts" ON public.contracts;
CREATE POLICY "Parties update own contracts" ON public.contracts
  FOR UPDATE USING (auth.uid() = creator_id OR auth.uid() = brand_id);
DROP POLICY IF EXISTS "System inserts contracts" ON public.contracts;
CREATE POLICY "System inserts contracts" ON public.contracts
  FOR INSERT WITH CHECK (auth.uid() = creator_id OR auth.uid() = brand_id);

-- campaign_applications
DROP POLICY IF EXISTS "Creator views own applications" ON public.campaign_applications;
CREATE POLICY "Creator views own applications" ON public.campaign_applications
  FOR SELECT USING (auth.uid() = creator_id OR EXISTS (
    SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.brand_user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "Creator inserts own applications" ON public.campaign_applications;
CREATE POLICY "Creator inserts own applications" ON public.campaign_applications
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- messages
DROP POLICY IF EXISTS "Users view own messages" ON public.messages;
CREATE POLICY "Users view own messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
DROP POLICY IF EXISTS "Users send messages" ON public.messages;
CREATE POLICY "Users send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
DROP POLICY IF EXISTS "Users update own messages" ON public.messages;
CREATE POLICY "Users update own messages" ON public.messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- ═══════════════════════════════════════════════════════════════
-- DONE! Summary:
-- ✅ Creator: Priya Sharma (priya_creates, Fashion/Beauty/Lifestyle)
-- ✅ Brand: Arjun Mehta / GlowCo India
-- ✅ Wallet: ₹18,500 + 3 transactions (Nykaa, Monsoon Glow, withdrawal)
-- ✅ Campaign: Monsoon Glow (id=room-001, status=active)
-- ✅ Contract: contract_monsoon_glow_demo (status=signed, deliverables filled)
-- ✅ Milestones: Brief (completed), Draft (in_progress), Final (pending)
-- ✅ Notifications: 4 items including GlowCo reference
-- ✅ RLS: enabled on all 11 required tables with policies
-- ═══════════════════════════════════════════════════════════════
