import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { useGameStore } from '../store/gameStore';

export default function FinishScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const { xp, money, correctAnswers, totalAnswers, maxStreak, currentLoad, resetRun } = useGameStore();

  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  let grade = 'C';
  let gradeColor = Colors.primary;
  let gradeMsg = 'Нужна практика. Пройди ещё раз!';
  if (accuracy === 100) { grade = 'S'; gradeColor = Colors.xp; gradeMsg = 'Идеальная доставка! Ты профессионал.'; }
  else if (accuracy >= 80) { grade = 'A'; gradeColor = Colors.success; gradeMsg = 'Отличная работа! Клиент доволен.'; }
  else if (accuracy >= 60) { grade = 'B'; gradeColor = Colors.primary; gradeMsg = 'Хороший результат. Есть куда расти.'; }

  return (
    <LinearGradient colors={['#0a0f1e', '#0f172a']} style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}>

        {/* TROPHY */}
        <Text style={styles.trophy}>
          {accuracy === 100 ? '🏆' : accuracy >= 80 ? '🥇' : accuracy >= 60 ? '🥈' : '📚'}
        </Text>

        {/* GRADE */}
        <View style={[styles.gradeBadge, { borderColor: gradeColor }]}>
          <Text style={[styles.gradeText, { color: gradeColor }]}>{grade}</Text>
        </View>

        <Text style={styles.title}>
          {accuracy === 100 ? 'Идеальная доставка!' : accuracy >= 80 ? 'Доставка выполнена!' : 'Маршрут завершён'}
        </Text>
        <Text style={styles.subtitle}>{gradeMsg}</Text>

        {/* ROUTE SUMMARY */}
        {currentLoad && (
          <View style={styles.routeSummary}>
            <Text style={styles.routeText}>
              {currentLoad.from} → {currentLoad.to}
            </Text>
            <Text style={styles.routeCommodity}>{currentLoad.commodity}</Text>
          </View>
        )}

        {/* STATS */}
        <View style={[styles.stats, isWide && styles.statsWide]}>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: Colors.xp }]}>{xp}</Text>
            <Text style={styles.statLabel}>⚡ XP</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: Colors.success }]}>${money.toLocaleString()}</Text>
            <Text style={styles.statLabel}>💰 Заработано</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: Colors.primary }]}>{accuracy}%</Text>
            <Text style={styles.statLabel}>✅ Точность</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: Colors.warning }]}>{maxStreak}</Text>
            <Text style={styles.statLabel}>🔥 Серия</Text>
          </View>
        </View>

        {/* ANSWERS BREAKDOWN */}
        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>Результат</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Правильных ответов</Text>
            <Text style={[styles.breakdownVal, { color: Colors.success }]}>{correctAnswers}/{totalAnswers}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Максимальная серия</Text>
            <Text style={[styles.breakdownVal, { color: Colors.warning }]}>{maxStreak} 🔥</Text>
          </View>
        </View>

        {/* BUTTONS */}
        <View style={[styles.btns, isWide && styles.btnsWide]}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => { resetRun(); router.replace('/loadboard'); }}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.btnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.btnText}>🚛 Новый маршрут</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.replace('/')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnSecondaryText}>🏠 Главное меню</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60, alignItems: 'center' },
  scrollWide: { maxWidth: 600, alignSelf: 'center', width: '100%' },

  trophy: { fontSize: 80, marginBottom: 16 },
  gradeBadge: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, backgroundColor: 'rgba(0,0,0,0.3)',
  },
  gradeText: { fontSize: 32, fontWeight: '900' },

  title: { fontSize: 28, fontWeight: '900', color: Colors.text, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', marginBottom: 24, lineHeight: 22 },

  routeSummary: {
    backgroundColor: Colors.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    padding: 14, alignItems: 'center', marginBottom: 24, width: '100%',
  },
  routeText: { fontSize: 16, fontWeight: '800', color: Colors.text },
  routeCommodity: { fontSize: 12, color: Colors.textDim, marginTop: 2 },

  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20, width: '100%' },
  statsWide: { flexWrap: 'nowrap' },
  statCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: Colors.bgCard, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border,
    padding: 16, alignItems: 'center',
  },
  statVal: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 11, color: Colors.textDim, fontWeight: '600' },

  breakdown: {
    backgroundColor: Colors.bgCard, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border,
    padding: 16, width: '100%', marginBottom: 28, gap: 10,
  },
  breakdownTitle: { fontSize: 14, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  breakdownLabel: { fontSize: 13, color: Colors.textMuted },
  breakdownVal: { fontSize: 14, fontWeight: '700' },

  btns: { gap: 12, width: '100%' },
  btnsWide: { flexDirection: 'row' },
  btnPrimary: { borderRadius: 16, overflow: 'hidden', flex: 1 },
  btnGrad: { paddingVertical: 16, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '900', color: '#fff' },
  btnSecondary: {
    flex: 1, backgroundColor: Colors.bgCard,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
    paddingVertical: 16, alignItems: 'center',
  },
  btnSecondaryText: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
});
