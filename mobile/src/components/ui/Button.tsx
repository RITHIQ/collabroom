import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  icon?: string;
  fullWidth?: boolean;
};

export function Button({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  icon,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        variant === 'primary'   && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost'     && styles.ghost,
        variant === 'outline'   && styles.outline,
        variant === 'danger'    && styles.danger,
        variant === 'success'   && styles.success,
        pressed && !isDisabled && variant === 'primary'   && styles.primaryPressed,
        pressed && !isDisabled && variant === 'secondary' && styles.secondaryPressed,
        pressed && !isDisabled && variant === 'ghost'     && styles.ghostPressed,
        pressed && !isDisabled && variant === 'outline'   && styles.outlinePressed,
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.background : colors.textPrimary}
          size="small"
        />
      ) : (
        <View style={styles.inner}>
          {icon && (
            <Feather
              name={icon as any}
              size={15}
              color={
                variant === 'primary'
                  ? colors.background
                  : variant === 'danger'
                  ? colors.danger
                  : variant === 'success'
                  ? colors.success
                  : colors.textPrimary
              }
            />
          )}
          <Text
            style={[
              styles.text,
              variant === 'primary'   && styles.textPrimary,
              variant === 'secondary' && styles.textSecondary,
              variant === 'ghost'     && styles.textGhost,
              variant === 'outline'   && styles.textOutline,
              variant === 'danger'    && styles.textDanger,
              variant === 'success'   && styles.textSuccess,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  // ── PRIMARY — white bg, black text (matches web btn-primary)
  primary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  primaryPressed: {
    backgroundColor: 'rgba(255,255,255,0.85)',
  },

  // ── SECONDARY — transparent, white border
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  secondaryPressed: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.40)',
  },

  // ── GHOST — no border, subtle bg on press
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostPressed: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  // ── OUTLINE — white border, white text
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  outlinePressed: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // ── DANGER
  danger: {
    backgroundColor: 'rgba(248,113,113,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.25)',
  },

  // ── SUCCESS
  success: {
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.25)',
  },

  disabled: {
    opacity: 0.4,
  },

  // ── Text styles
  text: {
    fontSize: typography.button,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  textPrimary:   { color: '#0a0a0a' },
  textSecondary: { color: '#ffffff' },
  textGhost:     { color: 'rgba(255,255,255,0.70)' },
  textOutline:   { color: '#ffffff' },
  textDanger:    { color: '#f87171' },
  textSuccess:   { color: '#4ade80' },
});
