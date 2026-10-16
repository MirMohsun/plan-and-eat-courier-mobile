import { parseVersionPolicy, resolvePolicyForGate, resolveVersionGate } from './version-policy';

describe('resolveVersionGate', () => {
  it('returns maintenance when the app is disabled', () => {
    expect(
      resolveVersionGate({
        currentVersion: '1.2.0',
        minSupportedVersion: '1.0.0',
        latestVersion: '1.2.0',
        appDisabled: true,
      }),
    ).toBe('maintenance');
  });

  it('returns force_update when current is below min supported', () => {
    expect(
      resolveVersionGate({
        currentVersion: '1.0.1',
        minSupportedVersion: '1.2.0',
        latestVersion: '1.3.0',
        appDisabled: false,
      }),
    ).toBe('force_update');
  });

  it('returns soft when current is at least min but below latest', () => {
    expect(
      resolveVersionGate({
        currentVersion: '1.2.0',
        minSupportedVersion: '1.0.0',
        latestVersion: '1.3.0',
        appDisabled: false,
      }),
    ).toBe('soft');
  });

  it('returns ok when current is latest or newer', () => {
    expect(
      resolveVersionGate({
        currentVersion: '1.3.0',
        minSupportedVersion: '1.0.0',
        latestVersion: '1.3.0',
        appDisabled: false,
      }),
    ).toBe('ok');
  });
});

describe('parseVersionPolicy', () => {
  it('falls back to fail-open defaults for empty values', () => {
    expect(parseVersionPolicy({})).toEqual({
      minSupportedVersion: '0.0.0',
      latestVersion: '0.0.0',
      storeUrl: '',
      appDisabled: false,
    });
  });

  it('parses boolean appDisabled from string true', () => {
    expect(
      parseVersionPolicy({
        minSupportedVersion: '1.0.0',
        latestVersion: '1.0.1',
        storeUrl: 'https://example.com',
        appDisabled: 'true',
      }),
    ).toEqual({
      minSupportedVersion: '1.0.0',
      latestVersion: '1.0.1',
      storeUrl: 'https://example.com',
      appDisabled: true,
    });
  });
});

describe('resolvePolicyForGate', () => {
  it('prefers fetched policy over cache', () => {
    const fetched = {
      minSupportedVersion: '1.1.0',
      latestVersion: '1.2.0',
      storeUrl: 'https://fetched.example',
      appDisabled: false,
    };
    const cached = {
      minSupportedVersion: '1.0.0',
      latestVersion: '1.0.1',
      storeUrl: 'https://cached.example',
      appDisabled: false,
    };

    expect(resolvePolicyForGate(fetched, cached)).toEqual(fetched);
  });

  it('uses cached policy when fetch is missing', () => {
    const cached = {
      minSupportedVersion: '1.0.0',
      latestVersion: '1.0.1',
      storeUrl: 'https://cached.example',
      appDisabled: false,
    };

    expect(resolvePolicyForGate(null, cached)).toEqual(cached);
  });

  it('uses fail-open defaults when nothing is available', () => {
    expect(resolvePolicyForGate(null, null)).toEqual({
      minSupportedVersion: '0.0.0',
      latestVersion: '0.0.0',
      storeUrl: '',
      appDisabled: false,
    });
  });
});
