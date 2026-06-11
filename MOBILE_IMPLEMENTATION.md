/**
 * MOBILE APP IMPLEMENTATION GUIDE
 * Ensuring feature parity between Web and Mobile apps
 */

import type { FC, ReactNode } from 'react';

// ============================================================================
// MOBILE APP STRUCTURE (Expo Router)
// ============================================================================

export const MOBILE_APP_STRUCTURE = {
  appDirectory: {
    '_layout.tsx': 'Root layout with navigation setup',
    'index.tsx': 'Home/Landing screen',
    'auth': {
      'login.tsx': 'Login screen',
      'register.tsx': 'Registration screen', 
      'forgot-password.tsx': 'Password reset',
      '_layout.tsx': 'Auth layout wrapper',
    },
    '(tabs)': {
      '_layout.tsx': 'Tab navigator (bottom nav)',
      'home.tsx': 'Dashboard/Home screen',
      'discover.tsx': 'Discover brands/creators',
      'campaigns.tsx': 'Campaigns list',
      'messages.tsx': 'Messaging screen',
      'profile.tsx': 'Profile screen',
    },
    'campaigns': {
      '[id].tsx': 'Campaign detail (single campaign)',
      'new.tsx': 'Create new campaign',
    },
    'contracts': {
      '[id].tsx': 'Contract detail & signing',
      'index.tsx': 'Contracts list',
    },
    'wallet': {
      'index.tsx': 'Wallet/payment screen',
    },
  },
};

// ============================================================================
// FEATURE PARITY CHECKLIST
// ============================================================================

