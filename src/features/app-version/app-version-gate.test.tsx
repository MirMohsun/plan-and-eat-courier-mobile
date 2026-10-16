import { cleanup } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { fireEvent, screen, setup } from '@/lib/test-utils';

import { AppVersionGate } from './app-version-gate';
import { useAppVersionGateStore } from './use-app-version-gate-store';
import { saveDismissedLatestVersion } from './version-policy-storage';

jest.mock('./open-store-url', () => ({
  openStoreUrl: jest.fn(),
}));

jest.mock('./version-policy-storage', () => ({
  saveDismissedLatestVersion: jest.fn(),
}));

jest.mock('env', () => ({
  __esModule: true,
  default: {
    EXPO_PUBLIC_PACKAGE: 'com.planandeat.customer',
    EXPO_PUBLIC_IOS_APP_STORE_ID: '1234567890',
  },
}));

const saveDismissedLatestVersionMock = jest.mocked(saveDismissedLatestVersion);

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function renderGate() {
  return setup(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <AppVersionGate />
    </SafeAreaProvider>,
  );
}

describe('appVersionGate', () => {
  afterEach(() => {
    cleanup();
    useAppVersionGateStore.setState({ result: null });
    saveDismissedLatestVersionMock.mockReset();
  });

  it('renders nothing when the gate is ok', () => {
    useAppVersionGateStore.setState({
      result: {
        status: 'ok',
        currentVersion: '1.0.1',
        policy: {
          minSupportedVersion: '1.0.0',
          latestVersion: '1.0.1',
          storeUrl: 'https://example.com',
          appDisabled: false,
        },
      },
    });

    renderGate();
    expect(screen.queryByTestId('app-version-prompt')).toBeNull();
  });

  it('dismisses a soft prompt and stores the latest version', () => {
    useAppVersionGateStore.setState({
      result: {
        status: 'soft',
        currentVersion: '1.0.1',
        policy: {
          minSupportedVersion: '1.0.0',
          latestVersion: '1.1.0',
          storeUrl: 'https://example.com',
          appDisabled: false,
        },
      },
    });

    renderGate();
    fireEvent.press(screen.getByTestId('app-version-later'));

    expect(saveDismissedLatestVersionMock).toHaveBeenCalledWith('1.1.0');
    expect(useAppVersionGateStore.getState().result?.status).toBe('ok');
  });
});
