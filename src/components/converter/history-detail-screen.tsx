import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import {
  AppSymbol,
  CardDivider,
  ConverterScreen,
  FormatBadge,
  InfoPill,
  PrimaryAction,
  SecondaryAction,
  SurfaceCard,
} from '@/components/converter/shared';
import { Fonts, Radii, Spacing, Type } from '@/constants/theme';
import {
  formatDimensions,
  formatHistoryDateTime,
  getDisplayFormatLabel,
} from '@/features/converter/converter-utils';
import { useConverter } from '@/features/converter/converter-context';
import { useExportActions } from '@/features/converter/use-export-actions';
import { useTheme } from '@/hooks/use-theme';

export function HistoryDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { deleteHistoryItem, getHistoryItem, startConversionFromHistory } = useConverter();
  const item = id ? getHistoryItem(id) : null;
  const { saveToPhotos, shareExport } = useExportActions(item?.uri ?? null);

  useEffect(() => {
    if (!item) {
      router.replace('/history');
    }
  }, [item, router]);

  if (!item) {
    return null;
  }

  const handleConvertAgain = () => {
    const nextItem = startConversionFromHistory(item.id);

    if (!nextItem) {
      router.replace('/history');
      return;
    }

    router.push('/format');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete from history?',
      'This removes the saved file from the app archive. Photos saved to your library will stay there.',
      [
        {
          style: 'cancel',
          text: 'Cancel',
        },
        {
          style: 'destructive',
          text: 'Delete',
          onPress: () => {
            const didDelete = deleteHistoryItem(item.id);

            if (didDelete) {
              router.replace('/history');
            }
          },
        },
      ]
    );
  };

  return (
    <ConverterScreen bottomNav={false}>
      <SurfaceCard padding={Spacing.four} radius={Radii.xl} tone="raised" style={{ gap: Spacing.four }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }}>
          <FormatBadge format={item.outputFormat} />
          <InfoPill label={item.sizeText} />
          <InfoPill label={formatDimensions(item.width, item.height)} />
        </View>

        <Text
          numberOfLines={2}
          selectable
          style={{
            color: theme.text,
            fontFamily: Fonts.rounded,
            fontSize: 24,
            fontWeight: '600',
            lineHeight: 30,
          }}>
          {item.name}
        </Text>

        <View
          style={{
            alignItems: 'center',
            backgroundColor: theme.surfaceMuted,
            borderRadius: Radii.xl,
            borderCurve: 'continuous',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: Spacing.five,
          }}>
          <Image
            source={{ uri: item.uri }}
            contentFit="contain"
            style={{
              aspectRatio: item.width / item.height,
              borderRadius: Radii.lg,
              maxHeight: 320,
              width: '100%',
            }}
          />
        </View>
      </SurfaceCard>

      <SurfaceCard padding={Spacing.five} radius={Radii.xl} style={{ gap: Spacing.four }}>
        <DetailRow label="Format" value={getDisplayFormatLabel(item.outputFormat)} />
        <CardDivider />
        <DetailRow label="File Size" value={item.sizeText} />
        <CardDivider />
        <DetailRow label="Dimensions" value={formatDimensions(item.width, item.height)} />
        <CardDivider />
        <DetailRow label="Saved" value={formatHistoryDateTime(item.createdAt)} />
        {item.sourceName ? (
          <>
            <CardDivider />
            <DetailRow label="Source" value={item.sourceName} />
          </>
        ) : null}
      </SurfaceCard>

      <View style={{ gap: Spacing.four }}>
        <PrimaryAction
          icon={{
            android: 'download',
            ios: 'square.and.arrow.down',
            web: 'square.and.arrow.down',
          }}
          label="Save to Photos"
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
              label="Convert Again"
              onPress={handleConvertAgain}
            />
          </View>
        </View>

        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => ({
            opacity: pressed ? 0.78 : 1,
          })}>
          <SurfaceCard
            padding={Spacing.four}
            radius={Radii.lg}
            tone="danger"
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: Spacing.three,
              justifyContent: 'center',
            }}>
            <AppSymbol
              icon={{ android: 'delete', ios: 'trash', web: 'trash' }}
              size={16}
              tintColor={theme.destructive}
              weight="semibold"
            />
            <Text
              style={{
                color: theme.destructive,
                fontFamily: Fonts.sans,
                fontSize: Type.bodySmall.fontSize,
                fontWeight: '700',
                lineHeight: Type.bodySmall.lineHeight,
              }}>
              Delete from History
            </Text>
          </SurfaceCard>
        </Pressable>
      </View>
    </ConverterScreen>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        gap: Spacing.four,
        justifyContent: 'space-between',
      }}>
      <Text
        style={{
          color: theme.textSecondary,
          fontFamily: Fonts.sans,
          fontSize: Type.bodySmall.fontSize,
          fontWeight: '700',
          lineHeight: Type.bodySmall.lineHeight,
        }}>
        {label}
      </Text>
      <Text
        selectable
        style={{
          color: theme.text,
          flex: 1,
          fontFamily: Fonts.sans,
          fontSize: Type.body.fontSize,
          fontWeight: '600',
          lineHeight: Type.body.lineHeight,
          textAlign: 'right',
        }}>
        {value}
      </Text>
    </View>
  );
}
