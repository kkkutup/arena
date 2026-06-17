import { Stack } from 'expo-router';
import { useThemeSync } from '@/store/theme';
import { colors } from '@/theme/tokens';

export default function AuthLayout() {
  useThemeSync();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}
    />
  );
}
