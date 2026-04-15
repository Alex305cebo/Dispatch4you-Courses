import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { useGameStore } from '../store/gameStore';

export default function ComplianceDashboard() {
  const { trucks } = useGameStore();

  // Статистика по compliance
  const totalTrucks = trucks.length;
  const compliantTrucks = trucks.filter(t => t.hoursLeft >= 4 && t.hosViolations === 0).length;
  const warningTrucks = trucks.filter(t => t.hoursLeft < 4 && t.hoursLeft >= 2).length;
  const criticalTrucks = trucks.filter(t => t.hoursLeft < 2 || t.hosViolations > 0).length;
  const avgCompliance = Math.round(trucks.reduce((sum, t) => sum + t.complianceRate, 0) / totalTrucks);
  const totalViolations = trucks.reduce((sum, t) => sum + t.hosViolations, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Compliance Dashboard</Text>
        <Text style={styles.headerSub}>Real-time HOS monitoring</Text>
      </View>

      {/* Общая статистика */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderColor: Colors.success }]}>
          <Text style={styles.statValue}>{compliantTrucks}/{totalTrucks}</Text>
          <Text style={styles.statLabel}>✅ Compliant</Text>
        </View>
        <View style={[styles.statCard, { borderColor: Colors.warning }]}>
          <Text style={[styles.statValue, { color: Colors.warning }]}>{warningTrucks}</Text>
          <Text style={styles.statLabel}>⚠️ Warning</Text>
        </View>
        <View style={[styles.statCard, { borderColor: Colors.danger }]}>
          <Text style={[styles.statValue, { color: Colors.danger }]}>{criticalTrucks}</Text>
          <Text style={styles.statLabel}>🚨 Critical</Text>
        </View>
        <View style={[styles.statCard, { borderColor: Colors.primary }]}>
          <Text style={styles.statValue}>{avgCompliance}%</Text>
          <Text style={styles.statLabel}>📈 Avg Rate</Text>
        </View>
      </View>

      {/* Violations Summary */}
      {totalViolations > 0 && (
        <View style={styles.violationsCard}>
          <Text style={styles.violationsTitle}>⚠️ HOS Violations Today</Text>
          <Text style={styles.violationsCount}>{totalViolations} total violations</Text>
          <Text style={styles.violationsText}>
            Review driver logs and take corrective action
          </Text>
        </View>
      )}

      {/* Список водителей */}
      <Text style={styles.sectionTitle}>Driver Status</Text>
      {trucks.map(truck => {
        const status = truck.hoursLeft >= 4 ? 'ok' : truck.hoursLeft >= 2 ? 'warning' : 'critical';
        const statusColor = status === 'ok' ? Colors.success : status === 'warning' ? Colors.warning : Colors.danger;
        const statusIcon = status === 'ok' ? '✅' : status === 'warning' ? '⚠️' : '🚨';

        return (
          <View key={truck.id} style={[styles.driverCard, { borderLeftColor: statusColor }]}>
            <View style={styles.driverTop}>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{truck.driver}</Text>
                <Text style={styles.driverTruck}>{truck.name}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15`, borderColor: statusColor }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {statusIcon} {status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={[styles.metricValue, { color: statusColor }]}>{(Math.round(truck.hoursLeft * 10) / 10).toFixed(1)}h</Text>
                <Text style={styles.metricLabel}>HOS Left</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{truck.complianceRate}%</Text>
                <Text style={styles.metricLabel}>Compliance</Text>
              </View>
              <View style={styles.metric}>
                <Text style={[styles.metricValue, truck.hosViolations > 0 && { color: Colors.danger }]}>
                  {truck.hosViolations}
                </Text>
                <Text style={styles.metricLabel}>Violations</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{truck.safetyScore}</Text>
                <Text style={styles.metricLabel}>Safety</Text>
              </View>
            </View>

            {truck.hosViolations > 0 && (
              <View style={styles.violationAlert}>
                <Text style={styles.violationText}>
                  ⚠️ {truck.hosViolations} HOS violation(s) - Review required
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 12, gap: 12 },
  
  header: { marginBottom: 4 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 11, color: Colors.textDim, marginTop: 2 },

  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.success,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textDim,
    marginTop: 4,
    textAlign: 'center',
  },

  violationsCard: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 2,
    borderColor: Colors.danger,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  violationsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.danger,
    marginBottom: 4,
  },
  violationsCount: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.danger,
    marginBottom: 6,
  },
  violationsText: {
    fontSize: 11,
    color: Colors.textMuted,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 8,
    marginTop: 4,
  },

  driverCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 8,
  },
  driverTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  driverInfo: { flex: 1 },
  driverName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  driverTruck: {
    fontSize: 11,
    color: Colors.textDim,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  metricLabel: {
    fontSize: 9,
    color: Colors.textDim,
    marginTop: 2,
  },

  violationAlert: {
    marginTop: 10,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 8,
    padding: 8,
  },
  violationText: {
    fontSize: 10,
    color: Colors.danger,
    fontWeight: '600',
  },
});
