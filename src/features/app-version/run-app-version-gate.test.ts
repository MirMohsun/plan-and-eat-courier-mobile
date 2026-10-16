import { evaluateAppVersionGate } from './evaluate-app-version-gate';
import { FORCE_VERSION_PROMPT_IN_DEV, runAppVersionGate } from './run-app-version-gate';
import { useAppVersionGateStore } from './use-app-version-gate-store';
import { DEFAULT_VERSION_POLICY } from './version-policy';

jest.mock('./evaluate-app-version-gate', () => ({
  evaluateAppVersionGate: jest.fn(),
}));

jest.mock('./fetch-version-policy', () => ({
  fetchVersionPolicyFromRemote: jest.fn(),
}));

jest.mock('./get-current-app-version', () => ({
  getCurrentAppVersion: () => '1.0.1',
}));

jest.mock('./version-policy-storage', () => ({
  getCachedVersionPolicy: jest.fn(),
  getDismissedLatestVersion: jest.fn(),
  saveCachedVersionPolicy: jest.fn(),
}));

const evaluateAppVersionGateMock = jest.mocked(evaluateAppVersionGate);

describe('runAppVersionGate', () => {
  const originalDev = globalThis.__DEV__;

  afterEach(() => {
    useAppVersionGateStore.setState({ result: null });
    evaluateAppVersionGateMock.mockReset();
    Object.defineProperty(globalThis, '__DEV__', {
      value: originalDev,
      configurable: true,
    });
  });

  it('stores the evaluated result', async () => {
    evaluateAppVersionGateMock.mockResolvedValue({
      status: 'force_update',
      currentVersion: '1.0.1',
      policy: {
        minSupportedVersion: '1.2.0',
        latestVersion: '1.3.0',
        storeUrl: 'https://example.com',
        appDisabled: false,
      },
    });

    const result = await runAppVersionGate();
    expect(result.status).toBe('force_update');
    expect(useAppVersionGateStore.getState().result?.status).toBe('force_update');
  });

  it('honours FORCE_VERSION_PROMPT_IN_DEV in __DEV__ when Remote Config resolves to ok', async () => {
    Object.defineProperty(globalThis, '__DEV__', {
      value: true,
      configurable: true,
    });
    evaluateAppVersionGateMock.mockResolvedValue({
      status: 'ok',
      currentVersion: '1.0.1',
      policy: DEFAULT_VERSION_POLICY,
    });

    const expected = FORCE_VERSION_PROMPT_IN_DEV ? 'force_update' : 'ok';
    const result = await runAppVersionGate();
    expect(result.status).toBe(expected);
    expect(useAppVersionGateStore.getState().result?.status).toBe(expected);
  });

  it('does not force the prompt in production when the gate is ok', async () => {
    Object.defineProperty(globalThis, '__DEV__', {
      value: false,
      configurable: true,
    });
    evaluateAppVersionGateMock.mockResolvedValue({
      status: 'ok',
      currentVersion: '1.0.1',
      policy: DEFAULT_VERSION_POLICY,
    });

    const result = await runAppVersionGate();
    expect(result.status).toBe('ok');
  });

  it('fail-opens when evaluation throws', async () => {
    evaluateAppVersionGateMock.mockRejectedValue(new Error('boom'));

    const result = await runAppVersionGate();
    expect(result).toEqual({
      status: 'ok',
      currentVersion: '1.0.1',
      policy: DEFAULT_VERSION_POLICY,
    });
    expect(useAppVersionGateStore.getState().result?.status).toBe('ok');
  });
});
