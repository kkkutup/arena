import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen, Txt, Button, TextField, Icon } from '@/ui';
import { useWallet, DIAMOND } from '@/store/wallet';
import { useJoinByCode } from '@/hooks/queries';
import { colors, spacing } from '@/theme/tokens';

import { useThemeSync } from '@/store/theme';

export default function Join() {
  useThemeSync();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const valid = code.trim().length >= 4;
  const spend = useWallet((s) => s.spend);
  const canAfford = useWallet((s) => s.canAfford);
  const openStore = useWallet((s) => s.openStore);
  const joinMut = useJoinByCode();

  const join = async () => {
    if (!valid || joinMut.isPending) return;
    setError(null);
    // Check affordability up front; only deduct after the server confirms.
    if (!canAfford(DIAMOND.JOIN_COST)) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      openStore();
      return;
    }
    try {
      const c = await joinMut.mutateAsync(code);
      spend(DIAMOND.JOIN_COST);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({ pathname: '/competition/[id]', params: { id: c.id } });
    } catch (e) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(e instanceof Error ? e.message : 'Could not join — check the code');
    }
  };

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={{ paddingVertical: spacing.sm, alignSelf: 'flex-start' }}>
        <Icon name="chevron-back" size={28} color={colors.ink} />
      </Pressable>

      <View style={{ marginTop: spacing.xxl, alignItems: 'center', gap: spacing.md }}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 28,
            backgroundColor: colors.primaryTint,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="key" size={44} color={colors.primary} />
        </View>
        <Txt variant="title" center>
          Join with a code
        </Txt>
        <Txt variant="body" color={colors.muted} center>
          Enter the invite code a friend shared with you.
        </Txt>
      </View>

      <View style={{ marginTop: spacing.xl, gap: spacing.lg }}>
        <TextField
          placeholder="ARENA42"
          autoCapitalize="characters"
          autoCorrect={false}
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          maxLength={10}
          style={{ textAlign: 'center', letterSpacing: 4, fontSize: 22 }}
        />
        {error ? (
          <Txt variant="small" color={colors.down} center>
            {error}
          </Txt>
        ) : null}
        <Button
          label={`Join competition · ${DIAMOND.JOIN_COST} 💎`}
          full
          loading={joinMut.isPending}
          disabled={!valid || joinMut.isPending}
          onPress={join}
        />
      </View>
    </Screen>
  );
}
