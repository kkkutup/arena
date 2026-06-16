import { useState } from 'react';
import { View, TextInput, type TextInputProps } from 'react-native';
import { Txt } from './Text';
import { colors, radius, spacing, fonts } from '@/theme/tokens';

export interface TextFieldProps extends TextInputProps {
  label?: string;
}

export function TextField({ label, style, ...rest }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Txt variant="label" color={colors.muted}>
          {label}
        </Txt>
      ) : null}
      <TextInput
        placeholderTextColor={colors.faint}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          {
            borderWidth: 2,
            borderColor: focused ? colors.primary : colors.line,
            borderRadius: radius.lg,
            paddingHorizontal: spacing.md,
            height: 52,
            fontFamily: fonts.bold,
            fontSize: 16,
            color: colors.ink,
            backgroundColor: colors.surface,
          },
          style,
        ]}
        {...rest}
      />
    </View>
  );
}
