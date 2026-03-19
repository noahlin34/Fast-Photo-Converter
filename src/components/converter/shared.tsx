import React from 'react';
import Slider from '@react-native-community/slider';
import { Image } from 'expo-image';
import { Link, usePathname, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import {
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Fonts,
  MaxContentWidth,
  Radii,
  Shadows,
  Spacing,
  Type,
} from '@/constants/theme';
import { getDisplayFormatLabel, type OutputFormat } from '@/features/converter/converter-utils';
import { useTheme } from '@/hooks/use-theme';

export type PlatformIcon = { android: string; ios: string; web: string };

type HistoryItemLike = {
  name: string;
  outputFormat?: OutputFormat;
  sizeText: string;
  subtitle?: string;
  thumbnailUri: string;
};

export type SurfaceTone =
  | 'accent'
  | 'butter'
  | 'danger'
  | 'default'
  | 'lilac'
  | 'mint'
  | 'muted'
  | 'peach'
  | 'raised'
  | 'sky';

export function ConverterScreen({
  backgroundMode = 'decorated',
  bottomNav = true,
  children,
  contentStyle,
  scrollable = true,
  verticalAlign = 'top',
}: {
  backgroundMode?: 'decorated' | 'minimal';
  bottomNav?: boolean;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  verticalAlign?: 'center' | 'top';
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const content = (
    <View
      style={[
        {
          alignSelf: 'center',
          gap: Spacing.six,
          maxWidth: MaxContentWidth,
          width: '100%',
        },
        contentStyle,
      ]}>
      {children}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {backgroundMode === 'decorated' ? <BackgroundDecoration /> : null}

      {scrollable ? (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{
            paddingBottom: (bottomNav ? 128 : 52) + insets.bottom,
            paddingHorizontal: Spacing.five,
            paddingTop: Spacing.three,
          }}
          showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: verticalAlign === 'center' ? 'center' : 'flex-start',
            paddingBottom: 36 + insets.bottom,
            paddingHorizontal: Spacing.five,
            paddingTop: Spacing.five,
          }}>
          {content}
        </View>
      )}

      {bottomNav ? <FloatingBottomNav /> : null}
    </View>
  );
}

export function BackgroundDecoration() {
  const theme = useTheme();

  return (
    <View pointerEvents="none" style={{ inset: 0, position: 'absolute' }}>
      <View
        style={{
          backgroundColor: theme.surfacePeach,
          borderRadius: Radii.pill,
          boxShadow: `0 0 90px ${theme.surfacePeach}`,
          height: 220,
          opacity: 0.42,
          position: 'absolute',
          right: -58,
          top: -72,
          width: 220,
        }}
      />
      <View
        style={{
          backgroundColor: theme.surfaceSky,
          borderRadius: Radii.pill,
          boxShadow: `0 0 80px ${theme.surfaceSky}`,
          height: 214,
          left: -96,
          opacity: 0.66,
          position: 'absolute',
          top: 280,
          width: 214,
        }}
      />
      <View
        style={{
          backgroundColor: theme.surfaceButter,
          borderRadius: Radii.pill,
          height: 170,
          opacity: 0.54,
          position: 'absolute',
          right: -48,
          top: 560,
          width: 170,
        }}
      />
    </View>
  );
}

export function FloatingBottomNav() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isHistoryRoute = pathname.startsWith('/history');
  const isSettingsRoute = pathname.startsWith('/settings');

  return (
    <View
      style={{
        alignItems: 'center',
        bottom: 18 + insets.bottom,
        left: 24,
        position: 'absolute',
        right: 24,
      }}>
      <View
        style={{
          alignItems: 'center',
          alignSelf: 'center',
          backgroundColor: theme.navBackground,
          borderColor: theme.navBorder,
          borderRadius: Radii.pill,
          borderWidth: 1,
          boxShadow: Shadows.floating,
          flexDirection: 'row',
          gap: Spacing.one,
          justifyContent: 'space-between',
          maxWidth: 348,
          paddingHorizontal: Spacing.two,
          paddingVertical: 6,
          width: '100%',
        }}>
        <NavItem
          active={!isHistoryRoute && !isSettingsRoute}
          icon={{ android: 'home', ios: 'house.fill', web: 'house.fill' }}
          label="Home"
          onPress={() => router.replace('/')}
        />
        <NavItem
          active={isHistoryRoute}
          icon={{
            android: 'history',
            ios: 'arrow.counterclockwise',
            web: 'arrow.counterclockwise',
          }}
          label="History"
          onPress={() => router.replace('/history')}
        />
        <NavItem
          active={isSettingsRoute}
          icon={{ android: 'settings', ios: 'gearshape', web: 'gearshape' }}
          label="Settings"
          onPress={() => router.replace('/settings')}
        />
      </View>
    </View>
  );
}

