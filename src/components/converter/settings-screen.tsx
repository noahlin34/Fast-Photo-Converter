import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import {
  AppSymbol,
  CardDivider,
  ConverterScreen,
  FormatBadge,
  QualitySlider,
  SectionTitle,
  SettingsSwitch,
  SurfaceCard,
  type PlatformIcon,
  type SurfaceTone,
} from '@/components/converter/shared';
import { Fonts, Radii, Spacing, Type } from '@/constants/theme';
import { useConverterSettings } from '@/features/converter/converter-settings';
import { type OutputFormat } from '@/features/converter/converter-utils';
import { useConverter } from '@/features/converter/converter-context';
import { useTheme } from '@/hooks/use-theme';

const PRIVACY_URL = 'https://noahlin.ca/privacy';
const SUPPORT_URL = 'https://noahlin.ca/support';

const SETTINGS_FORMATS: {
  format: OutputFormat;
  icon: PlatformIcon;
  label: string;
}[] = [
  {
    format: 'jpeg',
    icon: { android: 'image', ios: 'photo', web: 'photo' },
    label: 'JPEG',
  },
  {
    format: 'png',
    icon: { android: 'description', ios: 'doc.richtext', web: 'doc.richtext' },
    label: 'PNG',
  },
  {
    format: 'webp',
    icon: { android: 'public', ios: 'sparkles', web: 'sparkles' },
    label: 'WebP',
  },
  {
    format: 'heic',
    icon: { android: 'image', ios: 'camera.aperture', web: 'camera.aperture' },
    label: 'HEIC',
  },
];

