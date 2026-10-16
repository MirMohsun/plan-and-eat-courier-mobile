import type { RemoteConfig } from '@react-native-firebase/remote-config';
import type { VersionPolicy } from './version-policy';
import {
  fetchAndActivate,
  getRemoteConfig,
  getValue,
} from '@react-native-firebase/remote-config';

import { Platform } from 'react-native';
import { DEFAULT_VERSION_POLICY, parseVersionPolicy, REMOTE_CONFIG_KEYS } from './version-policy';

export const REMOTE_CONFIG_FETCH_TIMEOUT_MS = 15_000;
export const REMOTE_CONFIG_FETCH_TIME_MS = 15_000;

const TAG = '[remote-config]';

/**
 * Web modular RemoteConfig typings omit RN-native awaitable setters.
 * Instance from getRemoteConfig() still exposes them at runtime.
 */
type RemoteConfigWithNativeSetters = RemoteConfig & {
  setConfigSettings: (settings: {
    minimumFetchIntervalMillis?: number;
    fetchTimeMillis?: number;
    fetchTimeoutMillis?: number;
  }) => Promise<void>;
  setDefaults: (defaults: Record<string, string | number | boolean>) => Promise<null>;
};

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('remote-config-timeout'));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function logRemoteConfigDebug(
  step: string,
  detail?: Record<string, unknown>,
): void {
  if (!__DEV__)
    return;
  if (detail)
    console.log(TAG, step, detail);
  else
    console.log(TAG, step);
}

export async function fetchVersionPolicyFromRemote(): Promise<VersionPolicy> {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return DEFAULT_VERSION_POLICY;
  }

  const remoteConfig = getRemoteConfig() as RemoteConfigWithNativeSetters;

  try {
    await remoteConfig.setConfigSettings({
      minimumFetchIntervalMillis: __DEV__ ? 0 : 60 * 60 * 1000,
      fetchTimeMillis: REMOTE_CONFIG_FETCH_TIME_MS,
    });
    await remoteConfig.setDefaults({
      [REMOTE_CONFIG_KEYS.minSupportedVersion]: '0.0.0',
      [REMOTE_CONFIG_KEYS.latestVersion]: '0.0.0',
      [REMOTE_CONFIG_KEYS.storeUrl]: '',
      [REMOTE_CONFIG_KEYS.appDisabled]: false,
    });

    const fetchedRemotely = await withTimeout(
      fetchAndActivate(remoteConfig),
      REMOTE_CONFIG_FETCH_TIMEOUT_MS,
    );

    const minSupported = getValue(
      remoteConfig,
      REMOTE_CONFIG_KEYS.minSupportedVersion,
    );
    const latest = getValue(remoteConfig, REMOTE_CONFIG_KEYS.latestVersion);
    const storeUrl = getValue(remoteConfig, REMOTE_CONFIG_KEYS.storeUrl);
    const appDisabled = getValue(remoteConfig, REMOTE_CONFIG_KEYS.appDisabled);

    const policy = parseVersionPolicy({
      minSupportedVersion: minSupported.asString(),
      latestVersion: latest.asString(),
      storeUrl: storeUrl.asString(),
      appDisabled: appDisabled.asBoolean(),
    });

    logRemoteConfigDebug('fetch:ok', {
      fetchedRemotely,
      min_supported_version: {
        value: policy.minSupportedVersion,
        source: minSupported.getSource(),
      },
      latest_version: {
        value: policy.latestVersion,
        source: latest.getSource(),
      },
      store_url: {
        value: policy.storeUrl,
        source: storeUrl.getSource(),
      },
      app_disabled: {
        value: policy.appDisabled,
        source: appDisabled.getSource(),
      },
    });

    return policy;
  }
  catch (error) {
    logRemoteConfigDebug('fetch:failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