function NavItem({
  active = false,
  icon,
  label,
  onPress,
}: {
  active?: boolean;
  icon: PlatformIcon;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        borderRadius: Radii.pill,
        flex: 1,
        opacity: pressed ? 0.78 : 1,
        paddingHorizontal: Spacing.one,
        paddingVertical: 3,
      })}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: active ? theme.background : 'transparent',
          borderColor: active ? theme.border : 'transparent',
          borderRadius: Radii.pill,
          borderWidth: 1,
          boxShadow: active ? Shadows.card : 'none',
          gap: 2,
          minHeight: 58,
          minWidth: 98,
          paddingHorizontal: Spacing.four,
          paddingVertical: 8,
        }}>
        <AppSymbol
          icon={icon}
          size={18}
          tintColor={active ? theme.accentStrong : theme.textTertiary}
          weight="medium"
        />
        <Text
          style={{
            color: active ? theme.accentStrong : theme.textTertiary,
            fontFamily: Fonts.sans,
            fontSize: Type.label.fontSize,
            fontWeight: '700',
            lineHeight: Type.label.lineHeight,
          }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export function SurfaceCard({
  children,
  padding = Spacing.five,
  radius = Radii.lg,
  style,
  tone = 'default',
}: {
  children: React.ReactNode;
  padding?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  tone?: SurfaceTone;
}) {
  const theme = useTheme();

  const toneStyle = getSurfaceToneStyle(theme, tone);

  return (
    <Animated.View
      entering={FadeInUp.duration(260)}
      style={[
        {
          borderColor: toneStyle.borderColor,
          borderRadius: radius,
          borderCurve: 'continuous',
          borderWidth: 1,
          boxShadow: toneStyle.boxShadow,
          padding,
        },
        { backgroundColor: toneStyle.backgroundColor },
        style,
      ]}>
      {children}
    </Animated.View>
  );
}

export function PrimaryAction({
  disabled = false,
  icon,
  label,
  onPress,
}: {
  disabled?: boolean;
  icon: PlatformIcon;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <RoundedActionButton
      backgroundColor={disabled ? theme.surfaceMuted : theme.accent}
      borderColor={disabled ? theme.border : undefined}
      disabled={disabled}
      icon={icon}
      label={label}
      labelColor={disabled ? theme.textTertiary : '#fffaf7'}
      onPress={onPress}
      shadowColor={disabled ? undefined : 'rgba(242, 90, 67, 0.28)'}
    />
  );
}

export function SecondaryAction({
  disabled = false,
  icon,
  label,
  onPress,
}: {
  disabled?: boolean;
  icon: PlatformIcon;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <RoundedActionButton
      backgroundColor={disabled ? theme.surfaceMuted : theme.surfaceRaised}
      borderColor={theme.border}
      disabled={disabled}
      icon={icon}
      label={label}
      labelColor={disabled ? theme.textTertiary : theme.text}
      onPress={onPress}
    />
  );
}

function RoundedActionButton({
  backgroundColor,
  borderColor,
  disabled = false,
  icon,
  label,
  labelColor,
  onPress,
  shadowColor,
}: {
  backgroundColor: string;
  borderColor?: string;
  disabled?: boolean;
  icon: PlatformIcon;
  label: string;
  labelColor: string;
  onPress: () => void;
  shadowColor?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor,
        borderColor,
        borderRadius: Radii.pill,
        borderCurve: 'continuous',
        borderWidth: borderColor ? 1 : 0,
        boxShadow: shadowColor ? `0 18px 34px ${shadowColor}` : 'none',
        minHeight: 64,
        opacity: disabled ? 1 : pressed ? 0.8 : 1,
        paddingHorizontal: Spacing.five,
        paddingVertical: Spacing.four,
      })}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: Spacing.three,
          justifyContent: 'center',
        }}>
        <AppSymbol icon={icon} size={18} tintColor={labelColor} weight="semibold" />
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            color: labelColor,
            fontFamily: Fonts.sans,
            flexShrink: 1,
            fontSize: 16,
            fontWeight: '700',
            lineHeight: 22,
            textAlign: 'center',
          }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export function FormatOptionCard({
  active = false,
  description,
  disabled = false,
  icon,
  label,
  onPress,
  tone = 'default',
}: {
  active?: boolean;
  description: string;
  disabled?: boolean;
  icon: PlatformIcon;
  label: string;
  onPress: () => void;
  tone?: SurfaceTone;
}) {
  const theme = useTheme();
  const surfaceTone = getSurfaceToneStyle(theme, tone);
  const cardBackgroundColor = disabled
    ? theme.surfaceMuted
    : active
      ? theme.surface
      : surfaceTone.backgroundColor;
  const iconBackgroundColor = disabled
    ? theme.surface
    : active
      ? theme.accentStrong
      : theme.surface;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        opacity: disabled ? 0.52 : pressed ? 0.84 : 1,
      })}>
      <View
        style={{
          alignItems: 'flex-start',
          backgroundColor: cardBackgroundColor,
          borderColor: active ? theme.accentStrong : theme.border,
          borderRadius: Radii.lg,
          borderCurve: 'continuous',
          borderWidth: active ? 1.5 : 1,
          boxShadow: active ? Shadows.raised : Shadows.card,
          gap: Spacing.four,
          minHeight: 158,
          justifyContent: 'space-between',
          paddingHorizontal: Spacing.five,
          paddingVertical: Spacing.five,
        }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: iconBackgroundColor,
            borderRadius: Radii.pill,
            boxShadow: active ? '0 14px 22px rgba(23, 38, 78, 0.12)' : 'none',
            height: 52,
            justifyContent: 'center',
            width: 52,
          }}>
          <AppSymbol
            icon={icon}
            size={20}
            tintColor={active ? theme.surfaceRaised : disabled ? theme.textTertiary : theme.accentStrong}
            weight="medium"
          />
        </View>

        <View style={{ gap: 4, width: '100%' }}>
          <Text
            style={{
              color: theme.text,
              fontFamily: Fonts.rounded,
              fontSize: 18,
              fontWeight: '600',
              lineHeight: 24,
            }}>
            {label}
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              fontFamily: Fonts.sans,
              fontSize: Type.bodySmall.fontSize,
              lineHeight: Type.bodySmall.lineHeight,
            }}>
            {description}
          </Text>
        </View>

        {active ? (
          <View style={{ position: 'absolute', right: 14, top: 14 }}>
            <AppSymbol
              icon={{
                android: 'check_circle',
                ios: 'checkmark.circle.fill',
                web: 'checkmark.circle.fill',
              }}
              size={18}
              tintColor={theme.accentStrong}
              weight="semibold"
            />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export function RecentHeroCard({
  item,
  onPress,
  tone = 'default',
}: {
  item: HistoryItemLike;
  onPress?: () => void;
  tone?: SurfaceTone;
}) {
  const theme = useTheme();
  const content = (
    <SurfaceCard padding={14} radius={Radii.xl} style={{ gap: 16 }} tone={tone}>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Image
          source={{ uri: item.thumbnailUri }}
          contentFit="cover"
          style={{
            borderRadius: Radii.md,
            height: 96,
            width: 82,
          }}
        />

        <View style={{ flex: 1, gap: 10, justifyContent: 'space-between' }}>
          <View style={{ gap: 6 }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
              {item.outputFormat ? <FormatBadge format={item.outputFormat} /> : <View />}
              <AppSymbol
                icon={{
                  android: 'chevron_right',
                  ios: 'chevron.right',
                  web: 'chevron.right',
                }}
                size={14}
                tintColor={theme.textTertiary}
                weight="bold"
              />
            </View>
            <Text
              numberOfLines={2}
              style={{
                color: theme.text,
                fontFamily: Fonts.rounded,
                fontSize: 20,
                fontWeight: '600',
                lineHeight: 26,
              }}>
              {item.name}
            </Text>
          </View>

          <Text
            numberOfLines={2}
            style={{
              color: theme.textSecondary,
              fontFamily: Fonts.sans,
              fontSize: Type.bodySmall.fontSize,
              lineHeight: Type.bodySmall.lineHeight,
            }}>
            {item.subtitle ?? item.sizeText}
          </Text>
        </View>
      </View>
    </SurfaceCard>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.86 : 1 })}>
      {content}
    </Pressable>
  );
}

