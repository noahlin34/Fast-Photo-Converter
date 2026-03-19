import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    accent: '#f25a43',
    accentSoft: '#ffe4de',
    accentStrong: '#17264e',
    background: '#fffcf7',
    backgroundElement: '#ffffff',
    backgroundMuted: '#f5f6ff',
    backgroundSelected: '#eef3ff',
    border: '#e9e6e2',
    borderSoft: 'rgba(23, 38, 78, 0.08)',
    borderStrong: 'rgba(23, 38, 78, 0.16)',
    destructive: '#e04a37',
    destructiveSoft: '#fff0ec',
    navBackground: 'rgba(255, 255, 255, 0.92)',
    navBorder: 'rgba(23, 38, 78, 0.07)',
    overlay: 'rgba(23, 38, 78, 0.12)',
    success: '#17264e',
    surface: '#ffffff',
    surfaceAccent: '#eef3ff',
    surfaceMuted: '#f5f6ff',
    surfaceRaised: '#ffffff',
    surfaceButter: '#fff6d8',
    surfaceLilac: '#f2f3ff',
    surfaceMint: '#eaf8ef',
    surfacePeach: '#ffe8e1',
    surfaceSky: '#eaf1ff',
    text: '#17264e',
    textSecondary: '#5e6a86',
    textTertiary: '#98a2b8',
  },
  dark: {
    accent: '#ff7a67',
    accentSoft: '#4b2b29',
    accentStrong: '#f4f0ff',
    background: '#10131f',
    backgroundElement: '#171b2c',
    backgroundMuted: '#21263a',
    backgroundSelected: '#25304e',
    border: '#2a3147',
    borderSoft: 'rgba(244, 240, 255, 0.08)',
    borderStrong: 'rgba(244, 240, 255, 0.16)',
    destructive: '#ff8e82',
    destructiveSoft: '#432321',
    navBackground: 'rgba(23, 27, 44, 0.92)',
    navBorder: 'rgba(244, 240, 255, 0.08)',
    overlay: 'rgba(10, 12, 20, 0.22)',
    success: '#f4f0ff',
    surface: '#171b2c',
    surfaceAccent: '#24304d',
    surfaceMuted: '#21263a',
    surfaceRaised: '#1b2134',
    surfaceButter: '#453a20',
    surfaceLilac: '#252844',
    surfaceMint: '#18312b',
    surfacePeach: '#402a26',
    surfaceSky: '#23314b',
    text: '#f4f0ff',
    textSecondary: '#c3c8dd',
    textTertiary: '#949bb8',
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
  xs: 12,
  sm: 16,
  md: 22,
  lg: 32,
  xl: 42,
  pill: 999,
} as const;

export const Controls = {
  buttonHeight: 60,
  buttonCompactHeight: 52,
  chipHeight: 32,
  chipLargeHeight: 38,
  iconSm: 14,
  iconMd: 18,
  iconLg: 20,
  navItemHeight: 56,
  navItemMinWidth: 92,
} as const;

export const Shadows = {
  card: '0 10px 26px rgba(23, 38, 78, 0.06)',
  floating: '0 20px 38px rgba(23, 38, 78, 0.14)',
  raised: '0 16px 34px rgba(23, 38, 78, 0.08)',
} as const;

export const Type = {
  body: { fontSize: 16, lineHeight: 24 },
  bodySmall: { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 16 },
  label: { fontSize: 11, lineHeight: 15 },
  button: { fontSize: 17, lineHeight: 22 },
  chip: { fontSize: 12, lineHeight: 16 },
  sectionTitle: { fontSize: 20, lineHeight: 28 },
  title: { fontSize: 28, lineHeight: 34 },
  titleLarge: { fontSize: 34, lineHeight: 42 },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 480;
