import type { VersionGateResult } from './version-gate-result';
import { evaluateAppVersionGate } from './evaluate-app-version-gate';
import { fetchVersionPolicyFromRemote } from './fetch-version-policy';
import { getCurrentAppVersion } from './get-current-app-version';
import { useAppVersionGateStore } from './use-app-version-gate-store';
import { DEFAULT_VERSION_POLICY } from './version-policy';
import {
  getCachedVersionPolicy,
  getDismissedLatestVersion,
  saveCachedVersionPolicy,
} from './version-policy-storage';

/** Metro only: Remote Config defaults to 0.0.0, so the prompt never appears. Set false to restore the real gate. */
export const FORCE_VERSION_PROMPT_IN_DEV = false;

function applyDevForcePrompt(result: VersionGateResult): VersionGateResult {
  if (!__DEV__ || !FORCE_VERSION_PROMPT_IN_DEV || result.status !== 'ok') {
    return result;
  }

  return {
    ...result,
    status: 'force_update',
    policy: {
      ...result.policy,
      minSupportedVersion: '99.0.0',
      latestVersion: '99.0.0',
      storeUrl: result.policy.storeUrl || 'https://apps.apple.com',
    },
  };
}

export async function runAppVersionGate(): Promise<VersionGateResult> {
  try {
    const result = applyDevForcePrompt(
      await evaluateAppVersionGate({
        getCurrentVersion: getCurrentAppVersion,
        fetchPolicy: fetchVersionPolicyFromRemote,
        getCachedPolicy: getCachedVersionPolicy,
        saveCachedPolicy: saveCachedVersionPolicy,
        getDismissedLatestVersion,
      }),
    );
    useAppVersionGateStore.getState().setResult(result);
    return result;
  }
  catch {
    const fallback: VersionGateResult = {
      status: 'ok',
      policy: DEFAULT_VERSION_POLICY,
      currentVersion: getCurrentAppVersion(),
    };
    useAppVersionGateStore.getState().setResult(fallback);
    return fallback;
  }
}
