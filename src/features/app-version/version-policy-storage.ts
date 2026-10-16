import type { VersionPolicy } from './version-policy';

import { getItem, setItem } from '@/lib/storage';
import { parseVersionPolicy } from './version-policy';

export const VERSION_POLICY_STORAGE_KEY = 'app-version.policy';
export const SOFT_DISMISS_STORAGE_KEY = 'app-version.soft-dismissed-latest';

export function getCachedVersionPolicy(): VersionPolicy | null {
  const cached = getItem<VersionPolicy>(VERSION_POLICY_STORAGE_KEY);
  if (cached == null) {
    return null;
  }
  return parseVersionPolicy(cached);
}

export async function saveCachedVersionPolicy(policy: VersionPolicy): Promise<void> {
  await setItem(VERSION_POLICY_STORAGE_KEY, policy);
}

export function getDismissedLatestVersion(): string | null {
  const value = getItem<string>(SOFT_DISMISS_STORAGE_KEY);
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }
  return value;
}

export async function saveDismissedLatestVersion(latestVersion: string): Promise<void> {
  await setItem(SOFT_DISMISS_STORAGE_KEY, latestVersion);
}
