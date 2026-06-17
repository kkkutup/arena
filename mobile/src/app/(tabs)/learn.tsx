import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Txt, Card, Icon, Button } from '@/ui';
import { colors, spacing, radius } from '@/theme/tokens';

// Learn hub: a free, playable Backtest challenge now; premium Lessons later.
export default function Learn() {
  const router = useRouter();

  return (
    <Screen>
      <View style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
        <Txt variant="title">Learn</Txt>
        <Txt variant="body" color={colors.muted} style={{ marginTop: 2 }}>
          Practice with backtests, master with lessons
        </Txt>
      </View>

      {/* Playable backtest challenge */}
      <Pressable onPress={() => router.push('/backtest')}>
        <Card style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: radius.lg,
                backgroundColor: colors.upTint,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="stats-chart" size={26} color={colors.up} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Txt variant="h3">Backtest challenge</Txt>
                <View
                  style={{
                    backgroundColor: colors.upTint,
                    borderRadius: radius.sm,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Txt variant="tiny" color={colors.upDark}>
                    FREE
                  </Txt>
                </View>
              </View>
              <Txt variant="small" color={colors.muted} style={{ marginTop: 2 }}>
                A mystery chart appears — set your stop-loss & take-profit, reveal the outcome, earn XP.
              </Txt>
            </View>
          </View>
          <Button label="Play" variant="success" full onPress={() => router.push('/backtest')} />
        </Card>
      </Pressable>

      {/* Premium lessons teaser */}
      <Card
        flat
        style={{
          backgroundColor: colors.ink,
          borderColor: colors.ink,
          alignItems: 'center',
          paddingVertical: spacing.xl,
          marginTop: spacing.lg,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: radius.pill,
            backgroundColor: 'rgba(255,200,61,0.16)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="school" size={30} color={colors.gold} />
        </View>
        <Txt variant="tiny" color={colors.gold} style={{ marginTop: spacing.md }}>
          ARENA PREMIUM
        </Txt>
        <Txt variant="h2" color={colors.white} style={{ marginTop: spacing.xs, textAlign: 'center' }}>
          Lessons
        </Txt>
        <Txt
          variant="body"
          color={colors.faint}
          style={{ marginTop: spacing.sm, textAlign: 'center', maxWidth: 280 }}
        >
          Bite-sized, Duolingo-style lessons that teach trading strategy step by step.
        </Txt>
        <Button label="Coming soon" variant="neutral" disabled style={{ marginTop: spacing.lg }} />
      </Card>
    </Screen>
  );
}
