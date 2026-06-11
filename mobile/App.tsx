import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './src/components/ui/Button';
import { EmptyState } from './src/components/ui/EmptyState';
import { Input } from './src/components/ui/Input';
import { Screen } from './src/components/ui/Screen';
import { AuthSkeleton } from './src/components/ui/Skeleton';
import { useAuthFlow } from './src/hooks/useAuthFlow';
import { colors, spacing, typography } from './src/theme/tokens';

export default function App() {
  const {
    phase,
    title,
    email,
    otp,
    isLoading,
    isBootstrapping,
    errorMessage,
    setEmail,
    setOtp,
    setPhase,
    submitEmail,
    submitOtp,
    resendOtp,
    signOut,
    clearError,
  } = useAuthFlow();

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Secure email-based sign in with production-ready async handling.</Text>

        {isBootstrapping ? <AuthSkeleton /> : null}

        {!isBootstrapping && phase === 'email' ? (
          <>
            <Input
              label="Email address"
              placeholder="you@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              errorText={errorMessage ?? undefined}
              helperText="We will send a one-time code to this email."
            />
            <Button label="Send one-time code" onPress={submitEmail} loading={isLoading} disabled={!email.trim()} />
          </>
        ) : null}

        {!isBootstrapping && phase === 'otp' ? (
          <>
            <Input
              label="One-time code"
              placeholder="Enter 6-digit code"
              keyboardType="number-pad"
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/\s/g, ''))}
              maxLength={6}
              autoCapitalize="none"
              autoCorrect={false}
              errorText={errorMessage ?? undefined}
              helperText={`Code sent to ${email.trim()}`}
            />
            <Button label="Verify and continue" onPress={submitOtp} loading={isLoading} disabled={otp.trim().length < 6} />
            <View style={styles.actionsRow}>
              <Button label="Change email" variant="ghost" onPress={() => setPhase('email')} disabled={isLoading} />
              <Button label="Resend code" variant="ghost" onPress={resendOtp} loading={isLoading} disabled={!email.trim()} />
            </View>
          </>
        ) : null}

        {!isBootstrapping && phase === 'authed' ? (
          <>
            <EmptyState
              title="No data available yet"
              description="Your workspace is connected and ready. Once your backend resources are created, this screen will render live data."
            />
            <View style={styles.actionsColumn}>
              <Button label="Retry session sync" variant="ghost" onPress={clearError} />
              <Button label="Sign out" variant="danger" onPress={signOut} loading={isLoading} />
            </View>
          </>
        ) : null}

        <StatusBar style="auto" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: typography.title,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    fontSize: typography.body,
    lineHeight: 22,
  },
  actionsRow: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionsColumn: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
