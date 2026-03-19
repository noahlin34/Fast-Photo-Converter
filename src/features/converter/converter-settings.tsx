import React, { createContext, useMemo, useState } from 'react';

import { isHeicEncodingAvailable } from '@/features/converter/heic-encoder';
import { clamp, type OutputFormat } from '@/features/converter/converter-utils';

export type ConverterSettings = {
  defaultOutputFormat: OutputFormat;
  defaultQuality: number;
  keepHistoryEnabled: boolean;
};

type ConverterSettingsContextValue = ConverterSettings & {
  heicEncodingAvailable: boolean;
  setDefaultOutputFormat: (format: OutputFormat) => void;
  setDefaultQuality: (value: number) => void;
  setKeepHistoryEnabled: (value: boolean) => void;
};

export const CONVERTER_SETTINGS_STORAGE_KEY = 'converter.settings.v1';

const DEFAULT_SETTINGS: ConverterSettings = {
  defaultOutputFormat: 'png',
  defaultQuality: 90,
  keepHistoryEnabled: true,
};

const ConverterSettingsContext = createContext<ConverterSettingsContextValue | null>(null);

export function ConverterSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ConverterSettings>(() => readStoredSettings());
  const heicEncodingAvailable = isHeicEncodingAvailable();

  const persistSettings = React.useCallback(
    (updater: (current: ConverterSettings) => ConverterSettings) => {
      setSettings((current) => {
        const nextSettings = normalizeStoredSettings(updater(current));
        writeStoredSettings(nextSettings);
        return nextSettings;
      });
    },
    []
  );

  const value = useMemo<ConverterSettingsContextValue>(
    () => ({
      ...settings,
      defaultOutputFormat: resolveDefaultOutputFormat(
        settings.defaultOutputFormat,
        heicEncodingAvailable
      ),
      heicEncodingAvailable,
      setDefaultOutputFormat: (format) => {
        persistSettings((current) => ({
          ...current,
          defaultOutputFormat: format,
        }));
      },
      setDefaultQuality: (quality) => {
        persistSettings((current) => ({
          ...current,
          defaultQuality: Math.round(clamp(quality, 50, 100)),
        }));
      },
      setKeepHistoryEnabled: (keepHistoryEnabled) => {
        persistSettings((current) => ({
          ...current,
          keepHistoryEnabled,
        }));
      },
    }),
    [heicEncodingAvailable, persistSettings, settings]
  );

  return <ConverterSettingsContext.Provider value={value}>{children}</ConverterSettingsContext.Provider>;
}

export function useConverterSettings() {
  const value = React.use(ConverterSettingsContext);

  if (!value) {
    throw new Error('useConverterSettings must be used within a ConverterSettingsProvider');
  }

  return value;
}

function readStoredSettings() {
  const storage = globalThis.localStorage;

  if (!storage) {
    return DEFAULT_SETTINGS;
  }

  const rawValue = storage.getItem(CONVERTER_SETTINGS_STORAGE_KEY);

  if (!rawValue) {
    return DEFAULT_SETTINGS;
  }

  try {
    return normalizeStoredSettings(JSON.parse(rawValue));
  } catch {
    storage.removeItem(CONVERTER_SETTINGS_STORAGE_KEY);
    return DEFAULT_SETTINGS;
  }
}

function writeStoredSettings(settings: ConverterSettings) {
  const storage = globalThis.localStorage;

  if (!storage) {
    return;
  }

  storage.setItem(CONVERTER_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

function normalizeStoredSettings(value: unknown): ConverterSettings {
  if (!value || typeof value !== 'object') {
    return DEFAULT_SETTINGS;
  }

  const settings = value as Partial<ConverterSettings>;

  return {
    defaultOutputFormat: isOutputFormat(settings.defaultOutputFormat)
      ? settings.defaultOutputFormat
      : DEFAULT_SETTINGS.defaultOutputFormat,
    defaultQuality:
      typeof settings.defaultQuality === 'number'
        ? Math.round(clamp(settings.defaultQuality, 50, 100))
        : DEFAULT_SETTINGS.defaultQuality,
    keepHistoryEnabled:
      typeof settings.keepHistoryEnabled === 'boolean'
        ? settings.keepHistoryEnabled
        : DEFAULT_SETTINGS.keepHistoryEnabled,
  };
}

function isOutputFormat(value: unknown): value is OutputFormat {
  return value === 'jpeg' || value === 'png' || value === 'webp' || value === 'heic';
}

function resolveDefaultOutputFormat(
  defaultOutputFormat: OutputFormat,
  heicEncodingAvailable: boolean
) {
  if (defaultOutputFormat === 'heic' && !heicEncodingAvailable) {
    return 'png';
  }

  return defaultOutputFormat;
}
