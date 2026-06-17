import { type ReactNode } from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Screen, Txt, Card, Button, TextField, EmptyState } from '@/ui';
import { useFriends, useSuggested } from '@/hooks/queries';
import { FriendRow } from '@/features/social/FriendRow';
import { useIsFresh } from '@/hooks/useIsFresh';
import { colors, spacing } from '@/theme/tokens';

export default function Social() {
  const fresh = useIsFresh();
  const friends = useFriends();
  const suggested = useSuggested();
  const requests = fresh ? [] : friends.data?.filter((f) => f.status === 'PENDING_IN') ?? [];
  const accepted = fresh ? [] : friends.data?.filter((f) => f.status === 'FRIENDS') ?? [];
  const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  return (
    <Screen>
      <Txt variant="title" style={{ marginTop: spacing.sm }}>
        Friends
      </Txt>
      <View style={{ marginTop: spacing.md }}>
        <TextField placeholder="Search traders…" autoCapitalize="none" />
      </View>

      {requests.length > 0 ? (
        <>
          <SectionTitle>Requests</SectionTitle>
          <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
            {requests.map((f, i) => (
              <FriendRow
                key={f.id}
                friend={f}
                last={i === requests.length - 1}
                action={<Button label="Accept" size="sm" onPress={tap} />}
              />
            ))}
          </Card>
        </>
      ) : null}

      <SectionTitle>Your friends ({accepted.length})</SectionTitle>
      {accepted.length ? (
        <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
          {accepted.map((f, i) => (
            <FriendRow
              key={f.id}
              friend={f}
              last={i === accepted.length - 1}
              action={<Button label="Duel" size="sm" variant="outline" onPress={tap} />}
            />
          ))}
        </Card>
      ) : (
        <EmptyState icon="people-outline" text="Add friends to duel and compete together" />
      )}

      <SectionTitle>Suggested</SectionTitle>
      <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
        {suggested.data?.map((f, i) => (
          <FriendRow
            key={f.id}
            friend={f}
            last={i === (suggested.data?.length ?? 0) - 1}
            action={<Button label="Add" size="sm" variant="neutral" onPress={tap} />}
          />
        ))}
      </Card>
    </Screen>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Txt variant="h2" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
      {children}
    </Txt>
  );
}
