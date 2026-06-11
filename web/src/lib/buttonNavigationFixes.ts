/**
 * BUTTON & NAVIGATION FIXES
 * This file documents and provides fixes for all buttons and navigation
 */

import type { ReactNode } from 'react';

// ============================================================================
// COMMON BUTTON FIX PATTERNS
// ============================================================================

/**
 * All buttons should follow these patterns:
 * ✅ onClick handlers are immediately callable
 * ✅ No async operations in onClick (use useEffect)
 * ✅ Loading states are managed separately
 * ✅ Error handling with toast notifications
 * ✅ Proper disabled state management
 */

export const BUTTON_FIX_TEMPLATE = `
// ❌ WRONG - Async in onClick
<button onClick={async () => {
  const data = await fetchSomething();
  setData(data);
}}>
  Click
</button>

// ✅ RIGHT - Async in useEffect, onClick just calls handler
const handleClick = () => {
  setLoading(true);
};

useEffect(() => {
  if (!loading) return;
  const fetch = async () => {
    try {
      const data = await fetchSomething();
      setData(data);
    } catch (error) {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };
  fetch();
}, [loading]);

<button onClick={handleClick} disabled={loading}>
  {loading ? 'Loading...' : 'Click'}
</button>
`;

// ============================================================================
// NAVIGATION FIXES
// ============================================================================

export const NAVIGATION_FIXES = {
  // Sidebar Navigation - Dashboard Links
  dashboardQuickActions: {
    creator: [
      { label: 'Find Campaigns', to: '/discover/brands', icon: '🔍' },
      { label: 'My Contracts', to: '/contracts', icon: '📄' },
      { label: 'Wallet', to: '/wallet', icon: '💰' },
      { label: 'Profile', to: '/profile-edit', icon: '👤' },
      { label: 'AI Brief', to: '/ai-brief', icon: '✨' },
    ],
    brand: [
      { label: 'Create Campaign', to: '/campaigns/new', icon: '➕' },
      { label: 'Find Creators', to: '/discover/creators', icon: '🔍' },
      { label: 'My Campaigns', to: '/campaigns', icon: '📋' },
      { label: 'Contracts', to: '/contracts', icon: '📄' },
      { label: 'Payments', to: '/wallet', icon: '💳' },
    ],
  },

  // Top Navigation
  topNav: [
    { label: 'Home', to: '/', requiresAuth: false },
    { label: 'Dashboard', to: '/dashboard', requiresAuth: true },
    { label: 'Login', to: '/login', requiresAuth: false },
    { label: 'Register', to: '/register', requiresAuth: false },
  ],

  // Mobile Bottom Navigation (Mobile App)
  mobileBottomNav: [
    { label: 'Home', to: '/', icon: '🏠' },
    { label: 'Discover', to: '/discover/brands', icon: '🔍' },
    { label: 'Campaigns', to: '/campaigns', icon: '📋' },
    { label: 'Messages', to: '/messages', icon: '💬' },
    { label: 'Profile', to: '/profile', icon: '👤' },
  ],
};

// ============================================================================
// BUTTON FUNCTIONALITY CHECKLIST
// ============================================================================

