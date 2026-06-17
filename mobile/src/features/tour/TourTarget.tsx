import { useEffect, useRef, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { registerTarget, type TargetRect } from './registry';

// Wrap any element you want the coach-mark tour to spotlight.
// `collapsable={false}` keeps Android from flattening the View away so
// measureInWindow returns a real rect.
export function TourTarget({
  id,
  children,
  style,
}: {
  id: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const ref = useRef<View>(null);

  useEffect(() => {
    const measure = () =>
      new Promise<TargetRect | null>((resolve) => {
        const node = ref.current;
        if (!node) return resolve(null);
        node.measureInWindow((x, y, width, height) => {
          if (!width && !height) resolve(null);
          else resolve({ x, y, width, height });
        });
      });
    return registerTarget(id, measure);
  }, [id]);

  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
}
