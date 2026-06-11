import { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type InputProps = TextInputProps & {
  label?: string;
  helperText?: string;
  errorText?: string;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, helperText, errorText, style, onFocus, onBlur, ...props },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = Boolean(errorText);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        ref={ref}
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.accent}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
      {hasError ? (
        <Text style={styles.error}>{errorText}</Text>
      ) : helperText ? (
        <Text style={styles.helper}>{helperText}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
    marginBottom: spacing.xs,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    height: 50,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    fontSize: typography.body,
  },
  inputFocused: {
    borderColor: 'rgba(255,255,255,0.30)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  inputError: {
    borderColor: 'rgba(248,113,113,0.50)',
    borderWidth: 1.5,
  },
  helper: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontSize: typography.caption,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.xs,
    fontSize: typography.caption,
  },
});
