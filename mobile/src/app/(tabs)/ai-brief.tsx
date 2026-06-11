import { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Share,
  Clipboard,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography, shadows } from '../../theme/tokens';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const TONES = ['Professional', 'Casual', 'Energetic', 'Inspirational', 'Minimal'];
const PLATFORMS = ['Instagram', 'YouTube', 'Twitter/X', 'TikTok', 'LinkedIn'];

// ─── Blinking Cursor ─────────────────────────────────────────────────────────
function BlinkingCursor() {
  return (
    <MotiView
      animate={{ opacity: [1, 0, 1] }}
      transition={{ loop: true, duration: 600, type: 'timing' }}
      style={styles.cursor}
    />
  );
}

// ─── Platform Pill ────────────────────────────────────────────────────────────
function PlatformPill({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, selected && styles.pillSelected]}
    >
      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{label}</Text>
    </Pressable>
  );
}

// ─── Input Field ─────────────────────────────────────────────────────────────
function InputField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <MotiView
        animate={{
          borderColor: focused ? colors.accent : colors.borderInput,
          backgroundColor: focused ? colors.accentLight : colors.surface,
        }}
        transition={{ type: 'timing', duration: 180 }}
        style={[styles.inputWrapper, multiline && styles.inputWrapperMulti]}
      >
        <TextInput
          style={[styles.textInput, multiline && styles.textInputMulti]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={colors.accent}
        />
      </MotiView>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AIBriefScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  // Form fields
  const [objective, setObjective] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState('Professional');

  // Output state
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [displayedOutput, setDisplayedOutput] = useState('');
  const [copied, setCopied] = useState(false);

  // Typewriter effect
  useEffect(() => {
    if (!output) { setDisplayedOutput(''); return; }
    setDisplayedOutput('');
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedOutput(output.slice(0, i + 1));
      i++;
      if (i >= output.length) clearInterval(timer);
    }, 18);
    return () => clearInterval(timer);
  }, [output]);

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const canGenerate = objective.trim().length >= 1;

  const handleGenerate = async () => {
    if (!canGenerate) {
      Alert.alert('Missing Info', 'Please describe your campaign objective.');
      return;
    }

    setIsGenerating(true);
    setOutput('');
    setDisplayedOutput('');

    // Scroll to output
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);

    try {
      // Build the brief template (simulated — real AI endpoint can be wired here)
      await new Promise(r => setTimeout(r, 1800)); // Simulate API call

      const platforms = selectedPlatforms.length > 0 ? selectedPlatforms.join(', ') : 'Instagram & YouTube';
      const budgetLine = budget ? `Budget: ${budget}` : 'Budget: To be confirmed';

      const generated = `📋 CAMPAIGN BRIEF – ColabRoom AI\n\n📌 CAMPAIGN OBJECTIVE\n${objective}\n\n👥 TARGET AUDIENCE\n${targetAudience || 'Young adults aged 18–35, digitally active, interested in lifestyle and trends.'}\n\n📱 RECOMMENDED PLATFORMS\n${platforms}\n\n🎨 TONE & STYLE\n${selectedTone} — Content should feel authentic and relatable. Avoid overly salesy language.\n\n💰 ${budgetLine}\n\n📦 SUGGESTED DELIVERABLES\n• 2 × Short-form videos (Reels/Shorts) showcasing the product in everyday use\n• 3 × Story frames with swipe-up links\n• 1 × Carousel post with educational content about the product\n\n✍️ CONTENT GUIDELINES\n1. Lead with a strong hook in the first 3 seconds\n2. Show real usage scenarios, not just promotional angles\n3. Include a clear and compelling call-to-action\n4. Disclose partnership with #Ad or #Sponsored\n\n📊 PERFORMANCE KPIs\n• Reach: 500K+ impressions\n• Engagement Rate: >4%\n• Click-through Rate: >1.5%\n• Conversions tracked via unique referral code\n\n⏱️ TIMELINE\n• Brief acceptance: Within 48 hours\n• Draft submission: Day 7\n• Brand feedback: Day 10\n• Final content live: Day 14\n\n---\n✨ Generated by ColabRoom AI`;

      setOutput(generated);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate brief. Please try again.');
      console.error('Generate brief error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    Clipboard.setString(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (!output) return;
    await Share.share({ message: output, title: 'Campaign Brief from ColabRoom' });
  };

  const isTyping = isGenerating || (output && displayedOutput.length < output.length);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>AI Brief Generator</Text>
          <Text style={styles.headerSub}>Powered by ColabRoom AI</Text>
        </View>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>AI</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Input Form ── */}
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
            style={styles.formCard}
          >
            <Text style={styles.formTitle}>Campaign Details</Text>
            <Text style={styles.formSub}>Fill in as much detail as possible for a better brief.</Text>

            <InputField
              label="Campaign Objective *"
              value={objective}
              onChange={setObjective}
              placeholder="e.g. Promote our new skincare serum to Gen Z audiences..."
              multiline
            />

            <InputField
              label="Target Audience"
              value={targetAudience}
              onChange={setTargetAudience}
              placeholder="e.g. Women aged 18–28, interested in skincare and wellness"
              multiline
            />

            <InputField
              label="Budget"
              value={budget}
              onChange={setBudget}
              placeholder="e.g. ₹5,00,000 total"
            />

            {/* Platforms */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Platforms</Text>
              <View style={styles.pillRow}>
                {PLATFORMS.map(p => (
                  <PlatformPill
                    key={p}
                    label={p}
                    selected={selectedPlatforms.includes(p)}
                    onPress={() => togglePlatform(p)}
                  />
                ))}
              </View>
            </View>

            {/* Tone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tone</Text>
              <View style={styles.pillRow}>
                {TONES.map(t => (
                  <PlatformPill
                    key={t}
                    label={t}
                    selected={selectedTone === t}
                    onPress={() => setSelectedTone(t)}
                  />
                ))}
              </View>
            </View>

            {/* Generate Button */}
            <MotiView
              animate={{ opacity: canGenerate ? 1 : 0.5, scale: canGenerate ? 1 : 0.98 }}
              transition={{ type: 'timing', duration: 200 }}
              style={{ marginTop: spacing.md }}
            >
              <Pressable
                style={({ pressed }) => [styles.generateButton, pressed && styles.generateButtonPressed]}
                onPress={handleGenerate}
                disabled={isGenerating || !canGenerate}
              >
                {isGenerating ? (
                  <>
                    <MotiView
                      animate={{ rotate: ['0deg', '360deg'] }}
                      transition={{ loop: true, duration: 1200, type: 'timing' }}
                      style={{ marginRight: spacing.sm }}
                    >
                      <Feather name="loader" size={16} color="#ffffff" />
                    </MotiView>
                    <Text style={styles.generateButtonText}>Generating Brief...</Text>
                  </>
                ) : (
                  <>
                    <Feather name="zap" size={16} color="#ffffff" style={{ marginRight: spacing.sm }} />
                    <Text style={styles.generateButtonText}>Generate AI Brief</Text>
                  </>
                )}
              </Pressable>
            </MotiView>
          </MotiView>

          {/* ── Output Card ── */}
          <AnimatePresence>
            {(displayedOutput || isGenerating) ? (
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: 20 }}
                transition={{ type: 'timing', duration: 400 }}
                style={styles.outputCard}
              >
                {/* Output header */}
                <View style={styles.outputHeader}>
                  <View style={styles.outputTitleRow}>
                    <View style={styles.aiBadgeSm}>
                      <Feather name="zap" size={11} color="#ffffff" />
                    </View>
                    <Text style={styles.outputTitle}>Generated Brief</Text>
                  </View>
                  {output && displayedOutput.length === output.length && (
                    <View style={styles.outputActions}>
                      <Pressable onPress={handleCopy} style={styles.outputAction}>
                        <Feather name={copied ? 'check' : 'copy'} size={15} color={copied ? colors.success : colors.accent} />
                        <Text style={[styles.outputActionText, copied && { color: colors.success }]}>
                          {copied ? 'Copied!' : 'Copy'}
                        </Text>
                      </Pressable>
                      <Pressable onPress={handleShare} style={styles.outputAction}>
                        <Feather name="share-2" size={15} color={colors.accent} />
                        <Text style={styles.outputActionText}>Share</Text>
                      </Pressable>
                    </View>
                  )}
                </View>

                {/* Text output */}
                <View style={styles.outputBody}>
                  {isGenerating && !displayedOutput ? (
                    <View style={styles.generatingRow}>
                      <Text style={styles.generatingText}>Crafting your brief</Text>
                      <BlinkingCursor />
                    </View>
                  ) : (
                    <View>
                      <Text style={styles.outputText}>{displayedOutput}</Text>
                      {isTyping && <BlinkingCursor />}
                    </View>
                  )}
                </View>

                {/* Regenerate button */}
                {!isGenerating && displayedOutput.length === output.length && (
                  <Pressable style={styles.regenerateBtn} onPress={handleGenerate}>
                    <Feather name="refresh-cw" size={13} color={colors.accent} style={{ marginRight: 5 }} />
                    <Text style={styles.regenerateBtnText}>Regenerate</Text>
                  </Pressable>
                )}
              </MotiView>
            ) : null}
          </AnimatePresence>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md,
  },
  backBtn: { width: 36, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  headerSub: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  aiBadge: {
    backgroundColor: colors.accent, borderRadius: radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  aiBadgeText: { color: '#ffffff', fontSize: 11, fontWeight: '900' },
  content: { padding: spacing.lg, paddingBottom: 60 },

  // ── Form ──
  formCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.lg,
    marginBottom: spacing.lg, ...shadows.card,
  },
  formTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  formSub: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 19 },

  // ── Inputs ──
  inputGroup: { marginBottom: spacing.lg },
  inputLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm,
  },
  inputWrapper: {
    borderWidth: 1.5, borderColor: colors.borderInput,
    borderRadius: radius.sm, backgroundColor: colors.surface,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
  },
  inputWrapperMulti: { paddingBottom: spacing.xl },
  textInput: {
    color: colors.textPrimary, fontSize: typography.body,
    minHeight: 44, textAlignVertical: 'top',
  },
  textInputMulti: { minHeight: 80 },

  // ── Pills ──
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: {
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderInput,
    backgroundColor: colors.surface,
  },
  pillSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  pillText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  pillTextSelected: { color: '#ffffff', fontWeight: '700' },

  // ── Generate ──
  generateButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.accent, borderRadius: radius.pill, paddingVertical: 16,
  },
  generateButtonPressed: { backgroundColor: colors.accentHover },
  generateButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },

  // ── Output ──
  outputCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.accent + '40',
    overflow: 'hidden', ...shadows.card,
  },
  outputHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.accentLight,
  },
  outputTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  aiBadgeSm: {
    backgroundColor: colors.accent, width: 22, height: 22, borderRadius: 6,
    justifyContent: 'center', alignItems: 'center',
  },
  outputTitle: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  outputActions: { flexDirection: 'row', gap: spacing.md },
  outputAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  outputActionText: { fontSize: 12, fontWeight: '600', color: colors.accent },
  outputBody: { padding: spacing.lg },
  generatingRow: { flexDirection: 'row', alignItems: 'center' },
  generatingText: { fontSize: 14, color: colors.textSecondary, fontStyle: 'italic' },
  cursor: { width: 2, height: 16, backgroundColor: colors.accent, marginLeft: 2 },
  outputText: { fontSize: 13, color: colors.textPrimary, lineHeight: 22 },
  regenerateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  regenerateBtnText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
});