export function RecentMiniCard({
  item,
  onPress,
  tone = 'default',
}: {
  item: HistoryItemLike;
  onPress?: () => void;
  tone?: SurfaceTone;
}) {
  const theme = useTheme();
  const content = (
    <SurfaceCard padding={12} radius={Radii.lg} style={{ flex: 1, gap: 12, minHeight: 214 }} tone={tone}>
      <Image
        source={{ uri: item.thumbnailUri }}
        contentFit="cover"
        style={{
          borderRadius: Radii.md,
          height: 138,
          width: '100%',
        }}
      />

      <View style={{ gap: 4 }}>
        <Text
          numberOfLines={1}
          style={{
            color: theme.text,
            fontFamily: Fonts.rounded,
            fontSize: 15,
            fontWeight: '600',
            lineHeight: 20,
          }}>
          {item.name}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: theme.textSecondary,
            fontFamily: Fonts.sans,
            fontSize: Type.caption.fontSize,
            fontWeight: '600',
            lineHeight: Type.caption.lineHeight,
          }}>
          {item.sizeText}
        </Text>
      </View>
    </SurfaceCard>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        opacity: pressed ? 0.86 : 1,
      })}>
      {content}
    </Pressable>
  );
}

export function EmptyStateCard({
  action,
  description,
  icon,
  title,
  tone = 'default',
}: {
  action?: React.ReactNode;
  description: string;
  icon: PlatformIcon;
  title: string;
  tone?: 'default' | 'lilac' | 'muted' | 'peach' | 'sky';
}) {
  const theme = useTheme();

  return (
    <SurfaceCard
      padding={Spacing.six}
      radius={Radii.xl}
      tone={tone}
      style={{ alignItems: 'center', gap: Spacing.five }}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: tone === 'muted' ? theme.surface : theme.surfaceMuted,
          borderRadius: Radii.pill,
          height: 76,
          justifyContent: 'center',
          width: 76,
        }}>
        <AppSymbol icon={icon} size={28} tintColor={theme.accentStrong} weight="medium" />
      </View>

      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text
          style={{
            color: theme.text,
            fontFamily: Fonts.rounded,
            fontSize: 22,
            fontWeight: '600',
            lineHeight: 28,
            textAlign: 'center',
          }}>
          {title}
        </Text>
        <Text
          style={{
            color: theme.textSecondary,
            fontFamily: Fonts.sans,
            fontSize: 15,
            lineHeight: 22,
            textAlign: 'center',
          }}>
          {description}
        </Text>
      </View>

      {action ? <View style={{ width: '100%' }}>{action}</View> : null}
    </SurfaceCard>
  );
}

