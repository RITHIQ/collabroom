You are a senior full-stack developer and UI/UX designer tasked with building 
ColabRoom — a complete, fully functional, production-ready web and mobile 
application that serves as the all-in-one operating system for the creator 
economy. This platform connects brands and content creators, enabling them to 
discover each other, collaborate on campaigns, sign contracts, handle payments 
securely, and grow their businesses together — all within a single unified 
platform.

════════════════════════════════════════════════════════════════
TECH STACK
════════════════════════════════════════════════════════════════

Frontend Web:
- React.js with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Redux Toolkit for state management
- React Router v6 for navigation
- Axios for API calls
- Socket.io client for real-time features

Backend:
- Node.js with Express.js
- PostgreSQL as primary relational database
- MongoDB for unstructured data (portfolios, briefs)
- Redis for caching and session management
- Socket.io for real-time notifications and messaging
- JWT for authentication with refresh token rotation
- Bcrypt for password hashing

Mobile App:
- React Native with Expo
- Shared component library with web where possible
- React Navigation for mobile routing
- Expo Notifications for push notifications
- Expo Camera and ImagePicker for content submission
- Expo LocalAuthentication for biometric login

AI Integration:
- OpenAI GPT-4 API for brief generation
- Custom scoring algorithm for CreatorScore and BrandScore
- Recommendation engine using cosine similarity matching

Payments:
- Razorpay for India and Southeast Asia
- Stripe Connect for international payments
- Escrow logic built custom on top of payment gateway holds

Storage:
- AWS S3 for media files, contracts, and documents
- Cloudinary for image optimization and delivery

Hosting:
- AWS EC2 for backend
- Vercel for frontend web deployment
- Expo EAS for mobile builds

════════════════════════════════════════════════════════════════
DESIGN SYSTEM — LIGHT AND DARK MODE
════════════════════════════════════════════════════════════════

Build a complete dual-mode design system that is toggled by the user 
and persisted in localStorage and user profile settings. The toggle 
must be accessible from the top navigation bar on all screens.

LIGHT MODE COLOR PALETTE:
- Primary Brand Color: #6C3EF4 (deep violet purple)
- Primary Accent: #A78BFA (soft lavender)
- Secondary Accent: #F59E0B (warm amber — for CTAs and highlights)
- Background Primary: #FFFFFF (pure white)
- Background Secondary: #F5F3FF (very light lavender tint)
- Background Card: #FAFAFA (off white for cards)
- Text Primary: #111827 (near black)
- Text Secondary: #6B7280 (medium gray)
- Text Muted: #9CA3AF (light gray)
- Border Color: #E5E7EB (light gray border)
- Success: #10B981 (emerald green)
- Warning: #F59E0B (amber)
- Error: #EF4444 (red)
- Info: #3B82F6 (blue)

DARK MODE COLOR PALETTE:
- Primary Brand Color: #7C3AED (vibrant violet)
- Primary Accent: #A78BFA (soft lavender — same for consistency)
- Secondary Accent: #FBBF24 (bright amber)
- Background Primary: #0F0F13 (near black with slight purple tint)
- Background Secondary: #1A1A24 (dark purple-tinted surface)
- Background Card: #1E1E2E (dark card background)
- Text Primary: #F9FAFB (near white)
- Text Secondary: #D1D5DB (light gray)
- Text Muted: #6B7280 (medium gray)
- Border Color: #2D2D3F (dark border with purple tint)
- Success: #34D399 (lighter emerald for dark bg)
- Warning: #FBBF24 (bright amber)
- Error: #F87171 (lighter red for dark bg)
- Info: #60A5FA (lighter blue for dark bg)

TYPOGRAPHY:
- Font Family Primary: Inter (Google Fonts)
- Font Family Display: Sora (for headings and hero text)
- Base Font Size: 16px
- Heading Scale: H1 48px, H2 36px, H3 28px, H4 22px, H5 18px, H6 16px
- Line Height: 1.6 for body, 1.2 for headings
- Font Weights: 400 regular, 500 medium, 600 semibold, 700 bold