export function SettingsScreen() {
  const theme = useTheme();
  const { clearHistory, history } = useConverter();
  const {
    defaultOutputFormat,
    defaultQuality,
    heicEncodingAvailable,
    keepHistoryEnabled,
    setDefaultOutputFormat,
    setDefaultQuality,
    setKeepHistoryEnabled,
  } = useConverterSettings();

  const handleKeepHistoryChange = React.useCallback(
    (value: boolean) => {
      setKeepHistoryEnabled(value);

      if (!value) {
        clearHistory();
      }
    },
    [clearHistory, setKeepHistoryEnabled]
  );

  const confirmClearHistory = React.useCallback(() => {
    if (!history.length) {
      return;
    }

    const archiveCopy =
      history.length === 1
        ? 'This will remove 1 archived conversion from the app.'
        : `This will remove ${history.length} archived conversions from the app.`;

    Alert.alert(
      'Clear history?',
      `${archiveCopy} Photos saved to your library will stay there.`,
      [
        {
          style: 'cancel',
          text: 'Cancel',
        },
        {
          style: 'destructive',
          text: 'Clear',
          onPress: clearHistory,
        },
      ]
    );
  }, [clearHistory, history.length]);

  const openExternalPage = React.useCallback(async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
      });
    } catch {
      Alert.alert('Unable to open link', 'Please try again in a moment.');
    }
  }, []);

  return (
    <ConverterScreen>
      <View style={{ gap: Spacing.four }}>
        <SectionTitle title="Defaults" />

        <SurfaceCard padding={Spacing.five} radius={Radii.xl} tone="sky" style={{ gap: Spacing.five }}>
          <View style={{ gap: 8 }}>
            <Text
              style={{
                color: theme.text,
                fontFamily: Fonts.rounded,
                fontSize: 20,
                fontWeight: '600',
                lineHeight: 26,
              }}>
              Default Format
            </Text>
            <Text
              style={{
                color: theme.textSecondary,
                fontFamily: Fonts.sans,
                fontSize: Type.bodySmall.fontSize,
                lineHeight: Type.bodySmall.lineHeight,
              }}>
              New conversions start with this format selected.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.four }}>
            {SETTINGS_FORMATS.map((item) => (
              <View key={item.format} style={{ minWidth: '47%', flexGrow: 1 }}>
                <FormatPreferenceButton
                  active={defaultOutputFormat === item.format}
                  disabled={item.format === 'heic' && !heicEncodingAvailable}
                  format={item.format}
                  icon={item.icon}
                  label={item.label}
                  onPress={() => setDefaultOutputFormat(item.format)}
                  tone={getFormatTone(item.format)}
                />
              </View>
            ))}
          </View>

          {!heicEncodingAvailable ? (
            <Text
              style={{
                color: theme.textTertiary,
                fontFamily: Fonts.sans,
                fontSize: Type.caption.fontSize,
                lineHeight: Type.caption.lineHeight,
              }}>
              HEIC defaults require a custom iOS build. Expo Go, web, and Android fall back to PNG.
            </Text>
          ) : null}
        </SurfaceCard>

        <SurfaceCard padding={Spacing.five} radius={Radii.xl} tone="butter" style={{ gap: Spacing.five }}>
          <View style={{ gap: 8 }}>
            <Text
              style={{
                color: theme.text,
                fontFamily: Fonts.rounded,
                fontSize: 20,
                fontWeight: '600',
                lineHeight: 26,
              }}>
              Default Quality
            </Text>
            <Text
              style={{
                color: theme.textSecondary,
                fontFamily: Fonts.sans,
                fontSize: Type.bodySmall.fontSize,
                lineHeight: Type.bodySmall.lineHeight,
              }}>
              {heicEncodingAvailable
                ? 'This becomes the starting point for JPG, WebP, and HEIC exports.'
                : 'This becomes the starting point for JPG and WebP exports.'}
            </Text>
          </View>

          <QualitySlider value={defaultQuality} onChange={setDefaultQuality} />
        </SurfaceCard>
      </View>

      <View style={{ gap: Spacing.four }}>
        <SectionTitle title="History" />

        <SurfaceCard padding={Spacing.five} radius={Radii.xl} tone="raised" style={{ gap: Spacing.five }}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: Spacing.four,
              justifyContent: 'space-between',
            }}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text
                style={{
                  color: theme.text,
                  fontFamily: Fonts.rounded,
                  fontSize: 20,
                  fontWeight: '600',
                  lineHeight: 26,
                }}>
                Keep History
              </Text>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontFamily: Fonts.sans,
                  fontSize: Type.bodySmall.fontSize,
                  lineHeight: Type.bodySmall.lineHeight,
                }}>
                Save converted files locally so they show up on Home and in History.
              </Text>
            </View>
            <SettingsSwitch onValueChange={handleKeepHistoryChange} value={keepHistoryEnabled} />
          </View>

          {!keepHistoryEnabled ? (
            <Text
              style={{
                color: theme.textTertiary,
                fontFamily: Fonts.sans,
                fontSize: Type.caption.fontSize,
                lineHeight: Type.caption.lineHeight,
              }}>
              The archive is off. Future conversions will still work normally, but they won’t be saved in the app.
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={!history.length}
            onPress={confirmClearHistory}
            style={({ pressed }) => ({
              opacity: !history.length ? 0.45 : pressed ? 0.8 : 1,
            })}>
            <SurfaceCard
              padding={Spacing.four}
              radius={Radii.lg}
              tone="danger"
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                gap: Spacing.three,
                justifyContent: 'space-between',
              }}>
              <View style={{ flexDirection: 'row', flex: 1, gap: Spacing.three }}>
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: theme.surface,
                    borderRadius: Radii.pill,
                    height: 38,
                    justifyContent: 'center',
                    width: 38,
                  }}>
                  <AppSymbol
                    icon={{ android: 'delete', ios: 'trash', web: 'trash' }}
                    size={16}
                    tintColor={theme.destructive}
                    weight="semibold"
                  />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text
                    style={{
                      color: theme.destructive,
                      fontFamily: Fonts.sans,
                      fontSize: Type.bodySmall.fontSize,
                      fontWeight: '700',
                      lineHeight: Type.bodySmall.lineHeight,
                    }}>
                    Clear History
                  </Text>
                  <Text
                    style={{
                      color: theme.destructive,
                      fontFamily: Fonts.sans,
                      fontSize: Type.caption.fontSize,
                      lineHeight: Type.caption.lineHeight,
                    }}>
                    {history.length
                      ? `${history.length} archived ${history.length === 1 ? 'conversion' : 'conversions'} stored in the app`
                      : 'Nothing saved in the archive right now'}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  color: theme.destructive,
                  fontFamily: Fonts.sans,
                  fontSize: Type.caption.fontSize,
                  fontWeight: '800',
                  lineHeight: Type.caption.lineHeight,
                }}>
                Clear
              </Text>
            </SurfaceCard>
          </Pressable>
        </SurfaceCard>
      </View>

      <View style={{ gap: Spacing.four, paddingBottom: Spacing.seven }}>
        <SectionTitle title="About" />

        <SurfaceCard padding={Spacing.five} radius={Radii.xl} tone="lilac" style={{ gap: 0 }}>
          <SettingsLinkRow
            description="Read how the app handles photos and on-device data."
            icon={{
              android: 'privacy_tip',
              ios: 'hand.raised.fill',
              web: 'hand.raised.fill',
            }}
            label="Privacy"
            onPress={() => void openExternalPage(PRIVACY_URL)}
          />
          <CardDivider />
          <SettingsLinkRow
            description="Open the support page if you need help or want to get in touch."
            icon={{ android: 'help', ios: 'questionmark.circle', web: 'questionmark.circle' }}
            label="Support"
            onPress={() => void openExternalPage(SUPPORT_URL)}
          />
          <CardDivider />
          <SettingsValueRow
            icon={{ android: 'info', ios: 'info.circle', web: 'info.circle' }}
            label="Version"
            value={Constants.expoConfig?.version ?? '1.0.0'}
          />
        </SurfaceCard>
      </View>
    </ConverterScreen>
  );
}

