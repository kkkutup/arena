import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Txt } from './Text';
import { colors, radius, spacing } from '@/theme/tokens';

export interface PillProps {
  label: string;
  color?: string; // text + accent color
  tint?: string; // background
  style?: StyleProp<ViewStyle>;
}

// Small rounded status chip (e.g. "LONG 10×", "LIVE", division name).
export function Pill({ label, color = colors.primary, tint = colors.primaryTint, style }: PillProps) {
  return (
    <View
      style={[
        {
          backgroundColor: tint,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.sm,
          paddingVertical: 3,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Txt variant="tiny" color={color} style={{ textTransform: 'uppercase' }}>
        {label}
      </Txt>
    </View>
  );
}
