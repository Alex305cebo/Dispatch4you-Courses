import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { useGameStore } from '../store/gameStore';

export default function FinancialDashboard() {
  const { financeLog, totalEarned, totalLost, balance, trucks } = useGameStore();
  const profit = totalEarned - totalLost;
  const incomes = financeLog.filter(f => f.type === 'income');
  const expenses = financeLog.filter(f => f.type === 'expense');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Финансовый отчёт</Text>
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Доходы</Text>
          <Text style={[styles.summaryVal, { color: Colors.success }]}>+${totalEarned.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Расходы</Text>
          <Text style={[styles.summaryVal, { color: Colors.danger }]}>-${totalLost.toLocaleString()}</Text>
        </View>
        <View style={[styles.summaryItem, styles.summaryTotal]}>
          <Text style={styles.summaryLabel}>Итого</Text>
          <Text style={[styles.summaryVal, { color: profit >= 0 ? Colors.success : Colors.danger }]}>
            {profit >= 0 ? '+' : ''}{profit.toLocaleString()}$
          </Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Доходы</Text>
      {incomes.length === 0 ? (
        <Text style={styles.empty}>Нет доходов</Text>
      ) : incomes.map((f, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.rowDesc}>{f.description}</Text>
          <Text style={[styles.rowVal, { color: Colors.success }]}>+${f.amount.toLocaleString()}</Text>
        </View>
      ))}
      <Text style={styles.sectionTitle}>Расходы</Text>
      {expenses.length === 0 ? (
        <Text style={styles.empty}>Нет расходов</Text>
      ) : expenses.map((f, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.rowDesc}>{f.description}</Text>
          <Text style={[styles.rowVal, { color: Colors.danger }]}>-${f.amount.toLocaleString()}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16 },
  title: { fontSize: 18, fontWeight: '900', color: '#fff', marginBottom: 16 },
  summary: { backgroundColor: Colors.bgCard, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14, gap: 10, marginBottom: 20 },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryTotal: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, marginTop: 4 },
  summaryLabel: { fontSize: 13, color: Colors.textMuted },
  summaryVal: { fontSize: 14, fontWeight: '800' },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: Colors.textDim, marginBottom: 8, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.bgCard, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, padding: 10, marginBottom: 6 },
  rowDesc: { flex: 1, fontSize: 12, color: Colors.textSecondary },
  rowVal: { fontSize: 12, fontWeight: '700' },
  empty: { fontSize: 12, color: Colors.textDim, fontStyle: 'italic', marginBottom: 12 },
});
