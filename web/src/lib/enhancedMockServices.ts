/**
 * enhancedMockServices.ts
 * Enhanced mock services for full-featured demo with working contracts,
 * payments, wallets, and all campaign features
 */

import type { Contract, Wallet, Campaign } from '../types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK WALLET SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MOCK_WALLET_STORAGE_KEY = 'colabroom_mock_wallet_v2';
const MOCK_CONTRACTS_STORAGE_KEY = 'colabroom_mock_contracts_v2';
const MOCK_CAMPAIGNS_STORAGE_KEY = 'colabroom_mock_campaigns_v2';

export function getInitialMockWallet(): Wallet {
  return {
    userId: 'creator_demo',
    availableBalance: 48250,
    pendingBalance: 15000,
    lockedBalance: 125000, // From executed contract
    currency: 'INR',
    transactions: [
      {
        id: 'txn_1',
        type: 'credit',
        amount: 65000,
        currency: 'INR',
        campaignName: 'Mamaearth Campaign',
        status: 'completed',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        reference: 'CAM-MAMA-001',
      },
      {
        id: 'txn_2',
        type: 'escrow_lock',
        amount: 95000,
        currency: 'INR',
        campaignName: 'boAt Campaign',
        status: 'pending',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        reference: 'ESC-BOAT-001',
      },
      {
        id: 'txn_3',
        type: 'credit',
        amount: 185000,
        currency: 'INR',
        campaignName: 'Zomato Campaign',
        status: 'completed',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        reference: 'CAM-ZOMA-001',
      },
      {
        id: 'txn_4',
        type: 'withdrawal',
        amount: 50000,
        currency: 'INR',
        status: 'completed',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        reference: 'WD-UPI-12345',
      },
      {
        id: 'txn_5',
        type: 'escrow_release',
        amount: 65000,
        currency: 'INR',
        campaignName: 'Myntra Campaign',
        status: 'completed',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        reference: 'REL-MINT-001',
      },
    ],
  };
}

