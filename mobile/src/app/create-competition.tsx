import { useState, type ReactNode } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen, Txt, Button, TextField, Icon } from '@/ui';
import { INSTRUMENTS } from '@/mock/data';
import { useWallet, DIAMOND } from '@/store/wallet';
import { useMyCompetitions } from '@/store/competitions';
import { colors, spacing, radius } from '@/theme/tokens';
import { fmtUsd } from '@/lib/format';
import type { CompetitionType } from '@/api/types';

const TYPES: { key: CompetitionType; label: string; desc: string }[] = [
  {
    key: 'PRIVATE_LEAGUE',
    label: 'League',
    desc: 'Private group you invite with a code. Everyone trades the same markets — highest return over the duration wins.',
  },
  {
    key: 'DUEL',
    label: 'Duel',
    desc: 'Head-to-head 1-on-1. Challenge a single friend; the better return takes the bragging rights.',
  },
  {
    key: 'PUBLIC_DIVISION',
    label: 'Public',
    desc: 'Open to everyone in your division. Climb the public leaderboard and earn promotion to the next tier.',
  },
];
const DURATIONS = [
  { label: '1 day', h: 24 },
  { label: '3 days', h: 72 },
  { label: '1 week', h: 168 },
];
const BALANCES = [10000, 50000, 100000];
const LEVS = [5, 10, 20, 50];

import { useThemeSync } from '@/store/theme';

export default function CreateCompetition() {
  useThemeSync();
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<CompetitionType>('PRIVATE_LEAGUE');
  const [symbols, setSymbols] = useState<string[]>(['BTCUSDT', 'ETHUSDT']);
  const [dur, setDur] = useState(72);
  const [bal, setBal] = useState(100000);
  const [lev, setLev] = useState(20);

  const spend = useWallet((s) => s.spend);
  const openStore = useWallet((s) => s.openStore);
  const createComp = useMyCompetitions((s) => s.create);

  const toggle = (s: string) =>
    setSymbols((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  const valid = name.trim().length >= 3 && symbols.length > 0;

  const create = () => {
    if (!valid) return;
    // Spend diamonds to create; if too poor, open the get-diamonds sheet.
    if (!spend(DIAMOND.CREATE_COST)) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      openStore();
      return;
    }
    const c = createComp({
      name,
      type,
      instruments: symbols,
      durationHours: dur,
      startingBalance: bal,
      maxLeverage: lev,
    });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({ pathname: '/competition/[id]', params: { id: c.id } });
  };

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={{ paddingVertical: spacing.sm, alignSelf: 'flex-start' }}>
        <Icon name="chevron-back" size={28} color={colors.ink} />
      </Pressable>
      <Txt variant="title">New competition</Txt>

      <View style={{ marginTop: spacing.lg, gap: spacing.lg }}>
        <TextField label="Name" placeholder="Friends Faceoff" value={name} onChangeText={setName} maxLength={28} />

        <Field label="Type">
          {TYPES.map((t) => (
            <Chip key={t.key} label={t.label} active={type === t.key} onPress={() => setType(t.key)} />
          ))}
        </Field>
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
            backgroundColor: colors.surfaceAlt,
            borderRadius: radius.md,
            padding: spacing.md,
            marginTop: -spacing.sm,
          }}
        >
          <Icon name="information-circle" size={18} color={colors.primary} />
          <Txt variant="small" color={colors.muted} style={{ flex: 1 }}>
            {TYPES.find((t) => t.key === type)?.desc}
          </Txt>
        </View>

        <Field label="Markets">
          {INSTRUMENTS.map((i) => (
            <Chip key={i.symbol} label={i.base} active={symbols.includes(i.symbol)} onPress={() => toggle(i.symbol)} />
          ))}
        </Field>

        <Field label="Duration">
          {DURATIONS.map((d) => (
            <Chip key={d.h} label={d.label} active={dur === d.h} onPress={() => setDur(d.h)} />
          ))}
        </Field>

        <Field label="Starting balance">
          {BALANCES.map((b) => (
            <Chip key={b} label={fmtUsd(b)} active={bal === b} onPress={() => setBal(b)} />
          ))}
        </Field>

        <Field label="Max leverage">
          {LEVS.map((l) => (
            <Chip key={l} label={`${l}×`} active={lev === l} onPress={() => setLev(l)} />
          ))}
        </Field>

        <Button
          label={`Create competition · ${DIAMOND.CREATE_COST} 💎`}
          full
          disabled={!valid}
          onPress={create}
          style={{ marginTop: spacing.md }}
        />
      </View>
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Txt variant="label" color={colors.muted}>
        {label}
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: radius.md,
        backgroundColor: active ? colors.primary : colors.surfaceAlt,
        borderWidth: 1.5,
        borderColor: active ? colors.primary : colors.line,
      }}
    >
      <Txt variant="label" color={active ? colors.white : colors.muted}>
        {label}
      </Txt>
    </Pressable>
  );
}
