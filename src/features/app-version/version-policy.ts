import { isVersionLessThan } from './compare-versions';

export const REMOTE_CONFIG_KEYS = {
  minSupportedVersion: 'min_supported_version',
  latestVersion: 'latest_version',
  storeUrl: 'store_url',
  appDisabled: 'app_disabled',
} as const;

export type VersionGateStatus = 'ok' | 'soft' | 'force_update' | 'maintenance';

export type VersionPolicy = {
  minSupportedVersion: string;
  latestVersion: string;
  storeUrl: string;
  appDisabled: boolean;
};

export type ResolveVersionGateInput = {
  currentVersion: string;
  minSupportedVersion: string;
  latestVersion: string;
  appDisabled: boolean;
};

export const DEFAULT_VERSION_POLICY: VersionPolicy = {
  minSupportedVersion: '0.0.0',
  latestVersion: '0.0.0',
  storeUrl: '',
  appDisabled: false,
};

type RawVersionPolicy = {
  minSupportedVersion?: string;
  latestVersion?: string;
  storeUrl?: string;
  appDisabled?: boolean | string;
};

function parseOptionalVersion(value: string | undefined): string {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : '0.0.0';
}

function parseAppDisabled(value: boolean | string | undefined): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value !== 'string') {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

export function parseVersionPolicy(raw: RawVersionPolicy): VersionPolicy {
  return {
    minSupportedVersion: parseOptionalVersion(raw.minSupportedVersion),
    latestVersion: parseOptionalVersion(raw.latestVersion),
    storeUrl: raw.storeUrl?.trim() ?? '',
    appDisabled: parseAppDisabled(raw.appDisabled),
  };
}

export function resolvePolicyForGate(
  fetched: VersionPolicy | null,
  cached: VersionPolicy | null,
): VersionPolicy {
  return fetched ?? cached ?? DEFAULT_VERSION_POLICY;
}

export function resolveVersionGate(input: ResolveVersionGateInput): VersionGateStatus {
  if (input.appDisabled) {
    return 'maintenance';
  }
  if (isVersionLessThan(input.currentVersion, input.minSupportedVersion)) {
    return 'force_update';
  }
  if (isVersionLessThan(input.currentVersion, input.latestVersion)) {
    return 'soft';
  }
  return 'ok';
}
