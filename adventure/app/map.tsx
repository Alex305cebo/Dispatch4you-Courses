import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  useWindowDimensions, Animated, Easing,
} from 'react-native';
import Svg, { Path, Circle, Text as SvgText, Line } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { useGameStore } from '../store/gameStore';

// SVG USA map simplified path
const USA_PATH = "M 120,80 L 140,70 L 180,65 L 220,60 L 260,58 L 300,55 L 340,52 L 380,50 L 420,52 L 460,55 L 490,58 L 510,65 L 520,75 L 515,90 L 505,100 L 495,115 L 480,125 L 460,130 L 440,135 L 420,140 L 400,145 L 380,148 L 360,150 L 340,152 L 320,155 L 300,158 L 280,160 L 260,162 L 240,165 L 220,168 L 200,170 L 180,168 L 160,162 L 140,155 L 125,145 L 115,130 L 110,115 L 112,100 L 120,80 Z";

export default function MapScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { currentLoad, currentRoute, currentStopIndex, hearts, xp, advanceStop } = useGameStore();

  const isWide = width >= 768;
  const mapW = isWide ? Math.min(width * 0.6, 600) : width - 32;
  const mapH = mapW * 0.55;

  // Truck animation
  const truckX = useRef(new Animated.Value(0)).current;
  const truckY = useRef(new Animated.Value(0)).current;
  const truckBob = useRef(new Animated.Value(0)).current;
  const [truckMoving, setTruckMoving] = useState(false);

  // Road dash animation
  const dashOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous road dash animation
    Animated.loop(
      Animated.timing(dashOffset, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Truck bobbing
    Animated.loop(
      Animated.sequence([
        Animated.timing(truckBob, { toValue: -2, duration: 400, useNativeDriver: true }),
        Animated.timing(truckBob, { toValue: 2, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (currentRoute.length === 0) return;
    const stop = currentRoute[currentStopIndex];
    const targetX = (stop.x / 100) * mapW - 24;
    const targetY = (stop.y / 100) * mapH - 16;

    setTruckMoving(true);
    Animated.parallel([
      Animated.timing(truckX, {
        toValue: targetX,
        duration: 1200,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(truckY, {
        toValue: targetY,
        duration: 1200,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => setTruckMoving(false));
  }, [currentStopIndex, mapW, mapH]);

  function handleStopPress() {
    const stop = currentRoute[currentStopIndex];
    if (stop?.event) {
      router.push('/event');
    }
  }

  if (!currentLoad) {
    router.replace('/loadboard');
    return null;
  }

  const currentStop = currentRoute[currentStopIndex];
  const progress = currentStopIndex / (currentRoute.length - 1);

  return (
    <View style={styles.container}>
      {/* HUD */}
      <View style={styles.hud}>
        <TouchableOpacity onPress={() => router.back()} style={styles.hudBack}>
          <Text style={styles.hudBackText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.hudProgress}>
          <View style={[styles.hudFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.hudHearts}>
          {[1, 2, 3].map((i) => (
            <Text key={i} style={[styles.hudHeart, i > hearts && styles.hudHeartDead]}>❤️</Text>
          ))}
        </View>
        <View style={styles.hudXP}>
          <Text style={styles.hudXPText}>⚡ {xp}</Text>
        </View>
      </View>

      {/* MAIN CONTENT */}
      <View style={[styles.content, isWide && styles.contentWide]}>

        {/* MAP AREA */}
        <View style={[styles.mapWrap, { width: mapW, height: mapH }]}>
          <Svg width={mapW} height={mapH} viewBox={`0 0 ${mapW} ${mapH}`}>
            {/* USA outline */}
            <Path
              d={USA_PATH}
              fill="rgba(30,41,59,0.8)"
              stroke={Colors.roadLine}
              strokeWidth={1.5}
              transform={`scale(${mapW / 640}, ${mapH / 360})`}
            />

            {/* Route lines between stops */}
            {currentRoute.map((stop, i) => {
              if (i === 0) return null;
              const prev = currentRoute[i - 1];
              const x1 = (prev.x / 100) * mapW;
              const y1 = (prev.y / 100) * mapH;
              const x2 = (stop.x / 100) * mapW;
              const y2 = (stop.y / 100) * mapH;
              const isDone = i <= currentStopIndex;
              return (
                <Line
                  key={stop.city}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isDone ? Colors.success : Colors.roadLine}
                  strokeWidth={isDone ? 3 : 2}
                  strokeDasharray={isDone ? undefined : '6,4'}
                />
              );
            })}

            {/* Stop dots */}
            {currentRoute.map((stop, i) => {
              const cx = (stop.x / 100) * mapW;
              const cy = (stop.y / 100) * mapH;
              const isDone = i < currentStopIndex;
              const isActive = i === currentStopIndex;
              return (
                <React.Fragment key={stop.city}>
                  <Circle
                    cx={cx} cy={cy} r={isActive ? 8 : 5}
                    fill={isDone ? Colors.success : isActive ? Colors.primary : Colors.roadLine}
                    stroke={isActive ? Colors.primary : 'transparent'}
                    strokeWidth={isActive ? 3 : 0}
                    opacity={isActive ? 1 : 0.8}
                  />
                  <SvgText
                    x={cx} y={cy - 12}
                    fontSize={9} fill={isActive ? Colors.primary : Colors.textDim}
                    textAnchor="middle" fontWeight={isActive ? 'bold' : 'normal'}
                  >
                    {stop.city}
                  </SvgText>
                </React.Fragment>
              );
            })}
          </Svg>

          {/* Animated Truck */}
          <Animated.View
            style={[
              styles.truck,
              {
                transform: [
                  { translateX: truckX },
                  { translateY: truckY },
                  { translateY: truckBob },
                ],
              },
            ]}
          >
            <Text style={styles.truckEmoji}>🚛</Text>
            {truckMoving && (
              <View style={styles.exhaustWrap}>
                <Text style={styles.exhaust}>💨</Text>
              </View>
            )}
          </Animated.View>
        </View>

        {/* EVENT PANEL */}
        <View style={[styles.eventPanel, isWide && styles.eventPanelWide]}>
          {/* Location */}
          <View style={styles.locationBadge}>
            <Text style={styles.locationText}>📍 {currentStop?.city}, {currentStop?.state}</Text>
          </View>

          {/* Load info */}
          <View style={styles.loadInfo}>
            <Text style={styles.loadRoute}>
              {currentLoad.from} → {currentLoad.to}
            </Text>
            <Text style={styles.loadCommodity}>{currentLoad.commodity}</Text>
            <Text style={styles.loadRate}>${currentLoad.rate.toLocaleString()}</Text>
          </View>

          {/* Stop progress */}
          <View style={styles.stopProgress}>
            {currentRoute.map((stop, i) => (
              <View
                key={stop.city}
                style={[
                  styles.stopDot,
                  i < currentStopIndex && styles.stopDotDone,
                  i === currentStopIndex && styles.stopDotActive,
                ]}
              />
            ))}
          </View>

          {/* Action button */}
          {currentStop?.event ? (
            <TouchableOpacity style={styles.actionBtn} onPress={handleStopPress} activeOpacity={0.85}>
              <Text style={styles.actionBtnText}>
                {currentStopIndex === 0 ? '📦 Начать погрузку' : '📞 Ответить на звонок'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSecondary]}
              onPress={() => { advanceStop(); }}
              activeOpacity={0.85}
            >
              <Text style={styles.actionBtnText}>🚛 Продолжить маршрут</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// Need React import for Fragment
import React from 'react';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  hud: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingTop: 50, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: Colors.bg, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  hudBack: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  hudBackText: { fontSize: 14, color: Colors.textMuted },
  hudProgress: {
    flex: 1, height: 10, backgroundColor: Colors.bgCard,
    borderRadius: 5, overflow: 'hidden',
  },
  hudFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 5,
  },
  hudHearts: { flexDirection: 'row', gap: 2 },
  hudHeart: { fontSize: 18 },
  hudHeartDead: { opacity: 0.2 },
  hudXP: {
    backgroundColor: Colors.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  hudXPText: { fontSize: 12, fontWeight: '700', color: Colors.xp },

  content: { flex: 1, padding: 16, gap: 16 },
  contentWide: {
    flexDirection: 'row', alignItems: 'flex-start',
    maxWidth: 1000, alignSelf: 'center', width: '100%',
  },

  mapWrap: {
    backgroundColor: 'rgba(15,23,42,0.8)',
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
    position: 'relative',
  },

  truck: { position: 'absolute', top: 0, left: 0 },
  truckEmoji: { fontSize: 28 },
  exhaustWrap: { position: 'absolute', top: -8, left: -16 },
  exhaust: { fontSize: 14, opacity: 0.6 },

  eventPanel: {
    backgroundColor: Colors.bgCard, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border,
    padding: 18, gap: 14,
  },
  eventPanelWide: { flex: 1, marginLeft: 16 },

  locationBadge: {
    backgroundColor: 'rgba(6,182,212,0.1)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(6,182,212,0.25)',
    paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start',
  },
  locationText: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  loadInfo: { gap: 4 },
  loadRoute: { fontSize: 16, fontWeight: '800', color: Colors.text },
  loadCommodity: { fontSize: 13, color: Colors.textMuted },
  loadRate: { fontSize: 20, fontWeight: '900', color: Colors.success },

  stopProgress: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  stopDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.roadLine,
  },
  stopDotDone: { backgroundColor: Colors.success },
  stopDotActive: {
    backgroundColor: Colors.primary,
    width: 14, height: 14, borderRadius: 7,
  },

  actionBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  actionBtnSecondary: { backgroundColor: Colors.bgCardHover },
  actionBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
