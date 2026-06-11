import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { MotiView } from 'moti';
import { Screen } from '../../components/ui/Screen';
import { colors, spacing, radius, typography, shadows } from '../../theme/tokens';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

const PLATFORM_ICONS: Record<string, any> = {
  instagram: 'instagram',
  youtube: 'youtube',
  twitter: 'twitter',
  linkedin: 'linkedin',
};
const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  youtube: '#FF0000',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
};

function formatFollowers(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonProfile() {
  return (
    <View style={{ paddingHorizontal: spacing.lg }}>
      <MotiView
        from={{ opacity: 0.4 }} animate={{ opacity: 0.8 }}
        transition={{ loop: true, duration: 1500, type: 'timing' }}
        style={styles.skeletonCard}
      />
      {[1, 2, 3].map(i => (
        <MotiView
          key={i}
          from={{ opacity: 0.4 }} animate={{ opacity: 0.8 }}
          transition={{ loop: true, duration: 1500, type: 'timing', delay: i * 100 }}
          style={[styles.skeletonLine, { width: `${75 - i * 10}%`, marginBottom: 12 }]}
        />
      ))}
    </View>
  );
}

// ─── Profile Completeness ─────────────────────────────────────────────────────
function ProfileCompletenessCard({
  percent,
  onPress,
}: { percent: number; onPress: () => void }) {
  if (percent === 100) return null;
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay: 300 }}
      style={styles.completenessCard}
    >
      <Text style={styles.completenessTitle}>
        Your profile is <Text style={styles.completenessPercent}>{percent}%</Text> ready for brands
      </Text>
      <View style={styles.progressTrack}>
        <MotiView
          from={{ width: '0%' }}
          animate={{ width: `${percent}%` as any }}
          transition={{ type: 'timing', duration: 1200 }}
          style={styles.progressFill}
        />
      </View>
      <Pressable style={styles.completeButton} onPress={onPress}>
        <Text style={styles.completeButtonText}>Complete profile now →</Text>
      </Pressable>
    </MotiView>
  );
}

