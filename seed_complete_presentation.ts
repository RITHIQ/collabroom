/**
 * ============================================================================
 * COMPLETE PRESENTATION DATA SEEDING SCRIPT
 * ============================================================================
 * 
 * This script populates all 3 demo accounts (creator, brand, admin) with
 * complete fake data across all tables so both web and mobile apps work perfectly.
 * 
 * HOW TO RUN:
 * 1. Update SUPABASE_URL and SUPABASE_KEY below
 * 2. Update EMAIL/PASSWORD credentials for your 3 accounts
 * 3. Run: npx ts-node seed_complete_presentation.ts
 * 
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xcorhotvnayrboihsdvm.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_umiqwHBQxpE2ATCtfYiEMQ_NAl2nNRi';

// ============================================================================
// ACCOUNT CREDENTIALS - Update these with your actual Supabase accounts
// ============================================================================
const ACCOUNTS = {
  creator: {
    email: 'collabroomoperations+creator@gmail.com',
    password: 'Project2027#',
  },
  brand: {
    email: 'collabroomoperations+brand@gmail.com',
    password: 'Project2027#',
  },
  admin: {
    email: 'collabroomoperations+admin@gmail.com',
    password: 'Project2027#',
  },
};

// ============================================================================
// SEED DATA
// ============================================================================

const CREATOR_DATA = {
  displayName: 'Aisha Sharma',
  username: 'aisha_creates',
  bio: 'Fitness enthusiast & lifestyle content creator | 🎥 Reels | 📸 Photography | Marathon Runner',
  tagline: 'Inspiring healthy living through authentic content',
  location: 'Mumbai, India',
  languages: ['Hindi', 'English'],
  niches: ['Fitness', 'Lifestyle', 'Fashion'],
  availability: 'available' as const,
  creatorScore: 92,
  creatorTier: 'elite' as const,
  completionPercentage: 95,
  campaignsCompleted: 23,
  onTimeDeliveryRate: 98,
  revisionRate: 15,
  avgResponseTime: '2 hours',
  portfolioUrls: [
    'https://instagram.com/aisha_creates',
    'https://youtube.com/@aishafitness',
    'https://tiktok.com/@aisha_creates',
  ],
  socialLinks: [
    { platform: 'instagram', handle: 'aisha_creates', followers: 245000, engagementRate: 4.8 },
    { platform: 'youtube', handle: 'AishaFitness', followers: 85000, engagementRate: 6.2 },
    { platform: 'tiktok', handle: 'aisha_creates', followers: 520000, engagementRate: 7.1 },
    { platform: 'twitter', handle: 'aisha_fitness', followers: 35000, engagementRate: 2.3 },
    { platform: 'linkedin', handle: 'aisha-sharma', followers: 12000, engagementRate: 1.8 },
  ],
  pricingTiers: [
    { type: 'story', label: 'Instagram Story', minPrice: 5000, maxPrice: 10000, currency: 'INR' },
    { type: 'feed_post', label: 'Feed Post', minPrice: 15000, maxPrice: 30000, currency: 'INR' },
    { type: 'reel', label: 'Reel (15-30s)', minPrice: 25000, maxPrice: 50000, currency: 'INR' },
    { type: 'youtube_video', label: 'YouTube Video', minPrice: 50000, maxPrice: 125000, currency: 'INR' },
    { type: 'dedicated_video', label: 'Dedicated Video', minPrice: 75000, maxPrice: 200000, currency: 'INR' },
  ],
  audienceData: {
    topAgeGroup: '25-34',
    topLocation: 'India',
    genderSplit: { male: 35, female: 63, other: 2 },
  },
};

const BRAND_DATA = {
  companyName: 'boAt Lifestyle',
  handle: 'boatlifestyle',
  industry: 'Consumer Electronics & Wearables',
  companySize: '200-500',
  website: 'https://www.boat-lifestyle.com',
  description: 'Premium audio and wearable technology brand in India. We create products that inspire and empower.',
  values: 'Innovation • Quality • Customer First • Sustainability',
  preferredNiches: ['Technology', 'Lifestyle', 'Fitness', 'Music', 'Fashion'],
  preferredPlatforms: ['instagram', 'youtube', 'tiktok'],
  brandScore: 94,
  brandTier: 'top_brand' as const,
  avgPaymentTime: 5,
  campaignsCompleted: 156,
  onTimePaymentRate: 99,
  completionPercentage: 97,
};

const CAMPAIGNS_DATA = [
  {
    title: 'boAt Summer Audio Collection 2026',
    description: 'Launch campaign for our new summer audio collection. We need creators to showcase our latest wireless headphones through lifestyle content.',
    type: 'sponsored_post' as const,
    platforms: ['instagram', 'youtube', 'tiktok'] as const,
    contentFormats: ['reel', 'video', 'photo'] as const,
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 500000,
    slotsTotal: 8,
    niche: 'Technology',
    status: 'active' as const,
    visibility: 'public' as const,
    deliverables: [
      '3 Instagram Reels (15-30 seconds)',
      '1 YouTube video (2-3 minutes)',
      '5 TikTok videos (15-60 seconds)',
      'Minimum engagement commitment: 5% average',
    ],
    applicationMessage: 'Love boAt products! Perfect fit for my audience.',
  },
  {
    title: 'Fitness Month Challenge - August',
    description: 'Partner with us for our fitness month challenge. Create content showing your fitness journey with boAt wearables.',
    type: 'brand_ambassador' as const,
    platforms: ['instagram', 'tiktok'] as const,
    contentFormats: ['reel', 'story'] as const,
    startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 250000,
    slotsTotal: 5,
    niche: 'Fitness',
    status: 'active' as const,
    visibility: 'public' as const,
    deliverables: ['Daily fitness content for 30 days', 'Tag boAt in all content', 'Use brand hashtag #BoAtFitnessChallenge'],
    applicationMessage: 'Perfect timing! I love fitness content creation.',
  },
  {
    title: 'Holiday Gift Guide',
    description: 'Feature boAt products in your holiday gift guide content.',
    type: 'product_review' as const,
    platforms: ['youtube', 'instagram'] as const,
    contentFormats: ['video', 'blog'] as const,
    startDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 300000,
    slotsTotal: 6,
    niche: 'Lifestyle',
    status: 'draft' as const,
    visibility: 'private' as const,
    deliverables: ['Gift guide video/blog', 'Product reviews', 'Unboxing content'],
    applicationMessage: 'Would love to feature these in my guide!',
  },
];

const MILESTONES_DATA = [
  {
    title: 'Content Creation & Delivery',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'in_progress' as const,
    paymentAmount: 50000,
  },
  {
    title: 'First Review & Approval',
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending' as const,
    paymentAmount: 0,
  },
  {
    title: 'Content Goes Live',
    dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending' as const,
    paymentAmount: 30000,
  },
  {
    title: 'Performance Reporting',
    dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending' as const,
    paymentAmount: 20000,
  },
];

const CONTRACTS_DATA = [
  {
    title: 'boAt Summer Campaign Contract',
    amount: 100000,
    currency: 'INR',
    status: 'sent' as const,
    deliverables: ['3 Instagram Reels', '1 YouTube video', '5 TikTok videos'],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    title: 'Brand Ambassador Agreement',
    amount: 250000,
    currency: 'INR',
    status: 'draft' as const,
    deliverables: ['30 days fitness content', 'Daily posting commitment'],
    dueDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    title: 'Completed: Q2 Campaign',
    amount: 85000,
    currency: 'INR',
    status: 'signed' as const,
    deliverables: ['5 Reels', '2 Stories', '1 Video'],
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
];

const WALLET_TRANSACTIONS = [
  { type: 'credit', amount: 85000, method: 'bank_transfer', status: 'completed', description: 'Payment for Q2 Campaign' },
  { type: 'credit', amount: 50000, method: 'razorpay', status: 'completed', description: 'Advance for Summer Campaign' },
  { type: 'debit', amount: 15000, method: 'bank_transfer', status: 'completed', description: 'Withdrawal to bank' },
  { type: 'credit', amount: 30000, method: 'wallet_credit', status: 'completed', description: 'Referral bonus' },
  { type: 'debit', amount: 2500, method: 'wallet', status: 'completed', description: 'Platform fee' },
];

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================

async function seed() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    console.log('🚀 Starting complete presentation data seeding...\n');

    // ========================================================================
    // STEP 1: LOGIN & GET USER IDS
    // ========================================================================
    console.log('📝 Step 1: Authenticating accounts...');
    let userIds: { creator: string; brand: string; admin: string } = { creator: '', brand: '', admin: '' };

    for (const role of ['creator', 'brand', 'admin'] as const) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: ACCOUNTS[role].email,
        password: ACCOUNTS[role].password,
      });

      if (error) {
        console.error(`❌ Failed to login as ${role}:`, error.message);
        console.log(`   Make sure ${ACCOUNTS[role].email} exists in your Supabase auth`);
        process.exit(1);
      }

      userIds[role] = data.user!.id;
      console.log(`✅ ${role.toUpperCase()}: ${userIds[role]}`);
    }
    console.log('');

    // ========================================================================
    // STEP 2: UPDATE CREATOR PROFILE
    // ========================================================================
    console.log('👤 Step 2: Populating Creator Profile...');

    // Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'creator',
        full_name: CREATOR_DATA.displayName,
        is_verified: true,
      })
      .eq('user_id', userIds.creator);

    if (profileError) console.error('Profile update error (non-critical):', profileError.message);

    // Upsert creators table
    const { error: creatorError } = await supabase
      .from('creators')
      .upsert(
        {
          user_id: userIds.creator,
          display_name: CREATOR_DATA.displayName,
          username: CREATOR_DATA.username,
          bio: CREATOR_DATA.bio,
          tagline: CREATOR_DATA.tagline,
          location: CREATOR_DATA.location,
          languages: CREATOR_DATA.languages,
          niches: CREATOR_DATA.niches,
        },
        { onConflict: 'user_id' }
      );

    if (creatorError) console.error('Creator error:', creatorError.message);
    else console.log(`✅ Creator profile saved`);

    // ========================================================================
    // STEP 3: UPDATE BRAND PROFILE
    // ========================================================================
    console.log('🏢 Step 3: Populating Brand Profile...');

    const { error: brandProfileError } = await supabase
      .from('profiles')
      .update({
        role: 'brand',
        full_name: BRAND_DATA.companyName,
        is_verified: true,
      })
      .eq('user_id', userIds.brand);

    if (brandProfileError) console.error('Brand profile error (non-critical):', brandProfileError.message);

    const { error: brandError } = await supabase
      .from('brands')
      .upsert(
        {
          user_id: userIds.brand,
          company_name: BRAND_DATA.companyName,
          handle: BRAND_DATA.handle,
          industry: BRAND_DATA.industry,
          company_size: BRAND_DATA.companySize,
          website: BRAND_DATA.website,
          description: BRAND_DATA.description,
          preferred_niches: BRAND_DATA.preferredNiches,
          preferred_platforms: BRAND_DATA.preferredPlatforms,
        },
        { onConflict: 'user_id' }
      );

    if (brandError) console.error('Brand error:', brandError.message);
    else console.log(`✅ Brand profile saved`);

    // ========================================================================
    // STEP 4: UPDATE ADMIN PROFILE
    // ========================================================================
    console.log('🛡️  Step 4: Setting up Admin Account...');

    const { error: adminError } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        full_name: 'ColabRoom Admin',
        is_verified: true,
      })
      .eq('user_id', userIds.admin);

    if (adminError) console.error('Admin error (non-critical):', adminError.message);
    else console.log(`✅ Admin account configured`);
    console.log('');

    // ========================================================================
    // STEP 5: CREATE WALLETS
    // ========================================================================
    console.log('💰 Step 5: Setting up Wallets...');

    for (const role of ['creator', 'brand', 'admin'] as const) {
      const { error: walletError } = await supabase
        .from('wallets')
        .upsert(
          {
            user_id: userIds[role],
            available_balance: role === 'creator' ? 145250 : role === 'brand' ? 850000 : 500000,
            pending_balance: role === 'creator' ? 50000 : 0,
            locked_balance: role === 'creator' ? 125000 : 0,
            currency: 'INR',
          },
          { onConflict: 'user_id' }
        );

      if (walletError) console.error(`${role} wallet error:`, walletError.message);
      else console.log(`✅ ${role.toUpperCase()} wallet created`);
    }
    console.log('');

    // ========================================================================
    // STEP 6: ADD WALLET TRANSACTIONS (CREATOR)
    // ========================================================================
    console.log('📊 Step 6: Adding Wallet Transactions...');

    for (const tx of WALLET_TRANSACTIONS) {
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userIds.creator,
          type: tx.type,
          amount: tx.amount,
          method: tx.method,
          status: tx.status,
          created_at: new Date().toISOString(),
        });

      if (txError) console.error('Transaction error:', txError.message);
    }
    console.log(`✅ Added ${WALLET_TRANSACTIONS.length} transactions`);
    console.log('');

    // ========================================================================
    // STEP 7: CREATE CAMPAIGNS
    // ========================================================================
    console.log('📢 Step 7: Creating Campaigns...');

    const campaignIds: string[] = [];
    for (const campaign of CAMPAIGNS_DATA) {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          brand_user_id: userIds.brand,
          title: campaign.title,
          description: campaign.description,
          niche: campaign.niche,
          platforms: campaign.platforms,
          content_formats: campaign.contentFormats,
          start_date: campaign.startDate,
          end_date: campaign.endDate,
          budget: campaign.budget,
          currency: 'INR',
          status: campaign.status,
          visibility: campaign.visibility,
        })
        .select()
        .single();

      if (error) {
        console.error(`Campaign "${campaign.title}" error:`, error.message);
      } else {
        campaignIds.push(data.id);
        console.log(`✅ ${campaign.title}`);
      }
    }
    console.log('');

    // ========================================================================
    // STEP 8: CREATE CAMPAIGN APPLICATIONS
    // ========================================================================
    console.log('📝 Step 8: Creating Campaign Applications...');

    if (campaignIds.length > 0) {
      const { error: appError } = await supabase
        .from('campaign_applications')
        .insert({
          campaign_id: campaignIds[0],
          user_id: userIds.creator,
          message: CAMPAIGNS_DATA[0].applicationMessage,
          status: 'pending',
        });

      if (appError) {
        console.error('Application error:', appError.message);
      } else {
        console.log(`✅ Creator applied to first campaign`);
      }
    }
    console.log('');

    // ========================================================================
    // STEP 9: CREATE MILESTONES
    // ========================================================================
    console.log('🎯 Step 9: Creating Milestones...');

    if (campaignIds.length > 0) {
      for (let i = 0; i < Math.min(MILESTONES_DATA.length, 2); i++) {
        const milestone = MILESTONES_DATA[i];
        const { error } = await supabase
          .from('milestones')
          .insert({
            campaign_id: campaignIds[0],
            title: milestone.title,
            due_date: milestone.dueDate,
            assigned_to: userIds.creator,
            status: milestone.status,
            payment_amount: milestone.paymentAmount,
            currency: 'INR',
          });

        if (error) {
          console.error(`Milestone error:`, error.message);
        }
      }
      console.log(`✅ Created milestones for campaign`);
    }
    console.log('');

    // ========================================================================
    // STEP 10: CREATE CONTRACTS
    // ========================================================================
    console.log('📜 Step 10: Creating Contracts...');

    for (let i = 0; i < Math.min(CONTRACTS_DATA.length, campaignIds.length); i++) {
      const contract = CONTRACTS_DATA[i];
      const { error } = await supabase
        .from('contracts')
        .insert({
          campaign_id: campaignIds[i] || null,
          brand_id: userIds.brand,
          creator_id: userIds.creator,
          status: contract.status,
          content: {
            title: contract.title,
            amount: contract.amount,
            currency: contract.currency,
            deliverables: contract.deliverables,
            dueDate: contract.dueDate,
          },
        });

      if (error) {
        console.error(`Contract error:`, error.message);
      } else {
        console.log(`✅ ${contract.title}`);
      }
    }
    console.log('');

    // ========================================================================
    // STEP 11: CREATE NOTIFICATIONS
    // ========================================================================
    console.log('🔔 Step 11: Creating Sample Notifications...');

    const notifications = [
      { user_id: userIds.creator, type: 'new_campaign', title: 'New Campaign Available', body: 'boAt Summer Audio Collection matches your profile!' },
      { user_id: userIds.creator, type: 'contract_sent', title: 'Contract Received', body: 'New contract from boAt Lifestyle awaiting your review' },
      { user_id: userIds.creator, type: 'payment_received', title: 'Payment Received', body: '₹50,000 credited to your wallet' },
      { user_id: userIds.brand, type: 'application_received', title: 'New Application', body: 'Aisha Sharma applied to your Summer Campaign' },
      { user_id: userIds.brand, type: 'content_submitted', title: 'Content Submitted', body: 'Creator submitted content for review' },
    ];

    for (const notif of notifications) {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: notif.user_id,
          type: notif.type,
          title: notif.title,
          body: notif.body,
          is_read: false,
        });

      if (error) console.error('Notification error (non-critical):', error.message);
    }
    console.log(`✅ Created ${notifications.length} notifications`);
    console.log('');

    // ========================================================================
    // COMPLETION
    // ========================================================================
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✨ SEEDING COMPLETE! ✨');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('📋 ACCOUNT SUMMARY:\n');
    console.log('🎬 CREATOR ACCOUNT:');
    console.log(`   Email: ${ACCOUNTS.creator.email}`);
    console.log(`   Password: ${ACCOUNTS.creator.password}`);
    console.log(`   Name: ${CREATOR_DATA.displayName}`);
    console.log(`   Wallet: ₹145,250 available + ₹50,000 pending + ₹125,000 locked`);
    console.log(`   Verified: ✅\n`);

    console.log('🏢 BRAND ACCOUNT:');
    console.log(`   Email: ${ACCOUNTS.brand.email}`);
    console.log(`   Password: ${ACCOUNTS.brand.password}`);
    console.log(`   Company: ${BRAND_DATA.companyName}`);
    console.log(`   Wallet: ₹850,000 available`);
    console.log(`   Verified: ✅\n`);

    console.log('🛡️  ADMIN ACCOUNT:');
    console.log(`   Email: ${ACCOUNTS.admin.email}`);
    console.log(`   Password: ${ACCOUNTS.admin.password}`);
    console.log(`   Role: Administrator`);
    console.log(`   Full access to all features\n`);

    console.log('📊 DATA CREATED:');
    console.log(`   • ${campaignIds.length} Campaigns`);
    console.log(`   • ${CONTRACTS_DATA.length} Contracts`);
    console.log(`   • ${Math.min(MILESTONES_DATA.length, 2)} Milestones`);
    console.log(`   • ${WALLET_TRANSACTIONS.length} Wallet Transactions`);
    console.log(`   • ${notifications.length} Notifications`);
    console.log(`   • ${3} Wallets (creator, brand, admin)\n`);

    console.log('🎯 NEXT STEPS:');
    console.log('   1. Open your web app and login with creator account');
    console.log('   2. Dashboard should show all campaigns and contracts');
    console.log('   3. Mobile app should have the exact same data');
    console.log('   4. Try signing a contract, adding funds, etc.');
    console.log('   5. Switch to brand account to see from brand perspective\n');

    console.log('❤️  Ready for presentation!');
  } catch (error) {
    console.error('❌ FATAL ERROR:', error);
    process.exit(1);
  }
}

// Run the seeding
seed();