export const BUTTON_CHECKLIST = {
  dashboard: [
    {
      button: 'Create Campaign',
      shouldNavigateTo: '/campaigns/new',
      needsAuth: true,
      role: 'brand',
      mockData: true,
    },
    {
      button: 'Find Creators',
      shouldNavigateTo: '/discover/creators',
      needsAuth: true,
      role: 'either',
      mockData: true,
    },
    {
      button: 'Find Campaigns',
      shouldNavigateTo: '/discover/brands',
      needsAuth: true,
      role: 'creator',
      mockData: true,
    },
    {
      button: 'My Contracts',
      shouldNavigateTo: '/contracts',
      needsAuth: true,
      role: 'either',
      mockData: true,
      testFlow: 'Click contract → Review → Sign → Download PDF',
    },
    {
      button: 'My Wallet',
      shouldNavigateTo: '/wallet',
      needsAuth: true,
      role: 'either',
      mockData: true,
      testFlow: 'View balance → Add funds → Process payment → See updated balance',
    },
    {
      button: 'AI Brief',
      shouldNavigateTo: '/ai-brief',
      needsAuth: true,
      role: 'brand',
      mockData: 'simulated',
    },
    {
      button: 'Profile',
      shouldNavigateTo: '/profile-edit',
      needsAuth: true,
      role: 'either',
      mockData: true,
    },
  ],

  campaigns: [
    {
      button: 'Apply to Campaign',
      action: 'POST /campaigns/{id}/apply',
      needsAuth: true,
      role: 'creator',
      expectedResult: 'Show toast confirmation, disable button',
    },
    {
      button: 'Create Campaign',
      shouldNavigateTo: '/campaigns/new',
      needsAuth: true,
      role: 'brand',
      expectedResult: 'Open campaign creation form',
    },
    {
      button: 'Filter Campaigns',
      action: 'Updates visible campaign list',
      expectedResult: 'Show/hide campaigns based on filter',
    },
    {
      button: 'View Campaign Details',
      shouldNavigateTo: '/campaigns/{id}',
      expectedResult: 'Show brief, deliverables, applications',
    },
  ],

  contracts: [
    {
      button: 'Sign Contract',
      shouldNavigateTo: '/contracts/{id}/sign',
      needsAuth: true,
      testFlow: 'Draw signature → Accept terms → Submit → Return to list',
    },
    {
      button: 'Download PDF',
      action: 'Triggers PDF generation & download',
      expectedResult: 'File "contract_{id}.pdf" downloaded',
    },
    {
      button: 'View Details',
      shouldNavigateTo: '/contracts/{id}',
      expectedResult: 'Show contract content, status, timeline',
    },
    {
      button: 'Send to Creator',
      action: 'POST /contracts',
      needsAuth: true,
      role: 'brand',
      expectedResult: 'Contract status → "Sent", creator notified (mock)',
    },
  ],

  wallet: [
    {
      button: 'Add Funds',
      action: 'Opens payment modal',
      expectedResult: 'FakeRazorpay component renders',
    },
    {
      button: 'Proceed to Payment',
      action: 'Shows payment method selection',
      expectedResult: 'UPI or Card options rendered',
    },
    {
      button: 'Simulate Success',
      action: 'Processes mock payment',
      expectedResult: 'Success modal → Wallet balance updated',
      testAmount: '10000',
    },
    {
      button: 'Withdraw',
      action: 'Shows withdrawal form',
      expectedResult: 'Amount input, method selection',
    },
    {
      button: 'Process Withdrawal',
      action: 'Deducts from available balance',
      expectedResult: 'Transaction added to history with status "pending"',
    },
  ],

  profile: [
    {
      button: 'Add Social Link',
      action: 'Opens form to add platform',
      expectedResult: 'Can select platform & enter handle',
    },
    {
      button: 'Save Profile',
      action: 'POST /profiles/update',
      expectedResult: 'Toast confirmation, data persisted',
    },
    {
      button: 'Upload Avatar',
      action: 'File picker opens',
      expectedResult: 'Uses mock image from mock data',
    },
  ],

  auth: [
    {
      button: 'Login',
      shouldNavigateTo: '/login',
      action: 'Authenticates user',
      testEmail: 'creator@demo.colabroom.in',
      testPassword: 'Demo@123',
      expectedResult: 'Redirects to /dashboard',
    },
    {
      button: 'Register',
      shouldNavigateTo: '/register',
      action: 'Creates new account',
      expectedResult: 'Creates account, auto-logs in, shows onboarding',
    },
    {
      button: 'Logout',
      action: 'Clears auth state',
      expectedResult: 'Redirects to /login, session cleared',
    },
    {
      button: 'Forgot Password',
      shouldNavigateTo: '/forgot-password',
      action: 'Send reset email (mock)',
      expectedResult: 'Shows success message',
    },
  ],
};

// ============================================================================
// KNOWN ISSUES & FIXES
// ============================================================================

export const KNOWN_ISSUES = [
  {
    issue: 'Apply to Campaign button shows spinner forever',
    cause: 'Async operation in onClick without proper loading state',
    fix: 'Move logic to useEffect, manage loading separately',
    priority: 'HIGH',
  },
  {
    issue: 'Contract signing canvas not responsive',
    cause: 'Canvas not initializing properly or event handlers missing',
    fix: 'Add useRef, check getDPI calculations, add pointer events',
    priority: 'HIGH',
  },
  {
    issue: 'PDF download shows blank/placeholder',
    cause: 'jsPDF config issues or text encoding problems',
    fix: 'Check PDF content structure, test with different contracts',
    priority: 'HIGH',
  },
  {
    issue: 'Wallet balance not updating after payment',
    cause: 'Mock wallet state not persisting to localStorage',
    fix: 'Ensure writeMockWallet() called after each operation',
    priority: 'MEDIUM',
  },
  {
    issue: 'Navigation params not passed correctly',
    cause: 'Missing URL params in useParams() call',
    fix: 'Verify route params match useParams() destructuring',
    priority: 'MEDIUM',
  },
  {
    issue: 'Loading skeletons never disappear',
    cause: 'Loading state not being cleared on data fetch',
    fix: 'Add try/catch/finally, always set loading=false in finally',
    priority: 'MEDIUM',
  },
  {
    issue: 'Mobile buttons cut off or unclickable',
    cause: 'Viewport meta tag or responsive breakpoints',
    fix: 'Check Tailwind breakpoints, use mobile-first design',
    priority: 'MEDIUM',
  },
];

