import type { VersionGateStatus } from './version-policy';

import * as React from 'react';
import { BackHandler, Modal, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Text } from '@/components/ui';
import { translate } from '@/lib/i18n';

type Props = {
  status: Exclude<VersionGateStatus, 'ok'>;
  canOpenStore: boolean;
  onUpdate: () => void;
  onLater: () => void;
};

export function AppVersionPrompt({
  status,
  canOpenStore,
  onUpdate,
  onLater,
}: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const isSoft = status === 'soft';
  const isMaintenance = status === 'maintenance';

  React.useEffect(() => {
    if (isSoft) {
      return undefined;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [isSoft]);

  const titleKey = isMaintenance
    ? 'app_version.maintenance_title'
    : isSoft
      ? 'app_version.soft_title'
      : 'app_version.force_title';
  const messageKey = isMaintenance
    ? 'app_version.maintenance_message'
    : isSoft
      ? 'app_version.soft_message'
      : 'app_version.force_message';

  return (
    <Modal
      visible
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={isSoft ? onLater : undefined}
    >
      <View
        className="flex-1 justify-center gap-8 bg-white px-6 dark:bg-neutral-900"
        style={{
          paddingTop: Math.max(insets.top, 24),
          paddingBottom: Math.max(insets.bottom, 24),
        }}
        testID="app-version-prompt"
      >
        <View className="gap-3">
          <Text className="text-center font-montserrat-alternates text-2xl font-bold">
            {translate(titleKey)}
          </Text>
          <Text className="text-center text-base/6 text-neutral-500 dark:text-neutral-400">
            {translate(messageKey)}
          </Text>
        </View>
        <View className="gap-3">
          {isSoft
            ? (
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  disabled={false}
                  label={translate('app_version.later')}
                  onPress={onLater}
                  testID="app-version-later"
                />
              )
            : null}
          {!isMaintenance && canOpenStore
            ? (
                <Button
                  size="lg"
                  fullWidth
                  disabled={false}
                  label={translate('app_version.update')}
                  onPress={onUpdate}
                  testID="app-version-update"
                />
              )
            : null}
        </View>
      </View>
    </Modal>
  );
}
