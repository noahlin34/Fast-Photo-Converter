import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Text, View } from 'react-native';

import {
  ConverterScreen,
  FormatOptionCard,
  InfoPill,
  PrimaryAction,
  QualitySlider,
  SectionTitle,
  SurfaceCard,
  type PlatformIcon,
} from '@/components/converter/shared';
import { Fonts, Radii, Spacing, Type } from '@/constants/theme';
import {
  estimateOutputSizeBytes,
  formatBytes,
  formatDimensions,
  getSourceFormatLabel,
  type OutputFormat,
} from '@/features/converter/converter-utils';
import { useConverter } from '@/features/converter/converter-context';
import { useTheme } from '@/hooks/use-theme';

export function FormatSelectionScreen() {
  const router = useRouter();
  const theme = useTheme();
  const {
    conversionQuality,
    currentPhoto,
    heicEncodingAvailable,
    outputFormat,
    setConversionQuality,
    setOutputFormat,
    supportedOutputFormat,
  } = useConverter();
  const isLosslessFormat = outputFormat === 'png';

  useEffect(() => {
    if (!currentPhoto) {
      router.replace('/');
    }
  }, [currentPhoto, router]);

  if (!currentPhoto) {
    return null;
  }

  const selectFormat = async (format: OutputFormat) => {
    await Haptics.selectionAsync();
    setOutputFormat(format);
  };

  const estimatedOutputSizeBytes =
    !isLosslessFormat && supportedOutputFormat
      ? estimateOutputSizeBytes(currentPhoto, supportedOutputFormat, conversionQuality)
      : null;
  const estimatedSizeLabel = estimatedOutputSizeBytes
    ? `Estimated ~${formatBytes(estimatedOutputSizeBytes)}`
    : undefined;

  return (
    <ConverterScreen bottomNav={false}>
      <View style={{ gap: Spacing.four }}>
        <SectionTitle title="Preview" />

        <SurfaceCard padding={Spacing.four} radius={Radii.xl} tone="sky" style={{ gap: Spacing.four }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }}>
            <InfoPill label={`Original ${getSourceFormatLabel(currentPhoto)}`} tone="accent" />
            <InfoPill label={formatBytes(currentPhoto.fileSize)} />
            <InfoPill label={formatDimensions(currentPhoto.width, currentPhoto.height)} tone="sky" />
          </View>

          <View
            style={{
              backgroundColor: theme.surface,
              borderRadius: Radii.xl,
              borderCurve: 'continuous',
              boxShadow: '0 18px 30px rgba(23, 38, 78, 0.05)',
              overflow: 'hidden',
              position: 'relative',
            }}>
            <Image
              source={{ uri: currentPhoto.uri }}
              contentFit="cover"
              style={{
                aspectRatio: currentPhoto.width / currentPhoto.height,
                maxHeight: 288,
                width: '100%',
              }}
            />
            <View
              style={{
                backgroundColor: theme.overlay,
                inset: 0,
                position: 'absolute',
              }}
            />
          </View>
        </SurfaceCard>
      </View>

      <View style={{ gap: Spacing.four }}>
        <SectionTitle title="Output Format" />

        <View style={{ flexDirection: 'row', gap: Spacing.four }}>
          <FormatOptionCard
            active={outputFormat === 'jpeg'}
            description="Most compatible"
            icon={{ android: 'image', ios: 'photo', web: 'photo' } satisfies PlatformIcon}
            label="JPEG"
            onPress={() => void selectFormat('jpeg')}
            tone="peach"
          />
          <FormatOptionCard
            active={outputFormat === 'png'}
            description="Lossless quality"
            icon={{
              android: 'description',
              ios: 'doc.richtext',
              web: 'doc.richtext',
            } satisfies PlatformIcon}
            label="PNG"
            onPress={() => void selectFormat('png')}
            tone="sky"
          />
        </View>

        <View style={{ flexDirection: 'row', gap: Spacing.four }}>
          <FormatOptionCard
            active={outputFormat === 'webp'}
            description="Smaller web export"
            icon={{ android: 'public', ios: 'sparkles', web: 'sparkles' } satisfies PlatformIcon}
            label="WebP"
            onPress={() => void selectFormat('webp')}
            tone="mint"
          />
          <FormatOptionCard
            active={outputFormat === 'heic'}
            description={heicEncodingAvailable ? 'High efficiency' : 'Requires custom build'}
            disabled={!heicEncodingAvailable}
            icon={{ android: 'camera_alt', ios: 'camera', web: 'camera' } satisfies PlatformIcon}
            label="HEIC"
            onPress={() => void selectFormat('heic')}
            tone="lilac"
          />
        </View>

        {!heicEncodingAvailable ? (
          <SurfaceCard padding={Spacing.four} radius={Radii.lg} tone="lilac" style={{ gap: 6 }}>
            <Text
              style={{
                color: theme.text,
                fontFamily: Fonts.sans,
                fontSize: Type.bodySmall.fontSize,
                fontWeight: '700',
                lineHeight: Type.bodySmall.lineHeight,
              }}>
              HEIC is build-dependent
            </Text>
            <Text
              style={{
                color: theme.textSecondary,
                fontFamily: Fonts.sans,
                fontSize: Type.caption.fontSize,
                lineHeight: Type.caption.lineHeight,
              }}>
              HEIC export stays disabled in Expo Go and unsupported runtimes. Use a custom iOS build if you want to export in HEIC.
            </Text>
          </SurfaceCard>
        ) : null}
      </View>

      <View style={{ gap: Spacing.four }}>
        <SectionTitle title="Quality" />
        {isLosslessFormat ? (
          <SurfaceCard padding={Spacing.five} radius={Radii.xl} tone="lilac" style={{ gap: 8 }}>
            <Text
              style={{
                color: theme.text,
                fontFamily: Fonts.rounded,
                fontSize: 20,
                fontWeight: '600',
                lineHeight: 26,
              }}>
              PNG stays lossless
            </Text>
            <Text
              style={{
                color: theme.textSecondary,
                fontFamily: Fonts.sans,
                fontSize: Type.bodySmall.fontSize,
                lineHeight: Type.bodySmall.lineHeight,
              }}>
              PNG exports keep full quality, so there’s no slider here. Switch to JPG, WebP, or HEIC if you want to trade file size for compression.
            </Text>
          </SurfaceCard>
        ) : (
          <QualitySlider
            estimatedSizeLabel={estimatedSizeLabel}
            value={conversionQuality}
            onChange={setConversionQuality}
          />
        )}
      </View>

      <PrimaryAction
        icon={{ android: 'bolt', ios: 'bolt.fill', web: 'bolt.fill' } satisfies PlatformIcon}
        label="Convert Now"
        onPress={() => {
          if (!supportedOutputFormat) {
            Alert.alert(
              'HEIC needs a custom build',
              'Use a custom iOS build or choose PNG, JPG, or WebP in this runtime.'
            );
            return;
          }

          router.push('/processing');
        }}
      />
    </ConverterScreen>
  );
}
