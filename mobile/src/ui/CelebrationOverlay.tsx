import { useEffect, useRef } from 'react';
import { Modal, View, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Txt } from './Text';
import { Button } from './Button';
import { Icon } from './Icon';
import { useCelebration } from '@/store/celebration';
import { colors, spacing, radius, shadow } from '@/theme/tokens';

// Full-screen celebratory moment (level-up / achievement / win), mounted once
// at the root and driven by the celebration store.
export function CelebrationOverlay() {
  const current = useCelebration((s) => s.current);
  const dismiss = useCelebration((s) => s.dismiss);
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (current) {
      scale.setValue(0);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 80,
      }).start();
    }
  }, [current, scale]);

  if (!current) return null;

  return (
    <Modal transparent animationType="fade" visible onRequestClose={dismiss}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(15,15,30,0.6)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
        }}
      >
        <Animated.View
          style={[
            {
              transform: [{ scale }],
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
              padding: spacing.xxl,
              alignItems: 'center',
              gap: spacing.md,
              alignSelf: 'stretch',
            },
            shadow(12),
          ]}
        >
          <View
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              backgroundColor: current.color + '22',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={current.icon} size={60} color={current.color} />
          </View>
          <Txt variant="display" center>
            {current.title}
          </Txt>
          <Txt variant="body" color={colors.muted} center>
            {current.subtitle}
          </Txt>
          <Button label="Awesome!" full onPress={dismiss} style={{ marginTop: spacing.sm }} />
        </Animated.View>
      </View>
    </Modal>
  );
}