function FormatPreferenceButton({
  active,
  disabled = false,
  format,
  icon,
  label,
  onPress,
  tone,
}: {
  active: boolean;
  disabled?: boolean;
  format: OutputFormat;
  icon: PlatformIcon;
  label: string;
  onPress: () => void;
  tone: SurfaceTone;
}) {
  const theme = useTheme();
  const backgroundColor = disabled
    ? theme.surfaceMuted
    : active
      ? theme.surface
      : tone === 'peach'
        ? theme.surfacePeach
        : tone === 'sky'
          ? theme.surfaceSky
          : tone === 'mint'
            ? theme.surfaceMint
            : tone === 'lilac'
              ? theme.surfaceLilac
              : theme.surfaceButter;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: disabled ? 0.5 : pressed ? 0.82 : 1,
      })}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor,
          borderColor: active ? theme.accentStrong : theme.borderSoft,
          borderRadius: Radii.lg,
          borderCurve: 'continuous',
          borderWidth: 1,
          boxShadow: active ? '0 14px 28px rgba(23, 38, 78, 0.08)' : 'none',
          gap: 10,
          minHeight: 116,
          justifyContent: 'center',
          paddingHorizontal: Spacing.four,
          paddingVertical: Spacing.four,
        }}>
        <AppSymbol
          icon={icon}
          size={18}
          tintColor={
            disabled ? theme.textTertiary : active ? theme.accentStrong : theme.textSecondary
          }
          weight="medium"
        />
        <FormatBadge format={format} />
        <Text
          style={{
            color: theme.text,
            fontFamily: Fonts.sans,
            fontSize: Type.bodySmall.fontSize,
            fontWeight: '700',
            lineHeight: Type.bodySmall.lineHeight,
          }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function getFormatTone(format: OutputFormat): SurfaceTone {
  if (format === 'jpeg') {
    return 'peach';
  }

  if (format === 'png') {
    return 'sky';
  }

  if (format === 'webp') {
    return 'mint';
  }

  return 'lilac';
}

function SettingsLinkRow({
  description,
  icon,
  label,
  onPress,
}: {
  description: string;
  icon: PlatformIcon;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: Spacing.three,
          justifyContent: 'space-between',
          paddingVertical: Spacing.four,
        }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: theme.surfaceMuted,
            borderRadius: Radii.pill,
            height: 38,
            justifyContent: 'center',
            width: 38,
          }}>
          <AppSymbol icon={icon} size={16} tintColor={theme.accentStrong} weight="medium" />
        </View>

        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              color: theme.text,
              fontFamily: Fonts.sans,
              fontSize: Type.body.fontSize,
              fontWeight: '700',
              lineHeight: Type.body.lineHeight,
            }}>
            {label}
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              fontFamily: Fonts.sans,
              fontSize: Type.caption.fontSize,
              lineHeight: Type.caption.lineHeight,
            }}>
            {description}
          </Text>
        </View>

        <AppSymbol
          icon={{ android: 'chevron_right', ios: 'chevron.right', web: 'chevron.right' }}
          size={14}
          tintColor={theme.textTertiary}
          weight="bold"
        />
      </View>
    </Pressable>
  );
}

function SettingsValueRow({
  icon,
  label,
  value,
}: {
  icon: PlatformIcon;
  label: string;
  value: string;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        gap: Spacing.three,
        justifyContent: 'space-between',
        paddingVertical: Spacing.four,
      }}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: theme.surfaceMuted,
          borderRadius: Radii.pill,
          height: 38,
          justifyContent: 'center',
          width: 38,
        }}>
        <AppSymbol icon={icon} size={16} tintColor={theme.accentStrong} weight="medium" />
      </View>

      <Text
        style={{
          color: theme.text,
          flex: 1,
          fontFamily: Fonts.sans,
          fontSize: Type.body.fontSize,
          fontWeight: '700',
          lineHeight: Type.body.lineHeight,
        }}>
        {label}
      </Text>

      <Text
        selectable
        style={{
          color: theme.textSecondary,
          fontFamily: Fonts.sans,
          fontSize: Type.bodySmall.fontSize,
          fontWeight: '700',
          lineHeight: Type.bodySmall.lineHeight,
        }}>
        {value}
      </Text>
    </View>
  );
}
