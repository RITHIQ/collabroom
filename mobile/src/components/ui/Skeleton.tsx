import { DimensionValue, StyleSheet, View } from 'react-native';
import { MotiView } from 'moti';
import { radius, spacing } from '../../theme/tokens';

type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radiusSize?: number;
};

export function Skeleton({ width = '100%', height = 16, radiusSize = radius.md }: SkeletonProps) {
  return (
    <MotiView
      from={{ opacity: 0.3 }}
      animate={{ opacity: 0.7 }}
      transition={{ type: 'timing', duration: 900, loop: true, repeatReverse: true }}
      style={[styles.base, { width, height, borderRadius: radiusSize }]}
    />
  );
}

export function AuthSkeleton() {
  return (
    <View style={styles.wrapper}>
      <Skeleton width="60%" height={32} radiusSize={radius.sm} />
      <View style={styles.gap} />
      <Skeleton height={16} width="80%" />
      <View style={styles.gap} />
      <Skeleton height={20} width="90%" />
      <View style={styles.gap} />
      <Skeleton height={50} />
      <View style={styles.gap} />
      <Skeleton height={52} radiusSize={radius.pill} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    // Dark shimmer: light white on dark background
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  wrapper: {
    marginTop: spacing.lg,
  },
  gap: {
    height: spacing.md,
  },
});
