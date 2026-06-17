import { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, Pressable, TextInput, ScrollView,
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { colors, spacing, radius, typography, shadows } from '../theme/tokens';
import { supabase } from '../lib/supabase';

const NICHE_OPTIONS = ['Beauty', 'Fashion', 'Tech', 'Gaming', 'Food', 'Travel', 'Fitness', 'Lifestyle', 'Finance', 'Music', 'Comedy', 'Education', 'Sports', 'Parenting'];
const CONTENT_TYPES = ['Reels', 'Short Videos', 'Long-form Videos', 'Stories', 'Carousels', 'Podcasts', 'Blogs', 'Lives'];
const AVAILABILITY_OPTIONS = ['Immediately', 'Within 1 week', 'Within 2 weeks', 'Next month', 'Currently unavailable'];
const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Punjabi'];

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={s.sectionHeader}>
      <Feather name={icon as any} size={14} color={colors.textMuted} />
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

// ── Input Field ───────────────────────────────────────────────────────────────
function Field({
  label, value, onChange, placeholder, multiline = false, keyboardType = 'default',
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; multiline?: boolean; keyboardType?: any;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.fieldGroup}>
      <Text style={s.fieldLabel}>{label}</Text>
      <MotiView
        animate={{ borderColor: focused ? 'rgba(255,255,255,0.28)' : colors.borderInput }}
        transition={{ type: 'timing', duration: 180 }}
        style={[s.fieldWrapper, multiline && s.fieldWrapperMulti]}
      >
        <TextInput
          style={[s.fieldInput, multiline && s.fieldInputMulti]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline={multiline}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor="rgba(255,255,255,0.5)"
          textAlignVertical={multiline ? 'top' : 'auto'}
        />
      </MotiView>
    </View>
  );
}

// ── Multi-Select Chips ────────────────────────────────────────────────────────
function ChipGroup({
  label, options, selected, onToggle,
}: {
  label: string; options: string[]; selected: string[]; onToggle: (v: string) => void;
}) {
  return (
    <View style={s.fieldGroup}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={s.chipRow}>
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <Pressable
              key={opt}
              onPress={() => onToggle(opt)}
              style={[s.chip, active && s.chipActive]}
            >
              <Text style={[s.chipText, active && s.chipTextActive]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ProfileEditScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Basic info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  // Niches & content
  const [niches, setNiches] = useState<string[]>([]);
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');

  // Social
  const [instagramHandle, setInstagramHandle] = useState('');
  const [instagramFollowers, setInstagramFollowers] = useState('');
  const [youtubeChannel, setYoutubeChannel] = useState('');
  const [youtubeSubscribers, setYoutubeSubscribers] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [twitterFollowers, setTwitterFollowers] = useState('');

  // Languages
  const [languages, setLanguages] = useState<string[]>([]);

  // IDs
  const [userId, setUserId] = useState<string | null>(null);
  const [creatorId, setCreatorId] = useState<string | null>(null);

  // Load existing data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        const { data: profile } = await supabase.from('profiles')
          .select('*').eq('user_id', user.id).maybeSingle();
        if (profile) {
          setFirstName(profile.first_name || profile.full_name?.split(' ')[0] || '');
          setLastName(profile.last_name || profile.full_name?.split(' ').slice(1).join(' ') || '');
          setUsername(profile.username || '');
        }

        const { data: creator } = await supabase.from('creators')
          .select('*').eq('user_id', user.id).maybeSingle();
        if (creator) {
          setCreatorId(creator.id);
          setBio(creator.bio || creator.tagline || '');
          setCity(creator.city || '');
          setCountry(creator.country || '');
          setNiches(creator.niches || creator.niche || []);
          setContentTypes(creator.content_types || []);
          setAvailability(creator.availability || creator.work_preference || '');
          setLanguages(creator.languages || []);
          setInstagramHandle(creator.instagram_handle || '');
          setInstagramFollowers(String(creator.instagram_followers || ''));
          setYoutubeChannel(creator.youtube_channel || '');
          setYoutubeSubscribers(String(creator.youtube_subscribers || ''));
          setTwitterHandle(creator.twitter_handle || '');
          setTwitterFollowers(String(creator.twitter_followers || ''));
        }
      } catch (e) {
        console.warn('Profile load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleNiche = (v: string) =>
    setNiches(prev => prev.includes(v) ? prev.filter(n => n !== v) : [...prev, v]);
  const toggleContentType = (v: string) =>
    setContentTypes(prev => prev.includes(v) ? prev.filter(n => n !== v) : [...prev, v]);
  const toggleLanguage = (v: string) =>
    setLanguages(prev => prev.includes(v) ? prev.filter(n => n !== v) : [...prev, v]);

  const handleSave = async () => {
    if (!userId) { Alert.alert('Error', 'Not logged in'); return; }
    setSaving(true);
    try {
      // Update profiles table
      await supabase.from('profiles').update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        username: username.trim() || null,
      }).eq('user_id', userId);

      // Update or insert creator record
      const creatorPayload = {
        user_id: userId,
        bio: bio.trim() || null,
        city: city.trim() || null,
        country: country.trim() || null,
        niches: niches.length > 0 ? niches : null,
        content_types: contentTypes.length > 0 ? contentTypes : null,
        availability: availability || null,
        languages: languages.length > 0 ? languages : null,
        instagram_handle: instagramHandle.trim() || null,
        instagram_followers: parseInt(instagramFollowers) || 0,
        youtube_channel: youtubeChannel.trim() || null,
        youtube_subscribers: parseInt(youtubeSubscribers) || 0,
        twitter_handle: twitterHandle.trim() || null,
        twitter_followers: parseInt(twitterFollowers) || 0,
      };

      if (creatorId) {
        await supabase.from('creators').update(creatorPayload).eq('id', creatorId);
      } else {
        await supabase.from('creators').insert(creatorPayload);
      }

      Alert.alert('✅ Saved', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="rgba(255,255,255,0.4)" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={s.header}>
        <Pressable accessibilityLabel="back" onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={s.headerTitle}>Edit Profile</Text>
        <Pressable onPress={handleSave} disabled={saving} style={s.saveBtn}>
          {saving
            ? <ActivityIndicator size="small" color={colors.background} />
            : <Text style={s.saveBtnText}>Save</Text>
          }
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Basic Info ── */}
          <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400 }} style={s.card}>
            <SectionHeader icon="user" title="Basic Information" />
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Field label="FIRST NAME" value={firstName} onChange={setFirstName} placeholder="First name" />
              </View>
              <View style={{ width: spacing.md }} />
              <View style={{ flex: 1 }}>
                <Field label="LAST NAME" value={lastName} onChange={setLastName} placeholder="Last name" />
              </View>
            </View>
            <Field label="USERNAME" value={username} onChange={setUsername} placeholder="@handle" />
            <Field label="BIO / TAGLINE" value={bio} onChange={setBio} placeholder="Tell brands about yourself…" multiline />
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Field label="CITY" value={city} onChange={setCity} placeholder="Mumbai" />
              </View>
              <View style={{ width: spacing.md }} />
              <View style={{ flex: 1 }}>
                <Field label="COUNTRY" value={country} onChange={setCountry} placeholder="India" />
              </View>
            </View>
          </MotiView>

          {/* ── Niches ── */}
          <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 80 }} style={s.card}>
            <SectionHeader icon="tag" title="Content Niches" />
            <ChipGroup label="SELECT YOUR NICHES" options={NICHE_OPTIONS} selected={niches} onToggle={toggleNiche} />
          </MotiView>

          {/* ── Content Types ── */}
          <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 120 }} style={s.card}>
            <SectionHeader icon="film" title="Content Types & Availability" />
            <ChipGroup label="CONTENT FORMATS" options={CONTENT_TYPES} selected={contentTypes} onToggle={toggleContentType} />
            <View style={s.fieldGroup}>
              <Text style={s.fieldLabel}>AVAILABILITY</Text>
              <View style={s.chipRow}>
                {AVAILABILITY_OPTIONS.map(opt => (
                  <Pressable key={opt} onPress={() => setAvailability(opt)} style={[s.chip, availability === opt && s.chipActive]}>
                    <Text style={[s.chipText, availability === opt && s.chipTextActive]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </MotiView>

          {/* ── Social Platforms ── */}
          <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 160 }} style={s.card}>
            <SectionHeader icon="share-2" title="Social Platforms" />

            <View style={s.socialGroup}>
              <View style={[s.socialIcon, { backgroundColor: '#E1306C18' }]}>
                <Feather name="instagram" size={16} color="#E1306C" />
              </View>
              <Text style={s.socialLabel}>Instagram</Text>
            </View>
            <View style={s.row}>
              <View style={{ flex: 2 }}>
                <Field label="HANDLE" value={instagramHandle} onChange={setInstagramHandle} placeholder="@yourhandle" />
              </View>
              <View style={{ width: spacing.md }} />
              <View style={{ flex: 1 }}>
                <Field label="FOLLOWERS" value={instagramFollowers} onChange={setInstagramFollowers} placeholder="50000" keyboardType="numeric" />
              </View>
            </View>

            <View style={[s.socialGroup, { marginTop: spacing.md }]}>
              <View style={[s.socialIcon, { backgroundColor: '#FF000018' }]}>
                <Feather name="youtube" size={16} color="#FF0000" />
              </View>
              <Text style={s.socialLabel}>YouTube</Text>
            </View>
            <View style={s.row}>
              <View style={{ flex: 2 }}>
                <Field label="CHANNEL" value={youtubeChannel} onChange={setYoutubeChannel} placeholder="Channel name" />
              </View>
              <View style={{ width: spacing.md }} />
              <View style={{ flex: 1 }}>
                <Field label="SUBSCRIBERS" value={youtubeSubscribers} onChange={setYoutubeSubscribers} placeholder="10000" keyboardType="numeric" />
              </View>
            </View>

            <View style={[s.socialGroup, { marginTop: spacing.md }]}>
              <View style={[s.socialIcon, { backgroundColor: '#1DA1F218' }]}>
                <Feather name="twitter" size={16} color="#1DA1F2" />
              </View>
              <Text style={s.socialLabel}>Twitter / X</Text>
            </View>
            <View style={s.row}>
              <View style={{ flex: 2 }}>
                <Field label="HANDLE" value={twitterHandle} onChange={setTwitterHandle} placeholder="@handle" />
              </View>
              <View style={{ width: spacing.md }} />
              <View style={{ flex: 1 }}>
                <Field label="FOLLOWERS" value={twitterFollowers} onChange={setTwitterFollowers} placeholder="5000" keyboardType="numeric" />
              </View>
            </View>
          </MotiView>

          {/* ── Languages ── */}
          <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 200 }} style={s.card}>
            <SectionHeader icon="globe" title="Languages" />
            <ChipGroup label="LANGUAGES YOU CREATE IN" options={LANGUAGE_OPTIONS} selected={languages} onToggle={toggleLanguage} />
          </MotiView>

          {/* ── Save Button ── */}
          <Pressable
            style={({ pressed }) => [s.saveBtnBottom, pressed && s.saveBtnBottomPressed, saving && s.saveBtnBottomDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color={colors.background} />
              : <>
                  <Feather name="check" size={16} color={colors.background} style={{ marginRight: 8 }} />
                  <Text style={s.saveBtnBottomText}>Save Profile</Text>
                </>
            }
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  saveBtn: {
    backgroundColor: colors.textPrimary, borderRadius: radius.pill,
    paddingHorizontal: spacing.lg, paddingVertical: 8, minWidth: 60, alignItems: 'center',
  },
  saveBtnText: { color: colors.background, fontSize: 13, fontWeight: '700' },

  content: { padding: spacing.lg, paddingBottom: 60 },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, marginBottom: spacing.lg, ...shadows.card,
  },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },

  row: { flexDirection: 'row' },

  fieldGroup: { marginBottom: spacing.md },
  fieldLabel: {
    fontSize: 10, fontWeight: '700', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.xs,
  },
  fieldWrapper: {
    borderWidth: 1, borderColor: colors.borderInput, borderRadius: radius.sm,
    backgroundColor: colors.surface, paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  fieldWrapperMulti: { paddingVertical: spacing.md },
  fieldInput: { color: colors.textPrimary, fontSize: typography.body, minHeight: 22 },
  fieldInputMulti: { minHeight: 72 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: 7,
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderInput,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  chipTextActive: { color: colors.background, fontWeight: '700' },

  socialGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  socialIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  socialLabel: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },

  saveBtnBottom: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.textPrimary, borderRadius: radius.pill,
    paddingVertical: 16, marginTop: spacing.md,
  },
  saveBtnBottomPressed: { backgroundColor: 'rgba(255,255,255,0.85)' },
  saveBtnBottomDisabled: { opacity: 0.6 },
  saveBtnBottomText: { color: colors.background, fontSize: 15, fontWeight: '800' },
});
