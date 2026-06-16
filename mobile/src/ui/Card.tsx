import { View, type ViewProps } from 'react-native';
import { colors, radius, spacing, shadow } from '@/theme/tokens';

export interface CardProps extends ViewProps {
  flat?: boolean;
  padded?: boolean;
}

export function Card({ flat, padded = true, style, ...rest }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.xl,
          borderWidth: 1.5,
          borderColor: colors.line,
          padding: padded ? spacing.lg : 0,
        },
        flat ? null : shadow(3),
        style,
      ]}
      {...rest}
    />
  );
}
