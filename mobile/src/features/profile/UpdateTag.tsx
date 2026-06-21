import { useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { Txt, Card, Icon } from '@/ui';
import { colors, spacing, radius } from '@/theme/tokens';

// expo-updates is a native module — guard the require so a missing/old native
// build (or running in Expo Go / dev) just degrades to "development" instead of
// crashing the profile screen.
type UpdatesModule = {
  isEmbeddedLaunch?: boolean;
  updateId?: string | null;
  createdAt?: Date | null;
  channel?: string | null;
  runtimeVersion?: string | null;
  checkForUpdateAsync?: () => Promise<{ isAvailable: boolean }>;
  fetchUpdateAsync?: () => Promise<unknown>;
  reloadAsync?: () => Promise<void>;
};

let Updates: UpdatesModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Updates = require('expo-updates') as UpdatesModule;
} catch {
  Updates = null;
}

const short = (s?: string | null) => (s ? s.slice(0, 8) : '—');

export function UpdateTag() {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const embedded = Updates?.isEmbeddedLaunch ?? true;
  const updateId = Updates?.updateId ?? null;
  const createdAt = Updates?.createdAt ?? null;
  const channel = Updates?.channel ?? null;
  const runtime = Updates?.runtimeVersion ?? null;

  const check = async () => {
    if (!Updates?.checkForUpdateAsync) {
      setStatus('Updates not available in this build');
      return;
    }
    setBusy(true);
    setStatus('Checking…');
    try {
      const res = await Updates.checkForUpdateAsync();
      if (res.isAvailable && Updates.fetchUpdateAsync && Updates.reloadAsync) {
        setStatus('Downloading new version…');
        await Updates.fetchUpdateAsync();
        setStatus('Restarting…');
        await Updates.reloadAsync(); // relaunches into the new code
      } else {
        setStatus("You're on the latest version ✓");
      }
    } catch (e) {
      setStatus(e instanceof Error ? `Error: ${e.message}` : 'Update check failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={{ marginTop: spacing.md, gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Icon name="cloud-download-outline" size={18} color={colors.muted} />
        <Txt variant="bodyBold">App version</Txt>
      </View>

      <View style={{ gap: 2 }}>
        <Row k="Build" v={embedded ? 'base (no OTA yet)' : `OTA ${short(updateId)}`} />
        <Row k="Published" v={createdAt ? new Date(createdAt).toLocaleString() : '—'} />
        <Row k="Channel" v={channel ?? '—'} />
        <Row k="Runtime" v={short(runtime)} />
      </View>

      <Pressable
        onPress={() => void check()}
        disabled={busy}
        style={{
          marginTop: spacing.xs,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          paddingVertical: spacing.sm,
          borderRadius: radius.md,
          backgroundColor: colors.surfaceAlt,
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? <ActivityIndicator size="small" color={colors.primary} /> : <Icon name="refresh" size={18} color={colors.primary} />}
        <Txt variant="bodyBold" color={colors.primary}>
          Check for updates now
        </Txt>
      </Pressable>

      {status ? (
        <Txt variant="small" color={colors.muted} center>
          {status}
        </Txt>
      ) : null}
    </Card>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Txt variant="small" color={colors.faint}>
        {k}
      </Txt>
      <Txt variant="small" color={colors.muted}>
        {v}
      </Txt>
    </View>
  );
}
