import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import {
  AppSymbol,
  ConverterScreen,
  FormatBadge,
  InfoPill,
  PrimaryAction,
  SecondaryAction,
  SurfaceCard,
} from '@/components/converter/shared';
import { Fonts, Radii, Spacing, Type } from '@/constants/theme';
import { formatDimensions } from '@/features/converter/converter-utils';
import { useExportActions } from '@/features/converter/use-export-actions';
import { useConverter } from '@/features/converter/converter-context';
import { useTheme } from '@/hooks/use-theme';

export function ConversionSuccessScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { currentExport, resetForAnother } = useConverter();
  const { hasSavedToPhotos, saveToPhotos, shareExport } = useExportActions(
    currentExport
      ? {
          outputFormat: currentExport.outputFormat,
          uri: currentExport.uri,
        }
      : null
  );

  useEffect(() => {
    if (!currentExport) {
      router.replace('/');
    }
  }, [currentExport, router]);

  if (!currentExport) {
    return null;
  }

  return (
    <ConverterScreen bottomNav={false}>
      <View style={{ alignItems: 'center', gap: Spacing.five }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: theme.surfaceButter,
            borderRadius: Radii.pill,
            boxShadow: '0 18px 30px rgba(23, 38, 78, 0.08)',
            height: 96,
            justifyContent: 'center',
            width: 96,
          }}>
          <AppSymbol
            icon={{
              android: 'check_circle',
              ios: 'checkmark.circle.fill',
              web: 'checkmark.circle.fill',
            }}
            size={42}
            tintColor={theme.accentStrong}
            weight="medium"
          />
        </View>

        <View style={{ alignItems: 'center', gap: Spacing.two }}>
          <Text
            style={{
              color: theme.text,
              fontFamily: Fonts.rounded,
              fontSize: 30,
              fontWeight: '600',
              lineHeight: 36,
              letterSpacing: -0.8,
              textAlign: 'center',
            }}>
            Your export is ready
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              fontFamily: Fonts.sans,
              fontSize: Type.body.fontSize,
              lineHeight: Type.body.lineHeight,
              textAlign: 'center',
            }}>
            Save it to Photos, share it, or jump right into another conversion.
          </Text>
        </View>
      </View>

      <SurfaceCard padding={Spacing.four} radius={Radii.xl} tone="peach" style={{ gap: Spacing.four }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: theme.surface,
            borderRadius: Radii.xl,
            borderCurve: 'continuous',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: Spacing.five,
          }}>
          <Image
            source={{ uri: currentExport.thumbnailUri }}
            contentFit="contain"
            style={{
              aspectRatio: currentExport.width / currentExport.height,
              borderRadius: Radii.lg,
              maxHeight: 280,
              width: '100%',
            }}
          />
        </View>

        <View style={{ gap: Spacing.three }}>
          <View
            style={{
              alignItems: 'flex-start',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: Spacing.two,
              justifyContent: 'space-between',
            }}>
            <FormatBadge format={currentExport.outputFormat} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, justifyContent: 'flex-end' }}>
              <InfoPill label={currentExport.sizeText} />
              <InfoPill label={formatDimensions(currentExport.width, currentExport.height)} />
            </View>
          </View>

          <Text
            numberOfLines={2}
            selectable
            style={{
              color: theme.text,
              fontFamily: Fonts.rounded,
              fontSize: 22,
              fontWeight: '600',
              lineHeight: 28,
            }}>
            {currentExport.name}
          </Text>
        </View>
      </SurfaceCard>

      <View style={{ gap: Spacing.four }}>
        <PrimaryAction
          icon={{
            android: hasSavedToPhotos ? 'check' : 'download',
            ios: hasSavedToPhotos ? 'checkmark' : 'square.and.arrow.down',
            web: hasSavedToPhotos ? 'checkmark' : 'square.and.arrow.down',
          }}
          disabled={hasSavedToPhotos}
          label={hasSavedToPhotos ? 'Saved' : 'Save to Photos'}
          onPress={saveToPhotos}
        />

        <View style={{ flexDirection: 'row', gap: Spacing.four }}>
          <View style={{ flex: 1 }}>
            <SecondaryAction
              icon={{ android: 'share', ios: 'square.and.arrow.up', web: 'square.and.arrow.up' }}
              label="Share"
              onPress={shareExport}
            />
          </View>
          <View style={{ flex: 1 }}>
            <SecondaryAction
              icon={{ android: 'add', ios: 'plus', web: 'plus' }}
              label="New Conversion"
              onPress={() => {
                resetForAnother();
                router.replace('/');
              }}
            />
          </View>
        </View>
      </View>
    </ConverterScreen>
  );
}
