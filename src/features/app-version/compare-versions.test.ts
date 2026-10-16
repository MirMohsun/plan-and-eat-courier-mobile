import { compareVersions, isVersionLessThan } from './compare-versions';

describe('compareVersions', () => {
  it('treats 1.10.0 as greater than 1.2.0', () => {
    expect(compareVersions('1.10.0', '1.2.0')).toBeGreaterThan(0);
  });

  it('treats equal versions as 0', () => {
    expect(compareVersions('1.0.1', '1.0.1')).toBe(0);
  });

  it('pads missing patch segments with zero', () => {
    expect(compareVersions('1.2', '1.2.0')).toBe(0);
  });

  it('ignores prerelease suffix for numeric comparison', () => {
    expect(compareVersions('1.0.0-beta', '1.0.0')).toBe(0);
  });

  it('treats invalid versions as 0.0.0', () => {
    expect(compareVersions('not-a-version', '0.0.0')).toBe(0);
  });
});

describe('isVersionLessThan', () => {
  it('returns true when current is below target', () => {
    expect(isVersionLessThan('1.0.1', '1.2.0')).toBe(true);
  });

  it('returns false when current equals target', () => {
    expect(isVersionLessThan('1.0.1', '1.0.1')).toBe(false);
  });
});
