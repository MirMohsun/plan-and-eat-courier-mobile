import type { VersionGateResult } from './version-gate-result';
import type { VersionPolicy } from './version-policy';
import { applySoftUpdateDismissal } from './version-gate-result';
import { resolvePolicyForGate, resolveVersionGate } from './version-policy';

export type EvaluateAppVersionGateDeps = {
  getCurrentVersion: () => string;
  fetchPolicy: () => Promise<VersionPolicy>;
  getCachedPolicy: () => VersionPolicy | null;
  saveCachedPolicy: (policy: VersionPolicy) => Promise<void>;
  getDismissedLatestVersion: () => string | null;
};

export async function evaluateAppVersionGate(
  deps: EvaluateAppVersionGateDeps,
): Promise<VersionGateResult> {
  const currentVersion = deps.getCurrentVersion();
  let fetched: VersionPolicy | null = null;

  try {
    fetched = await deps.fetchPolicy();
    await deps.saveCachedPolicy(fetched);
  }
  catch {
    fetched = null;
  }

  const policy = resolvePolicyForGate(fetched, deps.getCachedPolicy());
  const status = resolveVersionGate({
    currentVersion,
    minSupportedVersion: policy.minSupportedVersion,
    latestVersion: policy.latestVersion,
    appDisabled: policy.appDisabled,
  });

  return applySoftUpdateDismissal(
    { status, policy, currentVersion },
    deps.getDismissedLatestVersion(),
  );
}
