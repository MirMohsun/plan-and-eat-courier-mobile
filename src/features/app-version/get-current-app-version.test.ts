import Env from 'env';

import * as Application from 'expo-application';

import { getCurrentAppVersion } from './get-current-app-version';

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '1.0.1' as string | null,
}));

jest.mock('env', () => ({
  __esModule: true,
  default: {
    EXPO_PUBLIC_VERSION: '9.9.9',
  },
}));

describe('getCurrentAppVersion', () => {
  beforeEach(() => {
    (Application as { nativeApplicationVersion: string | null }).nativeApplicationVersion = '1.0.1';
    (Env as { EXPO_PUBLIC_VERSION: string }).EXPO_PUBLIC_VERSION = '9.9.9';
  });

  it('prefers native application version', () => {
    expect(getCurrentAppVersion()).toBe('1.0.1');
  });

  it('falls back to env version when native is empty', () => {
    (Application as { nativeApplicationVersion: string | null }).nativeApplicationVersion = '  ';
    expect(getCurrentAppVersion()).toBe('9.9.9');
  });

  it('falls back to 0.0.0 when both are empty', () => {
    (Application as { nativeApplicationVersion: string | null }).nativeApplicationVersion = null;
    (Env as { EXPO_PUBLIC_VERSION: string }).EXPO_PUBLIC_VERSION = '';
    expect(getCurrentAppVersion()).toBe('0.0.0');
  });
});
