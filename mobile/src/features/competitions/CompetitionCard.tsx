import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Txt, Pill } from '@/ui';
import type { Competition } from '@/api/types';
import { colors, spacing } from '@/theme/tokens';
import { fmtPct, timeLeft } from '@/lib/format';
import { compTypeMeta } from './util';

export function CompetitionCard({ c }: { c: Competition }) {
  const router = useRouter();
  const meta = compTypeMeta(c.type);
  const joined = c.myRank != null;
  const ret = c.myReturnPct ?? 0;

  return (
    <Pressable onPress={() => router.push({ pathname: '/competition/[id]', params: { id: c.id } })}>
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pill label={meta.label} color={meta.color} tint={meta.tint} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {c.status === 'LIVE' ? (
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.up }} />
            ) : null}
            <Txt variant="small" color={colors.muted}>
              {c.status === 'LIVE'
                ? `ends in ${timeLeft(c.endAt)}`
                : `starts in ${timeLeft(c.startAt)}`}
            </Txt>
          </View>
        </View>

        <Txt variant="h3" style={{ marginTop: spacing.sm }}>
          {c.name}
        </Txt>
        <Txt variant="small" color={colors.muted} style={{ marginTop: 2 }}>
          {c.participantCount} traders · {c.instruments.length} markets
        </Txt>

        {joined ? (
          <View style={{ flexDirection: 'row', marginTop: spacing.md, gap: spacing.xl }}>
            <Mini label="Rank" value={`#${c.myRank}`} color={colors.ink} />
            <Mini label="Return" value={fmtPct(ret)} color={ret >= 0 ? colors.up : colors.down} />
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}

function Mini({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View>
      <Txt variant="tiny" color={colors.faint}>
        {label.toUpperCase()}
      </Txt>
      <Txt variant="num" color={color}>
        {value}
      </Txt>
    </View>
  );
}
