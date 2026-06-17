import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Txt, Button, Card, Icon, EmptyState } from '@/ui';
import { usePublicCompetitions, useDivision } from '@/hooks/queries';
import { CompetitionCard } from '@/features/competitions/CompetitionCard';
import { DiamondPill } from '@/features/wallet/DiamondPill';
import { tierMeta } from '@/features/competitions/util';
import { useMyCompetitions } from '@/store/competitions';
import { useThemeSync } from '@/store/theme';
import { useIsFresh } from '@/hooks/useIsFresh';
import type { Division } from '@/api/types';
import { colors, spacing, radius } from '@/theme/tokens';
import { timeLeft } from '@/lib/format';

export default function Compete() {
  useThemeSync();
  const router = useRouter();
  const fresh = useIsFresh();
  const pub = usePublicCompetitions();
  const div = useDivision();
  const myComps = useMyCompetitions((s) => s.mine);

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

      {!fresh && div.data ? (
        <DivisionCard div={div.data} onPress={() => router.push('/division')} />
      ) : null}

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

function DivisionCard({ div, onPress }: { div: Division; onPress: () => void }) {
  const meta = tierMeta(div.tier);
  const me = div.rows.find((r) => r.isMe);
  return (
    <Pressable onPress={onPress}>
      <Card style={{ marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: radius.lg,
            backgroundColor: meta.color + '22',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="trophy" size={28} color={meta.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt variant="h3">{meta.label} Division</Txt>
          <Txt variant="small" color={colors.muted}>
            Rank #{me?.rank ?? '—'} · resets in {timeLeft(div.weekEndsAt)}
          </Txt>
        </View>
        <Icon name="chevron-forward" size={22} color={colors.faint} />
      </Card>
    </Pressable>
  );
}
