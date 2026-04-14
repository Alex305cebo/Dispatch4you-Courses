import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { useGameStore } from '../store/gameStore';
import { cityState } from '../constants/config';

interface Props {
  cityName: string | null;
  onClose: () => void;
  onShowLoads: () => void;
}

export default function CityDetailModal({ cityName, onClose, onShowLoads }: Props) {
  const { availableLoads, trucks } = useGameStore();
  
  if (!cityName) return null;

  // Грузы из этого города
  const loadsFromCity = availableLoads.filter(l => l.fromCity === cityName);
  const avgRate = loadsFromCity.length > 0
    ? loadsFromCity.reduce((sum, l) => sum + (l.postedRate / l.miles), 0) / loadsFromCity.length
    : 0;

  // Траки рядом
  const trucksNearby = trucks.filter(t => t.currentCity === cityName);

  // Топ направления
  const destinations = loadsFromCity.reduce((acc, l) => {
    const key = l.toCity;
    if (!acc[key]) acc[key] = { city: key, count: 0, avgRate: 0, totalRate: 0 };
    acc[key].count++;
    acc[key].totalRate += l.postedRate / l.miles;
    return acc;
  }, {} as Record<string, { city: string; count: number; avgRate: number; totalRate: number }>);

  const topDestinations = Object.values(destinations)
    .map(d => ({ ...d, avgRate: d.totalRate / d.count }))
    .sort((a, b) => b.avgRate - a.avgRate)
    .slice(0, 3);

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.cityName}>📍 {cityState(cityName)}</Text>
                <Text style={styles.subtitle}>Информация о городе</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{loadsFromCity.length}</Text>
                <Text style={styles.statLabel}>Доступно грузов</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>${avgRate.toFixed(2)}/mi</Text>
                <Text style={styles.statLabel}>Средняя ставка</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{trucksNearby.length}</Text>
                <Text style={styles.statLabel}>Твои траки</Text>
              </View>
            </View>

            {/* Trucks Nearby */}
            {trucksNearby.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🚛 Твои траки здесь</Text>
                {trucksNearby.map(truck => (
                  <View key={truck.id} style={styles.truckItem}>
                    <Text style={styles.truckName}>{truck.name} — {truck.driver}</Text>
                    <Text style={styles.truckStatus}>
                      {truck.status === 'idle' ? '✅ Свободен' :
                       truck.status === 'at_delivery' ? '📦 Разгружается' :
                       '🚛 В пути'}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Top Destinations */}
            {topDestinations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔥 Горячие направления</Text>
                {topDestinations.map((dest, i) => (
                  <View key={dest.city} style={styles.destItem}>
                    <View style={styles.destLeft}>
                      <Text style={styles.destRank}>#{i + 1}</Text>
                      <Text style={styles.destCity}>{cityState(dest.city)}</Text>
                    </View>
                    <View style={styles.destRight}>
                      <Text style={styles.destRate}>${dest.avgRate.toFixed(2)}/mi</Text>
                      <Text style={styles.destCount}>{dest.count} груз{dest.count > 1 ? 'а' : ''}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Weather */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌤️ Погода</Text>
              <Text style={styles.weatherText}>☀️ Ясно, 72°F • Отличные условия для погрузки</Text>
            </View>

            {/* Action */}
            {loadsFromCity.length > 0 && (
              <TouchableOpacity style={styles.actionBtn} onPress={onShowLoads} activeOpacity={0.85}>
                <Text style={styles.actionBtnText}>
                  📋 Показать {loadsFromCity.length} груз{loadsFromCity.length > 1 ? 'а' : ''} из {cityState(cityName)}
                </Text>
              </TouchableOpacity>
            )}

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1a2332',
    borderRadius: 20,
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    borderWidth: 2,
    borderColor: 'rgba(6,182,212,0.4)',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  cityName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: '#94a3b8',
  },
  stats: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: 'rgba(6,182,212,0.15)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#67e8f9',
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    paddingTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 1,
  },
  truckItem: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  truckName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  truckStatus: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  destItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  destLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  destRank: {
    fontSize: 16,
    fontWeight: '700',
    color: '#67e8f9',
  },
  destCity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  destRight: {
    alignItems: 'flex-end',
  },
  destRate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4ade80',
  },
  destCount: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  weatherText: {
    fontSize: 14,
    color: '#e2e8f0',
  },
  actionBtn: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#06b6d4',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
