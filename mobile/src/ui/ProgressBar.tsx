import { View } from 'react-native';
import { colors } from '@/theme/tokens';

export interface ProgressBarProps {
  progress: number; // 0..1
  color?: string;
  track?: string;
  height?: number;
}

export function ProgressBar({
  progress,
  color = colors.up,
  track = colors.line,
  height = 12,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View
      style={{
        height,
        borderRadius: height,
        backgroundColor: track,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: height,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
