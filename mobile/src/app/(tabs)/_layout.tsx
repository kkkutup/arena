import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Icon } from '@/ui';
import { colors, fonts } from '@/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.faint,
        tabBarStyle: {
          backgroundColor: colors.surface,
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
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="compete"
        options={{ title: 'Compete', tabBarIcon: ({ color, size }) => <Icon name="trophy" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="trade"
        options={{ title: 'Trade', tabBarIcon: ({ color, size }) => <Icon name="pulse" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="social"
        options={{ title: 'Friends', tabBarIcon: ({ color, size }) => <Icon name="people" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Icon name="person" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
