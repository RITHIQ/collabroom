import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography, shadows } from '../theme/tokens';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Notification config ─────────────────────────────────────────────────────
const NOTIF_CONFIG: Record<string, { icon: string; color: string; filter: string }> = {
  campaign_match: { icon: 'star', color: '#6B4EFF', filter: 'Campaigns' },
  deadline_soon: { icon: 'clock', color: '#FF6D00', filter: 'Campaigns' },
  application_accepted: { icon: 'check-circle', color: '#00C853', filter: 'Campaigns' },
  new_message: { icon: 'message-circle', color: '#6B4EFF', filter: 'Messages' },
  payment_received: { icon: 'dollar-sign', color: '#00C853', filter: 'System' },
  profile_viewed: { icon: 'eye', color: '#999', filter: 'System' },
  contract_ready: { icon: 'file-text', color: '#FF6D00', filter: 'Campaigns' },
  milestone_approved: { icon: 'target', color: '#00C853', filter: 'Campaigns' },
  new_applicant: { icon: 'user-plus', color: '#6B4EFF', filter: 'Campaigns' },
  campaign_live: { icon: 'zap', color: '#00C853', filter: 'Campaigns' },
  content_submitted: { icon: 'upload', color: '#FF6D00', filter: 'Campaigns' },
  payment_processed: { icon: 'credit-card', color: '#00C853', filter: 'System' },
  system: { icon: 'bell', color: '#999', filter: 'System' },
};

const FILTER_TABS = ['All', 'Campaigns', 'Messages', 'System'];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isYesterday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toDateString() === yesterday.toDateString();
}

