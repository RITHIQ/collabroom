import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView,
  Pressable, RefreshControl, ActivityIndicator, Switch,
} from 'react-native';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { colors, spacing, radius, shadows } from '../../theme/tokens';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon, index, color = '#ffffff',
}: {
  label: string; value: string; icon: string; index: number; color?: string;
}) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', delay: index * 100 }}
      style={[styles.statCard, { borderColor: color + '30' }]}
    >
      <View style={[styles.statIconBg, { backgroundColor: color + '15' }]}>
        <Feather name={icon as any} size={16} color={color} />
      </View>
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </MotiView>
  );
}

// ─── Quick Action Button ──────────────────────────────────────────────────────
function ActionBtn({
  icon, label, accent, onPress, testID, accessibilityLabel
}: {
  icon: string; label: string; accent: string; onPress: () => void; testID?: string; accessibilityLabel?: string;
}) {
  return (
    <Pressable
      testID={testID || label}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
      onPress={onPress}
    >
      <View style={[styles.actionIconBg, { backgroundColor: accent + '18' }]}>
        <Feather name={icon as any} size={20} color={accent} />
      </View>
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);

  // User info
  const [userName, setUserName]       = useState('');
  const [isBrand, setIsBrand]         = useState(false);

  // Creator stats
  const [walletBalance, setWalletBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [activeCampaigns, setActiveCampaigns] = useState<number | string>('—');
  const [creatorScore, setCreatorScore]   = useState<number | string>('—');
  const [deliveryRate, setDeliveryRate]   = useState('—');
  const [brandScore, setBrandScore]       = useState<number | string>('—');
  const [campaigns, setCampaigns]         = useState<any[]>([]);
  const [workModeOn, setWorkModeOn]       = useState(true);
  const [creatorId, setCreatorId]         = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setUserName('Guest'); return; }

      setUserName(user.email?.split('@')[0] || 'User');

      // ── Wallet
      const { data: wallet } = await supabase
        .from('wallets').select('available_balance,pending_balance')
        .eq('user_id', user.id).maybeSingle();
      if (wallet) {
        setWalletBalance(wallet.available_balance || 0);
        setPendingBalance(wallet.pending_balance || 0);
      }

      // ── Creator branch
      const { data: creator } = await supabase
        .from('creators')
        .select('id,creator_score,on_time_delivery_rate,availability')
        .eq('user_id', user.id).maybeSingle();

      if (creator?.id) {
        setIsBrand(false);
        setCreatorId(creator.id);
        setCreatorScore(creator.creator_score || 85);
        setDeliveryRate(`${creator.on_time_delivery_rate || 98}%`);
        // Work mode: 'Currently unavailable' means OFF, everything else is ON
        setWorkModeOn((creator.availability || '') !== 'Currently unavailable');

        const { count } = await supabase
          .from('campaign_applications')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', creator.id).eq('status', 'approved');
        setActiveCampaigns(count || 0);

        const { data: apps } = await supabase
          .from('campaign_applications')
          .select('campaigns(id,title,budget,brands(name))')
          .eq('creator_id', creator.id).eq('status', 'approved').limit(3);
        if (apps) {
          setCampaigns(
            apps.filter((a: any) => a.campaigns).map((a: any) => ({
              id: a.campaigns.id,
              title: a.campaigns.title,
              budget: a.campaigns.budget,
              brandName: a.campaigns.brands?.name || 'Brand',
            }))
          );
        }
        return;
      }

      // ── Brand branch
      const { data: brand } = await supabase
        .from('brands').select('id,brand_score')
        .eq('user_id', user.id).maybeSingle();

      if (brand?.id) {
        setIsBrand(true);
        setBrandScore(brand.brand_score || 50);

        const { count } = await supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true })
          .eq('brand_user_id', user.id).eq('status', 'active');
        setActiveCampaigns(count || 0);

        const { data: cams } = await supabase
          .from('campaigns')
          .select('id,title,budget,status')
          .eq('brand_user_id', user.id)
          .order('created_at', { ascending: false }).limit(3);
        if (cams) {
          setCampaigns(cams.map((c: any) => ({
            id: c.id, title: c.title, budget: c.budget, brandName: 'My Campaign',
          })));
        }
      }
    } catch (e) {
      console.log('Dashboard fetch error', e);
    }
  }, []);

  // Toggle work mode — writes availability to creators table
  const handleToggleWorkMode = useCallback(async (value: boolean) => {
    setWorkModeOn(value);
    if (!creatorId) return;
    await supabase.from('creators').update({
      availability: value ? 'Immediately' : 'Currently unavailable',
    }).eq('id', creatorId);
  }, [creatorId]);

  useEffect(() => {
    (async () => { setLoading(true); await fetchData(); setLoading(false); })();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true); await fetchData(); setRefreshing(false);
  }, [fetchData]);

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Role-aware stats
  const stats = isBrand
    ? [
        { label: 'Active Campaigns', value: String(activeCampaigns), icon: 'briefcase', color: '#ffffff' },
        { label: 'Wallet Balance',   value: fmt(walletBalance),       icon: 'dollar-sign', color: '#4ade80' },
        { label: 'Pending Payout',   value: fmt(pendingBalance),       icon: 'clock', color: '#fbbf24' },
        { label: 'BrandScore',       value: String(brandScore),        icon: 'star', color: '#60a5fa' },
      ]
    : [
        { label: 'Wallet Balance',   value: fmt(walletBalance),       icon: 'dollar-sign', color: '#4ade80' },
        { label: 'Active Campaigns', value: String(activeCampaigns), icon: 'briefcase', color: '#60a5fa' },
        { label: 'CreatorScore',     value: String(creatorScore),     icon: 'star', color: '#fbbf24' },
        { label: 'Delivery Rate',    value: deliveryRate,             icon: 'check-circle', color: '#a78bfa' },
      ];

  // Role-aware quick actions
  const actions = isBrand
    ? [
        { icon: 'users',       label: 'Find Creators', accent: '#ffffff', onPress: () => router.push('/(tabs)/discover' as any) },
        { icon: 'plus-circle', label: 'New Campaign',  accent: '#4ade80', onPress: () => router.push('/(tabs)/campaigns' as any) },
        { icon: 'message-square', label: 'Inbox',      accent: '#60a5fa', onPress: () => router.push('/(tabs)/messages' as any), accessibilityLabel: 'View Inbox' },
        { icon: 'zap',         label: 'AI Brief',      accent: '#fbbf24', onPress: () => router.push('/(tabs)/ai-brief' as any) },
      ]
    : [
        { icon: 'search',      label: 'Find Work',     accent: '#ffffff', onPress: () => router.push('/(tabs)/discover' as any), accessibilityLabel: 'Find Work' },
        { icon: 'message-square', label: 'Inbox',      accent: '#4ade80', onPress: () => router.push('/(tabs)/messages' as any), accessibilityLabel: 'View Inbox' },
        { icon: 'file-text',   label: 'Contracts',     accent: '#60a5fa', onPress: () => router.push('/contracts' as any) },
        { icon: 'zap',         label: 'Colab AI',      accent: '#fbbf24', onPress: () => router.push('/(tabs)/ai-brief' as any) },
      ];

  if (loading) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="rgba(255,255,255,0.4)" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="rgba(255,255,255,0.4)"
          />
        }
      >
        {/* ── Header ── */}
        <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.name}>{userName} 👋</Text>
            </View>
            <Pressable accessibilityLabel="notifications" onPress={() => router.push('/notifications' as any)}>
              <Feather name="bell" size={24} color={colors.textPrimary} />
            </Pressable>
          </View>
          <Text style={styles.subtitle}>
            {isBrand ? 'Your brand dashboard' : 'Your creator dashboard'}
          </Text>
        </MotiView>

        {/* ── Work Mode Banner (creator only) ── */}
        {!isBrand && (
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 150 }}
            style={[styles.workModeBanner, !workModeOn && styles.workModeBannerOff]}
          >
            <View style={styles.workModeLeft}>
              <Text testID="Work Mode" style={styles.workModeTitle}>Work Mode</Text>
              <Text style={styles.workModeSub}>
                {workModeOn ? 'Visible to brands — you are accepting work' : 'Hidden from brands — unavailable'}
              </Text>
            </View>
            <Switch
              accessibilityLabel="Work Mode"
              value={workModeOn}
              onValueChange={handleToggleWorkMode}
              trackColor={{ false: 'rgba(255,255,255,0.10)', true: 'rgba(74,222,128,0.35)' }}
              thumbColor={workModeOn ? '#4ade80' : 'rgba(255,255,255,0.35)'}
              ios_backgroundColor="rgba(255,255,255,0.10)"
            />
          </MotiView>
        )}

        {/* ── Stats Grid ── */}
        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <StatCard key={s.label} index={i} {...s} />
          ))}
        </View>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionRow}>
          {actions.map((a) => (
            <ActionBtn key={a.label} {...a} />
          ))}
        </View>

        {/* ── Recent Campaigns ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {isBrand ? 'Recent Campaigns' : 'Active Campaigns'}
          </Text>
          <Pressable onPress={() => router.push('/(tabs)/campaigns' as any)}>
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        </View>

        {campaigns.length > 0 ? (
          campaigns.map((c, i) => (
            <MotiView
              key={c.id}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 300 + i * 80 }}
            >
              <Pressable
                style={({ pressed }) => [styles.campaignCard, pressed && styles.campaignCardPressed]}
                onPress={() => router.push(`/campaigns/${c.id}` as any)}
              >
                <View style={styles.campaignIcon}>
                  <Text style={styles.campaignIconText}>
                    {c.brandName.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.campaignInfo}>
                  <Text style={styles.campaignTitle} numberOfLines={1}>{c.title}</Text>
                  <Text style={styles.campaignBrand}>{c.brandName}</Text>
                </View>
                <View style={styles.campaignBudget}>
                  <Text style={styles.campaignBudgetText}>
                    ₹{((c.budget || 0) / 100000).toFixed(1)}L
                  </Text>
                  <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.25)" />
                </View>
              </Pressable>
            </MotiView>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Feather name="inbox" size={28} color="rgba(255,255,255,0.15)" style={{ marginBottom: spacing.sm }} />
            <Text style={styles.emptyText}>
              {isBrand ? 'No campaigns yet' : 'No active campaigns'}
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/discover' as any)}>
              <Text style={styles.emptyLink}>
                {isBrand ? 'Create a campaign' : 'Browse the marketplace'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* ── Wallet Snapshot (creator only) ── */}
        {!isBrand && walletBalance >= 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 500 }}
            style={styles.walletCard}
          >
            <View style={styles.walletHeader}>
              <Feather name="dollar-sign" size={14} color="#4ade80" />
              <Text style={styles.walletTitle}>Wallet Overview</Text>
            </View>
            <Text style={styles.walletBalance}>{fmt(walletBalance)}</Text>
            <Text style={styles.walletSub}>Available to withdraw</Text>
            <View style={styles.walletRow}>
              <View style={styles.walletStat}>
                <Text style={styles.walletStatLabel}>Pending</Text>
                <Text style={styles.walletStatValue}>{fmt(pendingBalance)}</Text>
              </View>
              <View style={styles.walletStat}>
                <Text style={styles.walletStatLabel}>Total Earned</Text>
                <Text style={styles.walletStatValue}>{fmt(walletBalance + pendingBalance)}</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.walletBtn, pressed && styles.walletBtnPressed]}
              onPress={() => router.push('/wallet' as any)}
            >
              <Text style={styles.walletBtnText}>Manage Wallet</Text>
              <Feather name="arrow-right" size={13} color="rgba(255,255,255,0.6)" />
            </Pressable>
          </MotiView>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: spacing.xl },

  // Header
  greeting:  { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  name:      { fontSize: 28, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5, marginTop: -2 },
  subtitle:  { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },

  // Work mode banner
  workModeBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(74,222,128,0.06)',
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.18)',
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.xl,
  },
  workModeBannerOff: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  workModeLeft: {},
  workModeTitle: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  workModeSub:   { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  workModeStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' },
  workModeStatusText: { fontSize: 12, color: '#4ade80', fontWeight: '700' },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  statCard: {
    width: '47%', backgroundColor: colors.surface, padding: spacing.lg,
    borderRadius: radius.md, borderWidth: 1, ...shadows.card,
  },
  statIconBg: {
    width: 32, height: 32, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
  },
  statValue: { fontSize: 20, fontWeight: '900', color: colors.textPrimary, marginBottom: 2 },
  statLabel: { fontSize: 10, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.3 },

  // Section
  sectionTitle:    { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.md },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  seeAll:          { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: spacing.md },

  // Quick actions
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  actionBtn: {
    flex: 1, backgroundColor: colors.surface, paddingVertical: spacing.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', ...shadows.card,
  },
  actionBtnPressed: { backgroundColor: colors.surfaceElevated },
  actionIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  actionText: { fontSize: 10, fontWeight: '700', color: colors.textSecondary },

  // Campaign rows
  campaignCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    padding: spacing.md, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.border, marginBottom: spacing.md, ...shadows.card,
  },
  campaignCardPressed: { backgroundColor: colors.surfaceElevated },
  campaignIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
  },
  campaignIconText:  { fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.6)' },
  campaignInfo:      { flex: 1 },
  campaignTitle:     { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  campaignBrand:     { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  campaignBudget:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  campaignBudgetText:{ fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.55)' },

  // Empty
  emptyCard: {
    alignItems: 'center', padding: spacing.xxxl, backgroundColor: colors.surface,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
  },
  emptyText: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  emptyLink: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '700', marginTop: spacing.xs },

  // Wallet snapshot
  walletCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.border, padding: spacing.lg, marginTop: spacing.xl, ...shadows.card,
  },
  walletHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  walletTitle:  { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  walletBalance:{ fontSize: 28, fontWeight: '900', color: colors.textPrimary, letterSpacing: -1 },
  walletSub:    { fontSize: 12, color: colors.textMuted, marginBottom: spacing.lg },
  walletRow:    { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  walletStat:   { flex: 1, backgroundColor: colors.surfaceElevated, borderRadius: radius.sm, padding: spacing.md },
  walletStatLabel:{ fontSize: 10, color: colors.textMuted, marginBottom: 4 },
  walletStatValue:{ fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  walletBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingVertical: spacing.sm,
  },
  walletBtnPressed: { backgroundColor: colors.surfaceElevated },
  walletBtnText:    { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
});
