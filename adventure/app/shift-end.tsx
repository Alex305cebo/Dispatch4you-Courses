import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { useGameStore } from '../store/gameStore';

export default function ShiftEndScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { balance, totalEarned, totalLost, reputation, financeLog, trucks, resolvedEvents, startShift } = useGameStore();

  const profit = totalEarned - totalLost;
  const grade = profit > 10000 ? 'S' : profit > 6000 ? 'A' : profit > 3000 ? 'B' : profit > 0 ? 'C' : 'D';
  const gradeColor = { S: '#fbbf24', A: '#22c55e', B: '#06b6d4', C: '#f59e0b', D: '#ef4444' }[grade];

  const incomes = financeLog.filter(f => f.type === 'income');
  const expenses = financeLog.filter(f => f.type === 'expense');

  return (
    <LinearGradient colors={['#050a14', '#0a0f1e']} style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scroll, width >= 768 && styles.scrollWide]}>

        {/* GRADE */}
        <View style={styles.gradeWrap}>
          <Text style={styles.gradeEmoji}>{grade === 'S' ? '🏆' : grade === 'A' ? '🥇' : grade === 'B' ? '🥈' : grade === 'C' ? '🥉' : '📚'}</Text>
          <View style={[styles.gradeBadge, { borderColor: gradeColor }]}>
            <Text style={[styles.gradeText, { color: gradeColor }]}>{grade}</Text>
          </View>
          <Text style={styles.gradeTitle}>Смена завершена</Text>
          <Text style={styles.gradeSub}>
            {grade === 'S' ? 'Идеальная смена! Ты профессионал.' :
             grade === 'A' ? 'Отличная работа! Клиенты довольны.' :
             grade === 'B' ? 'Хороший результат. Есть куда расти.' :
             grade === 'C' ? 'Неплохо, но можно лучше.' :
             'Нужна практика. Попробуй ещё раз.'}
          </Text>
        </View>

        {/* P&L */}
        <View style={styles.pnl}>
          <Text style={styles.pnlTitle}>📊 Финансовый отчёт</Text>
          <View style={styles.pnlRow}>
            <Text style={styles.pnlLabel}>Доходы</Text>
            <Text style={[styles.pnlVal, { color: Colors.success }]}>+${totalEarned.toLocaleString()}</Text>
          </View>
          <View style={styles.pnlRow}>
            <Text style={styles.pnlLabel}>Расходы / Штрафы</Text>
            <Text style={[styles.pnlVal, { color: Colors.danger }]}>-${totalLost.toLocaleString()}</Text>
          </View>
          <View style={[styles.pnlRow, styles.pnlTotal]}>
            <Text style={styles.pnlTotalLabel}>Итого</Text>
            <Text style={[styles.pnlTotalVal, { color: profit >= 0 ? Colors.success : Colors.danger }]}>
              {profit >= 0 ? '+' : ''}{profit.toLocaleString()}$
            </Text>
          </View>
        </View>

        {/* ДЕТАЛИ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Доходы</Text>
          {incomes.map((f, i) => (
            <View key={i} style={styles.logRow}>
              <Text style={styles.logDesc}>{f.description}</Text>
              <Text style={[styles.logVal, { color: Colors.success }]}>+${f.amount.toLocaleString()}</Text>
            </View>
          ))}
          {incomes.length === 0 && <Text style={styles.logEmpty}>Нет доходов</Text>}
        </View>

        {incomes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📉 Расходы</Text>
            {expenses.map((f, i) => (
              <View key={i} style={styles.logRow}>
                <Text style={styles.logDesc}>{f.description}</Text>
                <Text style={[styles.logVal, { color: Colors.danger }]}>-${f.amount.toLocaleString()}</Text>
              </View>
            ))}
            {expenses.length === 0 && <Text style={styles.logEmpty}>Нет расходов</Text>}
          </View>
        )}

        {/* КНОПКИ */}
        <View style={styles.btns}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => { startShift(); router.replace('/game'); }}>
            <Text style={styles.btnPrimaryText}>🔄 Новая смена</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => router.replace('/')}>
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

  gradeWrap: { alignItems: 'center', marginBottom: 32 },
  gradeEmoji: { fontSize: 64, marginBottom: 12 },
  gradeBadge: {
    width: 60, height: 60, borderRadius: 30, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  gradeText: { fontSize: 30, fontWeight: '900' },
  gradeTitle: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 6 },
  gradeSub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },

  pnl: {
    width: '100%', backgroundColor: Colors.bgCard, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border, padding: 16, marginBottom: 16, gap: 10,
  },
  pnlTitle: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 4 },
  pnlRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pnlLabel: { fontSize: 13, color: Colors.textMuted },
  pnlVal: { fontSize: 13, fontWeight: '700' },
  pnlTotal: {
    borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, marginTop: 4,
  },
  pnlTotalLabel: { fontSize: 15, fontWeight: '800', color: '#fff' },
  pnlTotalVal: { fontSize: 18, fontWeight: '900' },

  section: {
    width: '100%', backgroundColor: Colors.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, padding: 14, marginBottom: 12, gap: 8,
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: Colors.textMuted, marginBottom: 4 },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logDesc: { flex: 1, fontSize: 12, color: Colors.textSecondary },
  logVal: { fontSize: 12, fontWeight: '700' },
  logEmpty: { fontSize: 12, color: Colors.textDim, fontStyle: 'italic' },

  btns: { width: '100%', gap: 10, marginTop: 8 },
  btnPrimary: {
    backgroundColor: Colors.success, borderRadius: 16, paddingVertical: 16, alignItems: 'center',
  },
  btnPrimaryText: { fontSize: 16, fontWeight: '900', color: '#fff' },
  btnSecondary: {
    backgroundColor: Colors.bgCard, borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  btnSecondaryText: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
});