function getDateGroup(dateStr: string): string {
  if (isToday(dateStr)) return 'Today';
  if (isYesterday(dateStr)) return 'Yesterday';
  return 'Earlier';
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonNotif({ index }: { index: number }) {
  return (
    <MotiView
      from={{ opacity: 0.4 }} animate={{ opacity: 0.8 }}
      transition={{ loop: true, duration: 1500, type: 'timing', delay: index * 100 }}
      style={styles.skeletonRow}
    >
      <View style={styles.skeletonIcon} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={[styles.skeletonLine, { width: '65%' }]} />
        <View style={[styles.skeletonLine, { width: '85%' }]} />
        <View style={[styles.skeletonLine, { width: '30%' }]} />
      </View>
    </MotiView>
  );
}

// ─── Notification Card ────────────────────────────────────────────────────────
function NotifCard({
  item,
  index,
  onMarkRead,
  onDelete,
}: {
  item: any;
  index: number;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = NOTIF_CONFIG[item.type] || NOTIF_CONFIG.system;
  const isRead = item.is_read || item.read;

  return (
    <MotiView
      from={{ opacity: 0, translateY: -16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 350, delay: index * 40 }}
    >
      <Pressable
        style={[styles.notifRow, !isRead && styles.notifRowUnread]}
        onPress={() => onMarkRead(item.id)}
      >
        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: config.color + '18' }]}>
          <Feather name={config.icon as any} size={18} color={config.color} />
        </View>

        {/* Content */}
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
          {item.body || item.message ? (
            <Text style={styles.notifBody} numberOfLines={2}>{item.body || item.message}</Text>
          ) : null}
          <Text style={styles.notifTime}>{timeAgo(item.created_at)}</Text>
        </View>

        {/* Unread dot */}
        {!isRead && (
          <MotiView
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ loop: true, duration: 2000, type: 'timing' }}
            style={styles.unreadDot}
          />
        )}

        {/* Delete */}
        <Pressable
          onPress={() => onDelete(item.id)}
          style={styles.deleteBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x" size={14} color={colors.textMuted} />
        </Pressable>
      </Pressable>
    </MotiView>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (!error && data) setNotifications(data);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);
      await fetchNotifications(user.id);
      setLoading(false);
    };
    init();
  }, [fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel('notifications-screen')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as any, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // Apply filter
  useEffect(() => {
    if (activeTab === 'All') {
      setFiltered(notifications);
    } else {
      setFiltered(notifications.filter(n => {
        const config = NOTIF_CONFIG[n.type] || NOTIF_CONFIG.system;
        return config.filter === activeTab;
      }));
    }
  }, [notifications, activeTab]);

  const handleRefresh = useCallback(async () => {
    if (!userId) return;
    setRefreshing(true);
    await fetchNotifications(userId);
    setRefreshing(false);
  }, [userId, fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true, read: true } : n));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const handleDelete = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await supabase.from('notifications').delete().eq('id', id);
  };

  const handleMarkAllRead = async () => {
    if (!userId) return;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read: true })));
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
  };

  // Group by date
  const grouped: { group: string; data: any[] }[] = [];
  const groupOrder = ['Today', 'Yesterday', 'Earlier'];
  const groupMap: Record<string, any[]> = { Today: [], Yesterday: [], Earlier: [] };
  filtered.forEach(n => {
    const g = getDateGroup(n.created_at);
    groupMap[g].push(n);
  });
  groupOrder.forEach(g => {
    if (groupMap[g].length > 0) grouped.push({ group: g, data: groupMap[g] });
  });

  const flatData: any[] = [];
  grouped.forEach(({ group, data }) => {
    flatData.push({ type: 'header', group });
    data.forEach(item => flatData.push({ type: 'item', item }));
  });

  const unreadCount = notifications.filter(n => !(n.is_read || n.read)).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <Pressable onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </Pressable>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {/* ── Filter Tabs ── */}
      <View style={styles.tabsRow}>
        {FILTER_TABS.map(tab => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            {activeTab === tab && <View style={styles.tabIndicator} />}
          </Pressable>
        ))}
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.content}>
          {[1, 2, 3, 4, 5].map(i => <SkeletonNotif key={i} index={i} />)}
        </View>
      ) : (
        <FlatList
          data={flatData}
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
          keyExtractor={(item, index) => item.type === 'header' ? `header-${item.group}` : item.item.id}
          renderItem={({ item, index }) => {
            if (item.type === 'header') {
              return <Text style={styles.groupLabel}>{item.group}</Text>;
            }
            return (
              <NotifCard
                item={item.item}
                index={index}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="bell" size={44} color={colors.textMuted} style={{ marginBottom: spacing.md }} />
              <Text style={styles.emptyTitle}>All Caught Up!</Text>
              <Text style={styles.emptySubtitle}>No notifications in this category yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ── Header ──
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backBtn: { width: 36, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  markAllText: { fontSize: 13, color: colors.accent, fontWeight: '600', width: 80, textAlign: 'right' },

  // ── Tabs ──
  tabsRow: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.md, position: 'relative' },
  tabActive: {},
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: colors.accent, fontWeight: '700' },
  tabIndicator: {
    position: 'absolute', bottom: 0, left: '10%', right: '10%',
    height: 2, backgroundColor: colors.accent, borderRadius: 1,
  },

  // ── Content ──
  content: { paddingBottom: spacing.xxxl },

  // ── Group label ──
  groupLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },

  // ── Notif Row ──
  notifRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    gap: spacing.md,
  },
  notifRowUnread: { backgroundColor: '#F5F2FF' },
  iconCircle: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 },
  notifBody: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent,
    marginTop: 4, flexShrink: 0,
  },
  deleteBtn: { padding: spacing.xs, flexShrink: 0 },

  // ── Skeleton ──
  skeletonRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  skeletonIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E0E0E0', flexShrink: 0 },
  skeletonLine: { height: 12, backgroundColor: '#E0E0E0', borderRadius: 6 },

  // ── Empty ──
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.subtitle, fontWeight: '800', marginBottom: spacing.xs },
  emptySubtitle: { color: colors.textSecondary, fontSize: typography.body, textAlign: 'center', paddingHorizontal: spacing.xl },
});
