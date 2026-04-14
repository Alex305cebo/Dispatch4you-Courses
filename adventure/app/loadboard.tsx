import { useRouter } from 'expo-router';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, useWindowDimensions,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useGameStore, Load } from '../store/gameStore';
import { LOADS } from '../data/loads';
import { ROUTES } from '../data/routes';

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: Colors.success,
  medium: Colors.warning,
  hard: Colors.danger,
};
const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'ЛЁГКИЙ',
  medium: 'СРЕДНИЙ',
  hard: 'СЛОЖНЫЙ',
};

export default function LoadBoardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { selectLoad, setRoute } = useGameStore();
  const isWide = width >= 768;

  function handleSelect(load: Load) {
    selectLoad(load);
    const route = ROUTES[load.id];
    if (route) setRoute(route);
    router.push('/map');
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>📋 Load Board</Text>
          <Text style={styles.headerSub}>Выбери груз для своего водителя</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}>
        <Text style={styles.sectionLabel}>ДОСТУПНЫЕ ГРУЗЫ</Text>

        {LOADS.map((load) => (
          <TouchableOpacity
            key={load.id}
            style={styles.loadCard}
            onPress={() => handleSelect(load)}
            activeOpacity={0.8}
          >
            {/* TOP ROW */}
            <View style={styles.loadTop}>
              <View style={styles.routeWrap}>
                <Text style={styles.cityFrom}>{load.from}</Text>
                <Text style={styles.routeArrow}>→</Text>
                <Text style={styles.cityTo}>{load.to}</Text>
              </View>
              <View style={[styles.diffBadge, { borderColor: DIFFICULTY_COLOR[load.difficulty] }]}>
                <Text style={[styles.diffText, { color: DIFFICULTY_COLOR[load.difficulty] }]}>
                  {DIFFICULTY_LABEL[load.difficulty]}
                </Text>
              </View>
            </View>

            {/* COMMODITY */}
            <Text style={styles.commodity}>{load.commodity}</Text>
            <Text style={styles.broker}>Брокер: {load.brokerName}</Text>

            {/* STATS */}
            <View style={styles.loadStats}>
              <View style={styles.loadStat}>
                <Text style={styles.loadStatVal}>${load.rate.toLocaleString()}</Text>
                <Text style={styles.loadStatLabel}>Ставка</Text>
              </View>
              <View style={styles.loadStat}>
                <Text style={styles.loadStatVal}>{load.miles.toLocaleString()}</Text>
                <Text style={styles.loadStatLabel}>Миль</Text>
              </View>
              <View style={styles.loadStat}>
                <Text style={styles.loadStatVal}>{(load.rate / load.miles).toFixed(2)}</Text>
                <Text style={styles.loadStatLabel}>$/миля</Text>
              </View>
              <View style={styles.loadStat}>
                <Text style={styles.loadStatVal}>{(load.weight / 1000).toFixed(0)}K</Text>
                <Text style={styles.loadStatLabel}>Lbs</Text>
              </View>
            </View>

            {/* TAGS */}
            <View style={styles.tagRow}>
              <View style={styles.tag}><Text style={styles.tagText}>🚛 {load.equipment}</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>📍 {load.fromState} → {load.toState}</Text></View>
            </View>

            {/* CTA */}
            <View style={styles.selectBtn}>
              <Text style={styles.selectBtnText}>Взять груз →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { fontSize: 18, color: Colors.textMuted },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: 12, color: Colors.textDim, marginTop: 2 },

  scroll: { padding: 16, paddingBottom: 40 },
  scrollWide: { maxWidth: 720, alignSelf: 'center', width: '100%' },

  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: Colors.textDim,
    letterSpacing: 2, marginBottom: 12,
  },

  loadCard: {
    backgroundColor: Colors.bgCard, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border,
    padding: 18, marginBottom: 14,
  },

  loadTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  routeWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cityFrom: { fontSize: 17, fontWeight: '800', color: Colors.text },
  routeArrow: { fontSize: 16, color: Colors.primary },
  cityTo: { fontSize: 17, fontWeight: '800', color: Colors.primary },

  diffBadge: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 12, borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  diffText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  commodity: { fontSize: 14, color: Colors.textSecondary, marginBottom: 2 },
  broker: { fontSize: 12, color: Colors.textDim, marginBottom: 14 },

  loadStats: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  loadStat: {
    flex: 1, backgroundColor: Colors.bg, borderRadius: 10,
    padding: 10, alignItems: 'center',
  },
  loadStatVal: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  loadStatLabel: { fontSize: 10, color: Colors.textDim, fontWeight: '600' },

  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  tag: {
    backgroundColor: 'rgba(6,182,212,0.1)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)',
    paddingHorizontal: 10, paddingVertical: 4,
  },
  tagText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },

  selectBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  selectBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
