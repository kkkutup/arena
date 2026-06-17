import { useEffect, useRef } from 'react';
import { Animated, Pressable, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Txt, Icon, Button } from '@/ui';
import type { IconName } from '@/ui/Icon';
import { useWallet, DIAMOND } from '@/store/wallet';
import { colors, spacing, radius } from '@/theme/tokens';

// Diamond packs — real purchase is wired later (Google Pay / Play Billing).
const PACKS = [
  { amount: 250, price: '₺29' },
  { amount: 600, price: '₺59' },
  { amount: 1500, price: '₺129' },
];

// Root-mounted bottom sheet for earning / buying diamonds.
export function DiamondStoreSheet() {
  const open = useWallet((s) => s.storeOpen);
  const close = useWallet((s) => s.closeStore);
  const balance = useWallet((s) => s.balance);
  const add = useWallet((s) => s.add);
  const insets = useSafeAreaInsets();

  const slide = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(slide, {
      toValue: open ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [open, slide]);

  if (!open) return null;

  const watchAd = () => {
    // Stub: a real rewarded ad (AdMob) grants on completion. For now, grant now.
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    add(DIAMOND.AD_REWARD);
  };

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [400, 0] });

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(13,13,24,0.5)' }} onPress={close} />
      <Animated.View
        style={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + spacing.lg,
          transform: [{ translateY }],
        }}
      >
        <View
          style={{
            alignSelf: 'center',
            width: 40,
            height: 5,
            borderRadius: 999,
            backgroundColor: colors.line,
            marginBottom: spacing.lg,
          }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Txt variant="h2">Get diamonds</Txt>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: colors.primaryTint,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Icon name="diamond" size={16} color={colors.primary} />
            <Txt variant="bodyBold" color={colors.primary}>
              {balance}
            </Txt>
          </View>
        </View>

        {/* Earn free */}
        <Txt variant="label" color={colors.muted} style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
          EARN FREE
        </Txt>
        <Pressable onPress={watchAd}>
          <Row
            icon="play-circle"
            iconColor={colors.up}
            iconBg={colors.upTint}
            title="Watch a short ad"
            subtitle={`+${DIAMOND.AD_REWARD} diamonds`}
            right={<Txt variant="bodyBold" color={colors.up}>{`+${DIAMOND.AD_REWARD}`}</Txt>}
          />
        </Pressable>

        {/* Buy */}
        <Txt variant="label" color={colors.muted} style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
          BUY
        </Txt>
        <View style={{ gap: spacing.sm }}>
          {PACKS.map((p) => (
            <Row
              key={p.amount}
              icon="diamond"
              iconColor={colors.primary}
              iconBg={colors.primaryTint}
              title={`${p.amount} diamonds`}
              subtitle="Coming soon"
              right={
                <View
                  style={{
                    backgroundColor: colors.surfaceAlt,
                    borderRadius: radius.sm,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Txt variant="label" color={colors.faint}>
                    {p.price}
                  </Txt>
                </View>
              }
            />
          ))}
        </View>

        <Button label="Done" variant="neutral" full style={{ marginTop: spacing.lg }} onPress={close} />
      </Animated.View>
    </View>
  );
}

function Row({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  right,
}: {
  icon: IconName;
  iconColor: ColorValue;
  iconBg: string;
  title: string;
  subtitle: string;
  right: React.ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderWidth: 1.5,
        borderColor: colors.line,
        borderRadius: radius.lg,
        padding: spacing.md,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.md,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt variant="bodyBold">{title}</Txt>
        <Txt variant="small" color={colors.muted}>
          {subtitle}
        </Txt>
      </View>
      {right}
    </View>
  );
}
