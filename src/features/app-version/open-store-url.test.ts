import { Linking } from 'react-native';

import { openStoreUrl } from './open-store-url';

describe('openStoreUrl', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns false for empty url', async () => {
    const openURL = jest.spyOn(Linking, 'openURL');
    await expect(openStoreUrl('  ')).resolves.toBe(false);
    expect(openURL).not.toHaveBeenCalled();
  });

  it('opens the url and returns true', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await expect(openStoreUrl('https://example.com')).resolves.toBe(true);
    expect(openURL).toHaveBeenCalledWith('https://example.com');
  });

  it('returns false when opening fails', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('cannot open'));
    await expect(openStoreUrl('https://example.com')).resolves.toBe(false);
  });
});
