import { useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Txt, Card, Button, TextField, EmptyState } from '@/ui';
import {
  useFriends,
  useSuggested,
  useSearchFriends,
  useSendRequest,
  useAcceptFriend,
  useRemoveFriend,
} from '@/hooks/queries';
import { FriendRow } from '@/features/social/FriendRow';
import { useIsFresh } from '@/hooks/useIsFresh';
import { useThemeSync } from '@/store/theme';
import { colors, spacing } from '@/theme/tokens';
import type { Friend } from '@/api/types';

export default function Social() {
  useThemeSync();
  const router = useRouter();
  const fresh = useIsFresh();
  const [q, setQ] = useState('');
  const searching = q.trim().length >= 1;

  const friends = useFriends();
  const suggested = useSuggested();
  const search = useSearchFriends(q);
  const sendReq = useSendRequest();
  const accept = useAcceptFriend();
  const remove = useRemoveFriend();

  const requests = fresh ? [] : friends.data?.filter((f) => f.status === 'PENDING_IN') ?? [];
  const accepted = fresh ? [] : friends.data?.filter((f) => f.status === 'FRIENDS') ?? [];
  const results = search.data ?? [];
  const sugg = suggested.data ?? [];

  // Right-hand action for a row, based on the viewer's relationship to them.
  const relAction = (f: Friend): ReactNode => {
    if (f.status === 'FRIENDS') return <Txt variant="small" color={colors.muted}>Friends</Txt>;
    if (f.status === 'PENDING_OUT') return <Txt variant="small" color={colors.muted}>Requested</Txt>;
    if (f.status === 'PENDING_IN')
      return <Button label="Accept" size="sm" onPress={() => accept.mutate(f.id)} />;
    return <Button label="Add" size="sm" variant="neutral" onPress={() => sendReq.mutate(f.id)} />;
  };

  return (
    <Screen>
      <Txt variant="title" style={{ marginTop: spacing.sm }}>
        Friends
      </Txt>
      <View style={{ marginTop: spacing.md }}>
        <TextField
          placeholder="Search traders…"
          autoCapitalize="none"
          autoCorrect={false}
          value={q}
          onChangeText={setQ}
        />
      </View>

      {searching ? (
        <>
          <SectionTitle>Results</SectionTitle>
          {results.length ? (
            <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
              {results.map((f, i) => (
                <FriendRow key={f.id} friend={f} last={i === results.length - 1} action={relAction(f)} />
              ))}
            </Card>
          ) : (
            <EmptyState
              icon="search-outline"
              text={search.isLoading ? 'Searching…' : 'No traders found'}
            />
          )}
        </>
      ) : (
        <>
          {requests.length > 0 ? (
            <>
              <SectionTitle>Requests</SectionTitle>
              <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
                {requests.map((f, i) => (
                  <FriendRow
                    key={f.id}
                    friend={f}
                    last={i === requests.length - 1}
                    action={
                      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                        <Button label="Accept" size="sm" onPress={() => accept.mutate(f.id)} />
                        <Button label="✕" size="sm" variant="neutral" onPress={() => remove.mutate(f.id)} />
                      </View>
                    }
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
                  action={
                    <Button
                      label="Duel"
                      size="sm"
                      variant="outline"
                      onPress={() => router.push('/create-competition')}
                    />
                  }
                />
              ))}
            </Card>
          ) : (
            <EmptyState icon="people-outline" text="Add friends to duel and compete together" />
          )}

          <SectionTitle>Suggested</SectionTitle>
          {sugg.length ? (
            <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
              {sugg.map((f, i) => (
                <FriendRow
                  key={f.id}
                  friend={f}
                  last={i === sugg.length - 1}
                  action={<Button label="Add" size="sm" variant="neutral" onPress={() => sendReq.mutate(f.id)} />}
                />
              ))}
            </Card>
          ) : (
            <EmptyState icon="sparkles-outline" text="No suggestions right now" />
          )}
        </>
      )}
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
