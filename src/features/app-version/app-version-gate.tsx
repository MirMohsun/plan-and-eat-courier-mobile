import Env from 'env';
import * as React from 'react';

import { Platform } from 'react-native';

import { AppVersionPrompt } from './app-version-prompt';
import { openStoreUrl } from './open-store-url';
import { resolveFallbackStoreUrl } from './resolve-fallback-store-url';
import { useAppVersionGateStore } from './use-app-version-gate-store';
import { resolveStoreUrlForOpen } from './version-gate-result';
import { saveDismissedLatestVersion } from './version-policy-storage';

export function AppVersionGate(): React.JSX.Element | null {
  const result = useAppVersionGateStore(state => state.result);
  const setResult = useAppVersionGateStore(state => state.setResult);

  const storeUrl = React.useMemo(() => {
    if (!result) {
      return '';
    }
    return resolveStoreUrlForOpen(
      result.policy.storeUrl,
      resolveFallbackStoreUrl({
        platform: Platform.OS,
        androidPackage: Env.EXPO_PUBLIC_PACKAGE,
        iosAppStoreId: Env.EXPO_PUBLIC_IOS_APP_STORE_ID,
      }),
    );
  }, [result]);

  const handleUpdate = React.useCallback(() => {
    void openStoreUrl(storeUrl);
  }, [storeUrl]);

  const handleLater = React.useCallback(() => {
    if (!result) {
      return;
    }
    void saveDismissedLatestVersion(result.policy.latestVersion);
    setResult({ ...result, status: 'ok' });
  }, [result, setResult]);

  if (!result || result.status === 'ok') {
    return null;
  }

  return (
    <AppVersionPrompt
      status={result.status}
      canOpenStore={storeUrl.length > 0}
      onUpdate={handleUpdate}
      onLater={handleLater}
    />
  );
}
