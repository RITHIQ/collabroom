// ─── Shared Types for ColabRoom ───────────────────────────────────────────

export type UserRole = 'creator' | 'brand' | 'admin';
export type Theme = 'light' | 'dark';


// ─── User ───────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  profile?: CreatorProfile | BrandProfile;
}

// ─── Creator Profile ────────────────────────────────────────────────────────
export interface SocialLink {
  platform: 'instagram' | 'youtube' | 'tiktok' | 'twitter' | 'linkedin';
  handle: string;
  followers: number;
  engagementRate: number;
}

export interface PricingTier {
  type: 'story' | 'feed_post' | 'reel' | 'youtube_video' | 'dedicated_video';
  label: string;
  minPrice: number;
  maxPrice: number;
  currency: string;
}

export interface AudienceData {
  topAgeGroup: string;
  topLocation: string;
  genderSplit: { male: number; female: number; other: number };
}

export type AvailabilityStatus = 'available' | 'busy' | 'not_available';
export type CreatorTier = 'rising' | 'established' | 'elite' | 'verified_pro';

export interface CreatorProfile {
  userId: string;
  displayName: string;
  username: string;
  bio: string;
  tagline: string;
  location: string;
  languages: string[];
  niches: string[];
  socialLinks: SocialLink[];
  pricingTiers: PricingTier[];
  availability: AvailabilityStatus;
  portfolioUrls: string[];
  creatorScore: number;
  creatorTier: CreatorTier;
  audienceData?: AudienceData;
  profilePhoto?: string;
  coverImage?: string;
  completionPercentage: number;
  campaignsCompleted: number;
  onTimeDeliveryRate: number;
  revisionRate: number;
  avgResponseTime: string;
}

// ─── Brand Profile ──────────────────────────────────────────────────────────
export type BrandTier = 'new_brand' | 'trusted' | 'preferred' | 'top_brand';

export interface BrandProfile {
  userId: string;
  companyName: string;
  handle: string;
  industry: string;
  companySize: string;
  website: string;
  description: string;
  values: string;
  preferredNiches: string[];
  preferredPlatforms: string[];
  logoUrl?: string;
  coverImage?: string;
  brandScore: number;
  brandTier: BrandTier;
  avgPaymentTime: number;
  campaignsCompleted: number;
  onTimePaymentRate: number;
  completionPercentage: number;
}

// ─── Campaign ───────────────────────────────────────────────────────────────
export type CampaignType = 'sponsored_post' | 'product_review' | 'brand_ambassador' | 'affiliate' | 'giveaway' | 'event_coverage';
export type CampaignStatus = 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled';
export type CampaignVisibility = 'private' | 'public';
export type ContentFormat = 'photo' | 'video' | 'reel' | 'story' | 'blog' | 'podcast';
export type Platform = 'instagram' | 'youtube' | 'tiktok' | 'twitter' | 'linkedin';

export interface CampaignBrief {
  toneOfVoice?: string;
  dos?: string[];
  donts?: string[];
  mandatoryMentions?: string[];
  mandatoryHashtags?: string[];
  mandatoryLinks?: string[];
  moodBoardImages?: string[];
}

export interface Campaign {
  id: string;
  brandId: string;
  brandName: string;
  brandLogo?: string;
  title: string;
  description: string;
  type: CampaignType;
  platforms: Platform[];
  contentFormats: ContentFormat[];
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  slotsTotal: number;
  slotsFilled: number;
  status: CampaignStatus;
  visibility: CampaignVisibility;
  brief?: CampaignBrief;
  deliverables: string[];
  niche: string;
  applicationsCount: number;
  createdAt: string;
}

// ─── Milestone ──────────────────────────────────────────────────────────────
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'late' | 'disputed';

export interface Milestone {
  id: string;
  campaignId: string;
  title: string;
  dueDate: string;
  assignedTo: string;
  status: MilestoneStatus;
  paymentAmount: number;
  currency: string;
  completedAt?: string;
}

// ─── Content Submission ─────────────────────────────────────────────────────
export type SubmissionStatus = 'submitted' | 'in_review' | 'changes_requested' | 'approved' | 'published';

export interface ContentSubmission {
  id: string;
  milestoneId: string;
  creatorId: string;
  files: string[];
  caption?: string;
  status: SubmissionStatus;
  version: number;
  submittedAt: string;
  liveUrl?: string;
  feedback?: string;
}

// ─── Contract ───────────────────────────────────────────────────────────────
export type ContractStatus = 'draft' | 'sent' | 'under_review' | 'signed' | 'executed' | 'terminated';

export interface Contract {
  id: string;
  campaignId: string;
  brandId: string;
  creatorId: string;
  brandName: string;
  creatorName: string;
  content: Record<string, string>;
  status: ContractStatus;
  signedByBrandAt?: string;
  signedByCreatorAt?: string;
  pdfUrl?: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
}

// ─── Wallet ─────────────────────────────────────────────────────────────────
export type TransactionType = 'credit' | 'debit' | 'escrow_lock' | 'escrow_release' | 'withdrawal' | 'refund';
export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type EscrowStatus = 'deposited' | 'locked' | 'pending_release' | 'released' | 'refunded';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  campaignName?: string;
  status: TransactionStatus;
  createdAt: string;
  reference: string;
}

export interface Wallet {
  userId: string;
  availableBalance: number;
  pendingBalance: number;
  lockedBalance: number;
  currency: string;
  transactions: Transaction[];
}

// ─── Notification ────────────────────────────────────────────────────────────
export type NotificationType = 'match_found' | 'invite_received' | 'content_approved' | 'payment_released' | 'dispute_update' | 'contract_signed' | 'deadline_reminder' | 'message_received';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

// ─── Review ─────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerPhoto?: string;
  campaignId: string;
  campaignName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ─── Dispute ────────────────────────────────────────────────────────────────
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed';

export interface Dispute {
  id: string;
  campaignId: string;
  raisedBy: string;
  reason: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  resolution?: string;
  resolvedAt?: string;
  createdAt: string;
}

// ─── Message ─────────────────────────────────────────────────────────────────
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  content: string;
  isRead: boolean;
  sentAt: string;
  campaignId?: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantPhoto?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

// ─── AI Brief ────────────────────────────────────────────────────────────────
export type CampaignGoal = 'awareness' | 'sales' | 'app_downloads' | 'event_promotion' | 'product_launch' | 'brand_recall';

export interface AIBriefInput {
  productDescription: string;
  campaignGoal: CampaignGoal;
  targetAudience: string;
}

export interface AIBriefOutput {
  campaignTitle: string;
  campaignObjective: string;
  targetAudienceProfile: string;
  keyMessages: string[];
  contentDos: string[];
  contentDonts: string[];
  mandatoryInclusions: { hashtags: string[]; handles: string[]; disclosures: string[] };
  suggestedFormats: Record<string, string>;
  recommendedPostingTimes: string;
  suggestedCreatorCriteria: string;
  estimatedBudgetRange: string;
  kpis: string[];
}

// ─── API Response ────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

// ─── Filter Types ────────────────────────────────────────────────────────────
export interface CreatorFilters {
  niches: string[];
  platforms: Platform[];
  followerMin: number;
  followerMax: number;
  engagementMin: number;
  country: string;
  language: string;
  gender: string;
  audienceAgeRange: [number, number];
  priceMin: number;
  priceMax: number;
  minCreatorScore: number;
  availableNow: boolean;
  searchQuery: string;
}

export interface CampaignFilters {
  industry: string;
  budgetMin: number;
  budgetMax: number;
  type: CampaignType | '';
  platform: Platform | '';
  deadline: string;
  searchQuery: string;
}
