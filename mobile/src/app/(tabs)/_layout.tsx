import { Platform, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Icon } from '@/ui';
import { useThemeSync } from '@/store/theme';
import { colors, fonts } from '@/theme/tokens';

export default function TabsLayout() {
  const mode = useThemeSync();
  return (
    // key={mode} remounts the tab navigator on a night-mode toggle so the tab
    // bar + every tab rebuild with the new palette (React Navigation doesn't
    // reliably re-apply tabBarStyle on a plain re-render).
    <Tabs
      key={mode}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.faint,
        // A plain themed View as the bar background is the most reliable way to
        // recolor it (tabBarStyle.backgroundColor can lag a night-mode toggle).
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: colors.surface }} />
        ),
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopColor: colors.line,
          borderTopWidth: 1.5,
          height: Platform.OS === 'ios' ? 88 : 66,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Home', tabBarIcon: ({ color, size, focused }) => <Icon name={focused ? 'home' : 'home-outline'} color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="compete"
        options={{ title: 'Compete', tabBarIcon: ({ color, size, focused }) => <Icon name={focused ? 'trophy' : 'trophy-outline'} color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="learn"
        options={{ title: 'Learn', tabBarIcon: ({ color, size, focused }) => <Icon name={focused ? 'school' : 'school-outline'} color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="social"
        options={{ title: 'Friends', tabBarIcon: ({ color, size, focused }) => <Icon name={focused ? 'people' : 'people-outline'} color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size, focused }) => <Icon name={focused ? 'person' : 'person-outline'} color={color} size={size} /> }}
      />
    </Tabs>
  );
}
