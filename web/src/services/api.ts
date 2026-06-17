import type { Provider } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import type { Wallet } from '../types';
import { isMockAuthEnabled, MOCK_AUTH_TOKEN, shouldUseMockCatalog } from '../lib/mockAuth';
import {
  findMockBrandByHandle,
  findMockCampaign,
  findMockContract,
  MOCK_BRANDS,
  MOCK_CAMPAIGNS,
  MOCK_CONTRACTS,
  MOCK_CREATORS,
} from '../lib/mockSeedData';

function toCamel(o: any): any {
  if (o === null || typeof o !== 'object') return o;
  if (Array.isArray(o)) return o.map(toCamel);
  return Object.keys(o).reduce((acc: any, key) => {
    const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
    acc[camelKey] = toCamel(o[key]);
    return acc;
  }, {});
}

const MOCK_WALLET_KEY = 'colabroom-mock-wallet';

function isMockWalletSession(): boolean {
  if (!isMockAuthEnabled()) return false;
  return localStorage.getItem('colabroom-token') === MOCK_AUTH_TOKEN;
}

function getDefaultMockWallet(): Wallet {
  return {
    userId: 'mock-user',
    availableBalance: 18500,
    pendingBalance: 7200,
    lockedBalance: 5100,
    currency: 'INR',
    transactions: [
      {
        id: 'txn_mock_nykaa',
        type: 'credit',
        amount: 18500,
        currency: 'INR',
        campaignName: 'Nykaa Festive Glam Campaign',
        status: 'completed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        reference: 'CR-NYKAA-7821',
      },
      {
        id: 'txn_mock_1',
        type: 'credit',
        amount: 12500,
        currency: 'INR',
        campaignName: 'Monsoon Glow — Draft Milestone',
        status: 'completed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        reference: 'CR-GLOW-9121',
      },
      {
        id: 'txn_mock_2',
        type: 'withdrawal',
        amount: 5000,
        currency: 'INR',
        status: 'completed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
        reference: 'WD-REF-2134',
      },
    ],
  };
}


function readMockWallet(): Wallet {
  const raw = localStorage.getItem(MOCK_WALLET_KEY);
  if (!raw) return getDefaultMockWallet();
  try {
    const parsed = JSON.parse(raw) as Wallet;
    if (!parsed || !Array.isArray(parsed.transactions)) return getDefaultMockWallet();
    return parsed;
  } catch {
    return getDefaultMockWallet();
  }
}

function writeMockWallet(wallet: Wallet): void {
  localStorage.setItem(MOCK_WALLET_KEY, JSON.stringify(wallet));
}

// ─── Auth API ───────────────────
export const authAPI = {
  signUp: async (data: { email: string; password: string; role: 'creator' | 'brand'; metadata: Record<string, unknown> }) => {
    const { data: res, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { role: data.role, ...data.metadata },
      },
    });
    if (error) throw new Error(error.message);
    return { success: true, user: res.user, session: res.session };
  },

  signIn: async (data: { email: string; password: string }) => {
    const { data: res, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) throw new Error(error.message);
    if (!res.session || !res.user) throw new Error('Sign in failed');

    const role = (res.user.user_metadata?.role as 'creator' | 'brand' | 'admin' | undefined) ?? 'creator';
    const createdAt = res.user.created_at ?? new Date().toISOString();
    const isVerified = !!res.user.email_confirmed_at;

    return {
      token: res.session.access_token,
      user: {
        id: res.user.id,
        email: res.user.email ?? data.email,
        role,
        isVerified,
        createdAt,
      },
    };
  },

  resetPasswordForEmail: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
    return { success: true };
  },

  updatePassword: async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
    return { success: true };
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return data.session;
  },

  oauthSignIn: async (provider: Provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw new Error(error.message);
    return data;
  },
};

