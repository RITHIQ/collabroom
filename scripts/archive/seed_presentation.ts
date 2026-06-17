import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xcorhotvnayrboihsdvm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_umiqwHBQxpE2ATCtfYiEMQ_NAl2nNRi';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BRAND_EMAIL = 'collabroomoperations+brand@gmail.com';
const CREATOR_EMAIL = 'collabroomoperations+creator@gmail.com';
const PASSWORD = 'Project2027#';

async function seed() {
  console.log('Logging in as brand...');
  const { data: brandAuth, error: brandErr } = await supabase.auth.signInWithPassword({
    email: BRAND_EMAIL,
    password: PASSWORD,
  });
  if (brandErr) throw brandErr;
  const brandUserId = brandAuth.user.id;
  console.log('Brand User ID:', brandUserId);

  console.log('Logging in as creator...');
  const { data: creatorAuth, error: creatorErr } = await supabase.auth.signInWithPassword({
    email: CREATOR_EMAIL,
    password: PASSWORD,
  });
  if (creatorErr) throw creatorErr;
  const creatorUserId = creatorAuth.user.id;
  console.log('Creator User ID:', creatorUserId);

  // Update Profiles
  await supabase.from('profiles').update({
    first_name: 'Nike',
    last_name: 'India',
    full_name: 'Nike India',
    username: 'nikeindia',
    role: 'brand'
  }).eq('user_id', brandUserId);

  await supabase.from('profiles').update({
    first_name: 'Aisha',
    last_name: 'Sharma',
    full_name: 'Aisha Sharma',
    username: 'aisha_creates',
    role: 'creator'
  }).eq('user_id', creatorUserId);

  console.log('Updated profiles');

  // Insert/Update Brand
  const { data: brandData } = await supabase.from('brands').select('id').eq('user_id', brandUserId).maybeSingle();
  let brandId = brandData?.id;
  if (!brandId) {
    const { data: b } = await supabase.from('brands').insert({
      user_id: brandUserId,
      name: 'Nike India',
      company_name: 'Nike Inc.',
      industry: 'Sports & Fitness',
      website: 'https://nike.in',
      bio: 'Just Do It. Inspiring athletes across India.',
      verified: true
    }).select().single();
    brandId = b.id;
  } else {
    await supabase.from('brands').update({
      name: 'Nike India',
      industry: 'Sports & Fitness',
      bio: 'Just Do It. Inspiring athletes across India.',
      verified: true
    }).eq('id', brandId);
  }

  // Insert/Update Creator
  const { data: creatorData } = await supabase.from('creators').select('id').eq('user_id', creatorUserId).maybeSingle();
  let creatorId = creatorData?.id;
  if (!creatorId) {
    const { data: c } = await supabase.from('creators').insert({
      user_id: creatorUserId,
      bio: 'Fitness enthusiast & marathon runner. Sharing tips on healthy living and active wear.',
      city: 'Mumbai',
      country: 'India',
      niche: ['Fitness', 'Lifestyle', 'Fashion'],
      content_types: ['Reels', 'Shorts', 'Photos'],
      instagram_handle: 'aisha_creates',
      instagram_followers: 125000,
      youtube_channel: 'AishaFit',
      youtube_subscribers: 45000,
      availability: 'available',
      creator_score: 95
    }).select().single();
    creatorId = c.id;
  } else {
    await supabase.from('creators').update({
      bio: 'Fitness enthusiast & marathon runner. Sharing tips on healthy living and active wear.',
      city: 'Mumbai',
      country: 'India',
      niche: ['Fitness', 'Lifestyle', 'Fashion'],
      content_types: ['Reels', 'Shorts', 'Photos'],
      instagram_handle: 'aisha_creates',
      instagram_followers: 125000,
      youtube_channel: 'AishaFit',
      youtube_subscribers: 45000,
      availability: 'available',
      creator_score: 95
    }).eq('id', creatorId);
  }

  console.log('Updated Brand/Creator tables');

  console.log('Logging back in as brand to create campaign...');
  await supabase.auth.signInWithPassword({ email: BRAND_EMAIL, password: PASSWORD });

  // Create Campaign
  const { data: existingCamp } = await supabase.from('campaigns').select('id').eq('brand_user_id', brandUserId).maybeSingle();
  let campaignId = existingCamp?.id;
  if (!campaignId) {
    const { data: camp, error: campErr } = await supabase.from('campaigns').insert({
      brand_user_id: brandUserId,
      title: 'Nike Summer Runners',
      description: 'We are looking for energetic fitness creators to showcase our new summer running collection.',
      type: 'sponsored_post',
      budget: 25000,
      currency: 'INR',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      slots_total: 5,
      slots_filled: 0,
      platforms: ['instagram', 'youtube'],
      content_formats: ['reel', 'story'],
      niche: 'Fitness',
      deliverables: ['2 Reels', '3 Stories'],
      brand_name: 'Nike India',
      visibility: 'public',
      status: 'active'
    }).select().single();
    if (campErr) {
      console.error('Campaign insert error:', campErr);
      throw campErr;
    }
    campaignId = camp.id;
  } else {
    await supabase.from('campaigns').update({
      title: 'Nike Summer Runners',
      status: 'active',
      budget: 25000
    }).eq('id', campaignId);
  }

  // Application
  console.log('Logging back in as creator to create application...');
  await supabase.auth.signInWithPassword({ email: CREATOR_EMAIL, password: PASSWORD });

  const { data: existingApp } = await supabase.from('campaign_applications').select('id').eq('campaign_id', campaignId).eq('user_id', creatorUserId).maybeSingle();
  if (!existingApp) {
    await supabase.from('campaign_applications').insert({
      campaign_id: campaignId,
      user_id: creatorUserId,
      status: 'pending',
      cover_letter: 'I would love to be part of this campaign! I have a highly engaged fitness audience.'
    });
  } else {
    await supabase.from('campaign_applications').update({ status: 'pending' }).eq('id', existingApp.id);
  }

  console.log('Updated Campaign/Application');

  // Contracts
  console.log('Logging back in as brand to create contract...');
  await supabase.auth.signInWithPassword({ email: BRAND_EMAIL, password: PASSWORD });

  const { data: existingContract } = await supabase.from('contracts').select('id').eq('campaign_id', campaignId).eq('creator_id', creatorId).maybeSingle();
  let contractId = existingContract?.id;
  if (!contractId) {
    const { data: c } = await supabase.from('contracts').insert({
      campaign_id: campaignId,
      brand_id: brandId,
      creator_id: creatorId,
      title: 'Nike Summer Runners Agreement',
      amount: 25000,
      status: 'signed',
      signed_at: new Date().toISOString(),
      terms: 'Creator agrees to post 2 Reels and 3 Stories within 14 days of receiving the product. Content must include tags #NikeIndia and #SummerRunners. Payment of ₹25,000 will be released upon completion.',
      deliverables: ['2 Reels', '3 Stories']
    }).select().single();
    contractId = c.id;
  } else {
    await supabase.from('contracts').update({
      status: 'signed',
      signed_at: new Date().toISOString()
    }).eq('id', contractId);
  }

  // Wallets
  console.log('Logging back in as creator for wallet operations...');
  await supabase.auth.signInWithPassword({ email: CREATOR_EMAIL, password: PASSWORD });

  const { data: existingWallet } = await supabase.from('wallets').select('id').eq('user_id', creatorUserId).maybeSingle();
  if (!existingWallet) {
    await supabase.from('wallets').insert({
      user_id: creatorUserId,
      balance: 150000,
      available_balance: 150000,
      pending_balance: 25000,
      locked_balance: 0
    });
  } else {
    await supabase.from('wallets').update({
      balance: 150000,
      available_balance: 150000,
      pending_balance: 25000
    }).eq('user_id', creatorUserId);
  }

  // Transactions
  await supabase.from('wallet_transactions').delete().eq('user_id', creatorUserId);
  await supabase.from('wallet_transactions').insert([
    {
      user_id: creatorUserId,
      amount: 50000,
      type: 'credit',
      description: 'Puma Activewear Campaign',
      status: 'completed'
    },
    {
      user_id: creatorUserId,
      amount: 120000,
      type: 'credit',
      description: 'Myntra Big Fashion Festival',
      status: 'completed'
    },
    {
      user_id: creatorUserId,
      amount: 20000,
      type: 'debit',
      description: 'Withdrawal to Bank Account (HDFC)',
      status: 'completed'
    }
  ]);

  console.log('Updated Wallets & Transactions');

  // Messages (Brand -> Creator)
  await supabase.from('messages').delete().eq('sender_id', brandUserId).eq('receiver_id', creatorUserId);
  await supabase.from('messages').delete().eq('sender_id', creatorUserId).eq('receiver_id', brandUserId);
  
  await supabase.from('messages').insert([
    {
      sender_id: brandUserId,
      receiver_id: creatorUserId,
      sender_name: 'Nike India',
      receiver_name: 'Aisha Sharma',
      content: 'Hi Aisha! We loved your recent marathon vlog. Would you be interested in our Summer Runners campaign?',
      read: true
    },
    {
      sender_id: creatorUserId,
      receiver_id: brandUserId,
      sender_name: 'Aisha Sharma',
      receiver_name: 'Nike India',
      content: 'Absolutely! I am a huge fan of the new ReactX foam. When do we start?',
      read: true
    },
    {
      sender_id: brandUserId,
      receiver_id: creatorUserId,
      sender_name: 'Nike India',
      receiver_name: 'Aisha Sharma',
      content: 'Great! I have sent over the contract and the campaign brief. Let me know if you have any questions.',
      read: false
    }
  ]);

  // Notifications
  await supabase.from('notifications').delete().eq('user_id', creatorUserId);
  await supabase.from('notifications').insert([
    {
      user_id: creatorUserId,
      type: 'new_message',
      title: 'New Message from Nike India',
      body: 'Great! I have sent over the contract and...',
      is_read: false
    },
    {
      user_id: creatorUserId,
      type: 'contract_ready',
      title: 'Contract Ready for Signature',
      body: 'Nike Summer Runners Agreement is ready for your signature.',
      is_read: true
    },
    {
      user_id: creatorUserId,
      type: 'payment_received',
      title: 'Payment Received',
      body: '₹50,000 has been credited to your wallet for Puma Activewear.',
      is_read: true
    }
  ]);

  console.log('Updated Messages & Notifications');
  console.log('Seed Complete!');
}

seed().catch(console.error);
