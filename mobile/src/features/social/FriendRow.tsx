import { type ReactNode } from 'react';
import { View } from 'react-native';
import { Avatar, Txt } from '@/ui';
import { colors, spacing } from '@/theme/tokens';
import type { Friend } from '@/api/types';

export function FriendRow({
  friend,
  action,
  last,
}: {
  friend: Friend;
  action?: ReactNode;
  last?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: last ? 0 : 1.5,
        borderBottomColor: colors.line,
      }}
    >
      <View>
        <Avatar name={friend.displayName} uri={friend.avatarUrl} size={44} />
        {friend.online ? (
          <View
            style={{
              position: 'absolute',
              right: -1,
              bottom: -1,
              width: 13,
              height: 13,
              borderRadius: 7,
              backgroundColor: colors.up,
              borderWidth: 2,
              borderColor: colors.surface,
            }}
          />
        ) : null}
      </View>
      <View style={{ flex: 1 }}>
        <Txt variant="bodyBold">{friend.displayName}</Txt>
        <Txt variant="small" color={colors.muted}>
          @{friend.username} · Lvl {friend.level}
        </Txt>
      </View>
      {action}
    </View>
  );
}