// ============================================================================
// ANIMATION & TRANSITION GUIDE
// ============================================================================

export const ANIMATION_FIXES = {
  buttons: {
    default: 'transition-all duration-200 hover:scale-105',
    disabled: 'opacity-50 cursor-not-allowed',
    active: 'scale-95',
  },

  modals: {
    enter: 'animate-in fade-in zoom-in-95 duration-200',
    exit: 'animate-out fade-out zoom-out-95 duration-200',
  },

  transitions: {
    fade: 'transition-opacity duration-300',
    slide: 'transition-all duration-300',
    spring: 'transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

export const TESTING_GUIDE = `
✅ BUTTON & NAVIGATION TESTING CHECKLIST

🧪 Creator Account Flow:
  [ ] Login with creator@demo.colabroom.in
  [ ] Dashboard loads with stats
  [ ] Click "Find Campaigns" → Campaigns page loads with 8 campaigns
  [ ] Click campaign → Details page with apply button
  [ ] Click "Apply" → Success toast, button disabled
  [ ] Click "My Contracts" → Shows 3-4 contracts in different stages
  [ ] Click "Sent" contract → Details page
  [ ] Click "Sign This Contract" → Sign page loads
  [ ] Draw signature on canvas → Sign button enabled
  [ ] Check "I agree" → Submit button enabled
  [ ] Click Submit → Contract signed, returns to list
  [ ] Click "Download PDF" → PDF downloaded successfully
  [ ] Click "My Wallet" → Shows balance & transactions
  [ ] Click "+ Add Funds" → Payment modal opens
  [ ] Select UPI → Enter details
  [ ] Click "Simulate Success" → Processes (2 sec) → Success
  [ ] Returns to wallet with updated balance
  [ ] Transaction visible in history

🧪 Brand Account Flow:
  [ ] Login with brand@demo.colabroom.in
  [ ] Dashboard shows brand-specific stats
  [ ] Click "Create Campaign" → Campaign form
  [ ] Fill form → Submit creates campaign
  [ ] Click "Find Creators" → Shows 8 creators with filters
  [ ] Click creator → Profile with pricing, socials
  [ ] Click "Collaborate" → Goes to campaign selection or form
  [ ] Click "My Campaigns" → Shows active campaigns
  [ ] Select campaign with applications
  [ ] View creator applications
  [ ] Send contract to creator
  [ ] Monitor campaign status

🧪 Mobile Testing:
  [ ] All buttons clickable on mobile
  [ ] No overlapping elements
  [ ] Bottom navigation works
  [ ] Forms responsive and usable
  [ ] PDF download works on mobile
  [ ] Payment flow works on mobile
  [ ] Signature canvas works on mobile (stylus/finger)
  [ ] Landscape & portrait orientation working

🧪 Error Handling:
  [ ] Close payment modal → Balance unchanged
  [ ] Try to withdraw more than available → Error toast
  [ ] Navigation to invalid contract ID → 404 or redirect
  [ ] Hard refresh doesn't lose mock data
  [ ] localStorage cleared → Resets to initial state
  [ ] Invalid form submission → Shows validation errors

🧪 Performance:
  [ ] Page loads in < 2 seconds
  [ ] Clicking buttons responds immediately
  [ ] No console errors (except old browser warnings)
  [ ] No memory leaks on repeated actions
  [ ] Mobile loads quickly on 3G network
`;

// ============================================================================
// DEPLOYMENT CHECKLIST
// ============================================================================

export const DEPLOYMENT_CHECKLIST = {
  preDeployment: [
    '✅ All buttons have onClick handlers',
    '✅ All navigation links use correct paths',
    '✅ Mock data loads on initial page load',
    '✅ No console errors in DevTools',
    '✅ Responsive design tested on mobile/tablet/desktop',
    '✅ Payment flow works end-to-end',
    '✅ Contract signing works',
    '✅ PDF generation works',
    '✅ Authentication works with demo accounts',
    '✅ Wallet persists across page reloads',
    '✅ Animations are smooth (60fps)',
  ],

  deployment: [
    '✅ Run: npm run build',
    '✅ Check: No build errors',
    '✅ Deploy: To hosting (Vercel/netlify)',
    '✅ Test: Login with demo accounts',
    '✅ Verify: All feature flows work',
    '✅ Check: Network tab for slow requests',
    '✅ Verify: PDF downloads work',
    '✅ Test: On actual mobile device',
  ],

  postDeployment: [
    '✅ Monitor: Console for runtime errors',
    '✅ Check: Wallet persistence works',
    '✅ Verify: Payment flow on mobile',
    '✅ Test: Signature capture works',
    '✅ Check: PDF content correct',
    '✅ Verify: No data leaks',
    '✅ Monitor: Page load performance',
  ],
};