export function FormatBadge({ format }: { format: OutputFormat }) {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
        borderRadius: Radii.pill,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 5,
      }}>
      <Text
        style={{
          color: theme.accentStrong,
          fontFamily: Fonts.sans,
          fontSize: 10,
          fontWeight: '800',
          letterSpacing: 0.6,
          lineHeight: 14,
        }}>
        {getDisplayFormatLabel(format)}
      </Text>
    </View>
  );
}

export function InfoPill({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'accent' | 'neutral' | 'peach' | 'sky';
}) {
  const theme = useTheme();
  const backgroundColor =
    tone === 'accent'
      ? theme.surfaceSky
      : tone === 'peach'
        ? theme.surfacePeach
        : tone === 'sky'
          ? theme.surfaceSky
          : theme.surface;
  const textColor = tone === 'neutral' ? theme.textSecondary : theme.accentStrong;

  return (
    <View
      style={{
        backgroundColor,
        borderColor: theme.border,
        borderRadius: Radii.pill,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 7,
      }}>
      <Text
        style={{
          color: textColor,
          fontFamily: Fonts.sans,
          fontSize: Type.caption.fontSize,
          fontWeight: '700',
          lineHeight: Type.caption.lineHeight,
        }}>
        {label}
      </Text>
    </View>
  );
}

