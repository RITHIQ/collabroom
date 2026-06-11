import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList, Pressable, TextInput,
  ActivityIndicator, RefreshControl, Alert, Modal, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MotiView } from 'moti';
import { Screen } from '../../components/ui/Screen';
import { colors, spacing, radius, typography, shadows } from '../../theme/tokens';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

// ─── Status filter options (matches web exactly) ──────────────────────────────
const STATUS_FILTERS = [
  { label: 'All',         value: 'all' },
  { label: 'Active',      value: 'active' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed',   value: 'completed' },
  { label: 'Draft',       value: 'draft' },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard({ index }: { index: number }) {
  return (
    <MotiView
      from={{ opacity: 0.2 }}
      animate={{ opacity: 0.5 }}
      transition={{ loop: true, duration: 1200, type: 'timing', delay: index * 100, repeatReverse: true }}
      style={styles.skeletonCard}
    >
      <View style={styles.skeletonRow}>
        <View style={styles.skeletonAvatar} />
        <View style={{ flex: 1, gap: 8 }}>
          <View style={[styles.skeletonLine, { width: '65%' }]} />
          <View style={[styles.skeletonLine, { width: '40%' }]} />
        </View>
      </View>
      <View style={[styles.skeletonLine, { width: '90%', marginTop: 12 }]} />
      <View style={[styles.skeletonLine, { width: '70%', marginTop: 8 }]} />
    </MotiView>
  );
}

// ─── Campaign Card ────────────────────────────────────────────────────────────
function CampaignCard({
  item, index, submittedIds, onApply, onViewDetails,
}: {
  item: any; index: number; submittedIds: string[];
  onApply: (item: any) => void; onViewDetails: (item: any) => void;
}) {
  const isSubmitted = submittedIds.includes(item.id);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 350, delay: index * 50 }}
      style={styles.card}
    >
      {/* Brand row */}
      <View style={styles.cardHeader}>
        <View style={styles.brandAvatar}>
          <Text style={styles.brandAvatarText}>
            {(item.brandName || 'BR').slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.brandInfo}>
          <Text style={styles.brandName}>{item.brandName}</Text>
          <View style={styles.reviewingRow}>
            <View style={styles.reviewingDot} />
            <Text style={styles.reviewingText}>Actively reviewing</Text>
          </View>
        </View>
        {item.niche && (
          <View style={styles.nicheBadge}>
            <Text style={styles.nicheBadgeText}>
              {Array.isArray(item.niche) ? item.niche[0] : item.niche}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.campaignTitle}>{item.title}</Text>
      <Text style={styles.description} numberOfLines={3}>{item.description}</Text>

      <View style={styles.detailRow}>
        <View>
          <Text style={styles.budgetLabel}>Campaign Budget</Text>
          <Text style={styles.budgetValue}>
            {item.budget ? `₹${item.budget.toLocaleString('en-IN')}` : '₹TBD'}
          </Text>
        </View>
        <Text style={styles.applicantsText}>{item.applicantCount || 0}+ applied</Text>
      </View>

      <View style={styles.cardActionsRow}>
        <Pressable
          style={({ pressed }) => [styles.viewButton, pressed && styles.viewButtonPressed]}
          onPress={() => onViewDetails(item)}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.applyButton,
            isSubmitted && styles.applyButtonSubmitted,
            pressed && !isSubmitted && styles.applyButtonPressed,
          ]}
          onPress={() => !isSubmitted && onApply(item)}
          disabled={isSubmitted}
        >
          <Text style={styles.applyButtonText}>
            {isSubmitted ? '✓ Applied' : 'Apply Now'}
          </Text>
        </Pressable>
      </View>
    </MotiView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DiscoverScreen() {
  const [campaigns, setCampaigns]       = useState<any[]>([]);
  const [filtered, setFiltered]         = useState<any[]>([]);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [submittedIds, setSubmittedIds] = useState<string[]>([]);
  const [creatorId, setCreatorId]       = useState<string | null>(null);
  const [creatorNiches, setCreatorNiches] = useState<string[]>([]);

  // Cover letter modal
  const [applyTarget, setApplyTarget]   = useState<any | null>(null);
  const [coverLetter, setCoverLetter]   = useState('');
  const [applying, setApplying]         = useState(false);

  // Detail modal
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);

  const loadCreatorInfo = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('creators')
        .select('id,niches').eq('user_id', user.id).maybeSingle();
      if (data) {
        setCreatorId(data.id);
        setCreatorNiches(data.niches || []);
        const { data: apps } = await supabase
          .from('campaign_applications').select('campaign_id').eq('creator_id', data.id);
        if (apps) setSubmittedIds(apps.map((a: any) => a.campaign_id));
      }
    } catch (e) { /* ignore */ }
  }, []);

  const fetchCampaigns = useCallback(async (q?: string) => {
    try {
      let query = supabase
        .from('campaigns')
        .select('*, brands(name)')
        .order('created_at', { ascending: false })
        .limit(40);
      if (q?.trim()) query = query.ilike('title', `%${q.trim()}%`);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const formatted = data.map((item: any) => ({
          id: item.id,
          brandName: item.brands?.name || 'Brand',
          title: item.title || 'Campaign',
          description: item.description || '',
          budget: item.budget || item.total_budget,
          deliverables: Array.isArray(item.deliverables) ? item.deliverables.join(' · ') : item.deliverables,
          niche: item.niche || item.niches || ['Lifestyle'],
          applicantCount: item.applicant_count || 0,
          status: item.status || 'active',
        }));
        setCampaigns(formatted);
      } else {
        setCampaigns([]);
      }
    } catch (e) { setCampaigns([]); }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadCreatorInfo(), fetchCampaigns()]);
      setLoading(false);
    })();
  }, [loadCreatorInfo, fetchCampaigns]);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => { if (!loading) fetchCampaigns(search); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Filter by status
  useEffect(() => {
    if (statusFilter === 'all') { setFiltered(campaigns); return; }
    setFiltered(campaigns.filter(c => c.status === statusFilter));
  }, [campaigns, statusFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadCreatorInfo(), fetchCampaigns(search)]);
    setRefreshing(false);
  }, [loadCreatorInfo, fetchCampaigns, search]);

  // Open apply modal (with cover letter)
  const handleApplyPress = (item: any) => {
    if (!creatorId) {
      Alert.alert('Profile Incomplete', 'Complete your creator profile to apply.');
      return;
    }
    setApplyTarget(item);
    setCoverLetter('');
  };

  // Submit application with cover letter
  const submitApplication = async () => {
    if (!creatorId || !applyTarget) return;
    if (!coverLetter.trim()) {
      Alert.alert('Cover Letter Required', 'Please write a cover letter before submitting.');
      return;
    }
    setApplying(true);
    try {
      await supabase.from('campaign_applications').insert({
        campaign_id: applyTarget.id,
        creator_id: creatorId,
        status: 'pending',
        cover_letter: coverLetter,
      });
      setSubmittedIds(prev => [...prev, applyTarget.id]);
      setApplyTarget(null);
      setCoverLetter('');
      Alert.alert('✅ Applied!', 'Your application has been submitted. The brand will review your profile.');
    } catch (e) {
      Alert.alert('Error', 'Could not submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <Screen scrollable={false}>
      {/* ── Header ── */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>Browse brand campaigns</Text>
        </View>
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchBar}>
        <Feather name="search" size={15} color={colors.textMuted} style={{ marginRight: spacing.sm }} />
        <TextInput
          placeholder="Search campaigns by brand or keyword…"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Feather name="x" size={15} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* ── Status Filter Chips (matches web) ── */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
        style={styles.filterContainer}
      >
        {STATUS_FILTERS.map(f => (
          <Pressable
            key={f.value}
            onPress={() => setStatusFilter(f.value)}
            style={[styles.filterChip, statusFilter === f.value && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, statusFilter === f.value && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* ── List ── */}
      {loading ? (
        <View>
          {[0, 1, 2].map(i => <SkeletonCard key={i} index={i} />)}
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={({ item, index }) => (
            <CampaignCard
              item={item} index={index}
              submittedIds={submittedIds}
              onApply={handleApplyPress}
              onViewDetails={setSelectedCampaign}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing} onRefresh={onRefresh}
              tintColor="rgba(255,255,255,0.3)"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="search" size={36} color="rgba(255,255,255,0.12)" style={{ marginBottom: spacing.md }} />
              <Text style={styles.emptyTitle}>No Campaigns Found</Text>
              <Text style={styles.emptySubtitle}>
                {search ? 'Try a different keyword.' : 'No campaigns live right now.'}
              </Text>
            </View>
          }
        />
      )}

      {/* ── Cover Letter Modal ── */}
      <Modal
        visible={!!applyTarget}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setApplyTarget(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalKAV}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Apply to Campaign</Text>
              <Pressable onPress={() => setApplyTarget(null)} style={styles.modalCloseBtn}>
                <Feather name="x" size={22} color={colors.textPrimary} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Campaign summary */}
              <View style={styles.applyCampaignBox}>
                <Text style={styles.applyCampaignTitle}>{applyTarget?.title}</Text>
                {applyTarget?.brandName && (
                  <Text style={styles.applyCampaignBrand}>by {applyTarget.brandName}</Text>
                )}
              </View>

              {/* Cover Letter */}
              <Text style={styles.coverLetterLabel}>Cover Letter *</Text>
              <TextInput
                value={coverLetter}
                onChangeText={setCoverLetter}
                placeholder="Tell the brand why you're a great fit — your audience, content style, relevant experience…"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={6}
                style={styles.coverLetterInput}
                textAlignVertical="top"
              />
              <Text style={styles.coverLetterHint}>
                Your profile stats will be automatically shared with the brand.
              </Text>

              {/* Actions */}
              <View style={styles.modalActions}>
                <Pressable
                  style={({ pressed }) => [styles.submitBtn, pressed && styles.submitBtnPressed]}
                  onPress={submitApplication}
                  disabled={applying}
                >
                  {applying
                    ? <ActivityIndicator color="#0a0a0a" size="small" />
                    : (
                      <View style={styles.submitBtnInner}>
                        <Feather name="arrow-right" size={15} color="#0a0a0a" />
                        <Text style={styles.submitBtnText}>Submit Application</Text>
                      </View>
                    )
                  }
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.cancelBtn, pressed && styles.cancelBtnPressed]}
                  onPress={() => setApplyTarget(null)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Campaign Details Modal ── */}
      <Modal
        visible={!!selectedCampaign}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedCampaign(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>Campaign Details</Text>
            <Pressable onPress={() => setSelectedCampaign(null)} style={styles.modalCloseBtn}>
              <Feather name="x" size={22} color={colors.textPrimary} />
            </Pressable>
          </View>
          {selectedCampaign && (
            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.detailBrand}>{selectedCampaign.brandName}</Text>
              <Text style={styles.detailTitle}>{selectedCampaign.title}</Text>

              <Text style={styles.detailSectionTitle}>Description</Text>
              <Text style={styles.detailDescription}>{selectedCampaign.description}</Text>

              <View style={styles.detailStatsRow}>
                <View style={styles.detailStatBox}>
                  <Text style={styles.detailStatLabel}>Budget</Text>
                  <Text style={styles.detailStatValue}>
                    {selectedCampaign.budget ? `₹${selectedCampaign.budget.toLocaleString('en-IN')}` : '₹TBD'}
                  </Text>
                </View>
                <View style={styles.detailStatBox}>
                  <Text style={styles.detailStatLabel}>Applicants</Text>
                  <Text style={styles.detailStatValue}>{selectedCampaign.applicantCount || 0}+</Text>
                </View>
              </View>

              {selectedCampaign.deliverables && (
                <>
                  <Text style={styles.detailSectionTitle}>Deliverables</Text>
                  <Text style={styles.detailDescription}>{selectedCampaign.deliverables}</Text>
                </>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.submitBtn,
                  submittedIds.includes(selectedCampaign.id) && styles.submitBtnSubmitted,
                  pressed && !submittedIds.includes(selectedCampaign.id) && styles.submitBtnPressed,
                  { marginTop: spacing.xl }
                ]}
                onPress={() => {
                  if (!submittedIds.includes(selectedCampaign.id)) {
                    setSelectedCampaign(null);
                    setTimeout(() => handleApplyPress(selectedCampaign), 300);
                  }
                }}
                disabled={submittedIds.includes(selectedCampaign.id)}
              >
                <Text style={styles.submitBtnText}>
                  {submittedIds.includes(selectedCampaign.id) ? '✓ Interest Submitted' : 'Apply Now'}
                </Text>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg, marginTop: spacing.sm },
  headerTitle:    { fontSize: 26, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderColor: colors.borderInput,
    borderWidth: 1, borderRadius: radius.md,
    paddingHorizontal: spacing.md, height: 46, marginBottom: spacing.md,
  },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: typography.body },

  // Filter chips
  filterContainer: { marginBottom: spacing.md },
  filterScroll:    { gap: spacing.sm, paddingRight: spacing.lg },
  filterChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.pill, backgroundColor: colors.surfaceElevated,
    borderWidth: 1, borderColor: colors.border,
  },
  filterChipActive:     { backgroundColor: '#ffffff', borderColor: '#ffffff' },
  filterChipText:       { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterChipTextActive: { color: '#0a0a0a', fontWeight: '700' },

  // Cards
  listContent: { paddingBottom: spacing.xxxl },
  card: {
    backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1,
    borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md, ...shadows.card,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  brandAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
  },
  brandAvatarText: { fontWeight: '800', fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  brandInfo:       { flex: 1 },
  brandName:       { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  reviewingRow:    { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  reviewingDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80', marginRight: 5 },
  reviewingText:   { fontSize: 11, color: '#4ade80', fontWeight: '600' },
  nicheBadge: {
    borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: colors.border,
  },
  nicheBadgeText: { fontSize: 10, fontWeight: '700', color: colors.textSecondary },
  campaignTitle:  { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.xs, lineHeight: 22 },
  description:    { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: spacing.md },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, marginBottom: spacing.md,
  },
  budgetLabel:    { fontSize: 10, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  budgetValue:    { fontSize: 17, fontWeight: '900', color: colors.textPrimary, marginTop: 2 },
  applicantsText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  cardActionsRow: { flexDirection: 'row', gap: spacing.sm },
  viewButton: {
    flex: 1, backgroundColor: colors.surfaceElevated, borderRadius: radius.md,
    paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  viewButtonPressed: { backgroundColor: 'rgba(255,255,255,0.08)' },
  viewButtonText:    { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
  applyButton: {
    flex: 1, backgroundColor: '#ffffff', borderRadius: radius.md,
    paddingVertical: 11, alignItems: 'center',
  },
  applyButtonPressed:   { backgroundColor: 'rgba(255,255,255,0.85)' },
  applyButtonSubmitted: { backgroundColor: 'rgba(74,222,128,0.12)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)' },
  applyButtonText:      { color: '#0a0a0a', fontSize: 13, fontWeight: '700' },

  // Skeleton
  skeletonCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.md, height: 180,
  },
  skeletonRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  skeletonAvatar:{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)' },
  skeletonLine:  { height: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 6 },

  // Empty
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle:     { color: colors.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: spacing.xs },
  emptySubtitle:  { color: colors.textSecondary, fontSize: 13, textAlign: 'center', paddingHorizontal: spacing.xl },

  // Modals
  modalKAV:       { flex: 1 },
  modalContainer: { flex: 1, backgroundColor: '#0f0f0f' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  modalHeaderTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  modalCloseBtn:    { padding: 4 },
  modalContent:     { padding: spacing.lg, paddingBottom: 60 },

  // Apply modal
  applyCampaignBox: {
    backgroundColor: colors.surfaceElevated, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.lg,
  },
  applyCampaignTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  applyCampaignBrand: { fontSize: 12, color: colors.textSecondary, marginTop: 3 },
  coverLetterLabel:   { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.45)', letterSpacing: 0.8, marginBottom: 8 },
  coverLetterInput: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderInput,
    borderRadius: radius.md, color: colors.textPrimary, fontSize: 14,
    padding: spacing.md, minHeight: 140,
  },
  coverLetterHint: { fontSize: 11, color: colors.textMuted, marginTop: 8, marginBottom: spacing.xl },
  modalActions:    { gap: spacing.md },
  submitBtn: {
    backgroundColor: '#ffffff', borderRadius: radius.md, height: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  submitBtnPressed:   { backgroundColor: 'rgba(255,255,255,0.85)' },
  submitBtnSubmitted: { backgroundColor: 'rgba(74,222,128,0.12)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)' },
  submitBtnInner:     { flexDirection: 'row', alignItems: 'center', gap: 7 },
  submitBtnText:      { fontSize: 15, fontWeight: '700', color: '#0a0a0a' },
  cancelBtn: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    height: 48, alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnPressed: { backgroundColor: colors.surfaceElevated },
  cancelBtnText:    { fontSize: 15, fontWeight: '600', color: colors.textSecondary },

  // Detail modal
  detailBrand:        { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '700', marginBottom: 4 },
  detailTitle:        { fontSize: 22, fontWeight: '900', color: colors.textPrimary, marginBottom: spacing.lg, lineHeight: 28 },
  detailSectionTitle: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.md, marginBottom: spacing.sm },
  detailDescription:  { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.lg },
  detailStatsRow:     { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  detailStatBox: {
    flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.sm, padding: spacing.md,
  },
  detailStatLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  detailStatValue: { fontSize: 18, fontWeight: '900', color: colors.textPrimary },
});
