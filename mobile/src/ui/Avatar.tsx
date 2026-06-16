import { View } from 'react-native';
import { Image } from 'expo-image';
import { Txt } from './Text';
import { colors, fonts } from '@/theme/tokens';

const PALETTE = [
  colors.primary,
  colors.up,
  colors.flame,
  colors.diamond,
  colors.down,
  colors.goldTier,
];

function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? '?';
  const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (a + b).toUpperCase();
}

export interface AvatarProps {
  name: string;
  uri?: string | null;
  size?: number;
}

export function Avatar({ name, uri, size = 44 }: AvatarProps) {
  const bg = colorFor(name);
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.line }}
        contentFit="cover"
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Txt style={{ fontFamily: fonts.black, fontSize: size * 0.4, color: colors.white }}>
        {initials(name)}
      </Txt>
    </View>
  );
}