export function CardDivider() {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.borderSoft,
        height: 1,
        width: '100%',
      }}
    />
  );
}

export function SettingsSwitch({
  onValueChange,
  value,
}: {
  onValueChange: (value: boolean) => void;
  value: boolean;
}) {
  const theme = useTheme();

  return (
    <Switch
      ios_backgroundColor={theme.border}
      onValueChange={onValueChange}
      trackColor={{ false: theme.border, true: theme.accentSoft }}
      value={value}
    />
  );
}

export function ProgressBar({ progress }: { progress: number }) {
  const theme = useTheme();
  const [trackWidth, setTrackWidth] = React.useState(0);
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const animatedWidth = useSharedValue(0);

  React.useEffect(() => {
    animatedWidth.value = withTiming(trackWidth * clampedProgress, {
      duration: 180,
    });
  }, [animatedWidth, clampedProgress, trackWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: animatedWidth.value,
  }));

  return (
    <View
      onLayout={(event: LayoutChangeEvent) => setTrackWidth(event.nativeEvent.layout.width)}
      style={{
        backgroundColor: theme.surfaceMuted,
        borderRadius: Radii.pill,
        height: 14,
        overflow: 'hidden',
        width: '100%',
      }}>
      <Animated.View
        style={[
          {
            backgroundColor: theme.accent,
            borderRadius: Radii.pill,
            height: 14,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

export function QualitySlider({
  estimatedSizeLabel,
  value,
  onChange,
}: {
  estimatedSizeLabel?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const theme = useTheme();

  return (
    <SurfaceCard padding={Spacing.six} radius={Radii.xl} tone="butter" style={{ gap: Spacing.five }}>
      <View
        style={{
          alignItems: 'flex-start',
          flexDirection: 'row',
          gap: Spacing.four,
          justifyContent: 'space-between',
        }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              color: theme.textSecondary,
              fontFamily: Fonts.sans,
              fontSize: Type.bodySmall.fontSize,
              fontWeight: '700',
              lineHeight: Type.bodySmall.lineHeight,
            }}>
            Balance size and detail
          </Text>

          <Text
            style={{
              color: estimatedSizeLabel ? theme.accentStrong : theme.textTertiary,
              fontFamily: Fonts.sans,
              fontSize: Type.caption.fontSize,
              fontWeight: estimatedSizeLabel ? '700' : '600',
              lineHeight: Type.caption.lineHeight,
            }}>
            {estimatedSizeLabel ?? 'Higher quality preserves more detail.'}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderRadius: Radii.pill,
            borderWidth: 1,
            paddingHorizontal: 14,
            paddingVertical: 8,
          }}>
          <Text
            style={{
              color: theme.accentStrong,
              fontFamily: Fonts.sans,
              fontSize: 21,
              fontVariant: ['tabular-nums'],
              fontWeight: '800',
              lineHeight: 24,
            }}>
            {value}%
          </Text>
        </View>
      </View>

      <View style={{ marginHorizontal: -4 }}>
        <Slider
          maximumTrackTintColor={theme.border}
          maximumValue={100}
          minimumTrackTintColor={theme.accent}
          minimumValue={50}
          onValueChange={onChange}
          step={1}
          thumbTintColor={theme.accentStrong}
          value={value}
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text
          style={{
            color: theme.textTertiary,
            fontFamily: Fonts.sans,
            fontSize: Type.caption.fontSize,
            fontWeight: '800',
            letterSpacing: 0.5,
            lineHeight: Type.caption.lineHeight,
          }}>
          SMALLER FILE
        </Text>
        <Text
          style={{
            color: theme.textTertiary,
            fontFamily: Fonts.sans,
            fontSize: Type.caption.fontSize,
            fontWeight: '800',
            letterSpacing: 0.5,
            lineHeight: Type.caption.lineHeight,
          }}>
          BETTER QUALITY
        </Text>
      </View>
    </SurfaceCard>
  );
}

export function SectionTitle({
  action,
  title,
}: {
  action?: React.ReactNode;
  title: string;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
      }}>
      <Text
        style={{
          color: theme.text,
          fontFamily: Fonts.rounded,
          fontSize: Type.sectionTitle.fontSize,
          fontWeight: '600',
          lineHeight: Type.sectionTitle.lineHeight,
        }}>
        {title}
      </Text>
      {action}
    </View>
  );
}

