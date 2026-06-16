import { View, StyleSheet } from 'react-native';
import {
  Screen,
  Txt,
  Button,
  Card,
  Pill,
  Avatar,
  ProgressBar,
  ProgressRing,
  StreakFlame,
  Icon,
} from '@/ui';
import { colors, spacing, fonts } from '@/theme/tokens';

// M1 showcase — eyeball the design system on device. Replaced in M2 by the
// real onboarding / tab flow.
export default function Showcase() {
  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.logo}>
          <Txt style={{ fontFamily: fonts.black, fontSize: 24, color: colors.white }}>A</Txt>
        </View>
        <View style={{ flex: 1 }}>
          <Txt variant="title">Arena</Txt>
          <Txt variant="small" color={colors.muted}>
            Design system · M1
          </Txt>
        </View>
        <StreakFlame count={7} />
      </View>

      <Section title="Buttons">
        <View style={{ gap: spacing.sm }}>
          <Button label="Buy / Long" variant="success" full left={<Icon name="trending-up" color={colors.white} />} />
          <Button label="Sell / Short" variant="danger" full left={<Icon name="trending-down" color={colors.white} />} />
          <Button label="Start a Duel" variant="primary" full />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button label="Neutral" variant="neutral" size="md" />
            <Button label="Outline" variant="outline" size="md" />
            <Button label="Small" size="sm" />
          </View>
          <Button label="Loading" variant="primary" full loading />
        </View>
      </Section>

      <Section title="Cards & pills">
        <Card>
          <View style={styles.row}>
            <Avatar name="Kutup Tan" size={48} />
            <View style={{ flex: 1 }}>
              <Txt variant="h3">Kutup</Txt>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                <Pill label="Gold III" color={colors.goldDark} tint="#FFF4D6" />
                <Pill label="Live" color={colors.up} tint={colors.upTint} />
              </View>
            </View>
            <Txt variant="num" color={colors.up}>
              +12.4%
            </Txt>
          </View>
        </Card>
      </Section>

      <Section title="Progress">
        <Card>
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <ProgressRing progress={0.65} size={72} color={colors.gold}>
                <Txt variant="h3">65%</Txt>
              </ProgressRing>
              <Txt variant="small" color={colors.muted}>
                Daily goal
              </Txt>
            </View>
            <View style={{ flex: 1, gap: spacing.md, marginLeft: spacing.lg }}>
              <View style={{ gap: 6 }}>
                <View style={styles.between}>
                  <Txt variant="label">XP</Txt>
                  <Txt variant="small" color={colors.muted}>
                    430 / 600
                  </Txt>
                </View>
                <ProgressBar progress={430 / 600} color={colors.gold} />
              </View>
              <View style={{ gap: 6 }}>
                <View style={styles.between}>
                  <Txt variant="label">Equity</Txt>
                  <Txt variant="small" color={colors.up}>
                    +5.2%
                  </Txt>
                </View>
                <ProgressBar progress={0.52} color={colors.up} />
              </View>
            </View>
          </View>
        </Card>
      </Section>

      <Section title="Colors">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {(['primary', 'up', 'down', 'gold', 'flame', 'diamond'] as const).map((k) => (
            <View key={k} style={{ alignItems: 'center', gap: 4 }}>
              <View style={[styles.swatch, { backgroundColor: colors[k] }]} />
              <Txt variant="tiny" color={colors.muted}>
                {k}
              </Txt>
            </View>
          ))}
        </View>
      </Section>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
      <Txt variant="label" color={colors.muted} style={{ textTransform: 'uppercase' }}>
        {title}
      </Txt>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  swatch: { width: 48, height: 48, borderRadius: 12 },
});
