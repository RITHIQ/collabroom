import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '../../theme/tokens';
import { supabase } from '../../lib/supabase';
import { MotiView } from 'moti';

const MILESTONES = [
  { id: 'm1', label: 'Contract Signed', done: true, date: '10 May, 2026' },
  { id: 'm2', label: 'Content Draft Submitted', done: true, date: '20 May, 2026' },
  { id: 'm3', label: 'Brand Approval', done: false, date: '25 May, 2026' },
  { id: 'm4', label: 'Payment Released', done: false, date: '01 Jun, 2026' },
];

export default function CampaignRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'milestones'>('content');
  const [status, setStatus] = useState<'in_review' | 'changes_requested' | 'approved'>('in_review');

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await supabase.from('campaigns').select('title, description, budget, type, brands(name)').eq('id', id).maybeSingle();
        setCampaign(data || {
          title: 'Campaign Room',
          description: 'Deliverables and milestones tracking.',
          budget: 0,
          brands: { name: 'Brand Name' }
        });
      } catch {
        setCampaign({ title: 'Campaign Room', description: 'Deliverables and milestones tracking.', brands: { name: 'Brand Name' } });
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{campaign?.title || 'Collab Room'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Campaign Info */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={styles.brandText}>{campaign?.brands?.name || 'Brand'}</Text>
          <Text style={styles.titleText}>{campaign?.title}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <Pressable onPress={() => setActiveTab('content')} style={[styles.tab, activeTab === 'content' && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === 'content' && styles.tabTextActive]}>Content Review</Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab('milestones')} style={[styles.tab, activeTab === 'milestones' && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === 'milestones' && styles.tabTextActive]}>Milestones</Text>
          </Pressable>
        </View>

        {/* Content Review Tab */}
        {activeTab === 'content' && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 300 }}>
            {/* Status Bar */}
            <View style={styles.statusBar}>
              <View style={[styles.statusBadge, status === 'approved' ? { backgroundColor: colors.success } : status === 'changes_requested' ? { backgroundColor: colors.danger } : { backgroundColor: colors.warning }]}>
                <Text style={styles.statusBadgeText}>
                  {status === 'approved' ? 'Approved ✓' : status === 'changes_requested' ? 'Changes Requested' : 'In Review'}
                </Text>
              </View>
              <Text style={styles.versionText}>Version 2 · Submitted May 20</Text>
            </View>

            {/* Video Draft */}
            <View style={styles.draftCard}>
              <View style={styles.draftHeader}>
                <Feather name="file-text" size={16} color={colors.accent} style={{ marginRight: spacing.sm }} />
                <Text style={styles.draftTitle}>Video Review Draft</Text>
              </View>
              <View style={styles.draftPreview}>
                <View style={styles.draftPlayBtn}>
                  <Text style={{ fontSize: 32 }}>🎬</Text>
                </View>
                <Text style={styles.draftPreviewText}>Video preview — tap to review</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <Pressable style={styles.actionBtnOutline} onPress={() => { setStatus('changes_requested'); Alert.alert('Changes Requested', 'Notification sent to creator.'); }}>
                <Text style={styles.actionBtnOutlineText}>Request Changes</Text>
              </Pressable>
              <Pressable style={styles.actionBtnSolid} onPress={() => { setStatus('approved'); Alert.alert('Approved!', 'Content approved. Payment releasing.'); }}>
                <Feather name="check-circle" size={16} color="#fff" style={{ marginRight: spacing.xs }} />
                <Text style={styles.actionBtnSolidText}>Approve</Text>
              </Pressable>
            </View>

            {/* Upload New */}
            <Pressable style={styles.uploadArea}>
              <Feather name="upload" size={24} color={colors.textMuted} style={{ marginBottom: spacing.sm }} />
              <Text style={styles.uploadTitle}>Submit new version</Text>
              <Text style={styles.uploadSub}>Images or videos up to 50MB</Text>
            </Pressable>
          </MotiView>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 300 }}>
            {MILESTONES.map((m, i) => (
              <MotiView
                key={m.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: i * 100 }}
                style={styles.milestoneCard}
              >
                <View style={[styles.checkCircle, m.done && styles.checkCircleDone]}>
                  {m.done ? <Feather name="check" size={14} color="#ffffff" /> : <View style={styles.pendingDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.milestoneText, m.done && styles.milestoneTextDone]}>{m.label}</Text>
                  <Text style={styles.milestoneDate}>Due: {m.date}</Text>
                </View>
              </MotiView>
            ))}
          </MotiView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 36, justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  content: { padding: spacing.lg },
  brandText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  titleText: { fontSize: 22, fontWeight: '900', color: colors.textPrimary, lineHeight: 28 },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.xl },
  tab: { paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.accent },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.accent, fontWeight: '800' },
  
  // Content Tab
  statusBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  statusBadgeText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  versionText: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  draftCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, marginBottom: spacing.lg, overflow: 'hidden' },
  draftHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  draftTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  draftPreview: { padding: spacing.xxxl, alignItems: 'center', backgroundColor: colors.background },
  draftPlayBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accentLight, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  draftPreviewText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  actionsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  actionBtnOutline: { flex: 1, borderWidth: 1, borderColor: colors.border, paddingVertical: 14, borderRadius: radius.pill, alignItems: 'center' },
  actionBtnOutlineText: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  actionBtnSolid: { flex: 1, backgroundColor: colors.success, paddingVertical: 14, borderRadius: radius.pill, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  actionBtnSolidText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  uploadArea: { borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', borderRadius: radius.md, padding: spacing.xl, alignItems: 'center' },
  uploadTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  uploadSub: { fontSize: 12, color: colors.textMuted },
  
  // Milestones Tab
  milestoneCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  checkCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceMuted, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  checkCircleDone: { backgroundColor: colors.success },
  pendingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.borderInput },
  milestoneText: { fontSize: 15, fontWeight: '700', color: colors.textSecondary, marginBottom: 4 },
  milestoneTextDone: { color: colors.textPrimary },
  milestoneDate: { fontSize: 12, color: colors.textMuted },
});
