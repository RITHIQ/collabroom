import { Tabs } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { colors, shadows } from '../../theme/tokens';
import { Feather } from '@expo/vector-icons';

// Red LIVE badge for Campaigns tab
function LiveBadge() {
  return (
    <View style={badgeStyles.container}>
      <View style={badgeStyles.dot} />
      <Text style={badgeStyles.label}>LIVE</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f87171',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    position: 'absolute',
    top: -8,
    right: -18,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
    marginRight: 3,
  },
  label: {
    color: '#ffffff',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }: { color: string }) => (
            <Feather name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }: { color: string }) => (
            <Feather name="search" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="campaigns"
        options={{
          title: 'Campaigns',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <View style={{ position: 'relative' }}>
              <Feather name="briefcase" size={22} color={color} />
              {focused && <LiveBadge />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color }: { color: string }) => (
            <Feather name="message-circle" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-brief"
        options={{
          title: 'AI Brief',
          tabBarIcon: ({ color }: { color: string }) => (
            <Feather name="zap" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }: { color: string }) => (
            <Feather name="user" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0f0f0f',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    height: 68,
    paddingBottom: 10,
    paddingTop: 8,
    ...shadows.nav,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabBarIcon: {
    marginBottom: 0,
  },
});
