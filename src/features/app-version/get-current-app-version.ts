import Env from 'env';

import * as Application from 'expo-application';

export function getCurrentAppVersion(): string {
  const nativeVersion = Application.nativeApplicationVersion?.trim();
  if (nativeVersion) {
    return nativeVersion;
  }

  const configVersion = Env.EXPO_PUBLIC_VERSION?.trim();
  if (configVersion) {
    return configVersion;
  }

  return '0.0.0';
}
