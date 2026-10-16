import { evaluateAppVersionGate } from './evaluate-app-version-gate';
import { DEFAULT_VERSION_POLICY } from './version-policy';

describe('evaluateAppVersionGate', () => {
  it('blocks when fetched min version is above current', async () => {
    const result = await evaluateAppVersionGate({
      getCurrentVersion: () => '1.0.1',
      fetchPolicy: async () => ({
        minSupportedVersion: '1.2.0',
        latestVersion: '1.3.0',
        storeUrl: 'https://store.example',
        appDisabled: false,
      }),
      getCachedPolicy: () => null,
      saveCachedPolicy: async () => {},
      getDismissedLatestVersion: () => null,
    });

    expect(result.status).toBe('force_update');
    expect(result.currentVersion).toBe('1.0.1');
  });

  it('uses cached policy when fetch fails', async () => {
    const result = await evaluateAppVersionGate({
      getCurrentVersion: () => '1.0.1',
      fetchPolicy: async () => {
        throw new Error('offline');
      },
      getCachedPolicy: () => ({
        minSupportedVersion: '1.2.0',
        latestVersion: '1.3.0',
        storeUrl: 'https://cached.example',
        appDisabled: false,
      }),
      saveCachedPolicy: async () => {},
      getDismissedLatestVersion: () => null,
    });

    expect(result.status).toBe('force_update');
    expect(result.policy.storeUrl).toBe('https://cached.example');
  });

  it('fail-opens when fetch fails and cache is empty', async () => {
    const result = await evaluateAppVersionGate({
      getCurrentVersion: () => '1.0.1',
      fetchPolicy: async () => {
        throw new Error('offline');
      },
      getCachedPolicy: () => null,
      saveCachedPolicy: async () => {},
      getDismissedLatestVersion: () => null,
    });

    expect(result.status).toBe('ok');
    expect(result.policy).toEqual(DEFAULT_VERSION_POLICY);
  });

  it('saves fetched policy to cache', async () => {
    const saveCachedPolicy = jest.fn(async () => {});
    const policy = {
      minSupportedVersion: '1.0.0',
      latestVersion: '1.0.1',
      storeUrl: 'https://store.example',
      appDisabled: false,
    };

    await evaluateAppVersionGate({
      getCurrentVersion: () => '1.0.1',
      fetchPolicy: async () => policy,
      getCachedPolicy: () => null,
      saveCachedPolicy,
      getDismissedLatestVersion: () => null,
    });

    expect(saveCachedPolicy).toHaveBeenCalledWith(policy);
  });

  it('suppresses soft prompt after dismissal of the same latest version', async () => {
    const result = await evaluateAppVersionGate({
      getCurrentVersion: () => '1.0.1',
      fetchPolicy: async () => ({
        minSupportedVersion: '1.0.0',
        latestVersion: '1.1.0',
        storeUrl: 'https://store.example',
        appDisabled: false,
      }),
      getCachedPolicy: () => null,
      saveCachedPolicy: async () => {},
      getDismissedLatestVersion: () => '1.1.0',
    });

    expect(result.status).toBe('ok');
  });
});