export function getMockWallet(): Wallet {
  try {
    const stored = localStorage.getItem(MOCK_WALLET_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Wallet;
      if (parsed.availableBalance !== undefined) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse wallet from storage:', e);
  }
  const initial = getInitialMockWallet();
  saveMockWallet(initial);
  return initial;
}

export function saveMockWallet(wallet: Wallet): void {
  try {
    localStorage.setItem(MOCK_WALLET_STORAGE_KEY, JSON.stringify(wallet));
  } catch (e) {
    console.error('Failed to save wallet:', e);
  }
}

export function processMockWalletOperation(
  operation: 'add_funds' | 'withdraw' | 'lock_escrow' | 'release_escrow',
  amount: number,
  reference?: string
): void {
  const wallet = getMockWallet();
  const timestamp = new Date().toISOString();
  
  switch (operation) {
    case 'add_funds':
      wallet.availableBalance += amount;
      wallet.transactions.unshift({
        id: `txn_${Date.now()}`,
        type: 'credit',
        amount,
        currency: 'INR',
        status: 'completed',
        campaignName: 'Added Funds',
        createdAt: timestamp,
        reference: reference || `ADD-FUNDS-${Date.now()}`,
      });
      break;
    case 'withdraw':
      if (amount > wallet.availableBalance) throw new Error('Insufficient balance');
      wallet.availableBalance -= amount;
      wallet.transactions.unshift({
        id: `txn_${Date.now()}`,
        type: 'withdrawal',
        amount,
        currency: 'INR',
        status: 'pending',
        createdAt: timestamp,
        reference: reference || `WD-${Math.random().toString(36).substring(7).toUpperCase()}`,
      });
      break;
    case 'lock_escrow':
      wallet.pendingBalance += amount;
      wallet.lockedBalance += amount;
      wallet.transactions.unshift({
        id: `txn_${Date.now()}`,
        type: 'escrow_lock',
        amount,
        currency: 'INR',
        status: 'pending',
        createdAt: timestamp,
        reference: reference || `ESC-LOCK-${Date.now()}`,
      });
      break;
    case 'release_escrow':
      wallet.lockedBalance = Math.max(0, wallet.lockedBalance - amount);
      wallet.availableBalance += amount;
      wallet.transactions.unshift({
        id: `txn_${Date.now()}`,
        type: 'escrow_release',
        amount,
        currency: 'INR',
        status: 'completed',
        createdAt: timestamp,
        reference: reference || `ESC-REL-${Date.now()}`,
      });
      break;
  }
  
  saveMockWallet(wallet);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK CONTRACT SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface MockContractsStore {
  contracts: Contract[];
  lastUpdated: string;
}

export function getInitialMockContracts(): Contract[] {
  return [
    {
      id: 'demo-001',
      campaignId: 'camp_mock_mamaearth',
      brandId: 'brand_mock_mamaearth',
      creatorId: 'cr_demo',
      brandName: 'Mamaearth',
      creatorName: 'Demo Creator',
      content: {
        parties: 'Mamaearth Beauty Pvt. Ltd. × Demo Creator',
        compensation: '₹65,000 held in ColabRoom escrow',
        scope: '1 Instagram Reel, 3 Stories, 1 Feed Post',
        liability: 'Standard ColabRoom terms apply',
        timeline: '10 days for draft, 3 days for revisions',
      },
      status: 'sent',
      totalAmount: 65000,
      currency: 'INR',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      signedByBrandAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'contract_boat_demo',
      campaignId: 'camp_mock_boat_audio',
      brandId: 'brand_mock_boat',
      creatorId: 'cr_demo',
      brandName: 'boAt',
      creatorName: 'Demo Creator',
      content: {
        parties: 'boAt (Imagine Marketing Ltd.) × Demo Creator',
        compensation: '₹95,000 held in ColabRoom escrow',
        scope: 'YouTube review (8-12 min) + 2 Instagram Reels',
        liability: 'ASCI compliance required for all disclosures',
        timeline: '14 days for first draft',
      },
      status: 'under_review',
      totalAmount: 95000,
      currency: 'INR',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'contract_zomato_demo',
      campaignId: 'camp_mock_zomato',
      brandId: 'brand_mock_zomato',
      creatorId: 'cr_demo',
      brandName: 'Zomato',
      creatorName: 'Demo Creator',
      content: {
        parties: 'Zomato Ltd. × Demo Creator',
        compensation: '₹1,85,000 held in ColabRoom escrow',
        scope: 'City trail series — 3 Reels + 9 Stories',
        liability: 'Standard ColabRoom terms apply',
        kill_fee: '25% if cancelled < 7 days',
        timeline: 'Shoot within 15 days of signing',
      },
      status: 'signed',
      totalAmount: 185000,
      currency: 'INR',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      signedByBrandAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      signedByCreatorAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'contract_draft_myntra',
      campaignId: 'camp_mock_myntra',
      brandId: 'brand_mock_myntra',
      creatorId: 'cr_demo',
      brandName: 'Myntra',
      creatorName: 'Demo Creator',
      content: {
        parties: 'Myntra Ltd. × Demo Creator',
        compensation: '₹55,000 held in ColabRoom escrow',
        scope: 'Fashion GRWM Reel + 5 Feed Stories',
        liability: 'Standard influencer collaboration terms',
        timeline: 'Content due within 7 days',
      },
      status: 'draft',
      totalAmount: 55000,
      currency: 'INR',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export function getMockContracts(): Contract[] {
  try {
    const stored = localStorage.getItem(MOCK_CONTRACTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as MockContractsStore;
      if (Array.isArray(parsed.contracts)) {
        return parsed.contracts;
      }
    }
  } catch (e) {
    console.error('Failed to parse contracts from storage:', e);
  }
  const initial = getInitialMockContracts();
  saveMockContracts(initial);
  return initial;
}

export function saveMockContracts(contracts: Contract[]): void {
  try {
    const store: MockContractsStore = {
      contracts,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(MOCK_CONTRACTS_STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save contracts:', e);
  }
}

export function signMockContract(contractId: string, signedAt?: string): void {
  const contracts = getMockContracts();
  const contract = contracts.find(c => c.id === contractId);
  if (!contract) throw new Error('Contract not found');
  
  contract.status = 'signed';
  contract.signedByCreatorAt = signedAt || new Date().toISOString();
  
  // Lock funds in escrow
  processMockWalletOperation('lock_escrow', contract.totalAmount, `EST-${contractId}`);
  
  saveMockContracts(contracts);
}

export function updateMockContractStatus(
  contractId: string,
  status: Contract['status'],
  signedByBrand?: boolean
): void {
  const contracts = getMockContracts();
  const contract = contracts.find(c => c.id === contractId);
  if (!contract) throw new Error('Contract not found');
  
  contract.status = status;
  if (signedByBrand && !contract.signedByBrandAt) {
    contract.signedByBrandAt = new Date().toISOString();
  }
  
  saveMockContracts(contracts);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK CAMPAIGN SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface MockCampaignsStore {
  campaigns: Campaign[];
  lastUpdated: string;
}

export function getInitialMockCampaigns(): Campaign[] {
  // These will be loaded from MOCK_CAMPAIGNS in mockSeedData
  // This is just for tracking user-created campaigns
  return [];
}

export function createMockCampaign(campaign: Omit<Campaign, 'id' | 'createdAt'>): Campaign {
  const newCampaign: Campaign = {
    ...campaign,
    id: `camp_user_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  
  try {
    const stored = localStorage.getItem(MOCK_CAMPAIGNS_STORAGE_KEY);
    let campaigns: Campaign[] = [];
    if (stored) {
      const parsed = JSON.parse(stored) as MockCampaignsStore;
      campaigns = parsed.campaigns || [];
    }
    campaigns.push(newCampaign);
    const store: MockCampaignsStore = {
      campaigns,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(MOCK_CAMPAIGNS_STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to create campaign:', e);
  }
  
  return newCampaign;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK PAYMENT SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface MockPayment {
  id: string;
  amount: number;
  currency: string;
  method: 'upi' | 'card' | 'netbanking';
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  reference?: string;
}

const MOCK_PAYMENTS_KEY = 'colabroom_mock_payments_v2';

export function processMockPayment(
  amount: number,
  method: 'upi' | 'card' | 'netbanking' = 'upi',
  reference?: string
): MockPayment {
  const payment: MockPayment = {
    id: `pay_mock_${Date.now()}`,
    amount,
    currency: 'INR',
    method,
    status: 'success',
    createdAt: new Date().toISOString(),
    reference: reference || `REF-${Math.random().toString(36).substring(7).toUpperCase()}`,
  };
  
  // Add funds to wallet
  processMockWalletOperation('add_funds', amount, payment.reference);
  
  // Store payment record
  try {
    const stored = localStorage.getItem(MOCK_PAYMENTS_KEY);
    let payments: MockPayment[] = [];
    if (stored) {
      payments = JSON.parse(stored) as MockPayment[];
    }
    payments.push(payment);
    localStorage.setItem(MOCK_PAYMENTS_KEY, JSON.stringify(payments));
  } catch (e) {
    console.error('Failed to store payment:', e);
  }
  
  return payment;
}

export function getMockPayments(): MockPayment[] {
  try {
    const stored = localStorage.getItem(MOCK_PAYMENTS_KEY);
    if (stored) {
      return JSON.parse(stored) as MockPayment[];
    }
  } catch (e) {
    console.error('Failed to parse payments:', e);
  }
  return [];
}
