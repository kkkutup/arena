import type { CompetitionType, DivisionTier } from '@/api/types';
import type { IconName } from '@/ui/Icon';
import { colors } from '@/theme/tokens';

export function compTypeMeta(type: CompetitionType): {
  label: string;
  color: string;
  tint: string;
  icon: IconName;
} {
  switch (type) {
    case 'PRIVATE_LEAGUE':
      return { label: 'League', color: colors.primary, tint: colors.primaryTint, icon: 'people' };
    case 'DUEL':
      return { label: 'Duel', color: colors.down, tint: colors.downTint, icon: 'flash' };
    case 'PUBLIC_DIVISION':
      return { label: 'Division', color: colors.goldDark, tint: '#FFF4D6', icon: 'trophy' };
  }
}

export function tierMeta(tier: DivisionTier): { label: string; color: string } {
  switch (tier) {
    case 'BRONZE':
      return { label: 'Bronze', color: colors.bronze };
    case 'SILVER':
      return { label: 'Silver', color: colors.silver };
    case 'GOLD':
      return { label: 'Gold', color: colors.goldTier };
    case 'DIAMOND':
      return { label: 'Diamond', color: colors.diamond };
  }
}
