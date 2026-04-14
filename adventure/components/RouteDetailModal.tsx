import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { LoadOffer } from '../store/gameStore';
import { CITIES } from '../constants/config';

interface Props {
  load: LoadOffer | null;
  onClose: () => void;
  onBook?: () => void;
}

// Определяем Interstate по маршруту (упрощённо)
function getInterstates(fromCity: string, toCity: string): string[] {
  const routes: Record<string, string[]> = {
    'Atlanta-Dallas': ['I-20', 'I-30'],
    'Chicago-Houston': ['I-55', 'I-45'],
    'Los Angeles-Phoenix': ['I-10'],
    'New York-Miami': ['I-95'],
    'Seattle-Portland': ['I-5'],
  };
  const key = `${fromCity}-${toCity}`;
  return routes[key] || ['I-40', 'I-10']; // fallback
}

// Breakdown по штатам (mock)
function getStateBreakdown(miles: number): { state: string; miles: number }[] {
  const states = ['TX', 'LA', 'MS', 'AL'];
  const perState = Math.floor(miles / states.length);
  return states.map((state, i) => ({
    state,
    miles: i === states.length - 1 ? miles - perState * (states.length - 1) : perState,
  }));
}

export default function RouteDetailModal({ load, onClose, onBook }: Props) {
  if (!load) return null;

  const from = CITIES[load.fromCity];
  const to = CITIES[load.toCity];
  const interstates = getInterstates(load.fromCity, load.toCity);
  const stateBreakdown = getStateBreakdown(load.miles);
  const rpm = load.postedRate / load.miles;
  const estimatedTime = Math.ceil(load.miles / 55); // часов при 55mph

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>🛣️ Детали маршрута</Text>
                <Text style={styles.route}>{load.fromCity} → {load.toCity}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Main Stats */}
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{load.miles} mi</Text>
                <Text style={styles.statLabel}>Расстояние</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{estimatedTime}h</Text>
                <Text style={styles.statLabel}>Время в пути</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: rpm >= 2.5 ? '#22c55e' : rpm >= 2.0 ? '#f59e0b' : '#ef4444' }]}>
                  ${rpm.toFixed(2)}/mi
                </Text>
                <Text style={styles.statLabel}>Ставка</Text>
              </View>
            </View>

            {/* Interstates */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🛣️ Interstate маршрут</Text>
              <View style={styles.interstates}>
                {interstates.map((interstate, i) => (
                  <View key={i} style={styles.interstateChip}>
                    <Text style={styles.interstateText}>{interstate}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.hint}>Основные магистрали — хорошее покрытие, много заправок</Text>
            </View>

            {/* State Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 Breakdown по штатам</Text>
              {stateBreakdown.map((item, i) => (
                <View key={i} style={styles.stateRow}>
                  <View style={styles.stateLeft}>
                    <Text style={styles.stateFlag}>{item.state}</Text>
                    <Text style={styles.stateName}>{item.state}</Text>
                  </View>
                  <Text style={styles.stateMiles}>{item.miles} mi</Text>
                </View>
              ))}
            </View>

            {/* Fuel Stops */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⛽ Рекомендуемые заправки</Text>
              <View style={styles.fuelStop}>
                <Text style={styles.fuelName}>🛢️ Pilot Flying J — Little Rock, AR</Text>
                <Text style={styles.fuelDist}>~350 mi от старта</Text>
              </View>
              <View style={styles.fuelStop}>
                <Text style={styles.fuelName}>🛢️ Love's Travel Stop — Texarkana, TX</Text>
                <Text style={styles.fuelDist}>~550 mi от старта</Text>
              </View>
            </View>

            {/* Weigh Stations */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚖️ Weigh Stations на маршруте</Text>
              <Text style={styles.weighText}>📍 I-20 Exit 45 (LA) • I-30 Exit 12 (AR) • I-20 Exit 485 (TX)</Text>
              <Text style={styles.hint}>Все станции открыты 24/7 — будь готов к остановке</Text>
            </View>

            {/* Weather */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌤️ Погода по маршруту</Text>
              <View style={styles.weatherRow}>
                <Text style={styles.weatherCity}>🌤️ {load.fromCity}</Text>
                <Text style={styles.weatherTemp}>72°F Ясно</Text>
              </View>
              <View style={styles.weatherRow}>
                <Text style={styles.weatherCity}>⛅ Середина пути</Text>
                <Text style={styles.weatherTemp}>68°F Облачно</Text>
              </View>
              <View style={styles.weatherRow}>
                <Text style={styles.weatherCity}>🌤️ {load.toCity}</Text>
                <Text style={styles.weatherTemp}>75°F Ясно</Text>
              </View>
            </View>

            {/* Truck Recommendation */}
            <View style={[styles.section, styles.recommendation]}>
              <Text style={styles.recTitle}>💡 Рекомендация</Text>
              <Text style={styles.recText}>
                Этот маршрут идеален для сухого фургона. Хорошие дороги, минимум пробок. 
                Рекомендуем Unit 47 — он сейчас в {load.fromCity} и свободен.
              </Text>
            </View>

            {/* Action */}
            {onBook && (
              <TouchableOpacity style={styles.bookBtn} onPress={onBook} activeOpacity={0.85}>
                <Text style={styles.bookBtnText}>📞 Позвонить брокеру</Text>
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
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.bg.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  route: {
    fontSize: 14,
    color: Colors.primary,
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
    color: Colors.text.secondary,
  },
  stats: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: 'rgba(6,182,212,0.1)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 4,
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
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  interstates: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  interstateChip: {
    backgroundColor: 'rgba(6,182,212,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
  },
  interstateText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  hint: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  stateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  stateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stateFlag: {
    fontSize: 20,
  },
  stateName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  stateMiles: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  fuelStop: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  fuelName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  fuelDist: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  weighText: {
    fontSize: 13,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  weatherCity: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  weatherTemp: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  recommendation: {
    backgroundColor: 'rgba(6,182,212,0.08)',
    borderRadius: 12,
    margin: 20,
    marginTop: 0,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  recText: {
    fontSize: 13,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  bookBtn: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
});
