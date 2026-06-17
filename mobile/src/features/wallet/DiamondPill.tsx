import { Pressable, View } from 'react-native';
import { Txt, Icon } from '@/ui';
import { useWallet } from '@/store/wallet';
import { colors } from '@/theme/tokens';

// Tappable diamond balance chip. Tapping opens the get-diamonds sheet.
export function DiamondPill({ onPress }: { onPress?: () => void }) {
  const balance = useWallet((s) => s.balance);
  const openStore = useWallet((s) => s.openStore);
  return (
    <Pressable onPress={onPress ?? openStore} hitSlop={6}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: colors.primaryTint,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 5,
        }}
      >
        <Icon name="diamond" size={14} color={colors.primary} />
        <Txt variant="label" color={colors.primary}>
          {balance}
        </Txt>
      </View>
    </Pressable>
  );
}
