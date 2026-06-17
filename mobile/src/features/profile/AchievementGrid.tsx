import { View, Pressable } from 'react-native';
import { Txt, Card, Icon, ProgressBar } from '@/ui';
import type { IconName } from '@/ui/Icon';
import { useAchievements } from '@/hooks/queries';
import { useCelebration } from '@/store/celebration';
import { colors, radius } from '@/theme/tokens';

export function AchievementGrid({ locked = false }: { locked?: boolean }) {
  const { data } = useAchievements();
  const celebrate = useCelebration((s) => s.celebrate);
  if (!data) return null;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {data.map((raw) => {
        // Fresh accounts haven't earned anything yet — show all locked.
        const a = locked ? { ...raw, unlocked: false, progress: 0 } : raw;
        const icon = a.icon as IconName;
        return (
          <Pressable
            key={a.id}
            disabled={!a.unlocked}
            onPress={() =>
              celebrate({ icon, color: colors.gold, title: a.title, subtitle: a.description })
            }
            style={{ width: '47%' }}
          >
            <Card style={{ alignItems: 'center', gap: 6 }} flat>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: radius.lg,
                  backgroundColor: a.unlocked ? colors.gold + '22' : colors.surfaceAlt,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={icon} size={28} color={a.unlocked ? colors.goldDark : colors.faint} />
              </View>
              <Txt variant="bodyBold" center color={a.unlocked ? colors.ink : colors.muted}>
                {a.title}
              </Txt>
              <Txt variant="tiny" color={colors.faint} center numberOfLines={2}>
                {a.description}
              </Txt>
              {!a.unlocked && a.progress != null ? (
                <View style={{ width: '100%', marginTop: 4 }}>
                  <ProgressBar progress={a.progress} color={colors.gold} height={6} />
                </View>
              ) : null}
            </Card>
          </Pressable>
        );
      })}
    </View>
  );
}
