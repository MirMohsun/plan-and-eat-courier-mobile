import { getItem, setItem } from '@/lib/storage';

import {
  getCachedVersionPolicy,
  getDismissedLatestVersion,
  saveCachedVersionPolicy,
  saveDismissedLatestVersion,
  SOFT_DISMISS_STORAGE_KEY,
  VERSION_POLICY_STORAGE_KEY,
} from './version-policy-storage';

jest.mock('@/lib/storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const getItemMock = jest.mocked(getItem);
const setItemMock = jest.mocked(setItem);

describe('version-policy-storage', () => {
  beforeEach(() => {
    getItemMock.mockReset();
    setItemMock.mockReset();
    setItemMock.mockResolvedValue(true);
  });

  it('returns parsed cached policy', () => {
    getItemMock.mockReturnValue({
      minSupportedVersion: '1.0.0',
      latestVersion: '1.0.1',
      storeUrl: 'https://store.example',
      appDisabled: false,
    });

    expect(getCachedVersionPolicy()).toEqual({
      minSupportedVersion: '1.0.0',
      latestVersion: '1.0.1',
      storeUrl: 'https://store.example',
      appDisabled: false,
    });
    expect(getItemMock).toHaveBeenCalledWith(VERSION_POLICY_STORAGE_KEY);
  });

  it('returns null when cache is empty', () => {
    getItemMock.mockReturnValue(null);
    expect(getCachedVersionPolicy()).toBeNull();
  });

  it('persists policy and dismissed latest version', async () => {
    const policy = {
      minSupportedVersion: '1.0.0',
      latestVersion: '1.0.1',
      storeUrl: 'https://store.example',
      appDisabled: false,
    };

    await saveCachedVersionPolicy(policy);
    await saveDismissedLatestVersion('1.0.1');

    expect(setItemMock).toHaveBeenCalledWith(VERSION_POLICY_STORAGE_KEY, policy);
    expect(setItemMock).toHaveBeenCalledWith(SOFT_DISMISS_STORAGE_KEY, '1.0.1');
  });

  it('returns null for blank dismissed version', () => {
    getItemMock.mockReturnValue('  ');
    expect(getDismissedLatestVersion()).toBeNull();
  });
});