// ─── Creators API ──────────────────────────────────────────────────────────
export const creatorsAPI = {
  search: async (_filters: Record<string, unknown>) => {
    if (shouldUseMockCatalog()) {
      const data = MOCK_CREATORS;
      const total = data.length;
      return { data, pagination: { total, page: 1, limit: 20, totalPages: 1 } };
    }
    const { data, error, count } = await supabase
      .from('creators')
      .select('*', { count: 'exact' });
    if (error) throw new Error(error.message);
    const total = count ?? data?.length ?? 0;
    return { data: data ? toCamel(data) : [], pagination: { total, page: 1, limit: 20, totalPages: 1 } };
  },
  getByUsername: async (username: string) => {
    if (shouldUseMockCatalog()) {
      const row = MOCK_CREATORS.find((c) => c.username === username);
      if (!row) throw new Error('Creator not found');
      return row;
    }
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('username', username)
      .maybeSingle();
    if (!data || error) {
      const mockRow = MOCK_CREATORS.find((c) => c.username === username);
      if (mockRow) return toCamel(mockRow);
      throw new Error(error?.message || 'Creator not found');
    }
    return toCamel(data);
  },
  updateProfile: async (data: Record<string, unknown>) => {
    if (shouldUseMockCatalog()) {
      void data;
      return { success: true };
    }
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Not authenticated');
    const { error } = await supabase.from('creators').update(data).eq('user_id', user.id);
    if (error) throw new Error(error.message);
    return { success: true };
  },
};

// ─── Brands API ───────────────────────────────────────────────────────────
export const brandsAPI = {
  search: async (filters: Record<string, unknown>) => {
    if (shouldUseMockCatalog()) {
      const data = MOCK_BRANDS;
      const total = data.length;
      return { data, pagination: { total, page: 1, limit: 20, totalPages: 1 }, filters };
    }
    const { data, error, count } = await supabase
      .from('brands')
      .select('*', { count: 'exact' });
    if (error) throw new Error(error.message);
    const total = count ?? data?.length ?? 0;
    return { data: data ? toCamel(data) : [], pagination: { total, page: 1, limit: 20, totalPages: 1 }, filters };
  },
  getByHandle: async (handle: string) => {
    if (shouldUseMockCatalog()) {
      const row = findMockBrandByHandle(handle);
      if (!row) throw new Error('Brand not found');
      return row;
    }
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('handle', handle)
      .maybeSingle();
    if (!data || error) {
      const mockRow = findMockBrandByHandle(handle);
      if (mockRow) return toCamel(mockRow);
      throw new Error(error?.message || 'Brand not found');
    }
    return toCamel(data);
  },
};

// ─── Campaigns API ────────────────────────────────────────────────────────
export const campaignsAPI = {
  list: async () => {
    if (shouldUseMockCatalog()) {
      return { data: MOCK_CAMPAIGNS };
    }
    const { data, error } = await supabase.from('campaigns').select('*');
    if (error) throw new Error(error.message);
    return { data: data ? toCamel(data) : [] };
  },
  getById: async (id: string) => {
    if (shouldUseMockCatalog()) {
      const row = findMockCampaign(id);
      if (!row) throw new Error('Campaign not found');
      return row;
    }
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (!data || error) {
      const mockRow = findMockCampaign(id);
      if (mockRow) return toCamel(mockRow);
      throw new Error(error?.message || 'Campaign not found');
    }
    return toCamel(data);
  },
  create: async (data: Record<string, unknown>) => {
    if (shouldUseMockCatalog()) {
      const id = `camp_mock_${Date.now()}`;
      return { success: true, id, data: { ...data, id } };
    }
    const { data: created, error } = await supabase
      .from('campaigns')
      .insert(data)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return { success: true, id: created.id, data: toCamel(created) };
  },
  apply: async (campaignId: string, message: string) => {
    if (shouldUseMockCatalog()) {
      void campaignId;
      void message;
      return { success: true, campaignId, message };
    }
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Not authenticated');
    const { error } = await supabase.from('campaign_applications').insert({
      campaign_id: campaignId,
      user_id: user.id,
      message,
    });
    if (error) throw new Error(error.message);
    return { success: true, campaignId, message };
  },
};