export const FEATURE_PARITY_CHECKLIST = {
  authentication: {
    'Login Flow': {
      web: 'Email/password form on /login',
      mobile: 'Same form in Auth stack',
      status: '✅ Parity',
      notes: 'Both use same Supabase auth service',
    },
    'Register Flow': {
      web: 'Multi-step form on /register',
      mobile: 'Same form in Auth stack',
      status: '✅ Parity',
    },
    'Session Persistence': {
      web: 'Redux store + localStorage',
      mobile: 'Redux store + AsyncStorage',
      status: '✅ Parity (different storage)',
      notes: 'Same auth service, different storage layer',
    },
  },

  dashboard: {
    'Creator Dashboard': {
      web: 'Full layout with sidebar',
      mobile: 'Top tabs + content',
      status: '⚠️ Adapted',
      features: ['Wallet balance', 'Active campaigns', 'Creator score', 'Quick stats'],
    },
    'Brand Dashboard': {
      web: 'Full layout with sidebar',
      mobile: 'Top tabs + content', 
      status: '⚠️ Adapted',
      features: ['Campaign KPIs', 'Active campaigns', 'Applications', 'Brand score'],
    },
  },

  discovery: {
    'Creator Discovery': {
      web: '/discover/creators with filters',
      mobile: '(tabs)/discover with filters',
      status: '✅ Parity',
      features: [
        'Creator cards with stats',
        'Filter by niche, location, followers',
        'Search functionality',
        'Creator profile deep links',
      ],
    },
    'Brand Discovery': {
      web: '/discover/brands with filters',
      mobile: '(tabs)/discover with filters',
      status: '✅ Parity',
      features: [
        'Brand cards with scores',
        'Filter by industry, size',
        'Brand profile view',
        'Campaign browsing from brand',
      ],
    },
  },

  campaigns: {
    'Browse Campaigns': {
      web: '/campaigns list view',
      mobile: '(tabs)/campaigns list',
      status: '✅ Parity',
      features: [
        'Campaign cards with budget',
        'Infinite scroll or pagination',
        'Filter by niche, budget, platform',
        'Campaign detail modal/page',
      ],
    },
    'Campaign Details': {
      web: '/campaigns/{id}',
      mobile: 'campaigns/[id].tsx',
      status: '✅ Parity',
      features: [
        'Full brief and deliverables',
        'Creator applications',
        'Apply button',
        'Share campaign',
      ],
    },
    'Create Campaign': {
      web: '/campaigns/new',
      mobile: 'campaigns/new.tsx',
      status: '✅ Parity',
      features: [
        'Multi-step form',
        'Budget input & currency',
        'Content format selection',
        'Timeline setup',
        'Save & publish',
      ],
    },
  },

  contracts: {
    'Contract List': {
      web: '/contracts',
      mobile: 'contracts/index.tsx',
      status: '✅ Parity',
      features: [
        'Filter by status',
        'Sort by amount/date',
        'View quick summary',
        'Status badges',
      ],
    },
    'Contract Details': {
      web: '/contracts/{id}',
      mobile: 'contracts/[id].tsx',
      status: '✅ Parity',
      features: [
        'Full contract content',
        'Party information',
        'Amount & timeline',
        'Status tracking',
      ],
    },
    'Contract Signing': {
      web: '/contracts/{id}/sign with canvas',
      mobile: 'contracts/[id].tsx with signature capture',
      status: '⚠️ Adapted',
      notes: 'Mobile uses touch-compatible canvas',
      features: [
        'Signature capture (touch or stylus)',
        'Clear button',
        'Terms agreement',
        'Submit & download',
      ],
    },
    'PDF Download': {
      web: 'Client-side jsPDF generation',
      mobile: 'Client-side jsPDF generation',
      status: '✅ Parity',
      notes: 'Both use same jsPDF library',
    },
  },

  wallet: {
    'Wallet View': {
      web: '/wallet',
      mobile: 'wallet/index.tsx',
      status: '✅ Parity',
      features: [
        'Balance breakdown (Available, Pending, Locked)',
        'Transaction history',
        'Escrow tracking',
        'Add funds button',
        'Withdraw button',
      ],
    },
    'Add Funds': {
      web: 'Modal with FakeRazorpay',
      mobile: 'Same modal in Expo modal',
      status: '✅ Parity',
      features: [
        'UPI/Card selection',
        'Mock payment processing',
        'Success/failure handling',
      ],
    },
    'Withdrawals': {
      web: 'Form in withdrawal section',
      mobile: 'Form in withdrawal section',
      status: '✅ Parity',
      features: [
        'Amount input (≥ ₹500)',
        'Method selection (UPI, Bank)',
        'Confirmation',
        'Processing feedback',
      ],
    },
  },

  profile: {
    'View Profile': {
      web: '/profile or /profile/[username]',
      mobile: '(tabs)/profile.tsx',
      status: '✅ Parity',
      features: [
        'Profile picture',
        'Bio & tagline',
        'Social links',
        'Statistics',
        'Pricing tiers (if creator)',
      ],
    },
    'Edit Profile': {
      web: '/profile-edit',
      mobile: 'Profile edit mode in same component',
      status: '✅ Parity',
      features: [
        'Edit all fields',
        'Add/remove social links',
        'Update pricing',
        'Photo upload',
        'Save changes',
      ],
    },
  },

  messaging: {
    'Messages List': {
      web: '/messages',
      mobile: '(tabs)/messages.tsx',
      status: '✅ Parity',
      features: [
        'Recent conversations',
        'Unread badges',
        'Last message preview',
        'Timestamp',
        'Search conversations',
      ],
    },
    'Message Detail': {
      web: '/messages/{id}',
      mobile: 'messages/[id].tsx',
      status: '✅ Parity',
      features: [
        'Full conversation',
        'Typing indicators',
        'Message status',
        'File sharing',
        'Profile quick access',
      ],
    },
  },

  notifications: {
    'Notification Center': {
      web: '/notifications',
      mobile: 'notifications/index.tsx or tab badge',
      status: '⚠️ Adapted',
      notes: 'Mobile may use native notifications or in-app list',
      features: [
        'Campaign applications',
        'Contract updates',
        'Message notifications',
        'Payment confirmations',
        'System messages',
      ],
    },
  },

  settings: {
    'App Settings': {
      web: '/settings',
      mobile: 'settings/index.tsx',
      status: '✅ Parity',
      features: [
        'Theme toggle (dark/light)',
        'Notification preferences',
        'Privacy settings',
        'Account settings',
        'About & version',
      ],
    },
  },
};