SPACING SYSTEM:
- Base unit: 4px
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px
- Border Radius: Small 6px, Medium 12px, Large 20px, Full 9999px

COMPONENT DESIGN RULES:
- All cards must have subtle box shadows in light mode and 
  subtle border glow in dark mode
- Buttons must have hover and active states with smooth 
  150ms transitions
- All interactive elements must have visible focus rings 
  for accessibility
- Loading states must use skeleton screens, not spinners
- Empty states must have illustrated placeholders with 
  action prompts
- All forms must have inline real-time validation
- Toast notifications for all user actions

════════════════════════════════════════════════════════════════
AUTHENTICATION SYSTEM
════════════════════════════════════════════════════════════════

Build a complete authentication system with the following:

REGISTRATION:
- Two distinct signup flows — one for Creators, one for Brands
- User selects their role on the first screen with visual 
  role cards showing what each role offers
- Creator signup fields: Full name, username, email, password,
  primary content niche (dropdown), primary social platform,
  country, profile photo upload
- Brand signup fields: Company name, brand handle, email, 
  password, industry category, company size, website URL,
  company logo upload
- Email verification with 6-digit OTP sent to registered email
- Password strength indicator with real-time feedback
- Terms of service and privacy policy checkbox with links

SOCIAL LOGIN:
- Google OAuth 2.0 — one click signup and login
- Apple Sign In for iOS mobile app
- On social login, detect if new user and route to 
  role selection and profile completion flow

LOGIN:
- Email and password login
- Remember me functionality using secure httpOnly cookies
- Forgot password with email reset link (expires in 15 minutes)
- Account lockout after 5 failed attempts with 30 minute cooldown
- Show last login location and device on dashboard for security

ONBOARDING FLOW (post registration):
- 4-step guided onboarding for both user types
- Progress bar showing completion percentage
- Creator onboarding: Connect social accounts, set pricing 
  tiers, add portfolio items, set availability status
- Brand onboarding: Describe brand voice, set campaign budget 
  ranges, select preferred creator niches, add team members
- Skip option available but with prompt showing benefits of 
  completing profile
- Completion badge shown on profile when 100% complete

════════════════════════════════════════════════════════════════
PILLAR 1 — DISCOVERY AND MATCHING ENGINE
════════════════════════════════════════════════════════════════

Build a fully functional discovery system with:

BRAND-SIDE DISCOVERY:
- Search bar with instant results as user types
- Advanced filter panel (collapsible sidebar on desktop, 
  bottom sheet on mobile) with filters:
  * Content niche (multi-select dropdown with 50+ categories)
  * Primary platform (Instagram, YouTube, TikTok, X, LinkedIn)
  * Follower range (slider: 1K to 10M+)
  * Engagement rate minimum (slider: 1% to 20%+)
  * Location (country and city level)
  * Language
  * Gender of creator
  * Audience age range
  * Price range per post
  * ColabRoom CreatorScore minimum
  * Availability status (available now toggle)
- Creator cards in grid layout showing: profile photo, 
  name, niche badge, top platform, follower count, 
  engagement rate, starting price, CreatorScore badge
- Click card to open full creator profile in side panel 
  without leaving search results
- Save creator to favourites list with folder organization
- One-click send collaboration invite from search results

AI MATCHING:
- After brand posts a campaign brief, AI engine analyzes:
  * Campaign niche vs creator content category
  * Target audience demographics vs creator audience data
  * Budget vs creator pricing tiers
  * Past campaign performance in similar niches
  * Brand safety score vs creator content history
- Returns ranked list of top 20 matched creators with 
  match percentage score and reasoning explanation
- Brands can accept, skip, or save each recommendation

CREATOR-SIDE DISCOVERY:
- Brand opportunity feed showing active campaigns seeking creators
- Filter by: industry, budget range, campaign type, platform,
  application deadline, collaboration type
- Featured campaigns highlighted at top of feed
- Quick apply button on campaign cards
- Saved opportunities folder

