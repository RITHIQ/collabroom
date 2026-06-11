import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { MotiView } from 'moti';
import { Screen } from '../../components/ui/Screen';
import { colors, spacing, radius, typography, shadows } from '../../theme/tokens';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

// Status filters matching the web app exactly
const FILTER_TABS = [
  { label: 'All',         value: 'all' },
  { label: 'Active',      value: 'active' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed',   value: 'completed' },
  { label: 'Pending',     value: 'pending' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending:     { bg: 'rgba(251,191,36,0.10)',   text: '#fbbf24', border: 'rgba(251,191,36,0.30)' },
  active:      { bg: 'rgba(255,255,255,0.08)',   text: '#ffffff', border: 'rgba(255,255,255,0.20)' },
  in_progress: { bg: 'rgba(96,165,250,0.10)',    text: '#60a5fa', border: 'rgba(96,165,250,0.25)' },
  completed:   { bg: 'rgba(74,222,128,0.10)',    text: '#4ade80', border: 'rgba(74,222,128,0.25)' },
  rejected:    { bg: 'rgba(248,113,113,0.10)',   text: '#f87171', border: 'rgba(248,113,113,0.25)' },
  draft:       { bg: 'rgba(255,255,255,0.05)',   text: 'rgba(255,255,255,0.40)', border: 'rgba(255,255,255,0.12)' },
  sent:        { bg: 'rgba(96,165,250,0.10)',    text: '#60a5fa', border: 'rgba(96,165,250,0.25)' },
  signed:      { bg: 'rgba(74,222,128,0.10)',    text: '#4ade80', border: 'rgba(74,222,128,0.25)' },
};

function formatBudget(n: number | null | undefined): string {
  if (!n) return '₹TBD';
  return `₹${n.toLocaleString('en-IN')}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard({ index }: { index: number }) {
  return (
    <MotiView
      from={{ opacity: 0.4 }}
      animate={{ opacity: 0.8 }}
      transition={{ loop: true, duration: 1500, type: 'timing', delay: index * 120 }}
      style={styles.skeletonCard}
    >
      <View style={styles.skeletonRow}>
        <View style={styles.skeletonAvatar} />
        <View style={{ flex: 1, gap: 8 }}>
          <View style={[styles.skeletonLine, { width: '60%' }]} />
          <View style={[styles.skeletonLine, { width: '35%' }]} />
        </View>
      </View>
      <View style={[styles.skeletonLine, { width: '80%', marginTop: 14 }]} />
      <View style={[styles.skeletonLine, { width: '50%', marginTop: 8 }]} />
    </MotiView>
  );
}

// ─── Campaign Card ────────────────────────────────────────────────────────────
function CampaignCard({ item, index, router }: { item: any; index: number; router: any }) {
  const statusKey = (item.status || 'pending').toLowerCase();
  const statusStyle = STATUS_COLORS[statusKey] || STATUS_COLORS.pending;
  const brandInitials = (item.brandName || 'BR').slice(0, 2).toUpperCase();

  return (
    <MotiView
      from={{ opacity: 0, translateY: 24 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay: index * 60 }}
      style={styles.card}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.brandAvatar}>
          <Text style={styles.brandAvatarText}>{brandInitials}</Text>
        </View>
        <View style={styles.brandInfo}>
          <Text style={styles.brandName}>{item.brandName}</Text>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {(item.status || 'PENDING').toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.campaignTitle}>{item.title}</Text>
      {item.description ? (
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.detailGrid}>
        <View style={styles.detailCell}>
          <Text style={styles.detailLabel}>Budget</Text>
          <Text style={styles.detailValue}>{formatBudget(item.budget)}</Text>
        </View>
        <View style={styles.detailCell}>
          <Text style={styles.detailLabel}>Niche</Text>
          <Text style={styles.detailValue}>
            {Array.isArray(item.niche) ? item.niche[0] : (item.niche || 'Lifestyle')}
          </Text>
        </View>
        <View style={styles.detailCell}>
          <Text style={styles.detailLabel}>Type</Text>
          <Text style={styles.detailValue}>{item.type || 'Paid'}</Text>
        </View>
        {item.deadline ? (
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>Deadline</Text>
            <Text style={styles.detailValue}>{formatDate(item.deadline)}</Text>
          </View>
        ) : null}
      </View>

      {/* Action buttons */}
      {statusKey === 'pending' && (
        <View style={styles.pendingNotice}>
          <Feather name="clock" size={12} color={colors.warning} style={{ marginRight: 6 }} />
          <Text style={styles.pendingNoticeText}>Awaiting brand review</Text>
        </View>
      )}
      {statusKey === 'active' && (
        <Pressable style={styles.actionButton} onPress={() => router.push(`/campaigns/${item.id}` as any)}>
          <Feather name="message-circle" size={14} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.actionButtonText}>Open Collab Room</Text>
        </Pressable>
      )}
      {statusKey === 'signed' && (
        <Pressable style={styles.secondaryButton} onPress={() => router.push(`/contracts/${item.contractId || item.id}` as any)}>
          <Feather name="file-text" size={14} color={colors.textPrimary} style={{ marginRight: 6 }} />
          <Text style={styles.secondaryButtonText}>View Contract</Text>
        </Pressable>
      )}
    </MotiView>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function CampaignsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('all');
  const [allCampaigns, setAllCampaigns] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAllCampaigns([]);
        setCampaigns([]);
        return;
      }

      // Fetch creator profile
      const { data: creatorData } = await supabase
        .from('creators')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let query;
      if (creatorData?.id) {
        // Creator: fetch their applied campaigns
        const { data, error } = await supabase
          .from('campaign_applications')
          .select(`
            *,
            campaigns (
              id, title, description, budget, niche, type,
              deadline, created_at,
              brands (name)
            )
          `)
          .eq('creator_id', creatorData.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const formatted = data
            .filter((app: any) => app.campaigns)
            .map((app: any) => ({
              id: app.campaigns.id,
              applicationId: app.id,
              brandName: app.campaigns.brands?.name || 'Brand',
              title: app.campaigns.title || 'Campaign',
              description: app.campaigns.description || '',
              budget: app.campaigns.budget || app.campaigns.total_budget,
              niche: app.campaigns.niche || app.campaigns.niches,
              type: app.campaigns.type || 'paid',
              status: app.status || 'pending',
              createdAt: app.campaigns.created_at,
              deadline: app.campaigns.deadline,
            }));
          setAllCampaigns(formatted);
        } else {
          setAllCampaigns([]);
        }
      } else {
        // Brand: fetch their own campaigns
        const { data: brandData } = await supabase
          .from('brands')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (brandData?.id) {
          const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('brand_id', brandData.id)
            .order('created_at', { ascending: false });

          if (data && data.length > 0) {
            const formatted = data.map((item: any) => ({
              id: item.id,
              brandName: 'Your Campaign',
              title: item.title || 'Campaign',
              description: item.description || '',
              budget: item.budget || item.total_budget,
              niche: item.niche || item.niches,
              type: item.type || 'paid',
              status: item.status || 'active',
              createdAt: item.created_at,
              deadline: item.deadline,
            }));
            setAllCampaigns(formatted);
            return;
          }
        }
      }

      // If we reach here, it means we don't have Supabase data or the user is not found.
      // We will fallback to dummy/mock data for demonstration purposes.
      setAllCampaigns([
        {
          id: 'camp_mock_1',
          brandName: 'Mamaearth',
          title: 'Vitamin C serum — summer glow UGC',
          description: 'Micro & mid-tier skincare creators for before/after routines, GRWM hooks, and dermat-safe disclaimers. Prioritize lit-from-within aesthetic.',
          budget: 850000,
          niche: 'Beauty',
          type: 'sponsored_post',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'camp_mock_2',
          brandName: 'boAt',
          title: 'Rockerz ANC — Monsoon campaign',
          description: 'Seeking creators for punchy Reels and Shorts showcasing ANC in commute & gym scenarios. Ship product + hero assets; mandatory #DoWhatFloatsYourboAt.',
          budget: 520000,
          niche: 'Tech',
          type: 'product_review',
          status: 'active',
          createdAt: new Date().toISOString(),
        }
      ]);
      
    } catch (e) {
      console.log('Error fetching campaigns, using fallback data', e);
      setAllCampaigns([
        {
          id: 'camp_mock_1',
          brandName: 'Mamaearth',
          title: 'Vitamin C serum — summer glow UGC',
          description: 'Micro & mid-tier skincare creators for before/after routines, GRWM hooks, and dermat-safe disclaimers. Prioritize lit-from-within aesthetic.',
          budget: 850000,
          niche: 'Beauty',
          type: 'sponsored_post',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'camp_mock_2',
          brandName: 'boAt',
          title: 'Rockerz ANC — Monsoon campaign',
          description: 'Seeking creators for punchy Reels and Shorts showcasing ANC in commute & gym scenarios. Ship product + hero assets; mandatory #DoWhatFloatsYourboAt.',
          budget: 520000,
          niche: 'Tech',
          type: 'product_review',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'camp_mock_3',
          brandName: 'Zomato',
          title: 'Food Festival Promotion',
          description: 'Promote mega food festival featuring cuisines from across India. Showcase favorite food moments and restaurant experiences.',
          budget: 600000,
          niche: 'Food',
          type: 'sponsored_post',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'camp_mock_4',
          brandName: 'Myntra',
          title: 'Fashion Week Collection',
          description: 'Collaborate to showcase latest collection from upcoming fashion week. Create outfit inspiration and styling content.',
          budget: 800000,
          niche: 'Fashion',
          type: 'sponsored_post',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchCampaigns();
      setLoading(false);
    };
    init();
  }, [fetchCampaigns]);

  // Apply filter by status
  useEffect(() => {
    if (activeFilter === 'all') {
      setCampaigns(allCampaigns);
    } else {
      setCampaigns(allCampaigns.filter(c =>
        (c.status || '').toLowerCase() === activeFilter
      ));
    }
  }, [activeFilter, allCampaigns]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCampaigns();
    setRefreshing(false);
  }, [fetchCampaigns]);

  return (
    <Screen scrollable={false}>
      {/* ── Header ── */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerTitle}>Campaigns</Text>
          <Text style={styles.headerSubtitle}>Your brand collaborations</Text>
        </View>
      </View>

      {/* ── Filter Tabs ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
        style={styles.filterContainer}
      >
        {FILTER_TABS.map(tab => (
          <Pressable
            key={tab.value}
            onPress={() => setActiveFilter(tab.value)}
            style={[styles.filterTab, activeFilter === tab.value && styles.filterTabActive]}
          >
            <Text style={[styles.filterTabText, activeFilter === tab.value && styles.filterTabTextActive]}>
              {tab.label}
            </Text>
            {tab.value === 'all' && allCampaigns.length > 0 && (
              <View style={[styles.tabBadge, activeFilter === tab.value && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, activeFilter === tab.value && styles.tabBadgeTextActive]}>
                  {allCampaigns.length}
                </Text>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>

      {/* ── List ── */}
      {loading ? (
        <View>
          {[1, 2, 3].map(i => <SkeletonCard key={i} index={i} />)}
        </View>
      ) : (
        <FlatList
          data={campaigns}
          renderItem={({ item, index }) => <CampaignCard item={item} index={index} router={router} />}
          keyExtractor={(item) => item.id + (item.applicationId || '')}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="briefcase" size={40} color={colors.textMuted} style={{ marginBottom: spacing.md }} />
              <Text style={styles.emptyTitle}>No Campaigns Yet</Text>
              <Text style={styles.emptySubtitle}>
                Apply to campaigns in the Search tab to start collaborating with brands.
              </Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  // ─── all dark ───────────────────────────────────────────────────────────────
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg, marginTop: spacing.sm },
  headerTitle:    { fontSize: 26, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginTop: 2 },
  filterContainer: { marginBottom: spacing.lg },
  filterScroll:    { gap: spacing.sm, paddingRight: spacing.lg },
  filterTab: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: radius.pill, backgroundColor: colors.surfaceElevated,
    borderWidth: 1, borderColor: colors.border, gap: spacing.xs,
  },
  filterTabActive:     { backgroundColor: '#ffffff', borderColor: '#ffffff' },
  filterTabText:       { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterTabTextActive: { color: '#0a0a0a', fontWeight: '700' },
  tabBadge: {
    backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 999,
    width: 18, height: 18, justifyContent: 'center', alignItems: 'center',
  },
  tabBadgeActive:     { backgroundColor: 'rgba(0,0,0,0.20)' },
  tabBadgeText:       { fontSize: 9, fontWeight: '800', color: colors.textSecondary },
  tabBadgeTextActive: { color: '#0a0a0a' },
  listContent: { paddingBottom: spacing.xxxl },
  card: {
    backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1,
    borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md, ...shadows.card,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  brandAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
  },
  brandAvatarText: { color: 'rgba(255,255,255,0.7)', fontWeight: '800', fontSize: 14 },
  brandInfo:  { flex: 1 },
  brandName:  { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  dateText:   { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  statusBadge:{ borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
  campaignTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.xs, lineHeight: 22 },
  description:   { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: spacing.md },
  divider:       { height: 1, backgroundColor: colors.border, marginBottom: spacing.md },
  detailGrid:    { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  detailCell:    { width: '50%', marginBottom: spacing.sm },
  detailLabel:   { fontSize: 10, fontWeight: '600', color: colors.textMuted, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
  detailValue:   { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  actionButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#ffffff', borderRadius: radius.md, paddingVertical: 13,
  },
  actionButtonText: { color: '#0a0a0a', fontSize: 14, fontWeight: '700' },
  secondaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent', borderRadius: radius.md,
    paddingVertical: 13, borderWidth: 1, borderColor: colors.border,
  },
  secondaryButtonText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  pendingNotice: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(251,191,36,0.08)', borderRadius: radius.sm,
    padding: spacing.sm, borderWidth: 1, borderColor: 'rgba(251,191,36,0.25)',
  },
  pendingNoticeText: { color: '#fbbf24', fontSize: 12, fontWeight: '600' },
  skeletonCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.md, height: 180,
  },
  skeletonRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  skeletonAvatar:{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)' },
  skeletonLine:  { height: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 6 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxxl },
  emptyTitle:     { color: colors.textPrimary, fontSize: typography.subtitle, fontWeight: '800', marginBottom: spacing.xs },
  emptySubtitle:  { color: colors.textSecondary, fontSize: typography.body, textAlign: 'center', paddingHorizontal: spacing.xl, lineHeight: 22 },
});
