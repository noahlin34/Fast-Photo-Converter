import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import React from 'react';
import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';

import {
  getOutputMimeType,
  getOutputUti,
  type OutputFormat,
} from '@/features/converter/converter-utils';

type ExportTarget = {
  outputFormat: OutputFormat;
  uri: string;
};

export function useExportActions(target: ExportTarget | null) {
  const [hasSavedToPhotos, setHasSavedToPhotos] = React.useState(false);

  React.useEffect(() => {
    setHasSavedToPhotos(false);
  }, [target?.outputFormat, target?.uri]);

  const saveToPhotos = React.useCallback(async () => {
    if (!target?.uri || hasSavedToPhotos) {
      return;
    }

    try {
      const permission = await MediaLibrary.requestPermissionsAsync(true);

      if (!permission.granted) {
        Alert.alert('Photo access needed', 'Allow add-only access so the finished export can be saved to Photos.');
        return;
      }

      if (target.outputFormat === 'webp') {
        await MediaLibrary.createAssetAsync(target.uri);
      } else {
        await MediaLibrary.saveToLibraryAsync(target.uri);
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setHasSavedToPhotos(true);
    } catch {
      Alert.alert(
        target.outputFormat === 'webp' ? 'Could not save WebP image' : 'Could not save image',
        target.outputFormat === 'webp'
          ? 'Try Share if Photos keeps rejecting this WebP export on your device.'
          : 'Please try again.'
      );
    }
  }, [hasSavedToPhotos, target]);

  const shareExport = React.useCallback(async () => {
    if (!target?.uri) {
      return;
    }

    try {
      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        Alert.alert('Sharing unavailable', 'Open this on an iPhone or iOS simulator with sharing support.');
        return;
      }

      await Sharing.shareAsync(target.uri, {
        UTI: getOutputUti(target.outputFormat),
        mimeType: getOutputMimeType(target.outputFormat),
      });
    } catch {
      Alert.alert('Could not share image', 'Please try again.');
    }
  }, [target]);

  return {
    hasSavedToPhotos,
    saveToPhotos,
    shareExport,
  };
}
