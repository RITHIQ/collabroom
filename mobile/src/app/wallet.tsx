import { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  RefreshControl,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography, shadows } from '../theme/tokens';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatAmount(n: number | null | undefined): string {
  if (!n) return '₹0';
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

// ─── Count-Up Animation ───────────────────────────────────────────────────────
function AnimatedBalance({ value }: { value: number }) {
  const animVal = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    animVal.addListener(({ value: v }) => setDisplay(Math.floor(v)));
    Animated.timing(animVal, {
      toValue: value,
      duration: 2200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => animVal.removeAllListeners();
  }, [value]);

  return (
    <Text style={styles.balanceAmount}>
      ₹{display.toLocaleString('en-IN')}
    </Text>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonWallet() {
  return (
    <View>
      <MotiView
        from={{ opacity: 0.4 }} animate={{ opacity: 0.8 }}
        transition={{ loop: true, duration: 1500, type: 'timing' }}
        style={styles.skeletonBalance}
      />
      {[1, 2, 3, 4].map(i => (
        <MotiView
          key={i}
          from={{ opacity: 0.4 }} animate={{ opacity: 0.8 }}
          transition={{ loop: true, duration: 1500, type: 'timing', delay: i * 100 }}
          style={styles.skeletonTxn}
        />
      ))}
    </View>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────
function TxnRow({ item, index }: { item: any; index: number }) {
  const isCredit = (item.type || '').toLowerCase() === 'credit';
  const amountColor = isCredit ? colors.success : colors.danger;
  const prefix = isCredit ? '+' : '-';

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300, delay: index * 40 }}
      style={styles.txnRow}
    >
      <View style={[styles.txnIcon, { backgroundColor: isCredit ? colors.successLight : colors.dangerLight }]}>
        <Feather
          name={isCredit ? 'arrow-down-left' : 'arrow-up-right'}
          size={16}
          color={amountColor}
        />
      </View>
      <View style={styles.txnInfo}>
        <Text style={styles.txnDescription} numberOfLines={1}>{item.description || (isCredit ? 'Payment received' : 'Withdrawal')}</Text>
        <Text style={styles.txnDate}>{formatDate(item.created_at)}</Text>
      </View>
      <MotiView
        from={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: index * 40 + 150 }}
      >
        <Text style={[styles.txnAmount, { color: amountColor }]}>
          {prefix}{formatAmount(item.amount)}
        </Text>
      </MotiView>
    </MotiView>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function WalletScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [balance, setBalance] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [lockedAmount, setLockedAmount] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchWalletData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch wallet
      const { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (walletData) {
        setBalance(walletData.balance || walletData.available_balance || 0);
        setPendingAmount(walletData.pending_balance || walletData.pending || 0);
        setLockedAmount(walletData.locked_balance || walletData.escrow_balance || 0);
      }

      // Fetch transactions
      const { data: txnData } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (txnData) setTransactions(txnData);
    } catch (e) {
      console.warn('Wallet load error:', e);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchWalletData();
      setLoading(false);
    };
    init();
  }, [fetchWalletData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWalletData();
    setRefreshing(false);
  }, [fetchWalletData]);

  const totalEarned = transactions
    .filter(t => (t.type || '').toLowerCase() === 'credit')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.content}>
          <SkeletonWallet />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <>
              {/* ── Balance Hero ── */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 500 }}
                style={styles.balanceCard}
              >
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <AnimatedBalance value={balance} />
                <Pressable style={styles.withdrawButton}>
                  <Feather name="arrow-up" size={15} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
                </Pressable>
              </MotiView>

              {/* ── Balance breakdown ── */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
                <View style={styles.balanceCards}>
                  {[
                    { label: 'Pending', amount: pendingAmount, icon: 'clock', color: '#FF9500' },
                    { label: 'In Escrow', amount: lockedAmount, icon: 'lock', color: '#4F46E5' },
                    { label: 'Total Earned', amount: totalEarned, icon: 'trending-up', color: colors.success },
                  ].map((card, i) => (
                    <MotiView
                      key={i}
                      from={{ opacity: 0, translateX: 20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ type: 'timing', duration: 350, delay: 200 + i * 80 }}
                      style={styles.miniCard}
                    >
                      <View style={[styles.miniCardIcon, { backgroundColor: card.color + '18' }]}>
                        <Feather name={card.icon as any} size={14} color={card.color} />
                      </View>
                      <Text style={styles.miniCardAmount}>{formatAmount(card.amount)}</Text>
                      <Text style={styles.miniCardLabel}>{card.label}</Text>
                    </MotiView>
                  ))}
                </View>
              </ScrollView>

              {/* ── Transactions Header ── */}
              <Text style={styles.sectionTitle}>Transaction History</Text>
            </>
          }
          renderItem={({ item, index }) => <TxnRow item={item} index={index} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={40} color={colors.textMuted} style={{ marginBottom: spacing.md }} />
              <Text style={styles.emptyTitle}>No Transactions Yet</Text>
              <Text style={styles.emptySubtitle}>Earnings from completed campaigns will appear here.</Text>
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
  content: { padding: spacing.lg, paddingBottom: 100 },

  // ── Balance ──
  balanceCard: {
    backgroundColor: colors.accent, borderRadius: radius.lg,
    padding: spacing.xl, marginBottom: spacing.lg, alignItems: 'center',
  },
  balanceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: spacing.sm },
  balanceAmount: { fontSize: 42, fontWeight: '900', color: '#ffffff', letterSpacing: -1, marginBottom: spacing.lg },
  withdrawButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.pill,
    paddingHorizontal: spacing.xl, paddingVertical: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  withdrawButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },

  // ── Balance Cards ──
  balanceCards: { flexDirection: 'row', gap: spacing.md, paddingRight: spacing.lg },
  miniCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
    width: 130, ...shadows.card,
  },
  miniCardIcon: {
    width: 32, height: 32, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm,
  },
  miniCardAmount: { fontSize: 18, fontWeight: '900', color: colors.textPrimary, marginBottom: 2 },
  miniCardLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },

  // ── Transactions ──
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.md },
  txnRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md,
  },
  txnIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  txnInfo: { flex: 1 },
  txnDescription: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 },
  txnDate: { fontSize: 11, color: colors.textMuted },
  txnAmount: { fontSize: 15, fontWeight: '900' },

  // ── Skeleton ──
  skeletonBalance: { backgroundColor: '#F0F0F0', borderRadius: radius.lg, height: 180, marginBottom: spacing.lg },
  skeletonTxn: { backgroundColor: '#F0F0F0', borderRadius: radius.md, height: 60, marginBottom: spacing.md },

  // ── Empty ──
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: typography.subtitle, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.xs },
  emptySubtitle: { color: colors.textSecondary, fontSize: typography.body, textAlign: 'center', paddingHorizontal: spacing.xl },
});
