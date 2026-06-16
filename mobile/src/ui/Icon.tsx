import { type ColorValue } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/theme/tokens';

export type IconName = keyof typeof Ionicons.glyphMap;

export function Icon({
  name,
  size = 22,
  color = colors.ink,
}: {
  name: IconName;
  size?: number;
  color?: ColorValue;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}
