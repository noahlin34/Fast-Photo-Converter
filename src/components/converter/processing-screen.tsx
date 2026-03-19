import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import {
  AppSymbol,
  ConverterScreen,
  FormatBadge,
  ProgressBar,
  SurfaceCard,
} from '@/components/converter/shared';
import { Fonts, Radii, Spacing, Type } from '@/constants/theme';
import { delay, getDisplayFormatLabel } from '@/features/converter/converter-utils';
import { useConverter } from '@/features/converter/converter-context';
import { useTheme } from '@/hooks/use-theme';

export function ProcessingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { completeConversion, currentPhoto, supportedOutputFormat } = useConverter();
  const [progress, setProgress] = useState(0.62);

  useEffect(() => {
    let isActive = true;
    let timer: ReturnType<typeof setInterval> | undefined;

    const runConversion = async () => {
      if (!currentPhoto || !supportedOutputFormat) {
        router.replace('/');
        return;
      }

      let nextProgress = 0.62;
      setProgress(nextProgress);

      timer = setInterval(() => {
        nextProgress = Math.min(nextProgress + 0.035, 0.92);

        if (isActive) {
          setProgress(nextProgress);
        }
      }, 140);

      try {
        await Promise.all([completeConversion(), delay(1100)]);

        if (timer) {
          clearInterval(timer);
        }

        if (!isActive) {
          return;
        }

        setProgress(1);
        await delay(220);

        if (isActive) {
          router.replace('/done');
        }
      } catch {
        if (timer) {
          clearInterval(timer);
        }

        if (isActive) {
          router.replace('/format');
        }
      }
    };

    void runConversion();

    return () => {
      isActive = false;

      if (timer) {
        clearInterval(timer);
      }
    };
  }, [completeConversion, currentPhoto, router, supportedOutputFormat]);

  const progressLabel = Math.round(progress * 100);

  return (
    <ConverterScreen backgroundMode="minimal" bottomNav={false} scrollable={false} verticalAlign="center">
      <View style={{ alignItems: 'center', gap: Spacing.four }}>
        {supportedOutputFormat ? <FormatBadge format={supportedOutputFormat} /> : null}

        <View
          style={{
            alignItems: 'center',
            backgroundColor: theme.surfaceAccent,
            borderRadius: Radii.pill,
            boxShadow: '0 18px 34px rgba(15, 143, 131, 0.14)',
            height: 88,
            justifyContent: 'center',
            width: 88,
          }}>
          <AppSymbol
            icon={{ android: 'bolt', ios: 'sparkles', web: 'sparkles' }}
            size={34}
            tintColor={theme.accentStrong}
            weight="medium"
          />
        </View>

        <View style={{ alignItems: 'center', gap: 10 }}>
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
            Preparing your export
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              fontFamily: Fonts.sans,
              fontSize: Type.body.fontSize,
              lineHeight: Type.body.lineHeight,
              textAlign: 'center',
            }}>
            {supportedOutputFormat
              ? `Converting your image to ${getDisplayFormatLabel(supportedOutputFormat)} with your selected settings.`
              : 'Optimizing your image with your selected settings.'}
          </Text>
        </View>
      </View>

      <SurfaceCard padding={Spacing.six} radius={Radii.xl} tone="raised" style={{ gap: Spacing.five }}>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
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
            Processing
          </Text>
          <Text
            style={{
              color: theme.accentStrong,
              fontFamily: Fonts.sans,
              fontSize: 22,
              fontVariant: ['tabular-nums'],
              fontWeight: '800',
              lineHeight: 24,
            }}>
            {progressLabel}%
          </Text>
        </View>

        <ProgressBar progress={progress} />

        <Text
          style={{
            color: theme.textTertiary,
            fontFamily: Fonts.sans,
            fontSize: Type.caption.fontSize,
            lineHeight: Type.caption.lineHeight,
          }}>
          This usually only takes a moment.
        </Text>
      </SurfaceCard>
    </ConverterScreen>
  );
}
