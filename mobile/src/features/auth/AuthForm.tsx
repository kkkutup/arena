import { useState } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  // Image,  // ← un-comment when the mascot art is ready (see MASCOT block below)
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Txt, Button, TextField, Icon, Card } from '@/ui';
import type { IconName } from '@/ui/Icon';
import { useSession } from '@/store/session';
import { signInWithGoogle } from '@/lib/google';
import { googleConfigured } from '@/lib/auth-config';
import { authApi } from '@/api/auth';
import { useThemeSync } from '@/store/theme';
import { colors, spacing, radius } from '@/theme/tokens';

// What the login screen brags about — the two features onboarding doesn't cover.
const FEATURES: { icon: IconName; tint: string; title: string; body: string }[] = [
  {
    icon: 'school',
    tint: colors.primary,
    title: 'Learn by playing',
    body: 'Bite-size, gamified lessons — candlesticks to ICT, with XP and streaks.',
  },
  {
    icon: 'stats-chart',
    tint: colors.up,
    title: 'Backtest your calls',
    body: 'Drop into a real chart moment, set your stop & target, and score the outcome.',
  },
];

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  useThemeSync();
  const router = useRouter();
  const setSession = useSession((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSignup = mode === 'signup';

  const emailAuth = async () => {
    setError(null);
    const e = email.trim();
    if (!e || !password) {
      setError('Enter your email and password.');
      return;
    }
    if (isSignup && username.trim().length < 3) {
      setError('Pick a username (at least 3 characters).');
      return;
    }
    setBusy(true);
    try {
      const session = isSignup
        ? await authApi.register(e, password, username.trim())
        : await authApi.login(e, password);
      setSession(session);
      router.replace('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setBusy(false);
    }
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
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: spacing.xl,
            gap: spacing.xl,
          }}
        >
          {/* ── Brand + mascot ─────────────────────────────────────────── */}
          <View style={{ alignItems: 'center', gap: spacing.md }}>
            {/* MASCOT: replace this whole View with your art, e.g.
                <Image
                  source={require('../../../assets/images/mascot.png')}
                  style={{ width: 112, height: 112 }}
                  resizeMode="contain"
                /> */}
            <View
              style={{
                width: 112,
                height: 112,
                borderRadius: radius.pill,
                backgroundColor: colors.primaryTint,
                borderWidth: 2,
                borderColor: colors.primary + '33',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="happy" size={64} color={colors.primary} />
            </View>

            <View style={{ alignItems: 'center', gap: 4 }}>
              <Txt variant="display">Arena</Txt>
              <Txt variant="bodyBold" color={colors.muted}>
                Learn · Backtest · Compete
              </Txt>
            </View>
          </View>

          {/* ── Feature cards ──────────────────────────────────────────── */}
          <View style={{ gap: spacing.md }}>
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </View>

          {/* ── Auth ───────────────────────────────────────────────────── */}
          <View style={{ gap: spacing.lg }}>
            <View style={{ gap: 4, alignItems: 'center' }}>
              <Txt variant="h2">{isSignup ? 'Create your account' : 'Welcome back'}</Txt>
              <Txt variant="body" color={colors.muted} center>
                {isSignup
                  ? 'Join the arena and start competing.'
                  : 'Log in to continue your streak.'}
              </Txt>
            </View>

            <View style={{ gap: spacing.md }}>
              {isSignup ? (
                <TextField
                  label="Username"
                  placeholder="yourname"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={username}
                  onChangeText={setUsername}
                />
              ) : null}
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
              <Button
                label={isSignup ? 'Sign up' : 'Log in'}
                full
                loading={busy}
                disabled={busy}
                onPress={emailAuth}
              />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={{ flex: 1, height: 1.5, backgroundColor: colors.line }} />
              <Txt variant="small" color={colors.faint}>
                or
              </Txt>
              <View style={{ flex: 1, height: 1.5, backgroundColor: colors.line }} />
            </View>

            {error ? (
              <Txt variant="small" color={colors.down} center>
                {error}
              </Txt>
            ) : null}

            <Button
              label="Continue with Google"
              variant="outline"
              full
              loading={busy}
              left={<Icon name="logo-google" color={colors.ink} />}
              onPress={googleSignIn}
            />

            <Pressable
              onPress={() => router.replace(isSignup ? '/login' : '/signup')}
              style={{ alignSelf: 'center', paddingTop: spacing.xs }}
            >
              <Txt variant="body" color={colors.muted}>
                {isSignup ? 'Already have an account? ' : 'New here? '}
                <Txt variant="bodyBold" color={colors.primary}>
                  {isSignup ? 'Log in' : 'Sign up'}
                </Txt>
              </Txt>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FeatureCard({
  icon,
  tint,
  title,
  body,
}: {
  icon: IconName;
  tint: string;
  title: string;
  body: string;
}) {
  return (
    <Card flat style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md }}>
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: radius.md,
          backgroundColor: tint + '22',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={26} color={tint} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt variant="h3">{title}</Txt>
        <Txt variant="small" color={colors.muted}>
          {body}
        </Txt>
      </View>
    </Card>
  );
}
