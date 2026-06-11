import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { Feather } from '@expo/vector-icons';
import { useAuthFlow } from '../hooks/useAuthFlow';
import { AuthMode } from '../hooks/useAuthFlow';

const { width } = Dimensions.get('window');

// ─── Dark palette (matches web exactly) ─────────────────────────────────────
const D = {
  bg: '#0a0a0a',
  surface: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  borderFocus: 'rgba(255,255,255,0.28)',
  borderError: '#f87171',
  text: '#ffffff',
  textSub: '#888888',
  textMuted: 'rgba(255,255,255,0.2)',
  accent: '#6B4EFF',
  btnBg: '#ffffff',
  btnText: '#0a0a0a',
};

// ─── Background gradient orbs ─────────────────────────────────────────────────
function BackgroundOrbs() {
  return (
    <>
      <MotiView
        from={{ opacity: 0.1, scale: 0.85 }}
        animate={{ opacity: 0.18, scale: 1.12 }}
        transition={{ type: 'timing', duration: 4500, loop: true, repeatReverse: true }}
        style={[s.orb, { backgroundColor: '#6B4EFF', top: -80, right: -80, width: 260, height: 260 }]}
      />
      <MotiView
        from={{ opacity: 0.06, scale: 1 }}
        animate={{ opacity: 0.13, scale: 0.82 }}
        transition={{ type: 'timing', duration: 5800, loop: true, repeatReverse: true, delay: 800 }}
        style={[s.orb, { backgroundColor: '#1e40af', bottom: 120, left: -100, width: 300, height: 300 }]}
      />
      <MotiView
        from={{ opacity: 0.04 }}
        animate={{ opacity: 0.09 }}
        transition={{ type: 'timing', duration: 3000, loop: true, repeatReverse: true, delay: 1600 }}
        style={[s.orb, { backgroundColor: '#7c3aed', top: '45%', right: -60, width: 180, height: 180 }]}
      />
    </>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <MotiView
      from={{ opacity: 0, translateY: -18 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 80 }}
      style={s.logoRow}
    >
      <MotiView
        from={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 160 }}
        style={s.logoIconBox}
      >
        <Feather name="zap" size={14} color="#ffffff" />
      </MotiView>
      <Text style={s.logoText}>ColabRoom</Text>
    </MotiView>
  );
}

