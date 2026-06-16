import { View } from 'react-native';
import { Card, Txt, Avatar } from '@/ui';
import { colors, spacing } from '@/theme/tokens';
import { fmtUsd, fmtPct } from '@/lib/format';
import type { LeaderboardRow } from '@/api/types';

type Zone = 'promote' | 'relegate' | null;

export function LeaderboardList({
  rows,
  promoteZone = 0,
  relegateZone = 0,
}: {
  rows: LeaderboardRow[];
  promoteZone?: number;
  relegateZone?: number;
}) {
  const total = rows.length;
  return (
    <Card padded={false}>
      {rows.map((r, i) => {
        const zone: Zone =
          promoteZone && r.rank <= promoteZone
            ? 'promote'
            : relegateZone && r.rank > total - relegateZone
              ? 'relegate'
              : null;
        return <Row key={r.userId} row={r} last={i === total - 1} zone={zone} />;
      })}
    </Card>
  );
}

function rankColor(rank: number): string {
  if (rank === 1) return colors.gold;
  if (rank === 2) return colors.silver;
  if (rank === 3) return colors.bronze;
  return colors.faint;
}

function Row({ row, last, zone }: { row: LeaderboardRow; last: boolean; zone: Zone }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: last ? 0 : 1.5,
        borderBottomColor: colors.line,
        backgroundColor: row.isMe ? colors.primaryTint : 'transparent',
      }}
    >
      <View style={{ width: 28, flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        {zone === 'promote' ? (
          <View style={{ width: 3, height: 18, borderRadius: 2, backgroundColor: colors.up }} />
        ) : zone === 'relegate' ? (
          <View style={{ width: 3, height: 18, borderRadius: 2, backgroundColor: colors.down }} />
        ) : null}
        <Txt variant="bodyBold" color={rankColor(row.rank)}>
          {row.rank}
        </Txt>
      </View>

      <Avatar name={row.username} uri={row.avatarUrl} size={36} />
      <Txt variant="bodyBold" color={row.isMe ? colors.primary : colors.ink} style={{ flex: 1 }} numberOfLines={1}>
        {row.username}
      </Txt>

      <View style={{ alignItems: 'flex-end' }}>
        <Txt variant="num">{fmtUsd(row.equity)}</Txt>
        <Txt variant="small" color={row.returnPct >= 0 ? colors.up : colors.down}>
          {fmtPct(row.returnPct)}
        </Txt>
      </View>
    </View>
  );
}
