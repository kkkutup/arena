import { View } from 'react-native';
import { Screen, Txt, Icon } from '@/ui';
import type { IconName } from '@/ui/Icon';
import { colors, spacing, radius } from '@/theme/tokens';

export function Placeholder({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: IconName;
}) {
  return (
    <Screen scroll={false} contentStyle={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: radius.pill,
            backgroundColor: colors.primaryTint,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={56} color={colors.primary} />
        </View>
        <Txt variant="title" center>
          {title}
        </Txt>
        <Txt variant="body" color={colors.muted} center>
          {subtitle}
        </Txt>
      </View>
    </Screen>
  );
}
