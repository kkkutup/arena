import { Card } from './Card';
import { Txt } from './Text';
import { Icon, type IconName } from './Icon';
import { Button } from './Button';
import { colors, spacing } from '@/theme/tokens';

// Clean-slate placeholder for fresh accounts and empty lists.
export function EmptyState({
  icon,
  text,
  action,
  onAction,
}: {
  icon: IconName;
  text: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <Card
      flat
      style={{
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        paddingVertical: spacing.xl,
        gap: spacing.md,
      }}
    >
      <Icon name={icon} size={28} color={colors.faint} />
      <Txt variant="body" color={colors.muted}>
        {text}
      </Txt>
      {action && onAction ? (
        <Button label={action} size="sm" variant="neutral" onPress={onAction} />
      ) : null}
    </Card>
  );
}
