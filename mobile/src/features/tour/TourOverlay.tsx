import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Txt, Button } from '@/ui';
import { useTour } from '@/store/tour';
import { colors, spacing, radius } from '@/theme/tokens';

const PAD = 8;
const HOLE_RADIUS = 16;
const DIM = 'rgba(13,13,24,0.74)';

// SVG path for a rounded rectangle (the spotlight hole).
function roundedRect(x: number, y: number, w: number, h: number, r: number): string {
  const rad = Math.min(r, w / 2, h / 2);
  return (
    `M${x + rad} ${y} h${w - 2 * rad} a${rad} ${rad} 0 0 1 ${rad} ${rad}` +
    ` v${h - 2 * rad} a${rad} ${rad} 0 0 1 ${-rad} ${rad} h${-(w - 2 * rad)}` +
    ` a${rad} ${rad} 0 0 1 ${-rad} ${-rad} v${-(h - 2 * rad)} a${rad} ${rad} 0 0 1 ${rad} ${-rad} Z`
  );
}

// Renders the dim + spotlight cutout + tooltip for the active coach-mark step.
// The cutout is built from four dim panels framing the target rect (no SVG
// mask needed), with a gold ring around the hole.
//
// Targets are measured with measureInWindow (window coords), but this overlay
// may not sit at window (0,0) — e.g. under a status bar. So we measure the
// overlay's own window origin and subtract it, keeping the ring dead-centered
// on the real element on every platform.
export function TourOverlay() {
  const active = useTour((s) => s.active);
  const steps = useTour((s) => s.steps);
  const index = useTour((s) => s.index);
  const rect = useTour((s) => s.rect);
  const next = useTour((s) => s.next);
  const finish = useTour((s) => s.finish);

  const rootRef = useRef<View>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [frameH, setFrameH] = useState(0);
  const [frameW, setFrameW] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: active ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [active, fade]);

  // Re-measure our own origin whenever the tour shows or the step changes.
  useEffect(() => {
    if (!active) return;
    rootRef.current?.measureInWindow?.((x, y) => setOrigin({ x, y }));
  }, [active, index, rect]);

  const onLayout = (e: LayoutChangeEvent) => {
    setFrameH(e.nativeEvent.layout.height);
    setFrameW(e.nativeEvent.layout.width);
    rootRef.current?.measureInWindow?.((x, y) => setOrigin({ x, y }));
  };

  if (!active) return null;
  const step = steps[index];
  if (!step) return null;

  const isLast = index === steps.length - 1;
  const advance = () => void next();

  // target rect translated into this overlay's local coordinate space
  const hole = rect
    ? {
        x: rect.x - origin.x - PAD,
        y: rect.y - origin.y - PAD,
        w: rect.width + PAD * 2,
        h: rect.height + PAD * 2,
      }
    : null;
  const below = hole ? hole.y + hole.h / 2 < frameH / 2 : false;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { opacity: fade }]}
      pointerEvents="box-none"
    >
      {/* dim + spotlight (tap anywhere to advance) */}
      <Pressable ref={rootRef} onLayout={onLayout} style={StyleSheet.absoluteFill} onPress={advance}>
        {hole && frameW > 0 && frameH > 0 ? (
          <>
            {/* dim everything, then punch a rounded hole (even-odd fill) */}
            <Svg pointerEvents="none" width={frameW} height={frameH} style={StyleSheet.absoluteFill}>
              <Path
                d={`M0 0 H${frameW} V${frameH} H0 Z ${roundedRect(hole.x, hole.y, hole.w, hole.h, HOLE_RADIUS)}`}
                fill={DIM}
                fillRule="evenodd"
              />
            </Svg>
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: hole.x,
                top: hole.y,
                width: hole.w,
                height: hole.h,
                borderRadius: HOLE_RADIUS,
                borderWidth: 2.5,
                borderColor: colors.gold,
              }}
            />
          </>
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: DIM }]} />
        )}
      </Pressable>

      {/* tooltip */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: spacing.lg,
          right: spacing.lg,
          ...(hole
            ? below
              ? { top: hole.y + hole.h + 16 }
              : { bottom: (frameH || 0) - hole.y + 16 }
            : { top: 0, bottom: 0, justifyContent: 'center' }),
        }}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.xl,
            padding: spacing.lg,
            borderWidth: 1.5,
            borderColor: colors.line,
          }}
        >
          <Txt variant="tiny" color={colors.primary}>
            {`STEP ${index + 1} OF ${steps.length}`}
          </Txt>
          <Txt variant="h2" style={{ marginTop: spacing.xs }}>
            {step.title}
          </Txt>
          <Txt variant="body" color={colors.muted} style={{ marginTop: spacing.sm }}>
            {step.body}
          </Txt>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: spacing.lg,
            }}
          >
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              {steps.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === index ? 18 : 7,
                    height: 7,
                    borderRadius: 999,
                    backgroundColor: i === index ? colors.primary : colors.line,
                  }}
                />
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              {!isLast ? (
                <Pressable onPress={finish} hitSlop={8}>
                  <Txt variant="label" color={colors.faint}>
                    Skip
                  </Txt>
                </Pressable>
              ) : null}
              <Button label={isLast ? "Let's go" : 'Next'} size="sm" onPress={advance} />
            </View>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
}
