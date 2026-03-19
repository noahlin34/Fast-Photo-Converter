import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import {
  AppSymbol,
  ConverterScreen,
  EmptyStateCard,
  FormatBadge,
  InfoPill,
  PrimaryAction,
  SurfaceCard,
} from '@/components/converter/shared';
import { Fonts, Radii, Spacing, Type } from '@/constants/theme';
import {
  formatDimensions,
  formatHistoryDateLabel,
  type HistoryItem,
} from '@/features/converter/converter-utils';
import { useConverterSettings } from '@/features/converter/converter-settings';
import { useConverter } from '@/features/converter/converter-context';
import { useTheme } from '@/hooks/use-theme';

export function HistoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { keepHistoryEnabled } = useConverterSettings();
  const { history } = useConverter();

  return (
    <ConverterScreen>
      <View style={{ gap: Spacing.three }}>
        <Text
          style={{
            color: theme.textSecondary,
            fontFamily: Fonts.sans,
            fontSize: Type.body.fontSize,
            lineHeight: Type.body.lineHeight,
          }}>
          {!keepHistoryEnabled
            ? 'Archive is off right now, so future conversions won’t be stored here.'
            : history.length
              ? 'Revisit your converted photos, save them again, or start another conversion from any archived export.'
              : 'Your saved conversions will appear here once you export your first photo.'}
        </Text>

        {keepHistoryEnabled && history.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }}>
            <InfoPill
              label={`${history.length} archived ${history.length === 1 ? 'photo' : 'photos'}`}
              tone="accent"
            />
          </View>
        ) : null}
      </View>

      {!keepHistoryEnabled ? (
        <EmptyStateCard
          action={
            <PrimaryAction
              icon={{ android: 'settings', ios: 'gearshape', web: 'gearshape' }}
              label="Open Settings"
              onPress={() => router.replace('/settings')}
            />
          }
          description="Turn it back on in Settings if you want the app to keep your converted photos here."
          icon={{ android: 'settings', ios: 'gearshape', web: 'gearshape' }}
          title="History archive is turned off"
          tone="muted"
        />
      ) : history.length ? (
        <View style={{ gap: Spacing.four, paddingBottom: Spacing.seven }}>
          {history.map((item) => (
            <HistoryArchiveCard
              key={item.id}
              item={item}
              onPress={() =>
                router.push({
                  params: { id: item.id },
                  pathname: '/history/[id]',
                })
              }
            />
          ))}
        </View>
      ) : (
        <EmptyStateCard
          action={
            <PrimaryAction
              icon={{ android: 'add', ios: 'plus', web: 'plus' }}
              label="Convert a Photo"
              onPress={() => router.replace('/')}
            />
          }
          description="Convert a photo once and we’ll keep it here so it’s easy to revisit, share, or save again."
          icon={{
            android: 'history',
            ios: 'clock.arrow.circlepath',
            web: 'clock.arrow.circlepath',
          }}
          title="No converted photos yet"
        />
      )}
    </ConverterScreen>
  );
}

function HistoryArchiveCard({
  item,
  onPress,
}: {
  item: HistoryItem;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}>
      <SurfaceCard padding={14} radius={Radii.xl} style={{ gap: Spacing.four }}>
        <View style={{ flexDirection: 'row', gap: Spacing.four }}>
          <Image
            source={{ uri: item.thumbnailUri }}
            contentFit="cover"
            style={{
              borderRadius: Radii.md,
              height: 92,
              width: 92,
            }}
          />

          <View style={{ flex: 1, gap: 10, justifyContent: 'space-between' }}>
            <View style={{ gap: 8 }}>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <InfoPill label={formatHistoryDateLabel(item.createdAt)} />
                <FormatBadge format={item.outputFormat} />
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

              <Text
                numberOfLines={1}
                style={{
                  color: theme.textSecondary,
                  fontFamily: Fonts.sans,
                  fontSize: Type.bodySmall.fontSize,
                  lineHeight: Type.bodySmall.lineHeight,
                }}>
                {item.sizeText} • {formatDimensions(item.width, item.height)}
              </Text>
            </View>

            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                gap: Spacing.two,
                justifyContent: 'space-between',
              }}>
              <Text
                numberOfLines={1}
                style={{
                  color: theme.textTertiary,
                  flex: 1,
                  fontFamily: Fonts.sans,
                  fontSize: Type.caption.fontSize,
                  fontWeight: '700',
                  lineHeight: Type.caption.lineHeight,
                }}>
                {item.sourceName ? `From ${item.sourceName}` : item.subtitle ?? 'Saved on device'}
              </Text>
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
          </View>
        </View>
      </SurfaceCard>
    </Pressable>
  );
}