// ─── Menu Row ─────────────────────────────────────────────────────────────────
function MenuRow({
  icon,
  label,
  onPress,
  accent = false,
  danger = false,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  accent?: boolean;
  danger?: boolean;
}) {
  const iconColor = danger ? colors.danger : accent ? colors.accent : colors.textSecondary;
  const textColor = danger ? colors.danger : colors.textPrimary;
  return (
    <Pressable style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]} onPress={onPress}>
      <View style={[styles.menuIconBox, {
        backgroundColor: danger ? '#FFF0F0' : accent ? colors.accentLight : colors.surfaceElevated,
      }]}>
        <Feather name={icon as any} size={15} color={iconColor} />
      </View>
      <Text style={[styles.menuLabel, { color: textColor }]}>{label}</Text>
      {!danger && <Feather name="chevron-right" size={16} color={colors.textMuted} />}
    </Pressable>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // User data
  const [userId, setUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [bio, setBio] = useState('');
  const [niches, setNiches] = useState<string[]>([]);
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [workPreference, setWorkPreference] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [profilePercent, setProfilePercent] = useState(0);

  // Social platforms
  const [instagramHandle, setInstagramHandle] = useState('');
  const [instagramFollowers, setInstagramFollowers] = useState(0);
  const [youtubeChannel, setYoutubeChannel] = useState('');
  const [youtubeSubscribers, setYoutubeSubscribers] = useState(0);
  const [twitterHandle, setTwitterHandle] = useState('');
  const [twitterFollowers, setTwitterFollowers] = useState(0);

  // Stats
  const [totalFollowers, setTotalFollowers] = useState(0);
  const [activeCampaigns, setActiveCampaigns] = useState(0);
  const [completedCampaigns, setCompletedCampaigns] = useState(0);

  const loadProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Fetch profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        setFirstName(profile.first_name || profile.full_name?.split(' ')[0] || '');
        setLastName(profile.last_name || profile.full_name?.split(' ').slice(1).join(' ') || '');
        setUsername(profile.username || '');
      }

      // Fetch creators table
      const { data: creator } = await supabase
        .from('creators')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (creator) {
        setBio(creator.bio || creator.tagline || '');
        setNiches(creator.niches || creator.niche || []);
        setContentTypes(creator.content_types || []);
        setWorkPreference(creator.work_preference || creator.availability || '');
        setLanguages(creator.languages || []);
        setCity(creator.city || creator.location?.split(',')[0] || '');
        setCountry(creator.country || creator.location?.split(',')[1]?.trim() || '');

        // Social platforms
        setInstagramHandle(creator.instagram_handle || '');
        setInstagramFollowers(creator.instagram_followers || 0);
        setYoutubeChannel(creator.youtube_channel || '');
        setYoutubeSubscribers(creator.youtube_subscribers || 0);
        setTwitterHandle(creator.twitter_handle || '');
        setTwitterFollowers(creator.twitter_followers || 0);

        const total =
          (creator.instagram_followers || 0) +
          (creator.youtube_subscribers || 0) +
          (creator.twitter_followers || 0);
        setTotalFollowers(total);

        // Profile completeness
        const fields = [
          { key: 'profile_photo', weight: 20, val: creator.profile_photo },
          { key: 'bio', weight: 15, val: creator.bio },
          { key: 'instagram_handle', weight: 20, val: creator.instagram_handle },
          { key: 'niches', weight: 15, val: creator.niches?.length > 0 ? 'y' : '' },
          { key: 'city', weight: 10, val: creator.city },
          { key: 'availability', weight: 10, val: creator.availability },
          { key: 'content_types', weight: 10, val: creator.content_types?.length > 0 ? 'y' : '' },
        ];
        const pct = fields.filter(f => !!f.val).reduce((s, f) => s + f.weight, 0);
        setProfilePercent(pct);

        // Application stats
        const [activeRes, completedRes] = await Promise.all([
          supabase
            .from('campaign_applications')
            .select('*', { count: 'exact', head: true })
            .eq('creator_id', creator.id)
            .in('status', ['active', 'pending']),
          supabase
            .from('campaign_applications')
            .select('*', { count: 'exact', head: true })
            .eq('creator_id', creator.id)
            .eq('status', 'completed'),
        ]);
        setActiveCampaigns(activeRes.count || 0);
        setCompletedCampaigns(completedRes.count || 0);
      }
    } catch (e) {
      console.warn('Profile load error:', e);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadProfile();
      setLoading(false);
    };
    init();
  }, [loadProfile]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }, [loadProfile]);

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'Creator';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const location = [city, country].filter(Boolean).join(', ');

  // Social platforms to display
  const socialPlatforms = [
    { key: 'instagram', label: 'Instagram', handle: instagramHandle, followers: instagramFollowers },
    { key: 'youtube', label: 'YouTube', handle: youtubeChannel, followers: youtubeSubscribers },
    { key: 'twitter', label: 'Twitter/X', handle: twitterHandle, followers: twitterFollowers },
  ].filter(p => p.handle);

  if (loading) {
    return (
      <Screen scrollable={true}>
        <SkeletonProfile />
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* ── Cover ── */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 500 }}
          style={styles.coverArea}
        />

        {/* ── Profile Card ── */}
        <MotiView
          from={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 100 }}
          style={styles.profileCard}
        >
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBig}>
              <Text style={styles.avatarBigText}>{initials}</Text>
            </View>
          </View>

          <Text style={styles.displayName}>{displayName}</Text>
          {username ? <Text style={styles.usernameText}>@{username}</Text> : null}

          {location ? (
            <View style={styles.metaRow}>
              <Feather name="map-pin" size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
              <Text style={styles.metaText}>{location}</Text>
            </View>
          ) : null}

          {bio ? <Text style={styles.bioText}>{bio}</Text> : null}

          {/* Niche Pills */}
          {niches.length > 0 && (
            <View style={styles.nicheRow}>
              {niches.map(niche => (
                <View key={niche} style={styles.nicheBadge}>
                  <Text style={styles.nicheBadgeText}>{niche}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Content Types */}
          {contentTypes.length > 0 && (
            <View style={styles.nicheRow}>
              {contentTypes.slice(0, 4).map(ct => (
                <View key={ct} style={styles.contentTypeBadge}>
                  <Text style={styles.contentTypeBadgeText}>{ct}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Work Preference */}
          {workPreference ? (
            <View style={styles.workPrefBadge}>
              <Feather name="briefcase" size={11} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={styles.workPrefText}>{workPreference}</Text>
            </View>
          ) : null}

          {/* Languages */}
          {languages.length > 0 && (
            <View style={styles.metaRow}>
              <Feather name="globe" size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
              <Text style={styles.metaText}>{languages.join(', ')}</Text>
            </View>
          )}

          {/* CTA Row */}
          <View style={styles.ctaRow}>
            <Pressable style={styles.editProfileBtn} onPress={() => router.push('/profile-edit' as any)}>
              <Feather name="edit-2" size={13} color="#ffffff" style={{ marginRight: 5 }} />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </Pressable>
            <Pressable style={styles.shareBtn}>
              <Feather name="share-2" size={16} color={colors.textPrimary} />
            </Pressable>
          </View>
        </MotiView>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total Reach', value: totalFollowers ? formatFollowers(totalFollowers) : '—' },
            { label: 'Active', value: String(activeCampaigns) },
            { label: 'Completed', value: String(completedCampaigns) },
          ].map((stat, i) => (
            <MotiView
              key={i}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 300, delay: 200 + i * 80 }}
              style={styles.statCard}
            >
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </MotiView>
          ))}
        </View>

        {/* ── Profile Completeness ── */}
        <ProfileCompletenessCard
          percent={profilePercent}
          onPress={() => router.push('/profile-edit' as any)}
        />

        {/* ── Social Platforms ── */}
        {socialPlatforms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social Platforms</Text>
            <View style={styles.socialList}>
              {socialPlatforms.map((platform, idx) => {
                const iconName = PLATFORM_ICONS[platform.key] || 'link';
                const iconColor = PLATFORM_COLORS[platform.key] || colors.accent;
                return (
                  <View
                    key={platform.key}
                    style={[styles.socialRow, idx < socialPlatforms.length - 1 && styles.socialRowDivider]}
                  >
                    <View style={[styles.socialIconBox, { backgroundColor: `${iconColor}15` }]}>
                      <Feather name={iconName} size={16} color={iconColor} />
                    </View>
                    <View style={styles.socialInfo}>
                      <Text style={styles.socialHandle}>{platform.handle}</Text>
                      <Text style={styles.socialPlatformLabel}>{platform.label}</Text>
                    </View>
                    {platform.followers > 0 && (
                      <View style={styles.followersBadge}>
                        <Text style={styles.followersText}>{formatFollowers(platform.followers)}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Menu Items ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            <MenuRow icon="edit-2" label="Edit Profile" onPress={() => router.push('/profile-edit' as any)} />
            <MenuRow icon="file-text" label="Contracts" onPress={() => router.push('/contracts' as any)} />
            <MenuRow icon="dollar-sign" label="Wallet" onPress={() => router.push('/wallet' as any)} accent />
            <MenuRow icon="zap" label="AI Brief Generator" onPress={() => router.push('/ai-brief' as any)} accent />
            <MenuRow icon="bell" label="Notifications" onPress={() => router.push('/notifications' as any)} />
            <MenuRow icon="bar-chart-2" label="Stats" onPress={() => {}} />
            <MenuRow icon="settings" label="Settings" onPress={() => {}} />
          </View>
        </View>

        {/* ── Sign Out ── */}
        <View style={styles.section}>
          <View style={styles.menuCard}>
            <MenuRow icon="log-out" label="Sign Out" onPress={handleSignOut} danger />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xxxl },

  // ── Cover ──
  coverArea: {
    height: 100, backgroundColor: colors.accentMid,
    borderRadius: radius.md, marginBottom: -32,
  },

  // ── Profile Card ──
  profileCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, paddingTop: spacing.xxxl + 4,
    marginBottom: spacing.lg, alignItems: 'center', ...shadows.card,
  },
  avatarWrapper: { position: 'absolute', top: -32, alignSelf: 'center' },
  avatarBig: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: colors.background,
  },
  avatarBigText: { color: '#ffffff', fontSize: 28, fontWeight: '900' },
  displayName: { color: colors.textPrimary, fontSize: 20, fontWeight: '900', letterSpacing: -0.3, marginBottom: 2 },
  usernameText: { color: colors.textMuted, fontSize: typography.body, fontWeight: '500', marginBottom: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  metaText: { color: colors.textMuted, fontSize: typography.caption },
  bioText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, textAlign: 'center', marginVertical: spacing.sm, paddingHorizontal: spacing.sm },
  nicheRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  nicheBadge: { backgroundColor: colors.accentLight, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 5 },
  nicheBadgeText: { color: colors.accent, fontSize: 11, fontWeight: '700' },
  contentTypeBadge: {
    borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 5,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceElevated,
  },
  contentTypeBadgeText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
  workPrefBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.accentLight, borderRadius: radius.pill,
    paddingHorizontal: spacing.md, paddingVertical: 6, marginVertical: spacing.xs,
  },
  workPrefText: { color: colors.accent, fontSize: 11, fontWeight: '700' },
  ctaRow: { flexDirection: 'row', gap: spacing.sm, width: '100%', alignItems: 'center', marginTop: spacing.md },
  editProfileBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.textPrimary, borderRadius: radius.pill, paddingVertical: 10,
  },
  editProfileText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  shareBtn: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface,
  },

  // ── Stats ──
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
    alignItems: 'center', ...shadows.card,
  },
  statValue: { fontSize: 20, fontWeight: '900', color: colors.textPrimary },
  statLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2 },

  // ── Completeness ──
  completenessCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border,
    padding: spacing.lg, marginBottom: spacing.lg, ...shadows.card,
  },
  completenessTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md, lineHeight: 20 },
  completenessPercent: { color: colors.accent, fontWeight: '900' },
  progressTrack: { height: 6, backgroundColor: colors.surfaceElevated, borderRadius: 3, marginBottom: spacing.md, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 3 },
  completeButton: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingVertical: 11, alignItems: 'center' },
  completeButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },

  // ── Section ──
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.md },

  // ── Socials ──
  socialList: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, ...shadows.card,
  },
  socialRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  socialRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  socialIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  socialInfo: { flex: 1 },
  socialHandle: { color: colors.textPrimary, fontSize: typography.body, fontWeight: '700' },
  socialPlatformLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 1 },
  followersBadge: {
    backgroundColor: colors.surfaceElevated, borderRadius: radius.pill,
    paddingHorizontal: spacing.sm, paddingVertical: 4, borderWidth: 1, borderColor: colors.border,
  },
  followersText: { color: colors.textSecondary, fontSize: 11, fontWeight: '700' },

  // ── Menu ──
  menuCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...shadows.card },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuRowPressed: { backgroundColor: colors.surfaceElevated },
  menuIconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600' },

  // ── Skeleton ──
  skeletonCard: { backgroundColor: '#F0F0F0', borderRadius: radius.md, height: 250, marginBottom: spacing.lg },
  skeletonLine: { height: 14, backgroundColor: '#E0E0E0', borderRadius: 7 },
});
