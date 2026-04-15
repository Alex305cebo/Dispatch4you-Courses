import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { useGameStore, TruckStatus } from '../store/gameStore';
import { cityState } from '../constants/config';

type FilterType = 'all' | 'active' | 'idle' | 'warning';

export default function FleetOverview() {
  const { trucks } = useGameStore();
  const [filter, setFilter] = useState<FilterType>('all');

  // Фильтрация траков
  const filteredTrucks = trucks.filter(truck => {
    if (filter === 'all') return true;
    if (filter === 'active') return truck.status === 'driving' || truck.status === 'loaded';
    if (filter === 'idle') return truck.status === 'idle';
    if (filter === 'warning') return truck.hoursLeft < 4 || truck.hosViolations > 0;
    return true;
  });

  // Общая статистика флота
  const totalMiles = trucks.reduce((sum, t) => sum + t.totalMiles, 0);
  const totalDeliveries = trucks.reduce((sum, t) => sum + t.totalDeliveries, 0);
  const avgSafety = Math.round(trucks.reduce((sum, t) => sum + t.safetyScore, 0) / trucks.length);
  const avgFuel = (trucks.reduce((sum, t) => sum + t.fuelEfficiency, 0) / trucks.length).toFixed(1);
  const avgOnTime = Math.round(trucks.reduce((sum, t) => sum + t.onTimeRate, 0) / trucks.length);

  const activeTrucks = trucks.filter(t => t.status === 'driving' || t.status === 'loaded').length;
  const idleTrucks = trucks.filter(t => t.status === 'idle').length;
  const warningTrucks = trucks.filter(t => t.hoursLeft < 4 || t.hosViolations > 0).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚛 Fleet Overview</Text>
        <Text style={styles.headerSub}>{trucks.length} trucks total</Text>
      </View>

      {/* Общая статистика */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Fleet Performance</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalMiles.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Miles</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalDeliveries}</Text>
            <Text style={styles.statLabel}>Deliveries</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.success }]}>{avgSafety}</Text>
            <Text style={styles.statLabel}>Avg Safety</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{avgFuel}</Text>
            <Text style={styles.statLabel}>Avg MPG</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.success }]}>{avgOnTime}%</Text>
            <Text style={styles.statLabel}>On-Time</Text>
          </View>
        </View>
      </View>

      {/* Фильтры */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({trucks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'active' && styles.filterBtnActive]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
            🚛 Active ({activeTrucks})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'idle' && styles.filterBtnActive]}
          onPress={() => setFilter('idle')}
        >
          <Text style={[styles.filterText, filter === 'idle' && styles.filterTextActive]}>
            ⚪ Idle ({idleTrucks})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'warning' && styles.filterBtnActive]}
          onPress={() => setFilter('warning')}
        >
          <Text style={[styles.filterText, filter === 'warning' && styles.filterTextActive]}>
            ⚠️ Warning ({warningTrucks})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Список траков */}
      <Text style={styles.sectionTitle}>
        {filter === 'all' ? 'All Trucks' : 
         filter === 'active' ? 'Active Trucks' :
         filter === 'idle' ? 'Idle Trucks' : 'Trucks Needing Attention'}
      </Text>

      {filteredTrucks.map(truck => {
        const statusColor = truck.status === 'driving' ? Colors.primary :
                           truck.status === 'loaded' ? Colors.success :
                           truck.status === 'idle' ? Colors.textDim :
                           truck.status === 'breakdown' ? Colors.danger : Colors.warning;

        return (
          <View key={truck.id} style={styles.truckCard}>
            <View style={styles.truckHeader}>
              <View style={styles.truckInfo}>
                <Text style={styles.truckName}>{truck.name}</Text>
                <Text style={styles.truckDriver}>{truck.driver}</Text>
              </View>
              <View style={[styles.truckStatus, { backgroundColor: `${statusColor}15`, borderColor: statusColor }]}>
                <Text style={[styles.truckStatusText, { color: statusColor }]}>
                  {truck.status.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Performance Metrics */}
            <View style={styles.performanceGrid}>
              <View style={styles.perfMetric}>
                <Text style={styles.perfValue}>{truck.safetyScore}</Text>
                <Text style={styles.perfLabel}>Safety</Text>
              </View>
              <View style={styles.perfMetric}>
                <Text style={styles.perfValue}>{truck.fuelEfficiency}</Text>
                <Text style={styles.perfLabel}>MPG</Text>
              </View>
              <View style={styles.perfMetric}>
                <Text style={styles.perfValue}>{truck.onTimeRate}%</Text>
                <Text style={styles.perfLabel}>On-Time</Text>
              </View>
              <View style={styles.perfMetric}>
                <Text style={styles.perfValue}>{truck.complianceRate}%</Text>
                <Text style={styles.perfLabel}>Compliance</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <Text style={styles.statText}>📍 {cityState(truck.currentCity)}</Text>
              <Text style={styles.statText}>🛣️ {truck.totalMiles.toLocaleString()} mi</Text>
              <Text style={styles.statText}>📦 {truck.totalDeliveries} loads</Text>
              <Text style={[styles.statText, truck.hoursLeft < 4 && { color: Colors.warning }]}>
                ⏰ {(Math.round(truck.hoursLeft * 10) / 10).toFixed(1)}h HOS
              </Text>
            </View>

            {/* Warnings */}
            {(truck.hoursLeft < 4 || truck.hosViolations > 0) && (
              <View style={styles.warningBox}>
                {truck.hoursLeft < 2 && (
                  <Text style={styles.warningText}>🚨 Critical: Less than 2h HOS remaining</Text>
                )}
                {truck.hoursLeft >= 2 && truck.hoursLeft < 4 && (
                  <Text style={styles.warningText}>⚠️ Warning: Low HOS hours</Text>
                )}
                {truck.hosViolations > 0 && (
                  <Text style={styles.warningText}>⚠️ {truck.hosViolations} HOS violation(s)</Text>
                )}
              </View>
            )}
          </View>
        );
      })}

      {filteredTrucks.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No trucks match this filter</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 12, gap: 12 },
  
  header: { marginBottom: 4 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 11, color: Colors.textDim, marginTop: 2 },

  statsCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  statsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 9,
    color: Colors.textDim,
    marginTop: 2,
  },

  filters: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnActive: {
    backgroundColor: 'rgba(6,182,212,0.15)',
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  filterTextActive: {
    color: Colors.primary,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 4,
  },

  truckCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 10,
  },
  truckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  truckInfo: { flex: 1 },
  truckName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  truckDriver: {
    fontSize: 11,
    color: Colors.textDim,
    marginTop: 2,
  },
  truckStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  truckStatusText: {
    fontSize: 9,
    fontWeight: '700',
  },

  performanceGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  perfMetric: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  perfValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  perfLabel: {
    fontSize: 9,
    color: Colors.textDim,
    marginTop: 2,
  },

  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statText: {
    fontSize: 10,
    color: Colors.textMuted,
  },

  warningBox: {
    backgroundColor: 'rgba(251,146,60,0.1)',
    borderRadius: 8,
    padding: 8,
    gap: 4,
  },
  warningText: {
    fontSize: 10,
    color: Colors.warning,
    fontWeight: '600',
  },

  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textDim,
  },
});
