import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { colors, type as typePresets } from '@/theme/tokens';

type Variant = keyof typeof typePresets;

export interface TxtProps extends TextProps {
  variant?: Variant;
  color?: string;
  center?: boolean;
}

// Single text primitive so every label uses Nunito + a typography preset.
export function Txt({
  variant = 'body',
  color = colors.ink,
  center,
  style,
  ...rest
}: TxtProps) {
  return (
    <RNText
      style={[
        typePresets[variant] as TextStyle,
        { color },
        center ? { textAlign: 'center' } : null,
        style,
      ]}
      {...rest}
    />
  );
}
