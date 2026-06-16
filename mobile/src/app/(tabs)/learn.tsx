import { View } from 'react-native';
import { Screen, Txt, Card, Icon, Button } from '@/ui';
import { colors, spacing, radius } from '@/theme/tokens';

// Premium "Learn" hub: bite-sized lessons + a backtesting lab.
// Intentionally blank for now — this is the placeholder/teaser for the
// premium subscription tier. Real content is wired up later.

export default function Learn() {
  return (
    <Screen>
      <View style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
        <Txt variant="title">Learn</Txt>
        <Txt variant="body" color={colors.muted} style={{ marginTop: 2 }}>
          Lessons & backtesting
        </Txt>
      </View>

      {/* Premium hero */}
      <Card
        flat
        style={{
          backgroundColor: colors.ink,
          borderColor: colors.ink,
          alignItems: 'center',
          paddingVertical: spacing.xl,
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
          <Icon name="diamond" size={30} color={colors.gold} />
        </View>
        <Txt variant="tiny" color={colors.gold} style={{ marginTop: spacing.md }}>
          ARENA PREMIUM
        </Txt>
        <Txt variant="h2" color={colors.white} style={{ marginTop: spacing.xs, textAlign: 'center' }}>
          Master the markets
        </Txt>
        <Txt
          variant="body"
          color={colors.faint}
          style={{ marginTop: spacing.sm, textAlign: 'center', maxWidth: 280 }}
        >
          Bite-sized trading lessons and a full backtesting lab to sharpen your
          strategy before you compete.
        </Txt>
        <Button
          label="Coming soon"
          variant="neutral"
          disabled
          style={{ marginTop: spacing.lg }}
        />
      </Card>

      {/* Feature teasers */}
      <Txt variant="h3" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
        What's inside
      </Txt>
      <View style={{ gap: spacing.md }}>
        <FeatureRow
          icon="school"
          tint={colors.primaryTint}
          color={colors.primary}
          title="Lessons"
          subtitle="Learn strategies step by step, Duolingo-style."
        />
        <FeatureRow
          icon="stats-chart"
          tint={colors.upTint}
          color={colors.up}
          title="Backtest lab"
          subtitle="Replay real market history and test your ideas."
        />
      </View>
    </Screen>
  );
}

function FeatureRow({
  icon,
  tint,
  color,
  title,
  subtitle,
}: {
  icon: React.ComponentProps<typeof Icon>['name'];
  tint: string;
  color: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Card flat style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: radius.md,
          backgroundColor: tint,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={22} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt variant="bodyBold">{title}</Txt>
        <Txt variant="small" color={colors.muted} style={{ marginTop: 1 }}>
          {subtitle}
        </Txt>
      </View>
      <Icon name="lock-closed" size={18} color={colors.faint} />
    </Card>
  );
}
