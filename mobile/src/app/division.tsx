import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Txt, Icon } from '@/ui';
import { useDivision } from '@/hooks/queries';
import { tierMeta } from '@/features/competitions/util';
import { LeaderboardList } from '@/features/competitions/LeaderboardList';
import { colors, spacing, radius } from '@/theme/tokens';
import { timeLeft } from '@/lib/format';

export default function DivisionScreen() {
  const router = useRouter();
  const { data: div } = useDivision();

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={{ paddingVertical: spacing.sm, alignSelf: 'flex-start' }}>
        <Icon name="chevron-back" size={28} color={colors.ink} />
      </Pressable>

      {div ? (
        <>
          <View style={{ alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: radius.xl,
                backgroundColor: tierMeta(div.tier).color + '22',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="trophy" size={36} color={tierMeta(div.tier).color} />
            </View>
            <Txt variant="title">{tierMeta(div.tier).label} Division</Txt>
            <Txt variant="body" color={colors.muted}>
              Resets in {timeLeft(div.weekEndsAt)}
            </Txt>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, marginBottom: spacing.md }}>
            <Legend color={colors.up} label={`Top ${div.promoteZone} promote`} />
            <Legend color={colors.down} label={`Bottom ${div.relegateZone} relegate`} />
          </View>

          <LeaderboardList rows={div.rows} promoteZone={div.promoteZone} relegateZone={div.relegateZone} />
        </>
      ) : (
        <Txt variant="body" color={colors.muted}>
          Loading…
        </Txt>
      )}
    </Screen>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color }} />
      <Txt variant="small" color={colors.muted}>
        {label}
      </Txt>
    </View>
  );
}