════════════════════════════════════════════════════════════════
PILLAR 2 — CAMPAIGN WORKSPACE
════════════════════════════════════════════════════════════════

Build a complete campaign management system:

CAMPAIGN CREATION (Brand side):
- Campaign name and description
- Campaign type selector: Sponsored Post, Product Review, 
  Brand Ambassador, Affiliate, Giveaway, Event Coverage
- Platform selection (multi-select)
- Content format: Photo, Video, Reel, Story, Blog, Podcast
- Campaign timeline with start and end date pickers
- Budget allocation per creator slot
- Number of creators needed
- Deliverables checklist builder (add custom line items)
- Brand guidelines section: tone of voice, dos and don'ts,
  mandatory mentions, hashtags, and links to include
- Mood board with image upload (up to 10 reference images)
- Visibility: Private (invite only) or Public (open applications)
- Save as draft or publish to opportunity feed

CAMPAIGN ROOM (shared workspace):
- Left sidebar: Campaign details, team members, milestone 
  tracker, file library, payment status
- Main area: Content submission and approval workflow
- Right sidebar: Activity feed and comments

CONTENT SUBMISSION AND APPROVAL:
- Creator uploads content draft (image, video, document)
- Brand reviewer sees draft with annotation tools:
  * Click anywhere on image/video to pin a comment
  * Highlight text in documents to comment
  * General comment thread below content
- Status tags: Submitted, In Review, Changes Requested, 
  Approved, Published
- Version history showing all draft iterations
- Approval triggers automatic payment release from escrow
- Published confirmation requires creator to paste live 
  post URL for verification

MILESTONE TRACKER:
- Visual timeline of campaign milestones
- Each milestone has: name, due date, assigned party, 
  status indicator, linked payment amount
- Automated email and push notification reminders at 
  48 hours and 24 hours before each deadline
- Late milestone flagging with orange warning indicator

════════════════════════════════════════════════════════════════
PILLAR 3 — CONTRACTS AND PAYMENTS
════════════════════════════════════════════════════════════════

BUILD COMPLETE CONTRACT SYSTEM:

CONTRACT GENERATION:
- Auto-populate contract template from campaign parameters
- Contract includes: parties involved, deliverables list, 
  timeline, payment amount and schedule, revision rounds 
  allowed, content ownership rights, exclusivity clauses,
  FTC disclosure requirements, termination conditions
- Brand can edit any clause before sending
- Legal language toggle: Simple English or Formal Legal
- Send to creator for review with comment and redline capability
- Version tracking on all contract edits
- DocuSign-style e-signature with timestamp and IP logging
- Signed PDF automatically saved to both parties file library
- Email copy sent to both parties upon full execution

ESCROW PAYMENT SYSTEM:
- Brand deposits full campaign payment into ColabRoom escrow 
  at contract signing
- Payment held securely until milestone approval
- Creator sees payment as "locked" with estimated release date
- Milestone completion triggers payment release to creator wallet
- Platform fee: 8% from brand, 2% from creator per transaction
- Payment status indicators: Deposited, Locked, 
  Pending Release, Released, Withdrawn

CREATOR EARNINGS WALLET:
- Total balance dashboard showing: available, pending, locked
- Transaction history with campaign names and dates
- Withdraw to bank account (UPI, NEFT for India; 
  ACH for US; SEPA for Europe)
- Minimum withdrawal: ₹500 or $10
- Processing time displayed: Instant for UPI, 
  2-3 days for bank transfer

DISPUTE RESOLUTION:
- Either party can raise a dispute on any milestone
- Dispute form: select issue type, describe problem, 
  attach evidence (screenshots, files)
- Automatic notification to other party to respond 
  within 48 hours
- ColabRoom mediator assigned if unresolved in 72 hours
- Mediator reviews evidence and makes binding decision
- Payment released or refunded based on mediator decision
- Dispute history visible on both party profiles

AFFILIATE AND COMMISSION TRACKING:
- Brand creates unique trackable affiliate links per creator
- Real-time dashboard showing: clicks, conversions, 
  revenue generated per creator link
