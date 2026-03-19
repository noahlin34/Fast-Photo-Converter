import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';

import {
  AppSymbol,
  ConverterScreen,
  EmptyStateCard,
  RecentHeroCard,
  RecentMiniCard,
  SectionTitle,
  SeeAllLink,
  SurfaceCard,
  type PlatformIcon,
  type SurfaceTone,
} from '@/components/converter/shared';
import { Fonts, Radii, Spacing, Type } from '@/constants/theme';
import { useConverterSettings } from '@/features/converter/converter-settings';
import { createSelectedPhoto } from '@/features/converter/converter-utils';
import { useConverter } from '@/features/converter/converter-context';
import { useTheme } from '@/hooks/use-theme';

export function HomeUploadScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { keepHistoryEnabled } = useConverterSettings();
  const { history, resetForAnother, setCurrentPhoto } = useConverter();
  const featuredItem = history[0];
  const gridItems = history.slice(1, 3);
  const hasHistory = keepHistoryEnabled && history.length > 0;

  const handlePick = async () => {
    try {
      await Haptics.selectionAsync();
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        mediaTypes: ['images'],
        quality: 1,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      resetForAnother();
      setCurrentPhoto(createSelectedPhoto(result.assets[0]));
      router.push('/format');
    } catch {
      Alert.alert('Unable to open Photos', 'Please try choosing an image again.');
    }
  };

  const handleCamera = async () => {
    try {
      await Haptics.selectionAsync();
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Camera access needed',
          'Allow camera access if you want to capture and convert a fresh photo.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        cameraType: ImagePicker.CameraType.back,
        mediaTypes: ['images'],
        quality: 1,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      resetForAnother();
      setCurrentPhoto(createSelectedPhoto(result.assets[0]));
      router.push('/format');
    } catch {
      Alert.alert('Unable to open Camera', 'Please try again on a physical device.');
    }
  };

  return (
    <ConverterScreen>
      <View style={{ gap: Spacing.five }}>
        <Pressable onPress={handlePick} style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}>
          <SurfaceCard padding={Spacing.six} radius={Radii.xl} tone="peach" style={{ gap: Spacing.six }}>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: theme.surfaceRaised,
                  borderRadius: Radii.pill,
                  boxShadow: '0 14px 28px rgba(23, 38, 78, 0.08)',
                  height: 88,
                  justifyContent: 'center',
                  width: 88,
                }}>
                <AppSymbol
                  icon={{ android: 'photo-library', ios: 'photo.on.rectangle.angled', web: 'photo.on.rectangle.angled' }}
                  size={34}
                  tintColor={theme.accentStrong}
                  weight="medium"
                />
              </View>

              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: theme.accent,
                  borderRadius: Radii.pill,
                  height: 42,
                  justifyContent: 'center',
                  width: 42,
                }}>
                <AppSymbol
                  icon={{ android: 'arrow_forward', ios: 'arrow.right', web: 'arrow.right' }}
                  size={16}
                  tintColor="#fffaf7"
                  weight="bold"
                />
              </View>
            </View>

            <View style={{ gap: 10 }}>
              <Text
                style={{
                  color: theme.text,
                  fontFamily: Fonts.rounded,
                  fontSize: 28,
                  fontWeight: '600',
                  lineHeight: 34,
                  letterSpacing: -0.8,
                }}>
                Pick a photo
              </Text>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontFamily: Fonts.sans,
                  fontSize: Type.body.fontSize,
                  lineHeight: Type.body.lineHeight,
                }}>
                Start with something from Photos or shoot a new image. We’ll keep the conversion local on your device.
              </Text>
            </View>

            <View style={{ alignItems: 'center', flexDirection: 'row', gap: Spacing.two }}>
              <Text
                style={{
                  color: theme.text,
                  fontFamily: Fonts.sans,
                  fontSize: Type.bodySmall.fontSize,
                  fontWeight: '700',
                  lineHeight: Type.bodySmall.lineHeight,
                }}>
                Open Photos
              </Text>
              <AppSymbol
                icon={{ android: 'arrow_forward', ios: 'arrow.right', web: 'arrow.right' }}
                size={13}
                tintColor={theme.text}
                weight="bold"
              />
            </View>
          </SurfaceCard>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', gap: Spacing.four }}>
        <QuickActionButton
          description="Browse your library"
          icon={{
            android: 'photo-library',
            ios: 'photo.on.rectangle.angled',
            web: 'photo.on.rectangle.angled',
          }}
          label="Gallery"
          onPress={handlePick}
          tone="sky"
        />
        <QuickActionButton
          description="Capture something new"
          icon={{ android: 'photo-camera', ios: 'camera', web: 'camera' }}
          label="Camera"
          onPress={handleCamera}
          tone="butter"
        />
      </View>

      {keepHistoryEnabled ? (
        <View style={{ gap: Spacing.five, paddingBottom: Spacing.seven }}>
          <SectionTitle action={hasHistory ? <SeeAllLink /> : undefined} title="Recently Converted" />
          {hasHistory ? (
            <>
              {featuredItem ? (
                <RecentHeroCard
                  item={featuredItem}
                  onPress={() =>
                    router.push({
                      params: { id: featuredItem.id },
                      pathname: '/history/[id]',
                    })
                  }
                  tone="sky"
                />
              ) : null}

              {gridItems.length ? (
                <View style={{ flexDirection: 'row', gap: Spacing.four }}>
                  {gridItems.map((item, index) => (
                    <RecentMiniCard
                      key={item.id}
                      item={item}
                      onPress={() =>
                        router.push({
                          params: { id: item.id },
                          pathname: '/history/[id]',
                        })
                      }
                      tone={index % 2 === 0 ? 'butter' : 'lilac'}
                    />
                  ))}
                </View>
              ) : null}
            </>
          ) : (
            <EmptyRecentState />
          )}
        </View>
      ) : null}
    </ConverterScreen>
  );
}

function QuickActionButton({
  description,
  icon,
  label,
  onPress,
  tone,
}: {
  description: string;
  icon: PlatformIcon;
  label: string;
  onPress: () => void;
  tone: SurfaceTone;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        opacity: pressed ? 0.84 : 1,
      })}>
      <SurfaceCard padding={Spacing.five} radius={Radii.lg} tone={tone} style={{ gap: Spacing.three }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: theme.surface,
            borderRadius: Radii.pill,
            boxShadow: '0 10px 22px rgba(23, 38, 78, 0.08)',
            height: 48,
            justifyContent: 'center',
            width: 48,
          }}>
          <AppSymbol icon={icon} size={20} tintColor={theme.accentStrong} weight="medium" />
        </View>

        <View style={{ gap: Spacing.one }}>
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
      </SurfaceCard>
    </Pressable>
  );
}

function EmptyRecentState() {
  return (
    <EmptyStateCard
      description="Convert your first photo and we’ll keep recent exports handy here for quick access."
      icon={{ android: 'history', ios: 'clock.arrow.circlepath', web: 'clock.arrow.circlepath' }}
      title="Your recent exports will show up here"
      tone="lilac"
    />
  );
}
