import type { ImagePickerAsset } from 'expo-image-picker';

export type OutputFormat = 'jpeg' | 'png' | 'webp' | 'heic';
export type ManipulatorOutputFormat = Exclude<OutputFormat, 'heic'>;

export const OUTPUT_FORMATS: OutputFormat[] = ['jpeg', 'png', 'webp', 'heic'];

export const FORMAT_EXTENSIONS: Record<OutputFormat, string> = {
  heic: 'heic',
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
};

export const FORMAT_LABELS: Record<OutputFormat, string> = {
  heic: 'HEIC',
  jpeg: 'JPEG',
  png: 'PNG',
  webp: 'WebP',
};

export type SelectedPhoto = {
  fileName?: string | null;
  fileSize?: number;
  height: number;
  mimeType?: string | null;
  uri: string;
  width: number;
};

export type HistoryItem = {
  createdAt: number;
  height: number;
  id: string;
  name: string;
  outputFormat: OutputFormat;
  sizeText: string;
  sizeBytes: number;
  sourceName?: string;
  subtitle?: string;
  thumbnailUri: string;
  uri: string;
  width: number;
};

export type ConvertedExport = HistoryItem & {
  source: SelectedPhoto;
};

export function createSelectedPhoto(asset: ImagePickerAsset): SelectedPhoto {
  return {
    fileName: asset.fileName,
    fileSize: asset.fileSize,
    height: asset.height,
    mimeType: asset.mimeType,
    uri: asset.uri,
    width: asset.width,
  };
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatBytes(bytes?: number) {
  if (bytes == null || Number.isNaN(bytes)) {
    return 'Unknown size';
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDimensions(width: number, height: number) {
  return `${width} × ${height}`;
}

export function estimateOutputSizeBytes(
  photo: SelectedPhoto,
  format: OutputFormat,
  quality: number
) {
  if (format === 'png' || format === 'heic') {
    return null;
  }

  const baselineSizeBytes = getBaselineSizeBytes(photo);
  const sourceFormat = getSourceFormatKey(photo);
  const normalizedQuality = clamp((quality - 50) / 50, 0, 1);
  const multiplier = getEstimatedOutputMultiplier(
    format,
    sourceFormat,
    normalizedQuality
  );

  return Math.max(Math.round(baselineSizeBytes * multiplier), 1024);
}

export function createExportFileName(
  photo: SelectedPhoto,
  format: OutputFormat
) {
  const baseName = photo.fileName
    ?.replace(/\.[^/.]+$/, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-_]/g, '');

  return `${baseName || 'converted-image'}-converted.${FORMAT_EXTENSIONS[format]}`;
}

export function createHistorySubtitle(
  format: OutputFormat,
  sizeText: string
) {
  return `Converted to ${getDisplayFormatLabel(format)} • ${sizeText}`;
}

export function getCompression(quality: number, format: OutputFormat) {
  if (format === 'png') {
    return 1;
  }

  if (format === 'webp') {
    const normalizedQuality = clamp((quality - 50) / 50, 0, 1);
    return interpolate(0.3, 0.9, normalizedQuality);
  }

  return clamp(quality / 100, 0.5, 1);
}

export function getSourceFormatLabel(photo: SelectedPhoto | null) {
  if (!photo) {
    return 'HEIC';
  }

  const mime = photo.mimeType?.replace('image/', '').toUpperCase();

  if (mime) {
    return mime === 'JPEG' ? 'JPG' : mime;
  }

  const extension = photo.fileName?.split('.').pop()?.toUpperCase();
  return extension === 'JPEG' ? 'JPG' : extension || 'HEIC';
}

export function getDisplayFormatLabel(format: OutputFormat) {
  const label = FORMAT_LABELS[format];
  return label === 'JPEG' ? 'JPG' : label;
}

export function getOutputMimeType(format: OutputFormat) {
  switch (format) {
    case 'heic':
      return 'image/heic';
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
  }
}

export function getOutputUti(format: OutputFormat) {
  switch (format) {
    case 'heic':
      return 'public.heic';
    case 'jpeg':
      return 'public.jpeg';
    case 'png':
      return 'public.png';
    case 'webp':
      return 'org.webmproject.webp';
  }
}

export function createSelectedPhotoFromHistory(item: HistoryItem): SelectedPhoto {
  return {
    fileName: item.name,
    fileSize: item.sizeBytes,
    height: item.height,
    mimeType: getOutputMimeType(item.outputFormat),
    uri: item.uri,
    width: item.width,
  };
}

export function formatHistoryDateLabel(createdAt: number) {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameCalendarDay(createdDate, now)) {
    return 'Today';
  }

  if (isSameCalendarDay(createdDate, yesterday)) {
    return 'Yesterday';
  }

  if (createdDate.getFullYear() === now.getFullYear()) {
    return new Intl.DateTimeFormat(undefined, {
      day: 'numeric',
      month: 'short',
    }).format(createdDate);
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(createdDate);
}

export function formatHistoryDateTime(createdAt: number) {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(createdAt));
}

export function getOutputSaveFormat(format: OutputFormat) {
  switch (format) {
    case 'heic':
      return 'heic';
    case 'jpeg':
      return 'jpeg';
    case 'png':
      return 'png';
    case 'webp':
      return 'webp';
  }
}

type SourceFormatKey = OutputFormat | 'unknown';

function getSourceFormatKey(photo: SelectedPhoto): SourceFormatKey {
  const mimeType = photo.mimeType?.toLowerCase();

  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    return 'jpeg';
  }

  if (mimeType === 'image/png') {
    return 'png';
  }

  if (mimeType === 'image/webp') {
    return 'webp';
  }

  if (mimeType === 'image/heic' || mimeType === 'image/heif') {
    return 'heic';
  }

  const extension = photo.fileName?.split('.').pop()?.toLowerCase();

  if (extension === 'jpg' || extension === 'jpeg') {
    return 'jpeg';
  }

  if (extension === 'png') {
    return 'png';
  }

  if (extension === 'webp') {
    return 'webp';
  }

  if (extension === 'heic' || extension === 'heif') {
    return 'heic';
  }

  return 'unknown';
}

