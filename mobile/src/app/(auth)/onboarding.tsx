import { useState } from 'react';
import {
  View,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Txt, Button, Icon } from '@/ui';
import type { IconName } from '@/ui/Icon';
import { colors, spacing, radius } from '@/theme/tokens';

const SLIDES: { icon: IconName; color: string; title: string; body: string }[] = [
  {
    icon: 'trophy',
    color: colors.gold,
    title: 'Compete with friends',
    body: 'Climb leaderboards in private leagues, weekly divisions, and 1-on-1 duels.',
  },
  {
    icon: 'pulse',
    color: colors.up,
    title: 'Trade live markets',
    body: 'Practice on real prices with virtual money — go long, short, and use leverage. Zero risk.',
  },
  {
    icon: 'flame',
    color: colors.flame,
    title: 'Build your streak',
    body: 'Earn XP, keep your streak alive, and rise from Bronze all the way to Diamond.',
  },
];

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [page, setPage] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={{ flex: 1 }}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <View style={[styles.iconWrap, { backgroundColor: s.color + '22' }]}>
              <Icon name={s.icon} size={72} color={s.color} />
            </View>
            <Txt variant="title" center>
              {s.title}
            </Txt>
            <Txt variant="body" color={colors.muted} center>
              {s.body}
            </Txt>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === page ? colors.primary : colors.line,
                width: i === page ? 22 : 8,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.cta}>
        <Button label="Get started" full onPress={() => router.push('/signup')} />
        <Button
          label="I already have an account"
          variant="neutral"
          full
          onPress={() => router.push('/login')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  iconWrap: {
    width: 140,
    height: 140,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: spacing.lg },
  dot: { height: 8, borderRadius: 4 },
  cta: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, gap: spacing.md },
});
