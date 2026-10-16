/* eslint-disable max-lines-per-function */
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FocusAwareStatusBar } from '@/components/ui';
import { useCompleteAssignment } from '@/features/courier/api';
import { useCourierStops } from '@/features/courier/hooks/use-courier-stops';
import { useAppTheme } from '@/lib/hooks/use-app-theme';

import { CompanyPickupCard } from './components/company-pickup-card';
import { useStopsWithLocalState } from './hooks/use-stops-with-local-state';
import { useOrdersStore } from './store/use-orders-store';

const HERO_HEIGHT = 260;
const HEADER_COLLAPSE_AT = HERO_HEIGHT - 80;
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export function StopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark, c } = useAppTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const { stops: mappedStops } = useCourierStops();
  const completeAssignment = useCompleteAssignment();
  const stops = useStopsWithLocalState(mappedStops);
  const markDelivered = useOrdersStore(s => s.markDelivered);
  const stop = stops.find(s => s.id === id);

  const totalCompanies = stop?.companies.length ?? 0;
  const canComplete = Boolean(stop && !stop.isDelivered);

  const handleMarkDelivered = React.useCallback(async () => {
    if (!stop || stop.isDelivered) {
      return;
    }

    try {
      await completeAssignment.mutateAsync({ id: Number(stop.id) });
      markDelivered(stop.id);
      router.back();
    }
    catch (error) {
      if (__DEV__) {
        console.error('Failed to complete assignment', error);
      }
    }
  }, [completeAssignment, markDelivered, router, stop]);

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [0, HERO_HEIGHT], [0, -HERO_HEIGHT * 0.4], 'clamp') },
      { scale: interpolate(scrollY.value, [-60, 0], [1.12, 1], 'clamp') },
    ],
  }));

  const collapsedHeaderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [HEADER_COLLAPSE_AT, HEADER_COLLAPSE_AT + 40], [0, 1], 'clamp'),
  }));

  if (!stop) {
    return (
      <View style={[styles.notFound, { backgroundColor: c.bg }]}>
        <Text style={{ color: c.textPrimary, fontSize: 16 }}>
          {t('courier.stop.stop_not_found')}
        </Text>
      </View>
    );
  }

  const instructionText = stop.instruction;

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <FocusAwareStatusBar />

      <Pressable
        onPress={() => router.back()}
        style={[
          styles.backBtn,
          {
            top: insets.top + 10,
            backgroundColor: isDark ? 'rgba(23,23,23,0.92)' : '#ffffff',
          },
        ]}
        hitSlop={8}
      >
        <Text style={[styles.backBtnArrow, { color: isDark ? '#FAFAFA' : '#111111' }]}>←</Text>
      </Pressable>

      <Animated.View
        style={[
          styles.stickyHeader,
          { paddingTop: insets.top, backgroundColor: c.bg, borderBottomColor: c.border },
          collapsedHeaderStyle,
        ]}
        pointerEvents="none"
      >
        <Text style={[styles.stickyTitle, { color: c.textPrimary }]} numberOfLines={1}>
          {stop.name}
        </Text>
      </Animated.View>

      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        <View style={styles.heroContainer}>
          <Animated.View style={[StyleSheet.absoluteFillObject, heroStyle]}>
            {stop.photoUrl !== ''
              ? (
                  <Image
                    source={{ uri: stop.photoUrl }}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="cover"
                    transition={200}
                  />
                )
              : (
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: isDark ? '#1A1A1A' : '#2A2A2A' }]} />
                )}
          </Animated.View>
          <View style={styles.heroOverlay} />
          <View style={[styles.heroInfo, { paddingBottom: 24 }]}>
            <Text style={styles.heroName}>{stop.name}</Text>
            {stop.address !== '' && (
              <Text style={styles.heroAddress}>{stop.address}</Text>
            )}
          </View>
        </View>

        <View style={[styles.content, { backgroundColor: c.bg }]}>
          {instructionText != null && (
            <Animated.View
              entering={FadeInDown.delay(40).springify().damping(18)}
              style={[styles.instructionCard, { backgroundColor: c.card, borderColor: c.border }]}
            >
              <Text style={[styles.instructionTitle, { color: c.textPrimary }]}>
                {t('courier.stop.instruction_title')}
              </Text>
              <Text style={[styles.instructionBody, { color: c.textSecondary }]}>
                {instructionText}
              </Text>
            </Animated.View>
          )}

          {totalCompanies > 0 && (
            <Animated.View entering={FadeInDown.delay(100).springify().damping(18)}>
              <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
                {t('courier.stop.companies_section', { count: totalCompanies })}
              </Text>
              {stop.companies.map((company, idx) => (
                <CompanyPickupCard
                  key={company.id}
                  company={company}
                  index={idx}
                />
              ))}
            </Animated.View>
          )}

          <Animated.View
            entering={FadeInDown.delay(180).springify().damping(18)}
            style={[
              styles.deliverCard,
              {
                backgroundColor: stop.isDelivered
                  ? (isDark ? 'rgba(34,197,94,0.1)' : '#F0FDF4')
                  : (isDark ? 'rgba(255,108,0,0.08)' : '#FFF8F3'),
                borderColor: stop.isDelivered
                  ? (isDark ? 'rgba(34,197,94,0.25)' : '#BBF7D0')
                  : (isDark ? 'rgba(255,108,0,0.2)' : '#FFD4B0'),
              },
            ]}
          >
            <View style={styles.deliverHeader}>
              <Text style={styles.deliverIcon}>
                {stop.isDelivered ? '🎉' : '🚚'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.deliverTitle, { color: c.textPrimary }]}>
                  {stop.isDelivered
                    ? t('courier.stop.deliver_done_title')
                    : t('courier.stop.deliver_title')}
                </Text>
                <Text style={[styles.deliverSub, { color: c.textSecondary }]}>
                  {stop.isDelivered
                    ? t('courier.stop.deliver_done_sub')
                    : (stop.address || stop.name)}
                </Text>
              </View>
            </View>

            {!stop.isDelivered && (
              <Pressable
                onPress={handleMarkDelivered}
                disabled={!canComplete || completeAssignment.isPending}
                style={({ pressed }) => [
                  styles.deliverBtn,
                  {
                    backgroundColor: canComplete
                      ? '#22C55E'
                      : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'),
                    opacity: pressed || completeAssignment.isPending ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={[
                  styles.deliverBtnText,
                  { color: canComplete ? '#fff' : c.textSecondary },
                ]}
                >
                  {t('courier.stop.confirm_delivery')}
                </Text>
              </Pressable>
            )}
          </Animated.View>
        </View>
      </AnimatedScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: {
    position: 'absolute',
    left: 16,
    zIndex: 50,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  backBtnArrow: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
    includeFontPadding: false,
    textAlign: 'center',
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    paddingBottom: 12,
  },
  stickyTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    paddingTop: 12,
  },
  heroContainer: {
    height: HERO_HEIGHT,
    overflow: 'hidden',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  heroInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  heroName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  heroAddress: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  content: {
    padding: 16,
    paddingTop: 16,
  },
  instructionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 22,
    gap: 8,
  },
  instructionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  instructionBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  deliverCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
    gap: 14,
  },
  deliverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  deliverIcon: {
    fontSize: 32,
  },
  deliverTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  deliverSub: {
    fontSize: 12,
    marginTop: 3,
  },
  deliverBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deliverBtnText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});
