import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen, Txt, Button, TextField, Icon } from '@/ui';
import { colors, spacing } from '@/theme/tokens';

export default function Join() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const valid = code.trim().length >= 4;

  const join = () => {
    if (!valid) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // mock: jump into the friends league
    router.replace({ pathname: '/competition/[id]', params: { id: 'c_friends' } });
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
        <Button label="Join competition" full disabled={!valid} onPress={join} />
      </View>
    </Screen>
  );
}
