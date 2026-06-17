import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Txt } from './Text';
import { colors, fonts, radius, spacing } from '@/theme/tokens';

type Variant = 'primary' | 'success' | 'danger' | 'neutral' | 'outline';
type Size = 'lg' | 'md' | 'sm';

// Built per-render (not module-level) so it reflects the live theme palette.
function variants(): Record<Variant, { bg: string; edge: string; text: string; border?: string }> {
  return {
    primary: { bg: colors.primary, edge: colors.primaryDark, text: colors.white },
    success: { bg: colors.up, edge: colors.upDark, text: colors.white },
    danger: { bg: colors.down, edge: colors.downDark, text: colors.white },
    neutral: { bg: colors.surfaceAlt, edge: colors.line, text: colors.ink },
    outline: { bg: colors.surface, edge: colors.line, text: colors.ink, border: colors.line },
  };
}

const SIZES: Record<Size, { h: number; font: number; px: number }> = {
  lg: { h: 56, font: 17, px: 24 },
  md: { h: 48, font: 15, px: 20 },
  sm: { h: 38, font: 13, px: 16 },
};

const EDGE = 4;

export interface ButtonProps {
  label?: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
  left?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

// The signature "chunky 3D" button: a solid face sitting on a darker bottom
// edge; pressing it sinks the face onto the edge with a light haptic tap.
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled,
  loading,
  full,
  left,
  style,
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const v = variants()[variant];
  const s = SIZES[size];
  const isDisabled = disabled || loading;
  const sideBorder = v.border ? 1.5 : 0;

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={() => {
        if (isDisabled) return;
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      disabled={isDisabled}
      style={[
        { alignSelf: full ? 'stretch' : 'flex-start', opacity: isDisabled ? 0.5 : 1 },
        style,
      ]}
    >
      <View
        style={{
          height: s.h,
          backgroundColor: v.bg,
          borderRadius: radius.lg,
          borderColor: v.border ?? 'transparent',
          borderTopWidth: sideBorder,
          borderLeftWidth: sideBorder,
          borderRightWidth: sideBorder,
          borderBottomColor: v.edge,
          borderBottomWidth: pressed ? sideBorder : EDGE,
          paddingHorizontal: s.px,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          transform: [{ translateY: pressed ? EDGE - sideBorder : 0 }],
        }}
      >
        {loading ? (
          <ActivityIndicator color={v.text} />
        ) : (
          <>
            {left}
            {label ? (
              <Txt style={{ fontFamily: fonts.extra, fontSize: s.font, color: v.text }}>
                {label}
              </Txt>
            ) : null}
          </>
        )}
      </View>
    </Pressable>
  );
}
