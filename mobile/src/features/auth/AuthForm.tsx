import { useState } from 'react';
import { View, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Txt, Button, TextField, Icon } from '@/ui';
import { useSession } from '@/store/session';
import { signInWithGoogle } from '@/lib/google';
import { googleConfigured } from '@/lib/auth-config';
import { authApi } from '@/api/auth';
import { useThemeSync } from '@/store/theme';
import { colors, spacing } from '@/theme/tokens';

type Method = 'apple' | 'email';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  useThemeSync();
  const router = useRouter();
  const signInWith = useSession((s) => s.signInWith);
  const setSession = useSession((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSignup = mode === 'signup';

  const go = (method: Method) => {
    signInWith(method, method === 'email' ? email : undefined);
    router.replace('/profile-setup');
  };

  const googleSignIn = async () => {
    setError(null);
    if (!googleConfigured) {
      setError('Google sign-in isn’t configured yet — add your Web client ID.');
      return;
    }
    setBusy(true);
    try {
      const idToken = await signInWithGoogle();
      if (!idToken) return; // user cancelled
      const session = await authApi.google(idToken);
      setSession(session);
      router.replace('/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, padding: spacing.xl, gap: spacing.lg, justifyContent: 'center' }}>
          <View style={{ gap: 6 }}>
            <Txt variant="title">{isSignup ? 'Create your account' : 'Welcome back'}</Txt>
            <Txt variant="body" color={colors.muted}>
              {isSignup
                ? 'Join the arena and start competing.'
                : 'Log in to continue your streak.'}
            </Txt>
          </View>

          <View style={{ gap: spacing.md }}>
            <TextField
              label="Email"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextField
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Button label={isSignup ? 'Sign up' : 'Log in'} full onPress={() => go('email')} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{ flex: 1, height: 1.5, backgroundColor: colors.line }} />
            <Txt variant="small" color={colors.faint}>
              or
            </Txt>
            <View style={{ flex: 1, height: 1.5, backgroundColor: colors.line }} />
          </View>

          {error ? (
            <Txt variant="small" color={colors.down}>
              {error}
            </Txt>
          ) : null}

          <View style={{ gap: spacing.sm }}>
            <Button
              label="Continue with Google"
              variant="outline"
              full
              loading={busy}
              left={<Icon name="logo-google" color={colors.ink} />}
              onPress={googleSignIn}
            />
            <Button
              label="Continue with Apple"
              variant="outline"
              full
              left={<Icon name="logo-apple" color={colors.ink} />}
              onPress={() => go('apple')}
            />
          </View>

          <Pressable
            onPress={() => router.replace(isSignup ? '/login' : '/signup')}
            style={{ alignSelf: 'center', paddingTop: spacing.sm }}
          >
            <Txt variant="body" color={colors.muted}>
              {isSignup ? 'Already have an account? ' : 'New here? '}
              <Txt variant="bodyBold" color={colors.primary}>
                {isSignup ? 'Log in' : 'Sign up'}
              </Txt>
            </Txt>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
