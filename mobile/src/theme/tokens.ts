import { Platform, type TextStyle, type ViewStyle } from 'react-native';

// Arena design tokens — a bright, friendly "Duolingo-style" system.
// Brand color (violet) is kept distinct from market up/down (green/red) so P&L
// colors never clash with brand UI.

export const colors = {
  // brand
  primary: '#6C5CE7',
  primaryDark: '#5646C4', // darker bottom edge for the "3D" chunky button
  primaryTint: '#EEEBFE',

  // market semantics
  up: '#17C283',
  upDark: '#11A06B',
  upTint: '#E4F8F0',
  down: '#FF5A6A',
  downDark: '#E23F50',
  downTint: '#FFE9EC',

  // gamification accents
  gold: '#FFC83D',
  goldDark: '#E0A91F',
  flame: '#FF9F0A',
  flameDark: '#E5860A',

  // neutrals
  ink: '#17171F',
  muted: '#7A7D8C',
  faint: '#A8ABB8',
  line: '#E9EAF1',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F6FB',
  bg: '#FFFFFF',
  white: '#FFFFFF',

  // division tiers
  bronze: '#CD7F32',
  silver: '#9AA4B2',
  goldTier: '#F2B705',
  diamond: '#41C7E8',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const fonts = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extra: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
} as const;

// Typography presets (apply with the <Txt> component).
export const type = {
  display: { fontFamily: fonts.black, fontSize: 34, lineHeight: 40 },
  title: { fontFamily: fonts.extra, fontSize: 26, lineHeight: 32 },
  h2: { fontFamily: fonts.extra, fontSize: 20, lineHeight: 26 },
  h3: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 23 },
  body: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  bodyBold: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 18 },
  small: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  tiny: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 0.4 },
  num: { fontFamily: fonts.extra, fontSize: 15, lineHeight: 20 },
} satisfies Record<string, TextStyle>;

// Cross-platform soft shadow.
export function shadow(elevation = 4): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#1B1B3A',
      shadowOpacity: 0.1,
      shadowRadius: elevation * 1.6,
      shadowOffset: { width: 0, height: elevation * 0.7 },
    },
    android: { elevation },
    default: {},
  })!;
}

export type AppColor = keyof typeof colors;
