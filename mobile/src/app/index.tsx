import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Txt } from '@/ui/Text';
import { colors, fonts, radius, spacing, shadow } from '@/theme/tokens';

// M0 placeholder home — proves fonts + theme render. Replaced by the real
// onboarding/tab flow in M2+.
export default function Index() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <View style={styles.logo}>
          <Txt style={styles.logoMark}>A</Txt>
        </View>
        <Txt variant="display" style={styles.brand}>
          Arena
        </Txt>
        <Txt variant="h3" color={colors.muted} center>
          Trade. Compete. Climb.
        </Txt>
      </View>
      <Txt variant="small" color={colors.faint} center style={styles.footer}>
        v0 · foundation
      </Txt>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  logo: {
    width: 92,
    height: 92,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadow(8),
  },
  logoMark: { fontFamily: fonts.black, fontSize: 52, color: colors.white },
  brand: { color: colors.ink },
  footer: { paddingBottom: spacing.lg },
});