// ============================================================================
// MOBILE-SPECIFIC ADAPTATIONS
// ============================================================================

export const MOBILE_ADAPTATIONS = {
  'Signature Canvas': {
    web: 'Mouse-based drawing',
    mobile: 'Touch-based drawing with pressure sensitivity',
    implementation: `
      const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        // Start drawing
      };
    `,
  },

  'Camera Integration': {
    feature: 'Avatar upload',
    implementation: 'Expo Camera for photo capture',
  },

  'Bottom Navigation': {
    web: 'Sidebar navigation',
    mobile: 'Bottom tab bar with icons',
    tabs: ['Home', 'Discover', 'Campaigns', 'Messages', 'Profile'],
  },

  'Storage': {
    web: 'localStorage API',
    mobile: 'AsyncStorage from @react-native-async-storage/async-storage',
    note: 'Same storage interface, different implementation',
  },

  'Keyboard Handling': {
    mobile: 'Use KeyboardAvoidingView for forms',
    web: 'No special handling needed',
  },

  'Network Status': {
    mobile: 'Can use NetInfo to detect offline',
    web: 'Navigator.onLine',
  },
};

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

export const SHARED_COMPONENTS = {
  hooks: [
    'useAuthFlow - Authentication logic',
    'useNavigation - Navigation helpers',
    'usePagination - List pagination',
    'useDebounce - Search/input debouncing',
    'useLocalStorage - Data persistence',
    'useToast - Toast notifications',
  ],

  types: [
    'User - User profile type',
    'Campaign - Campaign data type',
    'Contract - Contract data type',
    'Wallet - Wallet data type',
    'Transaction - Transaction data type',
  ],

  services: [
    'authService - Sign in/up/logout',
    'campaignService - Campaign CRUD',
    'contractService - Contract management',
    'walletService - Wallet operations',
    'userService - User profile operations',
  ],

  utilities: [
    'formatCurrency - ₹ formatting',
    'formatDate - Date display',
    'formatStatus - Status badge text',
    'calculateAge - Date calculations',
    'generateContractPdf - PDF generation',
  ],
};

// ============================================================================
// TESTING STRATEGY FOR MOBILE
// ============================================================================

