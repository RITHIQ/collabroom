import { ActivityIndicator, View } from 'react-native';
import { colors } from '../theme/tokens';

export default function RootIndex() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