- Automatic commission calculation based on set percentage
- Commission added to creator wallet upon verified conversion
- Monthly commission report downloadable as CSV

════════════════════════════════════════════════════════════════
PILLAR 4 — PROFILES AND TRUST SYSTEM
════════════════════════════════════════════════════════════════

CREATOR PROFILE PAGE:
- Cover banner with customizable gradient or uploaded image
- Profile photo with verified badge if identity confirmed
- Display name, username, tagline (one liner about niche)
- Location and languages spoken
- Social platform links with live follower counts pulled 
  via API (Instagram Graph API, YouTube Data API, 
  TikTok Display API)
- Engagement rate calculated and displayed per platform
- Audience demographics summary: top age group, top 
  location, gender split (from connected platform APIs)
- Content niche tags (up to 5)
- Pricing tiers: Story post, Feed post, Reel/Short, 
  YouTube video, Dedicated video — each with price range
- Availability status: Available, Busy, Not Taking Work
- Portfolio grid: uploaded past work samples and 
  campaign case studies
- Reviews section: brand reviews with star rating and comment
- ColabRoom campaign history: number of completed campaigns,
  on-time delivery rate, revision request rate
- CreatorScore badge prominently displayed

BRAND PROFILE PAGE:
- Company logo and cover image
- Company name, handle, industry category, company size
- Website link and social profiles
- Brand description and values statement
- Preferred content niches and platforms
- Past campaigns section showing completed collaborations
- Creator reviews of this brand with star ratings
- Average payment time badge (e.g., Pays within 3 days)
- BrandScore badge prominently displayed

CREATORSCORE ALGORITHM:
Calculate a score from 0 to 100 based on:
- Campaign completion rate (30% weight)
- On-time delivery rate (25% weight)
- Brand review average rating (20% weight)
- Audience authenticity score from API data (15% weight)
- Response time to brand messages (10% weight)
Display as: Rising (0-40), Established (41-70), 
Elite (71-90), Verified Pro (91-100)
Show score with colored badge and progress ring

BRANDSCORE ALGORITHM:
Calculate a score from 0 to 100 based on:
- On-time payment rate (35% weight)
- Creator review average rating (25% weight)
- Brief clarity rating from creators (20% weight)
- Dispute rate (negative weight, 20%)
Display as: New Brand, Trusted, Preferred, 
Top Brand with corresponding colored badges

════════════════════════════════════════════════════════════════
PILLAR 5 — COLAB AI BRIEF GENERATOR
════════════════════════════════════════════════════════════════

BUILD AN AI-POWERED BRIEF GENERATION TOOL:

INPUT FORM (3 simple fields):
- Product or service description (text area, 3-5 sentences)
- Campaign goal selector: Awareness, Sales, App Downloads,
  Event Promotion, Product Launch, Brand Recall
- Target audience description (text area, 2-3 sentences)

AI PROCESSING:
- Send inputs to OpenAI GPT-4 API with a system prompt 
  engineered to output a structured campaign brief
- Show animated loading state with "Colab AI is thinking" 
  message during API call
- Stream the response token by token for live text appearance

AI OUTPUT — FULL BRIEF INCLUDES:
- Campaign title suggestion
- Campaign objective statement
- Target audience profile
- Key messages to communicate
- Content dos and don'ts
- Mandatory inclusions: hashtags, handles, disclosures
- Suggested content formats per platform
- Recommended posting times
- Suggested creator profile criteria
- Estimated fair budget range based on campaign scope
- KPIs to measure success

ADDITIONAL AI FEATURES:
- Pricing advisor: creator enters their stats, AI suggests 
  fair market rate for each content type
- Posting time optimizer: based on niche and platform, 
  suggest best days and times to post sponsored content
- Edit and regenerate: user can tweak any section and 
  ask AI to rewrite just that section

════════════════════════════════════════════════════════════════
PILLAR 6 — MOBILE APPLICATION
════════════════════════════════════════════════════════════════

BUILD REACT NATIVE MOBILE APP WITH:

NAVIGATION STRUCTURE:
- Bottom tab bar with 5 tabs:
  * Home (feed and dashboard)
  * Discover (search for creators or campaigns)
  * Campaigns (active campaign rooms)
  * Wallet (earnings and payments)
  * Profile (own profile and settings)

HOME SCREEN:
- Personalized greeting with user name
- Active campaign summary cards
- Pending action alerts: approvals needed, deadlines 
  approaching, unread messages
- Quick action buttons: Post Campaign, Find Creators,
  Check Wallet, View Contracts

NOTIFICATIONS:
- Push notifications for: new match found, campaign 
  invitation received, content approved, payment 
  released, dispute update, contract signed, 
  deadline reminder
- In-app notification center with read and unread states
- Notification preferences settings per category

CONTENT SUBMISSION (Creator mobile):
- One-tap access to phone camera roll
- Multi-file upload support (images and videos)
- Add caption and notes before submitting
- Real-time upload progress indicator
- Submission confirmation with campaign reference

BIOMETRIC CONTRACT SIGNING:
- Face ID on iOS, Fingerprint on Android
- Confirmation dialog showing contract summary 
  before biometric prompt
- Signed confirmation screen with timestamp

WALLET SCREEN:
- Total balance in large display
- Pending and locked amounts clearly separated
- Transaction history list with filters
- Withdraw button with bank account management
- Add payout method flow integrated with Razorpay

════════════════════════════════════════════════════════════════
REAL-TIME FEATURES USING SOCKET.IO
════════════════════════════════════════════════════════════════

- Live notification delivery without page refresh
- Real-time campaign room activity feed updates
- Typing indicators in campaign comment threads
- Live payment status updates when escrow releases
- Online presence indicators on profiles (optional, 
  user can disable in privacy settings)
- Real-time bid and application counter on campaign cards

════════════════════════════════════════════════════════════════
NAVIGATION AND PAGE STRUCTURE — WEB
════════════════════════════════════════════════════════════════

PUBLIC PAGES (unauthenticated):
- Landing page with hero, features, how it works, 
  pricing, testimonials, CTA
- About page
- Pricing page with three tier comparison table
- Blog (static for now)
- Login page
- Register page (with role selection)
- Forgot password page

AUTHENTICATED — CREATOR DASHBOARD:
- /dashboard — overview with stats and actions
- /discover/brands — browse brand campaigns
- /campaigns — list of all active and past campaigns
- /campaigns/:id — individual campaign room
- /contracts — all contracts list
- /contracts/:id — individual contract view and signing
- /wallet — earnings dashboard and withdrawal
- /profile/:username — own public profile
- /profile/edit — edit profile
- /messages — direct message inbox
- /notifications — notification center
- /settings — account, privacy, notification preferences

AUTHENTICATED — BRAND DASHBOARD:
- /dashboard — campaign overview and creator pipeline
- /discover/creators — creator search and browse
- /campaigns/new — create new campaign
- /campaigns — list of all campaigns
- /campaigns/:id — campaign room
- /contracts — all contracts
- /payments — payment history and escrow status
- /profile/:handle — own brand profile
- /profile/edit — edit brand profile
- /messages — direct message inbox
- /settings — account, team members, billing

════════════════════════════════════════════════════════════════
DATABASE SCHEMA OVERVIEW
════════════════════════════════════════════════════════════════

USERS TABLE: id, email, password_hash, role, 
created_at, last_login, is_verified, is_active

CREATOR_PROFILES: user_id, display_name, username, 
bio, location, niches[], platforms[], pricing_tiers{},
availability_status, portfolio_urls[], creator_score,
audience_data{}, social_connections{}

BRAND_PROFILES: user_id, company_name, handle, 
industry, company_size, website, brand_description,
preferred_niches[], brand_score, logo_url

CAMPAIGNS: id, brand_id, title, description, type,
platforms[], budget, slots, status, start_date, 
end_date, brief{}, visibility, created_at

APPLICATIONS: id, campaign_id, creator_id, message,
status, applied_at, reviewed_at

