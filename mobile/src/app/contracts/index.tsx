import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography, shadows } from '../../theme/tokens';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  draft:     { bg: 'rgba(255,255,255,0.05)',   text: 'rgba(255,255,255,0.40)', border: 'rgba(255,255,255,0.12)' },
  pending:   { bg: 'rgba(251,191,36,0.10)',    text: '#fbbf24', border: 'rgba(251,191,36,0.30)' },
  sent:      { bg: 'rgba(96,165,250,0.10)',    text: '#60a5fa', border: 'rgba(96,165,250,0.25)' },
  signed:    { bg: 'rgba(74,222,128,0.10)',    text: '#4ade80', border: 'rgba(74,222,128,0.25)' },
  active:    { bg: 'rgba(74,222,128,0.10)',    text: '#4ade80', border: 'rgba(74,222,128,0.25)' },
  completed: { bg: 'rgba(74,222,128,0.10)',    text: '#4ade80', border: 'rgba(74,222,128,0.25)' },
  disputed:  { bg: 'rgba(248,113,113,0.10)',   text: '#f87171', border: 'rgba(248,113,113,0.25)' },
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatAmount(n: number | null | undefined): string {
  if (!n) return '₹TBD';
  return `₹${n.toLocaleString('en-IN')}`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard({ index }: { index: number }) {
  return (
    <MotiView
      from={{ opacity: 0.4 }} animate={{ opacity: 0.8 }}
      transition={{ loop: true, duration: 1500, type: 'timing', delay: index * 100 }}
      style={styles.skeletonCard}
    />
  );
}

// ─── Contract Card ────────────────────────────────────────────────────────────
function ContractCard({ item, index, onPress }: { item: any; index: number; onPress: () => void }) {
  const statusKey = (item.status || 'draft').toLowerCase();
  const statusStyle = STATUS_COLORS[statusKey] || STATUS_COLORS.draft;
  const otherParty = item.otherParty || 'Party';
  const initials = otherParty.slice(0, 2).toUpperCase();

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay: index * 60 }}
    >
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={onPress}
      >
        <View style={styles.cardRow}>
          <View style={styles.initials}>
            <Text style={styles.initialsText}>{initials}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.campaignTitle} numberOfLines={1}>{item.campaignTitle || 'Contract'}</Text>
            <Text style={styles.otherParty}>{otherParty}</Text>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
          <View>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {(item.status || 'DRAFT').toUpperCase()}
              </Text>
            </View>
            {item.amount ? (
              <Text style={styles.amountText}>{formatAmount(item.amount)}</Text>
            ) : null}
          </View>
        </View>

        {/* Progress indicator for pending */}
        {(statusKey === 'pending' || statusKey === 'sent') && (
          <View style={styles.actionHint}>
            <Feather name="edit-3" size={12} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={styles.actionHintText}>Tap to review and sign</Text>
          </View>
        )}
      </Pressable>
    </MotiView>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ContractsScreen() {
  const router = useRouter();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContracts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .or(`creator_id.eq.${user.id},brand_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formatted = data.map((item: any) => {
          const otherName = item.brand_name || item.creator_name || 'Brand/Creator';
          return {
            id: item.id,
            campaignTitle: item.content?.title || item.title || 'Contract',
            otherParty: otherName,
            status: item.status || 'draft',
            amount: item.total_amount || item.amount,
            createdAt: item.created_at,
          };
        });
        setContracts(formatted);
      } else {
        setContracts([]);
      }
    } catch (e) {
      setContracts([]);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchContracts();
      setLoading(false);
    };
    init();
  }, [fetchContracts]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchContracts();
    setRefreshing(false);
  }, [fetchContracts]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable accessibilityLabel="back" onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Contracts</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* ── List ── */}
      {loading ? (
        <View style={styles.content}>
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} index={i} />)}
        </View>
      ) : (
        <FlatList
          data={contracts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          renderItem={({ item, index }) => (
            <ContractCard
              item={item}
              index={index}
              onPress={() => router.push(`/contracts/${item.id}` as any)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="file-text" size={44} color={colors.textMuted} style={{ marginBottom: spacing.md }} />
              <Text style={styles.emptyTitle}>No Contracts Yet</Text>
              <Text style={styles.emptySubtitle}>
                Contracts will appear here once a brand sends you an offer.
              </Text>
            </View>
          }
        />
      )}
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  card: {
    backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, ...shadows.card,
  },
  cardPressed: { backgroundColor: colors.surfaceElevated },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  initials: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.accentLight, justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  initialsText: { color: colors.accent, fontWeight: '800', fontSize: 16 },
  cardInfo: { flex: 1 },
  campaignTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: 2 },
  otherParty: { fontSize: 13, color: colors.textSecondary, fontWeight: '500', marginBottom: 2 },
  dateText: { fontSize: 11, color: colors.textMuted },
  statusBadge: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, alignSelf: 'flex-end' },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
  amountText: { fontSize: 14, fontWeight: '900', color: colors.textPrimary, textAlign: 'right', marginTop: 4 },
  actionHint: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.accentLight, borderRadius: radius.sm,
    padding: spacing.sm, marginTop: spacing.sm,
  },
  actionHintText: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  skeletonCard: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: radius.md,
    height: 80, marginBottom: spacing.md,
  },
  emptyContainer: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: typography.subtitle, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.xs },
  emptySubtitle: {
    color: colors.textSecondary, fontSize: typography.body, textAlign: 'center',
    paddingHorizontal: spacing.xl, lineHeight: 22,
  },
});
