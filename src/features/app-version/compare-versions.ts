function parseVersionParts(version: string): [number, number, number] {
  const numeric = version.trim().split(/[+-]/)[0] ?? '';
  const segments = numeric.split('.');

  const major = Number.parseInt(segments[0] ?? '', 10);
  const minor = Number.parseInt(segments[1] ?? '', 10);
  const patch = Number.parseInt(segments[2] ?? '', 10);

  return [
    Number.isFinite(major) ? major : 0,
    Number.isFinite(minor) ? minor : 0,
    Number.isFinite(patch) ? patch : 0,
  ];
}

export function compareVersions(left: string, right: string): number {
  const leftParts = parseVersionParts(left);
  const rightParts = parseVersionParts(right);

  for (let index = 0; index < 3; index += 1) {
    const diff = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}

export function isVersionLessThan(current: string, target: string): boolean {
  return compareVersions(current, target) < 0;
}
