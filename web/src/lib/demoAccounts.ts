/**
 * demoAccounts.ts
 * Pre-configured demo accounts for presentation with full mock data
 */

export const DEMO_ACCOUNTS = {
  // Creator Account - Fully loaded
  creator: {
    email: 'creator@demo.colabroom.in',
    password: 'Demo@123',
    name: 'Ananya Rao',
    role: 'creator' as const,
    displayName: 'Ananya Rao',
    username: 'ananya.lifestyle',
    bio: 'Bangalore-based lifestyle creator focused on sustainable fashion and honest brand reviews.',
    location: 'Bengaluru, India',
    avatar: '👩‍🦰',
  },
  
  // Brand Account - Fully loaded
  brand: {
    email: 'brand@demo.colabroom.in',
    password: 'Demo@123',
    name: 'Brand Manager',
    role: 'brand' as const,
    companyName: 'boAt',
    handle: 'boat-official',
    displayName: 'boAt',
    description: 'India\'s leading audio wearable brand',
    avatar: '🎧',
  },

  // Admin Account
  admin: {
    email: 'admin@colabroom.com',
    password: 'Admin@123',
    role: 'admin' as const,
    name: 'Admin User',
  },
};

/**
 * Quick login instructions for presentation
 */
export const DEMO_LOGIN_GUIDE = `
# ColabRoom - Demo Accounts Guide

## Creator Account (Full Features)
- Email: creator@demo.colabroom.in
- Password: Demo@123
- Features: Dashboard, Discover Brands, Campaigns, Contracts, Wallet, Profile

## Brand Account (Full Features)
- Email: brand@demo.colabroom.in
- Password: Demo@123
- Features: Dashboard, Create Campaign, Find Creators, Contracts, Payments

## Admin Account  
- Email: admin@colabroom.com
- Password: Admin@123
- Features: Admin Dashboard, User Management, Campaigns, Disputes

All accounts have full mock data pre-populated including:
✓ Active campaigns and contracts
✓ Wallet with transactions
✓ Creator profiles and pricing
✓ Brand profiles and campaigns
✓ Working payment flows (fake Razorpay)
✓ Contract signing with PDF generation
`;
