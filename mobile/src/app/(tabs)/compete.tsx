import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Txt, Button, Card, Icon } from '@/ui';
import { useCompetitions, usePublicCompetitions, useDivision } from '@/hooks/queries';
import { CompetitionCard } from '@/features/competitions/CompetitionCard';
import { tierMeta } from '@/features/competitions/util';
import type { Division } from '@/api/types';
import { colors, spacing, radius } from '@/theme/tokens';
import { timeLeft } from '@/lib/format';

export default function Compete() {
  const router = useRouter();
  const mine = useCompetitions();
  const pub = usePublicCompetitions();
  const div = useDivision();

  return (
    <Screen>
      <Txt variant="title" style={{ marginTop: spacing.sm }}>
        Compete
      </Txt>

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

      {div.data ? <DivisionCard div={div.data} onPress={() => router.push('/division')} /> : null}

      <Txt variant="h2" style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
        Your competitions
      </Txt>
      <View style={{ gap: spacing.md }}>
        {mine.data?.map((c) => (
          <CompetitionCard key={c.id} c={c} />
        ))}
      </View>

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
