import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
} from 'react-native';
import { MotiView } from 'moti';
import { Screen } from '../../components/ui/Screen';
import { colors, spacing, radius, typography, shadows } from '../../theme/tokens';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

const FILTER_TABS = ['All', 'Unread', 'Requests'];

const AVATAR_COLORS = ['#6B4EFF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

function getAvatarColor(name: string): string {
  const sum = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonChat({ index }: { index: number }) {
  return (
    <MotiView
      from={{ opacity: 0.4 }} animate={{ opacity: 0.8 }}
      transition={{ loop: true, duration: 1500, type: 'timing', delay: index * 80 }}
      style={styles.skeletonRow}
    >
      <View style={styles.skeletonAvatar} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={[styles.skeletonLine, { width: '55%' }]} />
        <View style={[styles.skeletonLine, { width: '80%' }]} />
      </View>
    </MotiView>
  );
}

// ─── Chat Row ─────────────────────────────────────────────────────────────────
function ChatRow({ item, index, onPress }: { item: any; index: number; onPress: () => void }) {
  const initials = (item.name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const avatarColor = getAvatarColor(item.name || '');

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300, delay: index * 40 }}
    >
      <Pressable style={({ pressed }) => [styles.chatRow, pressed && styles.chatRowPressed]} onPress={onPress}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: avatarColor + '20' }]}>
            <Text style={[styles.avatarText, { color: avatarColor }]}>{initials}</Text>
          </View>
          {item.online && <View style={styles.onlineBadge} />}
        </View>

        {/* Content */}
        <View style={styles.detailsContainer}>
          <View style={styles.nameRow}>
            <Text style={[styles.nameText, item.unreadCount > 0 && styles.nameTextBold]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.timeText}>{timeAgo(item.lastMessageTime)}</Text>
          </View>
          <View style={styles.messageRow}>
            <Text style={[styles.messageText, item.unreadCount > 0 && styles.messageTextUnread]} numberOfLines={2}>
              {item.lastMessage || 'No messages yet'}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount > 9 ? '9+' : item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </MotiView>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

// Mock message threads for fallback
const MOCK_THREADS = [
  {
    id: 'user-1',
    partnerId: 'user-1',
    name: 'Mamaearth Brand',
    lastMessage: 'Great content! Let\'s discuss the contract details.',
    lastMessageTime: new Date(Date.now() - 2 * 60000).toISOString(),
    unreadCount: 2,
    online: true,
  },
  {
    id: 'user-2',
    partnerId: 'user-2',
    name: 'boAt Marketing',
    lastMessage: 'Your reel got 500K views! Amazing engagement.',
    lastMessageTime: new Date(Date.now() - 1 * 3600000).toISOString(),
    unreadCount: 0,
    online: true,
  },
  {
    id: 'user-3',
    partnerId: 'user-3',
    name: 'Zomato Collab',
    lastMessage: 'Can we schedule a call for tomorrow?',
    lastMessageTime: new Date(Date.now() - 5 * 3600000).toISOString(),
    unreadCount: 1,
    online: false,
  },
  {
    id: 'user-4',
    partnerId: 'user-4',
    name: 'Myntra',
    lastMessage: 'The fashion shoot looks amazing! Sharing with team.',
    lastMessageTime: new Date(Date.now() - 1 * 86400000).toISOString(),
    unreadCount: 0,
    online: false,
  },
  {
    id: 'user-5',
    partnerId: 'user-5',
    name: 'Sarah Influencer',
    lastMessage: 'Want to collaborate on the eco product campaign?',
    lastMessageTime: new Date(Date.now() - 2 * 86400000).toISOString(),
    unreadCount: 0,
    online: false,
  },
];

