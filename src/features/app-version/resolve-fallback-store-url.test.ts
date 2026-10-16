import { resolveFallbackStoreUrl } from './resolve-fallback-store-url';

describe('resolveFallbackStoreUrl', () => {
  it('returns Play Store url for android', () => {
    expect(
      resolveFallbackStoreUrl({
        platform: 'android',
        androidPackage: 'com.planandeat.customer',
        iosAppStoreId: '1234567890',
      }),
    ).toBe('https://play.google.com/store/apps/details?id=com.planandeat.customer');
  });

  it('returns App Store url for ios when id is present', () => {
    expect(
      resolveFallbackStoreUrl({
        platform: 'ios',
        androidPackage: 'com.planandeat.customer',
        iosAppStoreId: '1234567890',
      }),
    ).toBe('https://apps.apple.com/app/id1234567890');
  });

  it('returns empty string for ios when id is missing', () => {
    expect(
      resolveFallbackStoreUrl({
        platform: 'ios',
        androidPackage: 'com.planandeat.customer',
        iosAppStoreId: undefined,
      }),
    ).toBe('');
  });
});
