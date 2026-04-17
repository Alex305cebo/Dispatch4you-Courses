import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { cityState } from '../constants/config';
import { useGameStore, ActiveLoad } from '../store/gameStore';

interface Props {
  load: ActiveLoad;
  onClose: () => void;
  onAssigned?: (truckId: string) => void;
}

export default function AssignModal({ load, onClose, onAssigned }: Props) {
  const { trucks, assignLoadToTruck } = useGameStore();
  // Включаем траки которые скоро освободятся
  const availableTrucks = trucks.filter(t => 
    t.status === 'idle' || t.status === 'at_delivery' || t.status === 'at_pickup'
  );

  async function handleAssign(truckId: string) {
    await assignLoadToTruck(load, truckId);
    onClose();
    onAssigned?.(truckId);
  }

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>🚛 Назначить водителя</Text>
          <Text style={styles.sub}>
            {cityState(load.fromCity)} → {cityState(load.toCity)} · ${(load.agreedRate ?? load.postedRate).toLocaleString()}
          </Text>

          <ScrollView style={styles.trucks} contentContainerStyle={{ gap: 10 }} showsVerticalScrollIndicator={false}>
            {availableTrucks.map(truck => {
              let statusBadge = '';
              if (truck.status === 'at_delivery') {
                statusBadge = '🔄 Заканчивает разгрузку';
              } else if (truck.status === 'at_pickup') {
                statusBadge = '🔄 Заканчивает погрузку';
              } else {
                statusBadge = '✅ Свободен';
              }
              return (
                <TouchableOpacity
                  key={truck.id}
                  style={styles.truckCard}
                  onPress={() => handleAssign(truck.id)}
                >
                  <Text style={styles.truckEmoji}>🚛</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.truckName}>{truck.name} · {truck.driver}</Text>
                    <Text style={styles.truckInfo}>
                      📍 {cityState(truck.currentCity)} · HOS: {(Math.round(truck.hoursLeft * 10) / 10).toFixed(1)}ч · Настроение: {truck.mood}%
                    </Text>
                    <Text style={styles.truckStatus}>{statusBadge}</Text>
                  </View>
                  <View style={styles.assignBtn}>
                    <Text style={styles.assignBtnText}>Назначить</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal: {
    backgroundColor: '#0f172a', borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, padding: 20,
    width: '100%', maxWidth: 480, maxHeight: '80%' as any,
  },
  title: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
  sub: { fontSize: 13, color: Colors.textMuted, marginBottom: 16 },
  trucks: { maxHeight: 400, marginBottom: 14 },
  truckCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, padding: 14,
  },
  truckEmoji: { fontSize: 28 },
  truckName: { fontSize: 14, fontWeight: '700', color: '#fff' },
  truckInfo: { fontSize: 11, color: Colors.textMuted, marginTop: 3 },
  truckStatus: { fontSize: 10, color: Colors.primary, marginTop: 2, fontWeight: '600' },
  assignBtn: {
    backgroundColor: Colors.success, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  assignBtnText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  cancelBtn: {
    padding: 12, alignItems: 'center',
    backgroundColor: Colors.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  cancelText: { fontSize: 14, color: Colors.textMuted, fontWeight: '600' },
});