export default function MessagesScreen() {
  const router = useRouter();
  const [threads, setThreads] = useState<any[]>([]);
  const [filteredThreads, setFilteredThreads] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchThreads = useCallback(async (uid: string) => {
    // Try fetching message threads / conversations
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      // Group by thread / conversation partner
      const threadMap = new Map<string, any>();
      for (const msg of data) {
        const partnerId = msg.sender_id === uid ? msg.receiver_id : msg.sender_id;
        if (!partnerId) continue;
        if (!threadMap.has(partnerId)) {
          threadMap.set(partnerId, {
            id: partnerId,
            partnerId,
            name: msg.sender_name || msg.receiver_name || `User ${partnerId.slice(0, 6)}`,
            lastMessage: msg.content || msg.text || msg.body || '',
            lastMessageTime: msg.created_at,
            unreadCount: (msg.receiver_id === uid && !msg.read) ? 1 : 0,
            online: false,
          });
        } else {
          const existing = threadMap.get(partnerId);
          if (!msg.read && msg.receiver_id === uid) {
            existing.unreadCount = (existing.unreadCount || 0) + 1;
          }
        }
      }
      setThreads([...threadMap.values()]);
    } else {
      setThreads(MOCK_THREADS);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchThreads(user.id);
      }
      setLoading(false);
    };
    init();
  }, [fetchThreads]);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel('messages-list')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      }, () => fetchThreads(userId))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchThreads]);

  // Filter
  useEffect(() => {
    let result = threads;
    if (search.trim()) {
      result = result.filter(t =>
        (t.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.lastMessage || '').toLowerCase().includes(search.toLowerCase())
      );
    }
    if (activeTab === 'Unread') result = result.filter(t => t.unreadCount > 0);
    setFilteredThreads(result);
  }, [search, activeTab, threads]);

  const handleRefresh = useCallback(async () => {
    if (!userId) return;
    setRefreshing(true);
    await fetchThreads(userId);
    setRefreshing(false);
  }, [userId, fetchThreads]);

  const totalUnread = threads.reduce((sum, t) => sum + (t.unreadCount || 0), 0);

  return (
    <Screen scrollable={false}>
      {/* ── Header ── */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Inbox</Text>
        {totalUnread > 0 && (
          <View style={styles.totalUnreadBadge}>
            <Text style={styles.totalUnreadText}>{totalUnread}</Text>
          </View>
        )}
      </View>

      {/* ── Search ── */}
      <View style={styles.searchBar}>
        <Feather name="search" size={16} color={colors.textMuted} style={{ marginRight: spacing.sm }} />
        <TextInput
          placeholder="Search messages..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Feather name="x" size={16} color={colors.textMuted} />
          </Pressable>
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

      {/* ── List ── */}
      {loading ? (
        <View>
          {[1, 2, 3, 4, 5].map(i => <SkeletonChat key={i} index={i} />)}
        </View>
      ) : (
        <FlatList
          data={filteredThreads}
          renderItem={({ item, index }) => <ChatRow item={item} index={index} onPress={() => router.push(`/messages/${item.partnerId}` as any)} />}
          keyExtractor={(item) => item.id}
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
              <Feather name="message-circle" size={40} color={colors.textMuted} style={{ marginBottom: spacing.md }} />
              <Text style={styles.emptyTitle}>
                {activeTab === 'Unread' ? 'No Unread Messages' : 'No Chats Available'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'Unread'
                  ? 'You\'re all caught up!'
                  : 'Start a collaboration to begin chatting with partners.'}
              </Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginBottom: spacing.md, marginTop: spacing.sm,
  },
  headerTitle: { fontSize: 26, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  totalUnreadBadge: {
    backgroundColor: colors.accent, borderRadius: 12,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  totalUnreadText: { color: '#ffffff', fontSize: 11, fontWeight: '900' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceMuted,
    borderColor: colors.border, borderWidth: 1, borderRadius: radius.sm,
    paddingHorizontal: spacing.md, height: 44, marginBottom: spacing.md,
  },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: typography.body },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.md },
  tab: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, position: 'relative', alignItems: 'center' },
  tabActive: {},
  tabText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: colors.accent, fontWeight: '700' },
  tabIndicator: {
    position: 'absolute', bottom: 0, left: spacing.lg, right: spacing.lg,
    height: 2, backgroundColor: colors.accent, borderRadius: 1,
  },
  listContent: { paddingBottom: spacing.xxxl },
  chatRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  chatRowPressed: { backgroundColor: colors.surfaceMuted },
  avatarContainer: { position: 'relative', marginRight: spacing.md },
  avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: '800', fontSize: 18 },
  onlineBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: colors.success, borderWidth: 2, borderColor: colors.background,
  },
  detailsContainer: { flex: 1, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  nameText: { color: colors.textPrimary, fontSize: typography.body, fontWeight: '600', flex: 1, paddingRight: spacing.sm },
  nameTextBold: { fontWeight: '800' },
  timeText: { color: colors.textMuted, fontSize: 11, fontWeight: '500' },
  messageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  messageText: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, flex: 1, paddingRight: spacing.md },
  messageTextUnread: { color: colors.textPrimary, fontWeight: '600' },
  unreadBadge: {
    backgroundColor: colors.accent, width: 20, height: 20,
    borderRadius: 10, justifyContent: 'center', alignItems: 'center',
  },
  unreadText: { color: '#ffffff', fontSize: 10, fontWeight: '900' },
  skeletonRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md,
  },
  skeletonAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.08)', flexShrink: 0 },
  skeletonLine: { height: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 6 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxxl },
  emptyTitle: { color: colors.textPrimary, fontSize: typography.subtitle, fontWeight: '800', marginBottom: spacing.xs },
  emptySubtitle: {
    color: colors.textSecondary, fontSize: typography.body,
    textAlign: 'center', paddingHorizontal: spacing.xl, lineHeight: 22,
  },
});
