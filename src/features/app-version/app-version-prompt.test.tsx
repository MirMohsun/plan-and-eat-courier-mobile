import type { ReactElement } from 'react';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { fireEvent, screen, setup } from '@/lib/test-utils';

import { AppVersionPrompt } from './app-version-prompt';

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function renderPrompt(ui: ReactElement) {
  return setup(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      {ui}
    </SafeAreaProvider>,
  );
}

describe('appVersionPrompt', () => {
  it('shows a blocking update action for force_update', () => {
    const onUpdate = jest.fn();
    renderPrompt(
      <AppVersionPrompt
        status="force_update"
        canOpenStore
        onUpdate={onUpdate}
        onLater={jest.fn()}
      />,
    );

    expect(screen.getByText('Update required')).toBeTruthy();
    fireEvent.press(screen.getByTestId('app-version-update'));
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('app-version-later')).toBeNull();
  });

  it('hides store action during maintenance', () => {
    renderPrompt(
      <AppVersionPrompt
        status="maintenance"
        canOpenStore
        onUpdate={jest.fn()}
        onLater={jest.fn()}
      />,
    );

    expect(screen.getByText('Temporarily unavailable')).toBeTruthy();
    expect(screen.queryByTestId('app-version-update')).toBeNull();
    expect(screen.queryByTestId('app-version-later')).toBeNull();
  });

  it('allows dismissing a soft update', () => {
    const onLater = jest.fn();
    renderPrompt(
      <AppVersionPrompt
        status="soft"
        canOpenStore
        onUpdate={jest.fn()}
        onLater={onLater}
      />,
    );

    fireEvent.press(screen.getByTestId('app-version-later'));
    expect(onLater).toHaveBeenCalledTimes(1);
  });
});
