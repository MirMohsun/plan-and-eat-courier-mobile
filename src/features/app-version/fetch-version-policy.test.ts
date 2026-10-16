/* eslint-disable import/first -- jest.mock must precede the module-under-test import */
const mockSetConfigSettings = jest.fn(async () => undefined);
const mockSetDefaults = jest.fn(async () => null);
const mockFetchAndActivate = jest.fn();
const mockGetValue = jest.fn();
const mockGetRemoteConfig = jest.fn(() => ({
  settings: {},
  defaultConfig: {},
  setConfigSettings: mockSetConfigSettings,
  setDefaults: mockSetDefaults,
}));

jest.mock('@react-native-firebase/remote-config', () => ({
  getRemoteConfig: () => mockGetRemoteConfig(),
  fetchAndActivate: (...args: unknown[]) => mockFetchAndActivate(...args),
  getValue: (...args: unknown[]) => mockGetValue(...args),
}));

import { Platform } from 'react-native';

import {
  fetchVersionPolicyFromRemote,
  REMOTE_CONFIG_FETCH_TIME_MS,
  REMOTE_CONFIG_FETCH_TIMEOUT_MS,
} from './fetch-version-policy';
import { DEFAULT_VERSION_POLICY } from './version-policy';

describe('fetchVersionPolicyFromRemote', () => {
  const originalOs = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalOs });
    mockFetchAndActivate.mockReset();
    mockGetValue.mockReset();
    mockGetRemoteConfig.mockClear();
    mockSetConfigSettings.mockClear();
    mockSetDefaults.mockClear();
  });

  it('returns fail-open defaults on web', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'web' });

    await expect(fetchVersionPolicyFromRemote()).resolves.toEqual(DEFAULT_VERSION_POLICY);
    expect(mockGetRemoteConfig).not.toHaveBeenCalled();
  });

  it('maps remote config values on ios after setConfigSettings and setDefaults', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    const remoteConfig = {
      settings: {},
      defaultConfig: {},
      setConfigSettings: mockSetConfigSettings,
      setDefaults: mockSetDefaults,
    };
    mockGetRemoteConfig.mockReturnValue(remoteConfig);
    mockFetchAndActivate.mockResolvedValue(true);
    mockGetValue.mockImplementation((_config: unknown, key: string) => ({
      asString: () => {
        if (key === 'min_supported_version')
          return '1.0.0';
        if (key === 'latest_version')
          return '1.0.1';
        if (key === 'store_url')
          return 'https://apps.apple.com/app/id1';
        return '';
      },
      asBoolean: () => false,
      getSource: () => 'remote',
    }));

    await expect(fetchVersionPolicyFromRemote()).resolves.toEqual({
      minSupportedVersion: '1.0.0',
      latestVersion: '1.0.1',
      storeUrl: 'https://apps.apple.com/app/id1',
      appDisabled: false,
    });

    expect(mockSetConfigSettings).toHaveBeenCalledWith({
      minimumFetchIntervalMillis: expect.any(Number),
      fetchTimeMillis: REMOTE_CONFIG_FETCH_TIME_MS,
    });
    expect(mockSetDefaults).toHaveBeenCalledWith({
      min_supported_version: '0.0.0',
      latest_version: '0.0.0',
      store_url: '',
      app_disabled: false,
    });
    expect(mockSetConfigSettings.mock.invocationCallOrder[0])
      .toBeLessThan(mockFetchAndActivate.mock.invocationCallOrder[0]);
    expect(mockSetDefaults.mock.invocationCallOrder[0])
      .toBeLessThan(mockFetchAndActivate.mock.invocationCallOrder[0]);
    expect(mockFetchAndActivate).toHaveBeenCalledWith(remoteConfig);
  });

  it('rejects on timeout', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    mockGetRemoteConfig.mockReturnValue({
      settings: {},
      defaultConfig: {},
      setConfigSettings: mockSetConfigSettings,
      setDefaults: mockSetDefaults,
    });
    mockFetchAndActivate.mockImplementation(
      () => new Promise(() => {}),
    );

    jest.useFakeTimers();
    try {
      const promise = fetchVersionPolicyFromRemote();
      const expectation = expect(promise).rejects.toThrow('remote-config-timeout');
      await jest.advanceTimersByTimeAsync(REMOTE_CONFIG_FETCH_TIMEOUT_MS);
      await expectation;
    }
    finally {
      jest.useRealTimers();
    }
  });
});