export function SeeAllLink() {
  const theme = useTheme();

  return (
    <Link href="/history" asChild>
      <Pressable
        style={({ pressed }) => ({
          alignItems: 'center',
          flexDirection: 'row',
          gap: 6,
          opacity: pressed ? 0.76 : 1,
        })}>
        <Text
          style={{
            color: theme.accentStrong,
            fontFamily: Fonts.sans,
            fontSize: Type.bodySmall.fontSize,
            fontWeight: '700',
            lineHeight: Type.bodySmall.lineHeight,
          }}>
          See all
        </Text>
        <AppSymbol
          icon={{
            android: 'chevron_right',
            ios: 'chevron.right',
            web: 'chevron.right',
          }}
          size={12}
          tintColor={theme.accentStrong}
          weight="bold"
        />
      </Pressable>
    </Link>
  );
}

function getSurfaceToneStyle(theme: ReturnType<typeof useTheme>, tone: SurfaceTone) {
  if (tone === 'accent') {
    return {
      backgroundColor: theme.surfaceAccent,
      borderColor: theme.border,
      boxShadow: Shadows.raised,
    };
  }

  if (tone === 'butter') {
    return {
      backgroundColor: theme.surfaceButter,
      borderColor: theme.borderSoft,
      boxShadow: Shadows.card,
    };
  }

  if (tone === 'danger') {
    return {
      backgroundColor: theme.destructiveSoft,
      borderColor: theme.borderSoft,
      boxShadow: 'none',
    };
  }

  if (tone === 'lilac') {
    return {
      backgroundColor: theme.surfaceLilac,
      borderColor: theme.borderSoft,
      boxShadow: Shadows.card,
    };
  }

  if (tone === 'mint') {
    return {
      backgroundColor: theme.surfaceMint,
      borderColor: theme.borderSoft,
      boxShadow: Shadows.card,
    };
  }

  if (tone === 'muted') {
    return {
      backgroundColor: theme.surfaceMuted,
      borderColor: theme.borderSoft,
      boxShadow: 'none',
    };
  }

  if (tone === 'peach') {
    return {
      backgroundColor: theme.surfacePeach,
      borderColor: theme.borderSoft,
      boxShadow: Shadows.card,
    };
  }

  if (tone === 'raised') {
    return {
      backgroundColor: theme.surfaceRaised,
      borderColor: theme.borderSoft,
      boxShadow: Shadows.raised,
    };
  }

  if (tone === 'sky') {
    return {
      backgroundColor: theme.surfaceSky,
      borderColor: theme.borderSoft,
      boxShadow: Shadows.card,
    };
  }

  return {
    backgroundColor: theme.surface,
    borderColor: theme.borderSoft,
    boxShadow: Shadows.card,
  };
}

export function AppSymbol({
  icon,
  size,
  tintColor,
  weight,
}: {
  icon: PlatformIcon;
  size: number;
  tintColor: string;
  weight?:
    | 'black'
    | 'bold'
    | 'heavy'
    | 'light'
    | 'medium'
    | 'regular'
    | 'semibold'
    | 'thin'
    | 'ultraLight';
}) {
  const platform = (process.env.EXPO_OS ?? 'ios') as keyof PlatformIcon;

  return (
    <SymbolView
      name={icon[platform] as never}
      size={size}
      tintColor={tintColor}
      weight={weight}
    />
  );
}
