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
        options={{ title: 'Home', tabBarIcon: ({ color, size, focused }) => <Icon name={focused ? 'home' : 'home-outline'} color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="compete"
        options={{ title: 'Compete', tabBarIcon: ({ color, size, focused }) => <Icon name={focused ? 'trophy' : 'trophy-outline'} color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="trade"
        options={{ title: 'Trade', tabBarIcon: ({ color, size, focused }) => <Icon name={focused ? 'pulse' : 'pulse-outline'} color={color} size={size} /> }}
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
