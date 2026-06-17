import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Txt, Button } from '@/ui';
import { useTour } from '@/store/tour';
import { colors, spacing, radius } from '@/theme/tokens';

const PAD = 8;
const DIM = 'rgba(13,13,24,0.74)';

// Renders the dim + spotlight cutout + tooltip for the active coach-mark step.
// The cutout is built from four dim panels framing the target rect (no SVG
// mask needed), with a gold ring around the hole.
export function TourOverlay() {
  const active = useTour((s) => s.active);
  const steps = useTour((s) => s.steps);
  const index = useTour((s) => s.index);
  const rect = useTour((s) => s.rect);
  const next = useTour((s) => s.next);
  const finish = useTour((s) => s.finish);

  const screen = useWindowDimensions();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: active ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [active, fade]);

  if (!active) return null;
  const step = steps[index];
  if (!step) return null;

  const isLast = index === steps.length - 1;
  const advance = () => void next();

  const hole = rect
    ? { x: rect.x - PAD, y: rect.y - PAD, w: rect.width + PAD * 2, h: rect.height + PAD * 2 }
    : null;
  const below = hole ? hole.y + hole.h / 2 < screen.height / 2 : false;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]} pointerEvents="box-none">
      {/* dim + spotlight (tap anywhere to advance) */}
      <Pressable style={StyleSheet.absoluteFill} onPress={advance}>
        {hole ? (
          <>
            <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: hole.y, backgroundColor: DIM }} />
            <View style={{ position: 'absolute', left: 0, right: 0, top: hole.y + hole.h, bottom: 0, backgroundColor: DIM }} />
            <View style={{ position: 'absolute', top: hole.y, height: hole.h, left: 0, width: hole.x, backgroundColor: DIM }} />
            <View style={{ position: 'absolute', top: hole.y, height: hole.h, left: hole.x + hole.w, right: 0, backgroundColor: DIM }} />
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: hole.x,
                top: hole.y,
                width: hole.w,
                height: hole.h,
                borderRadius: radius.lg,
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
              : { bottom: screen.height - hole.y + 16 }
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
