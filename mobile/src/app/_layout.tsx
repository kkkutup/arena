import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CelebrationOverlay } from '@/ui';
import { TourOverlay } from '@/features/tour/TourOverlay';
import { DiamondStoreSheet } from '@/features/wallet/DiamondStoreSheet';
import { enableFreeze } from 'react-native-screens';
import * as SystemUI from 'expo-system-ui';
import { useTheme, useThemeSync } from '@/store/theme';
import { useSession } from '@/store/session';
import { useWallet } from '@/store/wallet';
import { useLessons } from '@/store/lessons';
import { useMyCompetitions } from '@/store/competitions';
import { useTrade } from '@/store/trade';
import { useStoresHydrated } from '@/store/persist';
import { colors } from '@/theme/tokens';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';

// Stable list so the hydration hook doesn't re-subscribe every render.
const PERSISTED = [useSession, useTheme, useWallet, useLessons, useMyCompetitions, useTrade];

// Don't freeze inactive screens: they subscribe to the theme store, and a
// frozen screen misses store updates and won't re-render on unfreeze — which
// left some tabs stuck on the old palette after a night-mode toggle.
enableFreeze(false);

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5_000, retry: 1 } },
});

export default function RootLayout() {
  const mode = useThemeSync();
  const hydrated = useStoresHydrated(PERSISTED);
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  const ready = fontsLoaded && hydrated;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  // Tint the root window (under/behind screens + status bar) to match the theme.
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.bg);
  }, [mode]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
            }}
          />
          <CelebrationOverlay />
          <TourOverlay />
          <DiamondStoreSheet />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
