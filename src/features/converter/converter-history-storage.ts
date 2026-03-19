import { Directory, File, Paths } from 'expo-file-system';

import {
  FORMAT_LABELS,
  type HistoryItem,
} from '@/features/converter/converter-utils';

export const CONVERTER_HISTORY_STORAGE_KEY = 'converter.history.v1';
export const CONVERTER_HISTORY_LIMIT = 50;

const HISTORY_EXPORTS_DIRECTORY = new Directory(Paths.document, 'converter-history');

type PersistedExportFile = {
  sizeBytes: number;
  thumbnailUri: string;
  uri: string;
};

export function readStoredHistory() {
  const storage = globalThis.localStorage;

  if (!storage) {
    return [];
  }

  const rawValue = storage.getItem(CONVERTER_HISTORY_STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    const normalizedHistory = normalizeStoredHistory(parsedValue);

    if (normalizedHistory.length) {
      storage.setItem(CONVERTER_HISTORY_STORAGE_KEY, JSON.stringify(normalizedHistory));
    } else {
      storage.removeItem(CONVERTER_HISTORY_STORAGE_KEY);
    }

    return normalizedHistory;
  } catch {
    storage.removeItem(CONVERTER_HISTORY_STORAGE_KEY);
    return [];
  }
}

export function writeStoredHistory(items: HistoryItem[]) {
  const normalizedHistory = normalizeStoredHistory(items);
  const storage = globalThis.localStorage;

  if (!storage) {
    return normalizedHistory;
  }

  if (normalizedHistory.length) {
    storage.setItem(CONVERTER_HISTORY_STORAGE_KEY, JSON.stringify(normalizedHistory));
  } else {
    storage.removeItem(CONVERTER_HISTORY_STORAGE_KEY);
  }

  return normalizedHistory;
}

export function clearStoredHistory(items: HistoryItem[]) {
  items.forEach(deleteHistoryAssets);

  const storage = globalThis.localStorage;

  if (storage) {
    storage.removeItem(CONVERTER_HISTORY_STORAGE_KEY);
  }

  return [];
}

export function persistManagedExport({
  fileName,
  id,
  sourceUri,
}: {
  fileName: string;
  id: string;
  sourceUri: string;
}): PersistedExportFile {
  ensureHistoryDirectory();

  const sourceFile = new File(sourceUri);
  const managedFile = new File(HISTORY_EXPORTS_DIRECTORY, `${id}-${fileName}`);

  if (managedFile.exists) {
    managedFile.delete();
  }

  sourceFile.copy(managedFile);

  const fileInfo = managedFile.info();

  return {
    sizeBytes: fileInfo.size ?? 0,
    thumbnailUri: managedFile.uri,
    uri: managedFile.uri,
  };
}

export function deleteHistoryAssets(item: Pick<HistoryItem, 'thumbnailUri' | 'uri'>) {
  deleteManagedFile(item.uri);

  if (item.thumbnailUri !== item.uri) {
    deleteManagedFile(item.thumbnailUri);
  }
}

function ensureHistoryDirectory() {
  if (!HISTORY_EXPORTS_DIRECTORY.exists) {
    HISTORY_EXPORTS_DIRECTORY.create({
      idempotent: true,
      intermediates: true,
    });
  }
}

function normalizeStoredHistory(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const dedupedItems = Array.from(
    new Map(
      value
        .filter(isHistoryItem)
        .sort((left, right) => right.createdAt - left.createdAt)
        .map((item) => [item.id, item])
    ).values()
  );

  const existingItems = dedupedItems.filter((item) => {
    const exportFile = new File(item.uri);
    const thumbnailFile = new File(item.thumbnailUri);

    return exportFile.exists && thumbnailFile.exists;
  });

  const keptItems = existingItems.slice(0, CONVERTER_HISTORY_LIMIT);
  const trimmedItems = existingItems.slice(CONVERTER_HISTORY_LIMIT);

  trimmedItems.forEach(deleteHistoryAssets);

  return keptItems;
}

function isHistoryItem(value: unknown): value is HistoryItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Partial<HistoryItem>;

  return (
    typeof item.createdAt === 'number' &&
    typeof item.height === 'number' &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.outputFormat === 'string' &&
    item.outputFormat in FORMAT_LABELS &&
    typeof item.sizeBytes === 'number' &&
    typeof item.sizeText === 'string' &&
    typeof item.thumbnailUri === 'string' &&
    typeof item.uri === 'string' &&
    typeof item.width === 'number'
  );
}

function deleteManagedFile(uri: string) {
  try {
    const file = new File(uri);

    if (file.exists) {
      file.delete();
    }
  } catch {
    // Ignore cleanup failures so storage hydration stays resilient.
  }
}
