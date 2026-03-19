import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    accent: '#0f8f83',
    accentSoft: '#c8f1ea',
    accentStrong: '#00675f',
    background: '#f7f5ef',
    backgroundElement: '#fffdf8',
    backgroundMuted: '#efebe3',
    backgroundSelected: '#eaf7f3',
    border: '#ddd8ce',
    borderSoft: 'rgba(72, 80, 79, 0.08)',
    borderStrong: 'rgba(31, 42, 43, 0.14)',
    destructive: '#ba3a2d',
    destructiveSoft: '#fff1ee',
    navBackground: 'rgba(255, 252, 246, 0.84)',
    navBorder: 'rgba(31, 42, 43, 0.08)',
    overlay: 'rgba(15, 22, 24, 0.18)',
    success: '#00675f',
    surface: '#fffdf8',
    surfaceAccent: '#eef8f6',
    surfaceMuted: '#f3efe8',
    surfaceRaised: '#ffffff',
    text: '#1f2a2b',
    textSecondary: '#5e6869',
    textTertiary: '#8b9495',
  },
  dark: {
    accent: '#68e6d5',
    accentSoft: '#1e5e58',
    accentStrong: '#8ef6e7',
    background: '#0f1414',
    backgroundElement: '#182020',
    backgroundMuted: '#202a2a',
    backgroundSelected: '#153430',
    border: '#2d3737',
    borderSoft: 'rgba(232, 242, 242, 0.08)',
    borderStrong: 'rgba(232, 242, 242, 0.14)',
    destructive: '#ff8e82',
    destructiveSoft: '#432321',
    navBackground: 'rgba(24, 32, 32, 0.84)',
    navBorder: 'rgba(232, 242, 242, 0.08)',
    overlay: 'rgba(0, 0, 0, 0.24)',
    success: '#68e6d5',
    surface: '#182020',
    surfaceAccent: '#17332f',
    surfaceMuted: '#202a2a',
    surfaceRaised: '#1d2727',
    text: '#f6fbfb',
    textSecondary: '#bac5c5',
    textTertiary: '#8b9898',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
  seven: 40,
  eight: 56,
} as const;

export const Radii = {
  sm: 16,
  md: 22,
  lg: 30,
  xl: 38,
  pill: 999,
} as const;

export const Shadows = {
  card: '0 10px 30px rgba(31, 42, 43, 0.06)',
  floating: '0 18px 40px rgba(31, 42, 43, 0.12)',
  raised: '0 14px 32px rgba(31, 42, 43, 0.09)',
} as const;

export const Type = {
  body: { fontSize: 16, lineHeight: 24 },
  bodySmall: { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 16 },
  label: { fontSize: 11, lineHeight: 15 },
  sectionTitle: { fontSize: 20, lineHeight: 28 },
  title: { fontSize: 28, lineHeight: 34 },
  titleLarge: { fontSize: 34, lineHeight: 42 },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 480;