export const MOBILE_TESTING_GUIDE = `
📱 MOBILE APP TESTING CHECKLIST

🧪 Setup:
  [ ] Install Expo CLI: npm install -g expo-cli
  [ ] iOS: npm run ios (requires Xcode)
  [ ] Android: npm run android (requires Android Studio)
  [ ] Web: npm run web (Expo web preview)
  [ ] Expo Go app on phone for live development

🧪 UI/UX Testing:
  [ ] Bottom navigation works on all tabs
  [ ] Swipe to navigate tabs works
  [ ] Back button (Android) dismisses modals
  [ ] Safe area handled (notches, status bar)
  [ ] All text readable on mobile font sizes
  [ ] Touch targets are ≥ 44x44pt
  [ ] No horizontal scroll on any screen
  [ ] Landscape orientation works (if supported)

🧪 Creator Features:
  [ ] Login with demo account
  [ ] View dashboard with earnings
  [ ] Tap "Discover" tab → See brands/campaigns
  [ ] Search and filter work
  [ ] Tap campaign → See details
  [ ] Tap "Apply" → Works without navigation
  [ ] View contracts in "Campaigns" tab
  [ ] Tap contract → See details
  [ ] Signature canvas works with finger
  [ ] Can draw signature smoothly
  [ ] Download PDF after signing
  [ ] Tap wallet tab → See balance
  [ ] Add funds flow works
  [ ] Payment mock succeeds
  [ ] Balance updates correctly

🧪 Brand Features:
  [ ] Login with brand account
  [ ] View brand dashboard
  [ ] Create campaign from "+" button
  [ ] Form validates inputs
  [ ] Can upload budget
  [ ] Submit creates campaign
  [ ] View created campaign
  [ ] Find creators tab shows all
  [ ] Browse creator profiles
  [ ] Send contract to creator

🧪 Performance (Mobile):
  [ ] Initial load < 3 seconds on 3G
  [ ] Transitions smooth (60fps)
  [ ] Signature canvas responsive
  [ ] No lag when scrolling lists
  [ ] Images load efficiently
  [ ] Memory usage stable
  [ ] No crashes on rapid navigation

🧪 Touch/Gesture Testing:
  [ ] Tap responds immediately
  [ ] Long press opens context menu (if needed)
  [ ] Swipe navigates between tabs
  [ ] Pull-to-refresh works (if implemented)
  [ ] Keyboard dismisses on tap outside
  [ ] No accidental taps register

🧪 Network Testing:
  [ ] Offline mode shows appropriate UI
  [ ] Connection restored → Auto-retry
  [ ] API errors show helpful messages
  [ ] Slow network doesn't break UI
  [ ] Large files handle gracefully

🧪 Device Testing:
  [ ] iOS 15+: Works fully
  [ ] Android 8+: Works fully
  [ ] Tablet (iPad/Galaxy Tab): Layout adapts
  [ ] Different screen sizes: Responsive
  [ ] Different DPI: Text crisp and readable
`;

// ============================================================================
// BUILD & DEPLOYMENT FOR MOBILE
// ============================================================================

export const MOBILE_DEPLOYMENT = {
  buildWeb: `
    # Test on web first (easiest)
    npm run web
    # Or with expo go phone
    expo start
  `,

  buildAndroid: `
    # Build APK for testing on Android
    expo build:android -t apk
    
    # Or for Play Store
    expo build:android -t app-bundle
  `,

  buildIOS: `
    # Build for physical iOS device
    expo build:ios
    
    # Requires Apple Developer Account
    # Download .ipa and use Testflight
  `,

  testingServers: [
    'Expo Go app on phone for live development',
    'Android emulator (Android Studio)',
    'iOS Simulator (Xcode)',
    'Physical device for real testing',
  ],

  preRelease: [
    '✅ Test on real devices (iOS & Android)',
    '✅ Test on slow network (Throttle in DevTools)',
    '✅ Test battery usage (should be reasonable)',
    '✅ Test offline/online transitions',
    '✅ Test all gestures (tap, swipe, long press)',
    '✅ Test landscape orientation',
    '✅ Test with real data (mock data should be realistic)',
  ],
};

// ============================================================================
// KNOWN MOBILE ISSUES & SOLUTIONS
// ============================================================================

export const MOBILE_ISSUES = [
  {
    issue: 'Signature canvas doesn\'t respond to touch',
    cause: 'Touch event handlers not configured',
    solution: 'Add onTouchStart, onTouchMove, onTouchEnd handlers',
  },
  {
    issue: 'Bottom navigation doesn\'t show properly',
    cause: 'Missing safe area insets',
    solution: 'Wrap with useSafeAreaInsets from react-native-safe-area-context',
  },
  {
    issue: 'TextInput keyboard covers form',
    cause: 'KeyboardAvoidingView not used',
    solution: 'Wrap form in KeyboardAvoidingView with behavior="padding"',
  },
  {
    issue: 'Images not loading',
    cause: 'Network image URIs not set up',
    solution: 'Use full URLs, not relative paths',
  },
  {
    issue: 'App crashes on Android cold start',
    cause: 'Metro bundler timeout',
    solution: 'Increase timeout: expo start --max-workers 1',
  },
];

export default FEATURE_PARITY_CHECKLIST;