CAMPAIGN_MEMBERS: campaign_id, user_id, role, joined_at

CONTRACTS: id, campaign_id, brand_id, creator_id,
content{}, status, signed_by_brand_at, 
signed_by_creator_at, pdf_url

MILESTONES: id, campaign_id, title, due_date,
assigned_to, status, payment_amount, completed_at

CONTENT_SUBMISSIONS: id, milestone_id, creator_id,
files[], caption, status, version, submitted_at

ESCROW_TRANSACTIONS: id, contract_id, amount, 
platform_fee, status, deposited_at, released_at

CREATOR_WALLET: user_id, available_balance, 
pending_balance, locked_balance, currency

TRANSACTIONS: id, wallet_id, type, amount, 
reference, status, created_at

REVIEWS: id, reviewer_id, reviewee_id, campaign_id,
rating, comment, created_at, review_type

DISPUTES: id, campaign_id, raised_by, reason, 
evidence_urls[], status, resolution, resolved_at

MESSAGES: id, sender_id, receiver_id, campaign_id,
content, is_read, sent_at

NOTIFICATIONS: id, user_id, type, title, body,
data{}, is_read, created_at

════════════════════════════════════════════════════════════════
SECURITY REQUIREMENTS
════════════════════════════════════════════════════════════════

- All API endpoints protected with JWT middleware
- Role-based access control on every route
- Input sanitization on all form fields
- SQL injection prevention with parameterized queries
- XSS protection with Content Security Policy headers
- HTTPS enforced on all routes
- Sensitive data encrypted at rest using AES-256
- Payment data never stored on own servers — 
  handled entirely by Razorpay and Stripe
- GDPR compliant data handling with export and 
  delete account options
- Rate limiting on auth endpoints (login, register, 
  OTP verification)
- File upload validation: type check, size limit 50MB,
  virus scan on uploads

════════════════════════════════════════════════════════════════
PERFORMANCE REQUIREMENTS
════════════════════════════════════════════════════════════════

- Page load time under 2 seconds on 4G connection
- API response time under 200ms for cached queries
- Image lazy loading on all feed and grid views
- Infinite scroll pagination on all list views 
  (20 items per page)
- Redis caching for creator search results and 
  campaign feeds (5 minute TTL)
- Database indexing on all foreign keys and 
  frequently queried columns
- CDN delivery for all static assets and media files
- Gzip compression on all API responses

════════════════════════════════════════════════════════════════
ADDITIONAL UI REQUIREMENTS
════════════════════════════════════════════════════════════════

- Fully responsive design: mobile 375px, tablet 768px,
  desktop 1280px, wide 1440px
- Smooth page transitions using Framer Motion
- Micro-interactions on all buttons and interactive elements
- Skeleton loading screens matching actual content layout
- Error boundary components on all major sections
- 404 and 500 error pages with branded illustrations
- Accessible: WCAG 2.1 AA compliant, screen reader 
  friendly, keyboard navigable
- Onboarding tooltips for first-time users on key features
- Contextual empty states with illustrated graphics and 
  actionable prompts guiding users to first action
- Consistent icon library using Lucide React throughout
- All monetary values formatted with correct 
  currency symbols and locale formatting
- Dates and times displayed in user local timezone

════════════════════════════════════════════════════════════════
DELIVERABLE SUMMARY
════════════════════════════════════════════════════════════════

Deliver a fully functional, production-ready application with:
1. Complete web application built in React with TypeScript
2. Complete REST API built in Node.js with Express
3. React Native mobile app for iOS and Android
4. PostgreSQL database with complete schema and seed data
5. All six pillars fully implemented and interconnected
6. Light and dark mode working across all screens
7. AI brief generator integrated with OpenAI API
8. Payment and escrow system integrated with Razorpay
9. Real-time notifications via Socket.io
10. Deployed web app URL and mobile app build files
11. API documentation using Swagger
12. README with local setup instructions

Every feature described in this prompt must be fully 
functional, not mocked or placeholder. The application 
must work as a real product that brands and creators 
can use from day one.