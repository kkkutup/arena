import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Txt, Button, Card, Icon, EmptyState } from '@/ui';
import { usePublicCompetitions, useCompetitions, useRanking } from '@/hooks/queries';
import { CompetitionCard } from '@/features/competitions/CompetitionCard';
import { GlobalArenaCard } from '@/features/competitions/GlobalArenaCard';
import { DiamondPill } from '@/features/wallet/DiamondPill';
import { useThemeSync } from '@/store/theme';
import { colors, spacing, radius } from '@/theme/tokens';

export default function Compete() {
  useThemeSync();
  const router = useRouter();
  const pub = usePublicCompetitions();
  const myComps = useCompetitions().data ?? [];
  const me = useRanking('xp').data?.me;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm }}>
        <Txt variant="title">Compete</Txt>
        <DiamondPill />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Button
            label="Create"
            full
            left={<Icon name="add" color={colors.white} />}
            onPress={() => router.push('/create-competition')}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label="Join code"
            variant="neutral"
            full
            left={<Icon name="key" color={colors.ink} />}
            onPress={() => router.push('/join')}
          />
        </View>
      </View>

      <Pressable onPress={() => router.push('/global')}>
        <Card style={{ marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: radius.lg,
              backgroundColor: colors.primaryTint,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="podium" size={26} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt variant="h3">Global ranking</Txt>
            <Txt variant="small" color={colors.muted}>
              {me ? `You're #${me.rank} · earn XP to climb` : 'Earn XP to climb the board'}
            </Txt>
          </View>
          <Icon name="chevron-forward" size={22} color={colors.faint} />
        </Card>
      </Pressable>

      <GlobalArenaCard />

      <Txt variant="h2" style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
        Your competitions
      </Txt>
      {myComps.length ? (
        <View style={{ gap: spacing.md }}>
          {myComps.map((c) => (
            <CompetitionCard key={c.id} c={c} />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="trophy-outline"
          text="No competitions yet — create one or browse public below"
        />
      )}

      <Txt variant="h2" style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
        Browse public
      </Txt>
      <View style={{ gap: spacing.md }}>
        {pub.data?.map((c) => (
          <CompetitionCard key={c.id} c={c} />
        ))}
      </View>
    </Screen>
  );
}
