import 'expo-sqlite/localStorage/install';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Colors, Fonts } from '@/constants/theme';
import { ConverterProvider } from '@/features/converter/converter-context';
import { ConverterSettingsProvider } from '@/features/converter/converter-settings';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const themeName = colorScheme === 'unspecified' ? 'light' : colorScheme;
  const themeColors = Colors[themeName];
  const baseTheme = themeName === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider
      value={{
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          background: themeColors.background,
          border: themeColors.border,
          card: themeColors.background,
          notification: themeColors.accent,
          primary: themeColors.accent,
          text: themeColors.text,
        },
      }}>
      <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} />
      <ConverterSettingsProvider>
        <ConverterProvider>
          <Stack
            screenOptions={{
              headerBackButtonDisplayMode: 'minimal',
              headerLargeStyle: { backgroundColor: themeColors.background },
              headerLargeTitleStyle: {
                fontFamily: Fonts.rounded,
                fontWeight: '700',
              },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: themeColors.background },
              headerStyle: { backgroundColor: themeColors.background },
              headerTintColor: themeColors.text,
              headerTitleStyle: {
                fontFamily: Fonts.sans,
                fontSize: 17,
                fontWeight: '600',
              },
              headerShown: true,
            }}>
            <Stack.Screen
              name="index"
              options={{
                animation: 'none',
                headerLargeTitle: true,
                title: 'Convert',
              }}
            />
            <Stack.Screen
              name="format"
              options={{
                title: 'Format',
              }}
            />
            <Stack.Screen
              name="processing"
              options={{
                title: 'Converting',
              }}
            />
            <Stack.Screen
              name="done"
              options={{
                title: 'Done',
              }}
            />
            <Stack.Screen
              name="history/index"
              options={{
                animation: 'none',
                headerLargeTitle: true,
                title: 'History',
              }}
            />
            <Stack.Screen
              name="history/[id]"
              options={{
                title: 'Export',
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                animation: 'none',
                headerLargeTitle: true,
                title: 'Settings',
              }}
            />
          </Stack>
        </ConverterProvider>
      </ConverterSettingsProvider>
    </ThemeProvider>
  );
}