// ─── Contracts API ────────────────────────────────────────────────────────
export const contractsAPI = {
  list: async () => {
    if (shouldUseMockCatalog()) {
      return { data: MOCK_CONTRACTS };
    }
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .or(`creator_id.eq.${user.id},brand_id.eq.${user.id}`);
    if (error) throw new Error(error.message);
    return { data: data ? toCamel(data) : [] };
  },
  getById: async (id: string) => {
    if (shouldUseMockCatalog()) {
      const row = findMockContract(id);
      if (!row) throw new Error('Contract not found');
      return row;
    }
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (!data || error) {
      const mockRow = findMockContract(id);
      if (mockRow) return toCamel(mockRow);
      throw new Error(error?.message || 'Contract not found');
    }
    return toCamel(data);
  },
  sign: async (id: string) => {
    if (shouldUseMockCatalog()) {
      void id;
      return { success: true, id };
    }
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Not authenticated');
    const { error } = await supabase
      .from('contracts')
      .update({ status: 'signed', signed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true, id };
  },
};

// ─── Wallet API ───────────────────────────────────────────────────────────
export const walletAPI = {
  get: async () => {
    if (isMockWalletSession()) {
      const wallet = readMockWallet();
      writeMockWallet(wallet);
      return wallet;
    }
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('Wallet not found');
    return toCamel(data);
  },
  withdraw: async (data: { amount: number; method: string }) => {
    if (isMockWalletSession()) {
      const wallet = readMockWallet();
      if (data.amount <= 0) throw new Error('Invalid amount');
      if (data.amount > wallet.availableBalance) throw new Error('Insufficient balance');
      const next: Wallet = {
        ...wallet,
        availableBalance: wallet.availableBalance - data.amount,
        transactions: [
          {
            id: `txn_mock_${Date.now()}`,
            type: 'withdrawal',
            amount: data.amount,
            currency: wallet.currency,
            status: 'pending',
            createdAt: new Date().toISOString(),
            reference: `WD-MOCK-${Math.floor(Math.random() * 100000)}`,
          },
          ...wallet.transactions,
        ],
      };
      writeMockWallet(next);
      return { success: true };
    }
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Not authenticated');
    const { error } = await supabase.from('wallet_transactions').insert({
      user_id: user.id,
      type: 'withdrawal',
      amount: data.amount,
      method: data.method,
    });
    if (error) throw new Error(error.message);
    return { success: true };
  },
};

// ─── AI API ───────────────────────────────────────────────────────────────
export const aiAPI = {
  generateBrief: async (
    data: Record<string, unknown>,
    onChunk: (chunk: string) => void
  ) => {
    // Simulated streaming
    const mockOutput = `**Campaign Title:** ${data.productDescription?.toString().slice(0, 30)}... Launch Campaign

**Campaign Objective:** Drive ${data.campaignGoal} for the brand by reaching the target demographic through authentic creator content across social platforms.

**Target Audience Profile:** ${data.targetAudience}

**Key Messages:**
• Emphasize unique value proposition and product differentiators
• Showcase real-world use cases and benefits
• Create emotional connection with the audience
• Drive curiosity and desirability

**Content Dos:**
• Use natural, conversational tone
• Show the product in authentic, everyday settings
• Include personal testimonials and genuine reactions
• Add clear call-to-action in first 3 seconds of video

**Content Don'ts:**
• Avoid overly scripted or salesy language
• Don't use low-quality lighting or audio
• Avoid misleading claims about product capabilities
• Don't forget mandatory FTC disclosure

**Mandatory Inclusions:**
• Hashtags: #Ad #Sponsored #[BrandName]Official
• Handles: @BrandHandle
• Disclosures: "This is a paid partnership with [Brand]"

**Suggested Formats by Platform:**
• Instagram: Reel (30-60s) + Story series (5 slides)
• YouTube: Dedicated review video (8-12 min) + Shorts (60s)
• TikTok: Trend-based creative (15-30s) × 3 variations

**Recommended Posting Times:**
• Instagram: Tue-Thu, 11am-1pm or 7-9pm local time
• YouTube: Thu-Sat, 2-4pm local time
• TikTok: Mon-Fri, 6-10pm local time

**Suggested Creator Criteria:**
• Minimum 50K followers in relevant niche
• Engagement rate > 3.5%
• Audience 60%+ in target geography
• No competing brand partnerships in last 30 days

**Estimated Budget Range:** ₹2,50,000 – ₹8,00,000 for full campaign (3-5 creators)

**KPIs to Measure Success:**
• Reach: 500K+ impressions across all content
• Engagement: 5%+ average engagement rate
• Conversions: Track via unique discount code or UTM link
• Brand recall lift: +15% in post-campaign survey`;

    const words = mockOutput.split(' ');
    for (const word of words) {
      await new Promise(r => setTimeout(r, 25));
      onChunk(word + ' ');
    }
    return mockOutput;
  },

  getPricingAdvice: async (data: Record<string, unknown>) => {
    await new Promise(r => setTimeout(r, 800));
    return {
      storyPost: '₹2,000 – ₹5,000',
      feedPost: '₹5,000 – ₹15,000',
      reelShort: '₹10,000 – ₹35,000',
      youtubeVideo: '₹25,000 – ₹80,000',
      dedicatedVideo: '₹50,000 – ₹1,50,000',
      data,
    };
  },
};
