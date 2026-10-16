import type { VersionGateResult } from './version-gate-result';
import { applySoftUpdateDismissal, resolveStoreUrlForOpen } from './version-gate-result';

describe('applySoftUpdateDismissal', () => {
  const softResult: VersionGateResult = {
    status: 'soft',
    currentVersion: '1.0.1',
    policy: {
      minSupportedVersion: '1.0.0',
      latestVersion: '1.1.0',
      storeUrl: 'https://example.com',
      appDisabled: false,
    },
  };

  it('keeps force_update unchanged', () => {
    const blocked: VersionGateResult = {
      ...softResult,
      status: 'force_update',
    };
    expect(applySoftUpdateDismissal(blocked, '1.1.0')).toEqual(blocked);
  });

  it('hides soft prompt when this latest version was dismissed', () => {
    expect(applySoftUpdateDismissal(softResult, '1.1.0').status).toBe('ok');
  });

  it('keeps soft prompt when dismissed version differs', () => {
    expect(applySoftUpdateDismissal(softResult, '1.0.2').status).toBe('soft');
  });
});

describe('resolveStoreUrlForOpen', () => {
  it('prefers remote store url when present', () => {
    expect(
      resolveStoreUrlForOpen('https://apps.apple.com/app/id1', 'https://play.example'),
    ).toBe('https://apps.apple.com/app/id1');
  });

  it('falls back when remote url is empty', () => {
    expect(resolveStoreUrlForOpen('  ', 'https://play.example')).toBe(
      'https://play.example',
    );
  });
});
