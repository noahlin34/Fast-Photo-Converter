import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import React from 'react';
import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';

export function useExportActions(uri: string | null) {
  const saveToPhotos = React.useCallback(async () => {
    if (!uri) {
      return;
    }

    try {
      const permission = await MediaLibrary.requestPermissionsAsync(true);

      if (!permission.granted) {
        Alert.alert('Photo access needed', 'Allow add-only access so the finished export can be saved to Photos.');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(uri);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved', 'Your converted image is now in Photos.');
    } catch {
      Alert.alert('Could not save image', 'Please try again.');
    }
  }, [uri]);

  const shareExport = React.useCallback(async () => {
    if (!uri) {
      return;
    }

    try {
      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        Alert.alert('Sharing unavailable', 'Open this on an iPhone or iOS simulator with sharing support.');
        return;
      }

      await Sharing.shareAsync(uri);
    } catch {
      Alert.alert('Could not share image', 'Please try again.');
    }
  }, [uri]);

  return {
    saveToPhotos,
    shareExport,
  };
}
