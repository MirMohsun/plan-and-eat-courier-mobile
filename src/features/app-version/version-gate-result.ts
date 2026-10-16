import type { VersionGateStatus, VersionPolicy } from './version-policy';

export type VersionGateResult = {
  status: VersionGateStatus;
  policy: VersionPolicy;
  currentVersion: string;
};

export function applySoftUpdateDismissal(
  result: VersionGateResult,
  dismissedLatestVersion: string | null,
): VersionGateResult {
  if (result.status !== 'soft') {
    return result;
  }
  if (dismissedLatestVersion === result.policy.latestVersion) {
    return { ...result, status: 'ok' };
  }
  return result;
}

export function resolveStoreUrlForOpen(
  policyStoreUrl: string,
  fallbackStoreUrl: string,
): string {
  const remote = policyStoreUrl.trim();
  if (remote.length > 0) {
    return remote;
  }
  return fallbackStoreUrl.trim();
}
