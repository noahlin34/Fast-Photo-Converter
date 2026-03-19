import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

type HeicEncodeResult = {
  height: number;
  sizeBytes: number;
  uri: string;
  width: number;
};

type HeicEncoderNativeModule = {
  encodeHeicAsync(sourceUri: string, quality: number): Promise<HeicEncodeResult>;
  isHeicEncodingAvailable(): boolean;
};

const nativeModule =
  Platform.OS === 'ios'
    ? requireOptionalNativeModule<HeicEncoderNativeModule>('ExpoHeicEncoder')
    : null;

export function isHeicEncodingAvailable() {
  return Platform.OS === 'ios' && nativeModule?.isHeicEncodingAvailable() === true;
}

export async function encodeHeicAsync({
  quality,
  sourceUri,
}: {
  quality: number;
  sourceUri: string;
}) {
  if (!nativeModule || !isHeicEncodingAvailable()) {
    throw new Error('HEIC encoding is not available in this runtime');
  }

  const normalizedQuality = Math.min(Math.max(quality / 100, 0.5), 1);

  return nativeModule.encodeHeicAsync(sourceUri, normalizedQuality);
}
