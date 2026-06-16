import { View } from 'react-native';
import { Icon } from './Icon';
import { Txt } from './Text';
import { colors } from '@/theme/tokens';

export function StreakFlame({ count, size = 18 }: { count: number; size?: number }) {
  const lit = count > 0;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name="flame" size={size} color={lit ? colors.flame : colors.faint} />
      <Txt
        variant="bodyBold"
        color={lit ? colors.flameDark : colors.faint}
        style={{ fontSize: size - 2 }}
      >
        {count}
      </Txt>
    </View>
  );
}
