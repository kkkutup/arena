import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Txt, Button, TextField, Avatar } from '@/ui';
import { useSession } from '@/store/session';
import { useThemeSync } from '@/store/theme';
import { colors, spacing } from '@/theme/tokens';

export default function ProfileSetup() {
  useThemeSync();
  const router = useRouter();
  const completeProfile = useSession((s) => s.completeProfile);
  const [username, setUsername] = useState('');
  const valid = /^[A-Za-z0-9_.]{3,20}$/.test(username.trim());

  const submit = () => {
    if (!valid) return;
    completeProfile(username.trim());
    router.replace('/home');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, padding: spacing.xl, gap: spacing.xl, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <Avatar name={username || '?'} size={96} />
          <Txt variant="title" center>
            Pick your trader name
          </Txt>
          <Txt variant="body" color={colors.muted} center>
            This is how friends and rivals see you on the leaderboard.
          </Txt>
        </View>

        <TextField
          label="Trader name"
          placeholder="e.g. kutup_fx"
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={setUsername}
          maxLength={20}
        />

        <Button label="Enter the Arena" full disabled={!valid} onPress={submit} />
      </View>
    </SafeAreaView>
  );
}
