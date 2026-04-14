import { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  useWindowDimensions, ScrollView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { useGameStore, formatGameTime } from '../store/gameStore';
import { TIME_SCALE, SHIFT_DURATION } from '../constants/config';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { phase, startShift } = useGameStore();

  function handleStart() {
    console.log('🚀 Starting shift...');
    startShift();
    console.log('✅ Navigating to game...');
    router.push('/game');
  }

  return (
    <LinearGradient colors={['#050a14', '#0a0f1e', '#050a14']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* LOGO */}
        <View style={styles.logoWrap}>
          <Text style={styles.logoTruck}>🚛</Text>
          <Text style={styles.logoTitle}>DISPATCH</Text>
          <Text style={styles.logoSub}>4 ADVENTURE</Text>
          <View style={styles.betaBadge}><Text style={styles.betaText}>BETA v0.1</Text></View>
        </View>

        <Text style={styles.tagline}>
          Ты — диспетчер. Управляй 3 траками.{'\n'}
          Ищи грузы. Торгуйся. Решай кризисы.{'\n'}
          Зарабатывай максимум за смену.
        </Text>

        {/* КНОПКА СТАРТ */}
        <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.85}>
          <LinearGradient
            colors={['#22c55e', '#16a34a']}
            style={styles.startBtnGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.startBtnText}>🚀 НАЧАТЬ СМЕНУ</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* КАК ИГРАТЬ */}
        <View style={styles.howto}>
          <Text style={styles.howtoTitle}>Как играть</Text>
          <View style={styles.steps}>
            {[
              { n: '1', icon: '📋', title: 'Load Board', desc: 'Открой доску грузов. Выбери маршрут с лучшей ставкой за милю.' },
              { n: '2', icon: '📞', title: 'Переговоры', desc: 'Позвони брокеру. Торгуйся — брокер всегда занижает ставку на 15-25%.' },
              { n: '3', icon: '🚛', title: 'Отправь трак', desc: 'Назначь груз водителю. Трак едет по реальной карте США.' },
              { n: '4', icon: '⚡', title: 'Реагируй', desc: 'Поломки, detention, TONU — кризисы прилетают в любой момент.' },
              { n: '5', icon: '💰', title: 'P&L', desc: 'В конце смены — отчёт. Сколько заработал, сколько потерял.' },
            ].map(s => (
              <View key={s.n} style={styles.step}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>{s.n}</Text></View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{s.icon} {s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ФАКТЫ */}
        <View style={styles.facts}>
          {[
            { val: '3', label: 'Водителя' },
            { val: '8ч', label: 'Смена' },
            { val: '20+', label: 'Грузов' },
            { val: '∞', label: 'Кризисов' },
          ].map(f => (
            <View key={f.val} style={styles.fact}>
              <Text style={styles.factVal}>{f.val}</Text>
              <Text style={styles.factLabel}>{f.label}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60, alignItems: 'center' },

  logoWrap: { alignItems: 'center', marginBottom: 28 },
  logoTruck: { fontSize: 72, marginBottom: 8 },
  logoTitle: { fontSize: 44, fontWeight: '900', color: '#fff', letterSpacing: 4 },
  logoSub: { fontSize: 28, fontWeight: '900', color: Colors.primary, letterSpacing: 6, marginTop: -6 },
  betaBadge: {
    marginTop: 10, paddingHorizontal: 14, paddingVertical: 4,
    backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)',
  },
  betaText: { fontSize: 11, fontWeight: '800', color: '#ef4444', letterSpacing: 2 },

  tagline: {
    fontSize: 16, color: Colors.textMuted, textAlign: 'center',
    lineHeight: 26, marginBottom: 36,
  },

  startBtn: { width: '100%', maxWidth: 380, borderRadius: 18, overflow: 'hidden', marginBottom: 44 },
  startBtnGrad: { paddingVertical: 20, alignItems: 'center' },
  startBtnText: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 1 },

  howto: { width: '100%', maxWidth: 560, marginBottom: 36 },
  howtoTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 16, textAlign: 'center' },
  steps: { gap: 12 },
  step: {
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    backgroundColor: Colors.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, padding: 14,
  },
  stepNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumText: { fontSize: 13, fontWeight: '900', color: '#fff' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: '800', color: '#fff', marginBottom: 3 },
  stepDesc: { fontSize: 12, color: Colors.textMuted, lineHeight: 18 },

  facts: { flexDirection: 'row', gap: 12, width: '100%', maxWidth: 400 },
  fact: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    padding: 14, alignItems: 'center',
  },
  factVal: { fontSize: 24, fontWeight: '900', color: Colors.primary, marginBottom: 4 },
  factLabel: { fontSize: 11, color: Colors.textDim, fontWeight: '600' },
});
