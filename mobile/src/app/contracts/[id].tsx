import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MotiView } from 'moti';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, radius, typography, shadows } from '../../theme/tokens';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatAmount(n: number | null | undefined): string {
  if (!n) return '₹TBD';
  return `₹${n.toLocaleString('en-IN')}`;
}

// ─── Section Row ─────────────────────────────────────────────────────────────
function ContractRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={styles.contractRow}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function ContractDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchContract = useCallback(async () => {
    if (!id) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          campaigns (title, description, niche)
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        setContract({
          ...data,
          campaignTitle: data.content?.title || data.campaigns?.title || data.title || 'Contract',
          campaignDescription: data.campaigns?.description || '',
          otherParty: data.brand_name || data.creator_name || 'Brand',
        });
        setSigned(data.status === 'signed' || !!data.signed_at);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not load contract.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchContract(); }, [fetchContract]);

  const handleSign = async () => {
    if (!contract || signed) return;

    Alert.alert(
      'Sign Contract',
      'By signing, you agree to all terms and conditions in this contract. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Now',
          onPress: async () => {
            setSigning(true);
            try {
              const { error } = await supabase
                .from('contracts')
                .update({
                  status: 'signed',
                  signed_at: new Date().toISOString(),
                })
                .eq('id', contract.id);

              if (error) throw error;
              setSigned(true);
              setContract((prev: any) => ({ ...prev, status: 'signed', signed_at: new Date().toISOString() }));
            } catch (e) {
              Alert.alert('Error', 'Could not sign contract. Please try again.');
            } finally {
              setSigning(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (!contract) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Feather name="alert-circle" size={40} color={colors.textMuted} />
        <Text style={{ color: colors.textSecondary, marginTop: spacing.md }}>Contract not found</Text>
      </SafeAreaView>
    );
  }

  const statusLabel = (contract.status || 'draft').toUpperCase();
  const isSigned = signed;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>Contract</Text>
        <View style={[styles.statusBadge, isSigned ? styles.statusSigned : styles.statusPending]}>
          <Text style={[styles.statusText, isSigned ? styles.statusSignedText : styles.statusPendingText]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contract header */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.contractHeader}
        >
          <Text style={styles.contractTitle}>{contract.campaignTitle}</Text>
          <Text style={styles.contractDate}>Generated on {formatDate(contract.created_at)}</Text>
        </MotiView>

        {/* Contract details */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 100 }}
          style={styles.contractBody}
        >
          <Text style={styles.sectionTitle}>Agreement Details</Text>

          <ContractRow label="Campaign" value={contract.campaignTitle} />
          <ContractRow label="Other Party" value={contract.otherParty} />
          <ContractRow label="Contract Amount" value={formatAmount(contract.total_amount || contract.amount)} />
          <ContractRow label="Status" value={contract.status?.toUpperCase() || 'DRAFT'} />
          <ContractRow label="Created" value={formatDate(contract.created_at)} />
          {contract.signed_at && (
            <ContractRow label="Signed On" value={formatDate(contract.signed_at)} />
          )}

          {/* Terms */}
          {contract.terms || contract.campaignDescription ? (
            <>
              <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Terms & Conditions</Text>
              <Text style={styles.termsText}>
                {contract.terms || `This agreement is made between the brand and creator for the campaign "${contract.campaignTitle}".\n\n` +
                  (contract.campaignDescription ? `${contract.campaignDescription}\n\n` : '') +
                  'The creator agrees to deliver the content as specified in the campaign brief within the agreed timeline. ' +
                  'Payment will be released from escrow upon content approval by the brand. ' +
                  'All content rights shall be as agreed in the campaign details. ' +
                  'Both parties agree to maintain confidentiality of the terms herein.'
                }
              </Text>
            </>
          ) : null}

          {/* Deliverables */}
          {contract.deliverables && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Deliverables</Text>
              <Text style={styles.termsText}>
                {Array.isArray(contract.deliverables)
                  ? contract.deliverables.join('\n• ')
                  : contract.deliverables}
              </Text>
            </>
          )}

          {/* Signature section */}
          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Signature</Text>

          {isSigned ? (
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              style={styles.signedBox}
            >
              <MotiView
                from={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 16, delay: 200 }}
                style={styles.signedCheckmark}
              >
                <Feather name="check" size={28} color="#ffffff" />
              </MotiView>
              <Text style={styles.signedTitle}>Contract Signed</Text>
              {contract.signed_at && (
                <Text style={styles.signedDate}>Signed on {formatDate(contract.signed_at)}</Text>
              )}
            </MotiView>
          ) : (
            <View style={styles.signatureBox}>
              <Feather name="edit-3" size={20} color={colors.textMuted} style={{ marginBottom: spacing.sm }} />
              <Text style={styles.signaturePrompt}>Tap the button below to sign this contract</Text>
              <Text style={styles.signatureHint}>Your digital signature will be recorded with timestamp</Text>
            </View>
          )}
        </MotiView>

        {/* ── Sign CTA ── */}
        {!isSigned && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 300 }}
            style={styles.ctaContainer}
          >
            <Pressable
              style={({ pressed }) => [styles.signButton, pressed && styles.signButtonPressed]}
              onPress={handleSign}
              disabled={signing}
            >
              {signing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather name="edit-3" size={16} color="#ffffff" style={{ marginRight: spacing.sm }} />
                  <Text style={styles.signButtonText}>Sign Contract</Text>
                </>
              )}
            </Pressable>
            <Text style={styles.signDisclaimer}>
              By signing, you agree to all terms above. This action is binding and cannot be undone.
            </Text>
          </MotiView>
        )}
      </ScrollView>
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
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  statusBadge: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  statusSigned: { backgroundColor: '#E8F5E9', borderColor: '#00C853' },
  statusPending: { backgroundColor: '#FFF3E0', borderColor: '#FF6D00' },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
  statusSignedText: { color: '#00C853' },
  statusPendingText: { color: '#FF6D00' },
  content: { padding: spacing.lg, paddingBottom: 100 },
  contractHeader: { marginBottom: spacing.lg },
  contractTitle: { fontSize: 22, fontWeight: '900', color: colors.textPrimary, lineHeight: 28, marginBottom: spacing.xs },
  contractDate: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  contractBody: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.lg,
    marginBottom: spacing.lg, ...shadows.card,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md,
  },
  contractRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  rowLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  rowValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '700', flex: 1, textAlign: 'right', marginLeft: spacing.md },
  termsText: { fontSize: 13, color: colors.textSecondary, lineHeight: 21 },
  signatureBox: {
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.borderInput,
    borderRadius: radius.md, padding: spacing.xl,
    alignItems: 'center', backgroundColor: colors.surfaceElevated,
  },
  signaturePrompt: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, textAlign: 'center', marginBottom: 4 },
  signatureHint: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  signedBox: {
    backgroundColor: '#E8F5E9', borderRadius: radius.md, borderWidth: 1,
    borderColor: '#00C853' + '40', padding: spacing.xl, alignItems: 'center',
  },
  signedCheckmark: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#00C853', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
  },
  signedTitle: { fontSize: 18, fontWeight: '900', color: '#00C853' },
  signedDate: { fontSize: 12, color: '#00C853' + 'AA', marginTop: 4 },
  ctaContainer: { gap: spacing.md },
  signButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.accent, borderRadius: radius.pill, paddingVertical: 16, gap: spacing.sm,
  },
  signButtonPressed: { backgroundColor: colors.accentHover },
  signButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  signDisclaimer: { fontSize: 12, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
});