// ─── Animated Submit Button ───────────────────────────────────────────────────
function SubmitButton({
  label,
  isLoading,
  disabled,
  onPress,
}: {
  label: string;
  isLoading: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <MotiView
      animate={{ opacity: disabled && !isLoading ? 0.45 : 1, scale: pressed ? 0.975 : 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      style={{ marginTop: 18 }}
    >
      <Pressable
        style={s.submitBtn}
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
      >
        {isLoading ? (
          <ActivityIndicator color={D.btnText} size="small" />
        ) : (
          <>
            <Text style={s.submitText}>{label}</Text>
            <Feather name="arrow-right" size={16} color={D.btnText} />
          </>
        )}
      </Pressable>
    </MotiView>
  );
}

// ─── Input Row ────────────────────────────────────────────────────────────────
function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
  iconName,
  onToggleSecure,
  isFocused,
  onFocus,
  onBlur,
  hasError,
  autoFocus,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: any;
  autoCapitalize?: any;
  secureTextEntry?: boolean;
  iconName: string;
  onToggleSecure?: () => void;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  hasError?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <View style={s.inputGroup}>
      <Text style={s.inputLabel}>{label}</Text>
      <MotiView
        animate={{
          borderColor: hasError
            ? D.borderError
            : isFocused
            ? D.borderFocus
            : D.border,
          backgroundColor: isFocused ? 'rgba(255,255,255,0.06)' : D.surface,
        }}
        transition={{ type: 'timing', duration: 180 }}
        style={s.inputWrapper}
      >
        <Feather
          name={iconName as any}
          size={15}
          color={isFocused ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)'}
          style={s.inputIcon}
        />
        <TextInput
          style={s.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={D.textMuted}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={autoCapitalize || 'none'}
          autoCorrect={false}
          secureTextEntry={secureTextEntry}
          onFocus={onFocus}
          onBlur={onBlur}
          selectionColor="rgba(255,255,255,0.6)"
          autoFocus={autoFocus}
        />
        {onToggleSecure != null && (
          <TouchableOpacity onPress={onToggleSecure} style={s.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather
              name={secureTextEntry ? 'eye' : 'eye-off'}
              size={15}
              color="rgba(255,255,255,0.3)"
            />
          </TouchableOpacity>
        )}
      </MotiView>
    </View>
  );
}

// ─── Password strength meter ──────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;
  const barColor =
    score <= 1 ? '#f87171' : score === 2 ? '#fbbf24' : score === 3 ? '#60a5fa' : '#4ade80';
  const label = ['', 'Weak', 'Fair', 'Good', 'Strong'][score];
  return (
    <View style={{ marginTop: 8, paddingHorizontal: 2 }}>
      <View style={{ flexDirection: 'row', gap: 4, marginBottom: 5 }}>
        {[1, 2, 3, 4].map(i => (
          <MotiView
            key={i}
            animate={{ backgroundColor: i <= score ? barColor : 'rgba(255,255,255,0.08)' }}
            transition={{ type: 'timing', duration: 300 }}
            style={{ flex: 1, height: 2.5, borderRadius: 2 }}
          />
        ))}
      </View>
      {label ? <Text style={{ fontSize: 10, color: barColor, fontWeight: '600' }}>{label}</Text> : null}
    </View>
  );
}

// ─── Alert Banner ──────────────────────────────────────────────────────────────
function AlertBanner({ message, type }: { message: string; type: 'error' | 'success' }) {
  const isError = type === 'error';
  return (
    <MotiView
      from={{ opacity: 0, translateY: -6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      style={[s.banner, isError ? s.bannerError : s.bannerSuccess]}
    >
      <Feather
        name={isError ? 'alert-circle' : 'check-circle'}
        size={13}
        color={isError ? '#f87171' : '#4ade80'}
        style={{ marginRight: 8 }}
      />
      <Text style={[s.bannerText, { color: isError ? '#f87171' : '#4ade80' }]}>{message}</Text>
    </MotiView>
  );
}

// ─── Stats strip ──────────────────────────────────────────────────────────────
function StatsStrip() {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500, delay: 700 }}
      style={s.statsRow}
    >
      {[['50K+', 'Creators'], ['8K+', 'Brands'], ['₹120Cr+', 'Paid Out']].map(([val, label], i) => (
        <View key={i} style={s.statPill}>
          <Text style={s.statVal}>{val}</Text>
          <Text style={s.statLabel}>{label}</Text>
        </View>
      ))}
    </MotiView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AuthScreen() {
  const {
    mode, setMode,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    fullName, setFullName,
    isBootstrapping, isLoading,
    errorMessage, successMessage,
    signIn, signUp, forgotPassword,
    clearMessages,
  } = useAuthFlow();

  const [showPass, setShowPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const focus = (name: string) => () => setFocused(name);
  const blur = () => setFocused(null);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    clearMessages();
    setShowPass(false);
    setShowConfPass(false);
  };

  if (isBootstrapping) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="light-content" backgroundColor={D.bg} />
        <MotiView
          from={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        >
          <ActivityIndicator color="rgba(255,255,255,0.4)" size="large" />
        </MotiView>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={D.bg} />
      <BackgroundOrbs />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* ── Logo ── */}
            <Logo />

            {/* ── Card ── */}
            <MotiView
              from={{ opacity: 0, translateY: 32 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 200 }}
              style={s.card}
            >
              <AnimatePresence exitBeforeEnter>

                {/* ══════════════ LOGIN ══════════════ */}
                {mode === 'login' && (
                  <MotiView
                    key="login"
                    from={{ opacity: 0, translateX: 30 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    exit={{ opacity: 0, translateX: -30 }}
                    transition={{ type: 'timing', duration: 240 }}
                  >
                    <Text style={s.formTitle}>Welcome back</Text>
                    <Text style={s.formSub}>Sign in to your ColabRoom account</Text>

                    <InputField
                      label="EMAIL ADDRESS"
                      value={email}
                      onChangeText={setEmail}
                      placeholder="you@example.com"
                      keyboardType="email-address"
                      iconName="mail"
                      isFocused={focused === 'email'}
                      onFocus={focus('email')}
                      onBlur={blur}
                      hasError={!!errorMessage}
                    />

                    {/* Password with forgot link */}
                    <View style={s.inputGroup}>
                      <View style={s.passLabelRow}>
                        <Text style={s.inputLabel}>PASSWORD</Text>
                        <TouchableOpacity onPress={() => switchMode('forgot')}>
                          <Text style={s.forgotLink}>Forgot password?</Text>
                        </TouchableOpacity>
                      </View>
                      <MotiView
                        animate={{
                          borderColor: focused === 'pass' ? D.borderFocus : D.border,
                          backgroundColor: focused === 'pass' ? 'rgba(255,255,255,0.06)' : D.surface,
                        }}
                        transition={{ type: 'timing', duration: 180 }}
                        style={s.inputWrapper}
                      >
                        <Feather
                          name="lock"
                          size={15}
                          color={focused === 'pass' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)'}
                          style={s.inputIcon}
                        />
                        <TextInput
                          style={s.textInput}
                          value={password}
                          onChangeText={setPassword}
                          placeholder="••••••••"
                          placeholderTextColor={D.textMuted}
                          secureTextEntry={!showPass}
                          onFocus={focus('pass')}
                          onBlur={blur}
                          selectionColor="rgba(255,255,255,0.6)"
                          onSubmitEditing={signIn}
                          returnKeyType="go"
                        />
                        <TouchableOpacity onPress={() => setShowPass(p => !p)} style={s.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Feather name={showPass ? 'eye-off' : 'eye'} size={15} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>
                      </MotiView>
                    </View>

                    {errorMessage ? <AlertBanner message={errorMessage} type="error" /> : null}
                    {successMessage ? <AlertBanner message={successMessage} type="success" /> : null}

                    <SubmitButton
                      label="Sign In"
                      isLoading={isLoading}
                      disabled={!email.trim() || !password}
                      onPress={signIn}
                    />

                    <View style={s.switchRow}>
                      <Text style={s.switchText}>Don't have an account?</Text>
                      <TouchableOpacity onPress={() => switchMode('signup')}>
                        <Text style={s.switchLink}> Sign up free</Text>
                      </TouchableOpacity>
                    </View>
                  </MotiView>
                )}

                {/* ══════════════ SIGN UP ══════════════ */}
                {mode === 'signup' && (
                  <MotiView
                    key="signup"
                    from={{ opacity: 0, translateX: 30 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    exit={{ opacity: 0, translateX: -30 }}
                    transition={{ type: 'timing', duration: 240 }}
                  >
                    <TouchableOpacity style={s.backBtn} onPress={() => switchMode('login')}>
                      <Feather name="arrow-left" size={15} color="rgba(255,255,255,0.4)" />
                      <Text style={s.backText}>Back to sign in</Text>
                    </TouchableOpacity>

                    <Text style={s.formTitle}>Join ColabRoom</Text>
                    <Text style={s.formSub}>Create your account to get started</Text>

                    <InputField
                      label="FULL NAME"
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="Your full name"
                      iconName="user"
                      autoCapitalize="words"
                      isFocused={focused === 'name'}
                      onFocus={focus('name')}
                      onBlur={blur}
                      autoFocus
                    />

                    <InputField
                      label="EMAIL ADDRESS"
                      value={email}
                      onChangeText={setEmail}
                      placeholder="you@example.com"
                      keyboardType="email-address"
                      iconName="mail"
                      isFocused={focused === 'email'}
                      onFocus={focus('email')}
                      onBlur={blur}
                      hasError={!!errorMessage}
                    />

                    {/* Password with strength */}
                    <View style={s.inputGroup}>
                      <Text style={s.inputLabel}>PASSWORD</Text>
                      <MotiView
                        animate={{
                          borderColor: focused === 'pass' ? D.borderFocus : D.border,
                          backgroundColor: focused === 'pass' ? 'rgba(255,255,255,0.06)' : D.surface,
                        }}
                        transition={{ type: 'timing', duration: 180 }}
                        style={s.inputWrapper}
                      >
                        <Feather
                          name="lock"
                          size={15}
                          color={focused === 'pass' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)'}
                          style={s.inputIcon}
                        />
                        <TextInput
                          style={s.textInput}
                          value={password}
                          onChangeText={setPassword}
                          placeholder="Create a strong password"
                          placeholderTextColor={D.textMuted}
                          secureTextEntry={!showPass}
                          onFocus={focus('pass')}
                          onBlur={blur}
                          selectionColor="rgba(255,255,255,0.6)"
                        />
                        <TouchableOpacity onPress={() => setShowPass(p => !p)} style={s.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Feather name={showPass ? 'eye-off' : 'eye'} size={15} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>
                      </MotiView>
                      <PasswordStrength password={password} />
                    </View>

                    <InputField
                      label="CONFIRM PASSWORD"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Re-enter your password"
                      iconName="lock"
                      secureTextEntry={!showConfPass}
                      onToggleSecure={() => setShowConfPass(p => !p)}
                      isFocused={focused === 'confirm'}
                      onFocus={focus('confirm')}
                      onBlur={blur}
                      hasError={!!errorMessage && errorMessage.includes('match')}
                    />

                    {errorMessage ? <AlertBanner message={errorMessage} type="error" /> : null}
                    {successMessage ? <AlertBanner message={successMessage} type="success" /> : null}

                    <SubmitButton
                      label="Create Account"
                      isLoading={isLoading}
                      disabled={!email.trim() || !password || !fullName.trim() || !confirmPassword}
                      onPress={signUp}
                    />

                    <Text style={s.termsNote}>
                      By signing up you agree to our{' '}
                      <Text style={s.termsLink}>Terms of Service</Text>
                      {' & '}
                      <Text style={s.termsLink}>Privacy Policy</Text>
                    </Text>

                    <View style={s.switchRow}>
                      <Text style={s.switchText}>Already have an account?</Text>
                      <TouchableOpacity onPress={() => switchMode('login')}>
                        <Text style={s.switchLink}> Sign in</Text>
                      </TouchableOpacity>
                    </View>
                  </MotiView>
                )}

                {/* ══════════════ FORGOT PASSWORD ══════════════ */}
                {mode === 'forgot' && (
                  <MotiView
                    key="forgot"
                    from={{ opacity: 0, translateX: 30 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    exit={{ opacity: 0, translateX: -30 }}
                    transition={{ type: 'timing', duration: 240 }}
                  >
                    <TouchableOpacity style={s.backBtn} onPress={() => switchMode('login')}>
                      <Feather name="arrow-left" size={15} color="rgba(255,255,255,0.4)" />
                      <Text style={s.backText}>Back to sign in</Text>
                    </TouchableOpacity>

                    <Text style={s.formTitle}>Reset password</Text>
                    <Text style={s.formSub}>
                      Enter your email and we'll send you a reset link
                    </Text>

                    <InputField
                      label="EMAIL ADDRESS"
                      value={email}
                      onChangeText={setEmail}
                      placeholder="you@example.com"
                      keyboardType="email-address"
                      iconName="mail"
                      isFocused={focused === 'email'}
                      onFocus={focus('email')}
                      onBlur={blur}
                      autoFocus
                    />

                    {errorMessage ? <AlertBanner message={errorMessage} type="error" /> : null}
                    {successMessage ? <AlertBanner message={successMessage} type="success" /> : null}

                    <SubmitButton
                      label="Send Reset Link"
                      isLoading={isLoading}
                      disabled={!email.trim()}
                      onPress={forgotPassword}
                    />
                  </MotiView>
                )}
              </AnimatePresence>
            </MotiView>

            {/* ── Stats (login screen only) ── */}
            {mode === 'login' && <StatsStrip />}

            {/* ── Global terms ── */}
            {mode === 'login' && (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: 'timing', duration: 500, delay: 800 }}
              >
                <Text style={s.termsGlobal}>
                  By continuing, you accept our{' '}
                  <Text style={s.termsLink}>Terms of Service</Text>
                  {' & '}
                  <Text style={s.termsLink}>Privacy Policy</Text>
                </Text>
              </MotiView>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: D.bg,
  },

  // ── background orbs
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },

  // ── scroll
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 48,
  },

  // ── logo
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 36,
  },
  logoIconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.4,
  },

  // ── card
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },

  // ── form headings
  formTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: D.text,
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  formSub: {
    fontSize: 13.5,
    color: D.textSub,
    marginBottom: 28,
    lineHeight: 20,
  },

  // ── back button
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  backText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },

  // ── inputs
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.9,
    marginBottom: 8,
  },
  passLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotLink: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: D.border,
    borderRadius: 10,
    backgroundColor: D.surface,
    height: 48,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: D.text,
    fontSize: 14.5,
    height: 48,
    paddingRight: 4,
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 8,
  },

  // ── submit button
  submitBtn: {
    height: 50,
    backgroundColor: D.btnBg,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '700',
    color: D.btnText,
    letterSpacing: -0.2,
  },

  // ── alert banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
    marginTop: 4,
  },
  bannerError: {
    backgroundColor: 'rgba(248,113,113,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.2)',
  },
  bannerSuccess: {
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.2)',
  },
  bannerText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  // ── switch row
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  switchText: {
    fontSize: 13.5,
    color: D.textSub,
  },
  switchLink: {
    fontSize: 13.5,
    color: D.text,
    fontWeight: '700',
  },

  // ── terms (inside signup form)
  termsNote: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 14,
    marginBottom: 2,
  },
  termsLink: {
    color: 'rgba(255,255,255,0.45)',
    textDecorationLine: 'underline',
  },

  // ── stats strip
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
    flexWrap: 'wrap',
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
    color: D.text,
  },
  statLabel: {
    fontSize: 11.5,
    color: D.textSub,
  },

  // ── global terms (login screen bottom)
  termsGlobal: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
    lineHeight: 17,
  },
});
