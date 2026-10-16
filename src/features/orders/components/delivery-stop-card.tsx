import type { DeliveryStop } from '../types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeBlurView } from '@/components/ui/safe-blur-view';

import { useAppTheme } from '@/lib/hooks/use-app-theme';

type Props = {
  stop: DeliveryStop;
  isLocked: boolean;
  isCompleted: boolean;
  index: number;
  onPress: () => void;
};

type ThemeColors = ReturnType<typeof useAppTheme>['c'];

function openWaze(address: string) {
  const query = encodeURIComponent(address);
  Linking.openURL(`waze://?q=${query}&navigate=yes`).catch(() =>
    Linking.openURL(`https://waze.com/ul?q=${query}`),
  );
}

function openGoogleMaps(address: string) {
  const query = encodeURIComponent(address);
  Linking.openURL(`https://maps.google.com/?q=${query}`);
}

function StopCardNavActions({
  address,
  c,
  isDark,
  wazeLabel,
  mapsLabel,
}: {
  address: string;
  c: ThemeColors;
  isDark: boolean;
  wazeLabel: string;
  mapsLabel: string;
}) {
  return (
    <View style={styles.actionsRow}>
      <Pressable
        onPress={() => openWaze(address)}
        style={({ pressed }) => [styles.navBtn, styles.navBtnWaze, pressed && { opacity: 0.75 }]}
      >
        <Text style={styles.navBtnText}>
          🗺
          {wazeLabel}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => openGoogleMaps(address)}
        style={({ pressed }) => [
          styles.navBtn,
          styles.navBtnMaps,
          { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' },
          pressed && { opacity: 0.75 },
        ]}
      >
        <Text style={[styles.navBtnText, { color: c.textPrimary }]}>
          📍
          {mapsLabel}
        </Text>
      </Pressable>
    </View>
  );
}

export function DeliveryStopCard({ stop, isLocked, isCompleted, index, onPress }: Props) {
  const { isDark, c } = useAppTheme();
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  const navAddress = stop.address || stop.name;
  const sequence = stop.sequence > 0 ? stop.sequence : index + 1;

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isLocked) {
      scale.value = withSpring(0.975);
    }
  };
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View
      entering={FadeIn.delay(index * 80).springify().damping(18)}
      style={[styles.wrapper, cardStyle]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={isLocked ? undefined : onPress}
        style={styles.pressable}
      >
        <View style={[styles.card, { borderColor: isCompleted ? 'rgba(34,197,94,0.3)' : c.border }]}>
          <SafeBlurView
            intensity={isDark ? 40 : 50}
            tint={c.blurTint}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={[
            styles.cardInner,
            {
              backgroundColor: isDark ? 'rgba(23,23,23,0.6)' : 'rgba(255,255,255,0.65)',
              opacity: isLocked ? 0.55 : 1,
            },
          ]}
          >
            <View style={styles.content}>
              {isLocked && (
                <View style={[
                  styles.lockBanner,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
                ]}
                >
                  <Text style={[styles.lockText, { color: c.textSecondary }]}>
                    🔒
                    {t('courier.card.locked')}
                  </Text>
                </View>
              )}

              <Text style={[styles.name, { color: c.textPrimary }]} numberOfLines={2}>
                {stop.name}
              </Text>

              {stop.containerCount != null && (
                <Text style={[styles.meta, { color: c.textSecondary }]}>
                  {t('courier.card.container_count', { count: stop.containerCount })}
                </Text>
              )}

              <Text style={[styles.meta, { color: c.textSecondary }]}>
                {t('courier.card.sequence', { number: sequence })}
              </Text>

              {navAddress !== '' && (
                <StopCardNavActions
                  address={navAddress}
                  c={c}
                  isDark={isDark}
                  wazeLabel={t('courier.stop.nav_waze')}
                  mapsLabel={t('courier.stop.nav_maps')}
                />
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  pressable: {
    borderRadius: 22,
  },
  card: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  cardInner: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
    gap: 8,
  },
  lockBanner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  lockText: {
    fontSize: 13,
    fontWeight: '600',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  meta: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  navBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  navBtnWaze: {
    backgroundColor: '#00B4E6',
  },
  navBtnMaps: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});
