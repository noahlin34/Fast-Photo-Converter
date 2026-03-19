import { File } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import React, { createContext, useMemo, useState } from 'react';

import {
  type ConvertedExport,
  type HistoryItem,
  type ManipulatorOutputFormat,
  type OutputFormat,
  type SelectedPhoto,
  createSelectedPhotoFromHistory,
  createExportFileName,
  createHistorySubtitle,
  formatBytes,
  getCompression,
} from '@/features/converter/converter-utils';
import {
  clearStoredHistory,
  deleteHistoryAssets,
  persistManagedExport,
  readStoredHistory,
  writeStoredHistory,
} from '@/features/converter/converter-history-storage';
import { encodeHeicAsync } from '@/features/converter/heic-encoder';
import { useConverterSettings } from '@/features/converter/converter-settings';

type ConverterContextValue = {
  clearHistory: () => void;
  completeConversion: () => Promise<ConvertedExport>;
  conversionQuality: number;
  currentExport: ConvertedExport | null;
  currentPhoto: SelectedPhoto | null;
  deleteHistoryItem: (id: string) => boolean;
  getHistoryItem: (id: string) => HistoryItem | null;
  history: HistoryItem[];
  heicEncodingAvailable: boolean;
  resetForAnother: () => void;
  setConversionQuality: (value: number) => void;
  setCurrentPhoto: (photo: SelectedPhoto | null) => void;
  setOutputFormat: (format: OutputFormat) => void;
  startConversionFromHistory: (id: string) => HistoryItem | null;
  supportedOutputFormat: OutputFormat | null;
  outputFormat: OutputFormat;
};

const ConverterContext = createContext<ConverterContextValue | null>(null);

function toSaveFormat(format: ManipulatorOutputFormat) {
  switch (format) {
    case 'jpeg':
      return SaveFormat.JPEG;
    case 'png':
      return SaveFormat.PNG;
    case 'webp':
      return SaveFormat.WEBP;
  }
}

export function ConverterProvider({ children }: { children: React.ReactNode }) {
  const {
    defaultOutputFormat,
    defaultQuality,
    heicEncodingAvailable,
    keepHistoryEnabled,
  } = useConverterSettings();
  const [currentPhoto, setCurrentPhoto] = useState<SelectedPhoto | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(defaultOutputFormat);
  const [conversionQuality, setConversionQuality] = useState(defaultQuality);
  const [currentExport, setCurrentExport] = useState<ConvertedExport | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => readStoredHistory());

  const supportedOutputFormat =
    outputFormat === 'heic' && !heicEncodingAvailable ? null : outputFormat;

  const updateHistory = React.useCallback((updater: (items: HistoryItem[]) => HistoryItem[]) => {
    setHistory((items) => writeStoredHistory(updater(items)));
  }, []);

  const completeConversion = React.useCallback(async () => {
    if (!currentPhoto || !supportedOutputFormat) {
      throw new Error('Conversion is not ready');
    }

    const nextExportId = `export-${Date.now()}`;
    const createdAt = Date.now();
    const fileName = createExportFileName(currentPhoto, supportedOutputFormat);
    const result =
      supportedOutputFormat === 'heic'
        ? await encodeHeicAsync({
            quality: conversionQuality,
            sourceUri: currentPhoto.uri,
          })
        : await manipulateAsync(currentPhoto.uri, [], {
            compress: getCompression(conversionQuality, supportedOutputFormat),
            format: toSaveFormat(supportedOutputFormat),
          });
    const currentSizeBytes =
      ('sizeBytes' in result ? result.sizeBytes : undefined) ||
      new File(result.uri).info().size ||
      currentPhoto.fileSize ||
      0;
    const sizeBytes = currentSizeBytes;
    const sizeText = sizeBytes ? formatBytes(sizeBytes) : 'Unknown size';
    const exportRecord: ConvertedExport = {
      createdAt,
      height: result.height,
      id: nextExportId,
      name: fileName,
      outputFormat: supportedOutputFormat,
      sizeBytes,
      sizeText,
      source: currentPhoto,
      sourceName: currentPhoto.fileName ?? undefined,
      subtitle: createHistorySubtitle(supportedOutputFormat, sizeText),
      thumbnailUri: result.uri,
      uri: result.uri,
      width: result.width,
    };

    setCurrentExport(exportRecord);

    if (keepHistoryEnabled) {
      const managedExport = persistManagedExport({
        fileName,
        id: nextExportId,
        sourceUri: result.uri,
      });
      const historySizeBytes = managedExport.sizeBytes || currentSizeBytes;
      const historySizeText = historySizeBytes ? formatBytes(historySizeBytes) : 'Unknown size';
      const historyItem: HistoryItem = {
        createdAt,
        height: result.height,
        id: nextExportId,
        name: fileName,
        outputFormat: supportedOutputFormat,
        sizeBytes: historySizeBytes,
        sizeText: historySizeText,
        sourceName: currentPhoto.fileName ?? undefined,
        subtitle: createHistorySubtitle(supportedOutputFormat, historySizeText),
        thumbnailUri: managedExport.thumbnailUri,
        uri: managedExport.uri,
        width: result.width,
      };

      updateHistory((items) => [historyItem, ...items]);
    }

    return exportRecord;
  }, [conversionQuality, currentPhoto, keepHistoryEnabled, supportedOutputFormat, updateHistory]);

  const clearHistory = React.useCallback(() => {
    setHistory((items) => clearStoredHistory(items));
  }, []);

  const getHistoryItem = React.useCallback(
    (id: string) => history.find((item) => item.id === id) ?? null,
    [history]
  );

  const deleteHistoryItem = React.useCallback(
    (id: string) => {
      const item = history.find((entry) => entry.id === id);

      if (!item) {
        return false;
      }

      deleteHistoryAssets(item);
      updateHistory((items) => items.filter((entry) => entry.id !== id));

      return true;
    },
    [history, updateHistory]
  );

  const startConversionFromHistory = React.useCallback(
    (id: string) => {
      const item = history.find((entry) => entry.id === id) ?? null;

      if (!item) {
        return null;
      }

      setCurrentExport(null);
      setOutputFormat(defaultOutputFormat);
      setConversionQuality(defaultQuality);
      setCurrentPhoto(createSelectedPhotoFromHistory(item));

      return item;
    },
    [defaultOutputFormat, defaultQuality, history]
  );

  const resetForAnother = React.useCallback(() => {
    setCurrentPhoto(null);
    setCurrentExport(null);
    setOutputFormat(defaultOutputFormat);
    setConversionQuality(defaultQuality);
  }, [defaultOutputFormat, defaultQuality]);

  const value = useMemo<ConverterContextValue>(
    () => ({
      clearHistory,
      completeConversion,
      conversionQuality,
      currentExport,
      currentPhoto,
      deleteHistoryItem,
      getHistoryItem,
      history,
      heicEncodingAvailable,
      outputFormat,
      resetForAnother,
      setConversionQuality,
      setCurrentPhoto,
      setOutputFormat,
      startConversionFromHistory,
      supportedOutputFormat,
    }),
    [
      clearHistory,
      completeConversion,
      conversionQuality,
      currentExport,
      currentPhoto,
      deleteHistoryItem,
      getHistoryItem,
      history,
      heicEncodingAvailable,
      outputFormat,
      resetForAnother,
      startConversionFromHistory,
      supportedOutputFormat,
    ]
  );

  return <ConverterContext.Provider value={value}>{children}</ConverterContext.Provider>;
}

export function useConverter() {
  const value = React.use(ConverterContext);

  if (!value) {
    throw new Error('useConverter must be used within a ConverterProvider');
  }

  return value;
}
