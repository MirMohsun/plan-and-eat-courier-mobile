type FallbackStoreUrlInput = {
  platform: 'ios' | 'android' | string;
  androidPackage: string;
  iosAppStoreId?: string;
};

export function resolveFallbackStoreUrl({
  platform,
  androidPackage,
  iosAppStoreId,
}: FallbackStoreUrlInput): string {
  if (platform === 'android') {
    return `https://play.google.com/store/apps/details?id=${androidPackage}`;
  }

  if (platform === 'ios') {
    const storeId = iosAppStoreId?.trim() ?? '';
    if (storeId.length === 0) {
      return '';
    }
    return `https://apps.apple.com/app/id${storeId}`;
  }

  return '';
}
