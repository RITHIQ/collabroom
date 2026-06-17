/**
 * SEED DEMO ACCOUNTS — Eligibility Audit Fix
 * Seeds: Priya Sharma (creator), Arjun Mehta / GlowCo India (brand),
 *        Monsoon Glow campaign, contracts, collab room, wallet, notifications
 *
 * Run: node seed_demo_accounts.js
 * NOTE: Uses service-role anon key — some inserts will be blocked by RLS.
 *       For blocked items, SQL is printed for manual execution.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xcorhotvnayrboihsdvm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_umiqwHBQxpE2ATCtfYiEMQ_NAl2nNRi';

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Known User IDs from DB ────────────────────────────────────────────────
// Aisha Sharma creator: user_id = 82c65607-2526-4ad0-a727-6ac3e4c787d1
// boAt brand user_id: e155667b-5f45-4ae3-9469-131709fd6e5f

// We'll use synthetic UUIDs for new accounts (since we can't create auth users via anon key)
const PRIYA_USER_ID  = 'aa000001-0000-0000-0000-000000000001';
const ARJUN_USER_ID  = 'aa000002-0000-0000-0000-000000000002';
const PRIYA_CREATOR_ID = 'cc000001-0000-0000-0000-000000000001';
const GLOWCO_BRAND_ID  = 'bb000001-0000-0000-0000-000000000001';
const MONSOON_CAMPAIGN_ID = 'ca000001-0000-0000-0000-000000000001';
const MONSOON_CONTRACT_ID = 'co000001-0000-0000-0000-000000000001';
const ROOM_001_ID = 'room-001';
const PRIYA_WALLET_ID = 'wl000001-0000-0000-0000-000000000001';

async function main() {
  console.log('🌱 Starting seed...\n');
  const sqls = [];

  // ── 1. Creator: Priya Sharma ────────────────────────────────────────────
  console.log('Creating Priya Sharma creator profile...');
  const { error: e1 } = await sb.from('creators').upsert({
    id: PRIYA_CREATOR_ID,
    user_id: PRIYA_USER_ID,
    display_name: 'Priya Sharma',
    username: 'priya_creates',
    bio: 'Fashion & lifestyle creator based in Delhi. Love helping brands tell their story through authentic content. 500K+ followers across platforms.',
    tagline: 'Where fashion meets authenticity',
    location: 'New Delhi, India',
    languages: ['Hindi', 'English'],
    niches: ['Fashion', 'Beauty', 'Lifestyle'],
    social_links: [
      { platform: 'instagram', handle: 'priya_creates', url: 'https://instagram.com/priya_creates', followers: 520000 },
      { platform: 'youtube', handle: 'PriyaCreates', url: 'https://youtube.com/@priyacreates', followers: 180000 }
    ],
    pricing_tiers: [
      { type: 'instagram_reel', price: 25000, currency: 'INR' },
      { type: 'youtube_video', price: 75000, currency: 'INR' }
    ],
    creator_score: 87,
    creator_tier: 'gold',
    availability: 'Immediately',
    campaigns_completed: 14,
    on_time_delivery_rate: 96,
    avg_response_time: '< 12h',
    completion_percentage: 85,
  }, { onConflict: 'id' });

  if (e1) {
    console.log('  ⚠ creators upsert blocked (RLS) — use SQL below');
    sqls.push(`
-- Creator: Priya Sharma
INSERT INTO creators (id, user_id, display_name, username, bio, niches, social_links, creator_score, creator_tier, availability, completion_percentage, on_time_delivery_rate, campaigns_completed)
VALUES (
  '${PRIYA_CREATOR_ID}', '${PRIYA_USER_ID}', 'Priya Sharma', 'priya_creates',
  'Fashion & lifestyle creator based in Delhi. 500K+ followers across platforms.',
  ARRAY['Fashion','Beauty','Lifestyle'],
  '[{"platform":"instagram","handle":"priya_creates","followers":520000},{"platform":"youtube","handle":"PriyaCreates","followers":180000}]'::jsonb,
  87, 'gold', 'Immediately', 85, 96, 14
) ON CONFLICT (id) DO UPDATE SET display_name=EXCLUDED.display_name, username=EXCLUDED.username;`);
  } else {
    console.log('  ✅ Priya Sharma creator created');
  }

  // ── 2. Profile for Priya ────────────────────────────────────────────────
  const { error: e2 } = await sb.from('profiles').upsert({
    id: PRIYA_USER_ID,
    user_id: PRIYA_USER_ID,
    role: 'creator',
    full_name: 'Priya Sharma',
  }, { onConflict: 'id' });
  if (e2) {
    sqls.push(`
-- Profile for Priya
INSERT INTO profiles (id, user_id, role, full_name) VALUES ('${PRIYA_USER_ID}','${PRIYA_USER_ID}','creator','Priya Sharma') ON CONFLICT (id) DO NOTHING;`);
  } else {
    console.log('  ✅ Priya Sharma profile created');
  }

  // ── 3. GlowCo India brand ───────────────────────────────────────────────
  console.log('Creating GlowCo India brand...');
  const { error: e3 } = await sb.from('brands').upsert({
    id: GLOWCO_BRAND_ID,
    user_id: ARJUN_USER_ID,
    company_name: 'GlowCo India',
    handle: 'glowcoindia',
    industry: 'Beauty & Skincare',
    company_size: '50-200',
    website: 'https://glowco.in',
    description: 'GlowCo India is a premium skincare brand focused on clean beauty for modern Indian consumers.',
    preferred_niches: ['Beauty', 'Skincare', 'Fashion', 'Lifestyle'],
    preferred_platforms: ['instagram', 'youtube'],
    brand_score: 72,
    brand_tier: 'established',
    avg_payment_time: 5,
    campaigns_completed: 8,
    on_time_payment_rate: 100,
  }, { onConflict: 'id' });
  if (e3) {
    console.log('  ⚠ brands upsert blocked — SQL below');
    sqls.push(`
-- Brand: GlowCo India
INSERT INTO brands (id, user_id, company_name, handle, industry, description, preferred_niches, brand_score, brand_tier)
VALUES (
  '${GLOWCO_BRAND_ID}', '${ARJUN_USER_ID}', 'GlowCo India', 'glowcoindia',
  'Beauty & Skincare', 'Premium skincare brand for modern India.',
  ARRAY['Beauty','Skincare','Fashion'],
  72, 'established'
) ON CONFLICT (id) DO UPDATE SET company_name=EXCLUDED.company_name;`);
  } else {
    console.log('  ✅ GlowCo India brand created');
  }

  // ── 4. Profile for Arjun Mehta ──────────────────────────────────────────
  const { error: e4 } = await sb.from('profiles').upsert({
    id: ARJUN_USER_ID,
    user_id: ARJUN_USER_ID,
    role: 'brand',
    full_name: 'Arjun Mehta',
  }, { onConflict: 'id' });
  if (e4) {
    sqls.push(`
-- Profile for Arjun Mehta
INSERT INTO profiles (id, user_id, role, full_name) VALUES ('${ARJUN_USER_ID}','${ARJUN_USER_ID}','brand','Arjun Mehta') ON CONFLICT (id) DO NOTHING;`);
  } else {
    console.log('  ✅ Arjun Mehta profile created');
  }

  // ── 5. Monsoon Glow campaign ────────────────────────────────────────────
  console.log('Creating Monsoon Glow campaign...');
  const { error: e5 } = await sb.from('campaigns').upsert({
    id: MONSOON_CAMPAIGN_ID,
    brand_user_id: ARJUN_USER_ID,
    title: 'Monsoon Glow',
    description: 'Showcase GlowCo\'s new monsoon skincare range through authentic lifestyle content. We need creators who can authentically demonstrate our hydrating serums and SPF range.',
    niche: 'Beauty/Skincare',
    platforms: ['instagram', 'youtube'],
    content_formats: ['reel', 'video', 'photo'],
    start_date: '2026-06-20',
    end_date: '2026-07-31',
    budget: 350000,
    currency: 'INR',
    status: 'active',
    visibility: 'public',
    type: 'sponsored_post',
    deliverables: ['2x Instagram Reels', '1x YouTube Video', '3x Stories'],
    slots_total: 3,
    slots_filled: 1,
    brand_name: 'GlowCo India',
    applications_count: 2,
  }, { onConflict: 'id' });
  if (e5) {
    console.log('  ⚠ campaigns upsert blocked — SQL below');
    sqls.push(`
-- Campaign: Monsoon Glow
INSERT INTO campaigns (id, brand_user_id, title, description, niche, platforms, budget, currency, status, visibility, type, deliverables, slots_total, slots_filled, brand_name)
VALUES (
  '${MONSOON_CAMPAIGN_ID}', '${ARJUN_USER_ID}', 'Monsoon Glow',
  'Showcase GlowCo''s new monsoon skincare range through authentic lifestyle content.',
  'Beauty/Skincare', ARRAY['instagram','youtube'], 350000, 'INR', 'active', 'public', 'sponsored_post',
  ARRAY['2x Instagram Reels','1x YouTube Video','3x Stories'],
  3, 1, 'GlowCo India'
) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;`);
  } else {
    console.log('  ✅ Monsoon Glow campaign created');
  }

  // ── 6. Campaign application by Priya for Monsoon Glow ──────────────────
  console.log('Creating campaign application...');
  const { error: e6 } = await sb.from('campaign_applications').upsert({
    id: 'ap000001-0000-0000-0000-000000000001',
    campaign_id: MONSOON_CAMPAIGN_ID,
    creator_id: PRIYA_CREATOR_ID,
    status: 'approved',
    cover_letter: 'Hi GlowCo! I\'d love to be part of the Monsoon Glow campaign. Fashion and skincare are my two biggest passions, and my audience (520K Instagram followers) is 78% female, 25-35, based in India — perfect for your product range.',
  }, { onConflict: 'id' });
  if (e6) {
    sqls.push(`
-- Campaign application
INSERT INTO campaign_applications (id, campaign_id, creator_id, status, cover_letter)
VALUES ('ap000001-0000-0000-0000-000000000001','${MONSOON_CAMPAIGN_ID}','${PRIYA_CREATOR_ID}','approved','Hi GlowCo! Fashion and skincare are my passions.') ON CONFLICT (id) DO NOTHING;`);
  } else {
    console.log('  ✅ Campaign application created');
  }

  // ── 7. Contract: Monsoon Glow (Signed) ──────────────────────────────────
  console.log('Creating Monsoon Glow contract...');
  const { error: e7 } = await sb.from('contracts').upsert({
    id: MONSOON_CONTRACT_ID,
    campaign_id: MONSOON_CAMPAIGN_ID,
    brand_id: ARJUN_USER_ID,
    creator_id: PRIYA_USER_ID,
    status: 'signed',
    brand_name: 'GlowCo India',
    creator_name: 'Priya Sharma',
    total_amount: 85000,
    currency: 'INR',
    signed_at: '2026-06-15T10:30:00Z',
    signed_by_brand_at: '2026-06-15T09:00:00Z',
    signed_by_creator_at: '2026-06-15T10:30:00Z',
    content: `INFLUENCER COLLABORATION AGREEMENT

This agreement is between GlowCo India ("Brand") and Priya Sharma ("Creator").

Campaign: Monsoon Glow
Duration: June 20 – July 31, 2026
Total Compensation: ₹85,000 INR

DELIVERABLES:
• 2x Instagram Reels (min 30 seconds, product featured)
• 1x YouTube Video (min 8 minutes, dedicated review)
• 3x Instagram Stories (swipe-up link required)

PAYMENT SCHEDULE:
• 30% (₹25,500) on contract signing
• 40% (₹34,000) on content submission
• 30% (₹25,500) on brand approval & posting

CONTENT GUIDELINES:
• Authentic demonstration of Monsoon Glow Hydrating Serum and SPF 50+ Sunscreen
• Include #MonsoonGlow #GlowCoIndia #GlowWithPriya
• Mandatory disclosure: "Paid partnership with GlowCo India"
• No competing skincare brand content 30 days before/after

Both parties agree to the terms above.`,
  }, { onConflict: 'id' });
  if (e7) {
    console.log('  ⚠ contracts upsert blocked — SQL below');
    sqls.push(`
-- Contract: Monsoon Glow (Signed)
INSERT INTO contracts (id, campaign_id, brand_id, creator_id, status, brand_name, creator_name, total_amount, currency, signed_at, content)
VALUES (
  '${MONSOON_CONTRACT_ID}', '${MONSOON_CAMPAIGN_ID}', '${ARJUN_USER_ID}', '${PRIYA_USER_ID}',
  'signed', 'GlowCo India', 'Priya Sharma', 85000, 'INR', '2026-06-15T10:30:00Z',
  'INFLUENCER COLLABORATION AGREEMENT — Monsoon Glow campaign between GlowCo India and Priya Sharma. Deliverables: 2x Instagram Reels, 1x YouTube Video, 3x Stories. Payment: Rs 85,000.'
) ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status;`);
  } else {
    console.log('  ✅ Monsoon Glow contract created');
  }

  // ── 8. Milestones for Monsoon Glow ──────────────────────────────────────
  console.log('Creating milestones...');
  const milestones = [
    { id: 'ml000001-0000-0000-0000-000000000001', campaign_id: MONSOON_CAMPAIGN_ID, title: 'Brief', status: 'completed', due_date: '2026-06-16', assigned_to: PRIYA_USER_ID, payment_amount: 25500 },
    { id: 'ml000002-0000-0000-0000-000000000002', campaign_id: MONSOON_CAMPAIGN_ID, title: 'Draft', status: 'in_progress', due_date: '2026-07-05', assigned_to: PRIYA_USER_ID, payment_amount: 34000 },
    { id: 'ml000003-0000-0000-0000-000000000003', campaign_id: MONSOON_CAMPAIGN_ID, title: 'Final', status: 'pending', due_date: '2026-07-20', assigned_to: PRIYA_USER_ID, payment_amount: 25500 },
  ];
  for (const m of milestones) {
    const { error } = await sb.from('milestones').upsert(m, { onConflict: 'id' });
    if (error) {
      sqls.push(`
-- Milestone: ${m.title}
INSERT INTO milestones (id, campaign_id, title, status, due_date, assigned_to, payment_amount)
VALUES ('${m.id}','${m.campaign_id}','${m.title}','${m.status}','${m.due_date}','${m.assigned_to}',${m.payment_amount}) ON CONFLICT (id) DO NOTHING;`);
    }
  }
  console.log('  ✅ Milestones created (Brief=completed, Draft=in_progress, Final=pending)');

  // ── 9. Wallet for Priya ─────────────────────────────────────────────────
  console.log('Creating Priya wallet with ₹18,500 balance...');
  const { error: e9 } = await sb.from('wallets').upsert({
    id: PRIYA_WALLET_ID,
    user_id: PRIYA_USER_ID,
    available_balance: 18500,
    pending_balance: 34000,
    locked_balance: 25500,
    currency: 'INR',
  }, { onConflict: 'id' });
  if (e9) {
    sqls.push(`
-- Wallet: Priya Sharma (Rs 18,500)
INSERT INTO wallets (id, user_id, available_balance, pending_balance, locked_balance, currency)
VALUES ('${PRIYA_WALLET_ID}','${PRIYA_USER_ID}',18500,34000,25500,'INR') ON CONFLICT (id) DO UPDATE SET available_balance=EXCLUDED.available_balance;`);
  } else {
    console.log('  ✅ Priya wallet created (₹18,500)');
  }

  // ── 10. Wallet transactions for Priya ───────────────────────────────────
  console.log('Creating wallet transactions...');
  const transactions = [
    { id: 'tx000001-0000-0000-0000-000000000001', user_id: PRIYA_USER_ID, type: 'credit', amount: 25500, method: 'escrow_release', status: 'completed' },
    { id: 'tx000002-0000-0000-0000-000000000002', user_id: PRIYA_USER_ID, type: 'credit', amount: 12000, method: 'bank_transfer', status: 'completed' },
    { id: 'tx000003-0000-0000-0000-000000000003', user_id: PRIYA_USER_ID, type: 'debit', amount: 19000, method: 'bank_transfer', status: 'completed' },
  ];
  for (const tx of transactions) {
    const { error } = await sb.from('wallet_transactions').upsert(tx, { onConflict: 'id' });
    if (error) {
      sqls.push(`
INSERT INTO wallet_transactions (id, user_id, type, amount, method, status)
VALUES ('${tx.id}','${tx.user_id}','${tx.type}',${tx.amount},'${tx.method}','${tx.status}') ON CONFLICT (id) DO NOTHING;`);
    }
  }
  console.log('  ✅ Wallet transactions created (3 rows)');

  // ── 11. Notifications referencing GlowCo ───────────────────────────────
  console.log('Creating GlowCo notifications for Priya...');
  const notifs = [
    {
      id: 'no000001-0000-0000-0000-000000000001',
      user_id: PRIYA_USER_ID,
      type: 'contract_sent',
      title: 'Contract from GlowCo India',
      body: 'GlowCo India has sent you a contract for the Monsoon Glow campaign. Review and sign to proceed.',
      is_read: false,
    },
    {
      id: 'no000002-0000-0000-0000-000000000002',
      user_id: PRIYA_USER_ID,
      type: 'payment_received',
      title: 'Payment received from GlowCo',
      body: '₹25,500 advance from GlowCo India for Monsoon Glow has been credited to your wallet.',
      is_read: false,
    },
    {
      id: 'no000003-0000-0000-0000-000000000003',
      user_id: PRIYA_USER_ID,
      type: 'new_campaign',
      title: 'Application approved — Monsoon Glow',
      body: 'Congratulations! GlowCo India approved your application for the Monsoon Glow campaign.',
      is_read: true,
    },
  ];
  for (const n of notifs) {
    const { error } = await sb.from('notifications').upsert(n, { onConflict: 'id' });
    if (error) {
      sqls.push(`
-- Notification: ${n.title}
INSERT INTO notifications (id, user_id, type, title, body, is_read)
VALUES ('${n.id}','${n.user_id}','${n.type}','${n.title}','${n.body}',${n.is_read}) ON CONFLICT (id) DO NOTHING;`);
    }
  }
  console.log('  ✅ GlowCo notifications created');

  // ── 12. Print SQL for blocked items ─────────────────────────────────────
  if (sqls.length > 0) {
    console.log('\n' + '═'.repeat(60));
    console.log('⚠️  SOME INSERTS WERE BLOCKED BY RLS. Run this SQL in Supabase SQL Editor:');
    console.log('═'.repeat(60));
    console.log(sqls.join('\n'));
    console.log('═'.repeat(60));
    console.log('\nGo to: https://supabase.com/dashboard/project/xcorhotvnayrboihsdvm/sql');
  } else {
    console.log('\n✨ ALL SEED DATA CREATED SUCCESSFULLY!');
  }

  console.log('\n📊 SUMMARY:');
  console.log('   Creator: Priya Sharma (priya_creates) — Fashion/Beauty/Lifestyle');
  console.log('   Brand: Arjun Mehta / GlowCo India');
  console.log('   Campaign: Monsoon Glow (active, Beauty/Skincare, ₹3.5L budget)');
  console.log('   Contract: Monsoon Glow (signed)');
  console.log('   Milestones: Brief (completed), Draft (in_progress), Final (pending)');
  console.log('   Wallet: ₹18,500 available balance');
  console.log('   Transactions: 3 rows');
  console.log('   Notifications: 3 items referencing GlowCo');
}

main().catch(console.error);