function getBaselineSizeBytes(photo: SelectedPhoto) {
  if (
    typeof photo.fileSize === 'number' &&
    Number.isFinite(photo.fileSize) &&
    photo.fileSize > 0
  ) {
    return photo.fileSize;
  }

  const pixels = Math.max(photo.width * photo.height, 1);

  switch (getSourceFormatKey(photo)) {
    case 'jpeg':
      return Math.round(pixels * 0.42);
    case 'webp':
      return Math.round(pixels * 0.32);
    case 'png':
      return Math.round(pixels * 1.45);
    case 'heic':
      return Math.round(pixels * 0.28);
    case 'unknown':
      return Math.round(pixels * 0.55);
  }
}

function getEstimatedOutputMultiplier(
  targetFormat: OutputFormat,
  sourceFormat: SourceFormatKey,
  normalizedQuality: number
) {
  if (targetFormat === 'jpeg') {
    switch (sourceFormat) {
      case 'jpeg':
        return interpolate(0.6, 1, normalizedQuality);
      case 'webp':
        return interpolate(0.75, 1.15, normalizedQuality);
      case 'png':
      case 'heic':
      case 'unknown':
        return interpolate(0.18, 0.55, normalizedQuality);
    }
  }

  switch (sourceFormat) {
    case 'jpeg':
      return interpolate(0.4, 0.85, normalizedQuality);
    case 'webp':
      return interpolate(0.7, 1, normalizedQuality);
    case 'png':
    case 'heic':
    case 'unknown':
      return interpolate(0.14, 0.4, normalizedQuality);
  }
}

function interpolate(min: number, max: number, progress: number) {
  return min + (max - min) * progress;
}

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getDate() === right.getDate() &&
    left.getMonth() === right.getMonth() &&
    left.getFullYear() === right.getFullYear()
  );
}
