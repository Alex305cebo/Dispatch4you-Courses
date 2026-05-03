import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../constants/themes';
import { cityState } from '../constants/config';
import { useGameStore, ActiveLoad } from '../store/gameStore';

interface Props {
  load: ActiveLoad;
  onClose: () => void;
  onAssigned?: (truckId: string) => void;
}

export default function AssignModal({ load, onClose, onAssigned }: Props) {
  const T = useTheme();
  const styles = useMemo(() => makeStyles(T), [T]);
  const { trucks, assignLoadToTruck } = useGameStore();
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const availableTrucks = trucks.filter(t => 
    t.status === 'idle' || t.status === 'at_delivery' || t.status === 'at_pickup'
  );

  function handleAssign(truckId: string) {
    if (assigningId) return; // уже назначаем
    setAssigningId(truckId);
    // Закрываем модал сразу — не ждём fetch
    onClose();
    onAssigned?.(truckId);
    // Назначаем в фоне
    assignLoadToTruck(load, truckId).catch(() => {});
    // Онбординг триггер
    try { (window as any).__onboardingTrigger?.('assign_load'); } catch {}
  }

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.overlay}>
        <View style={styles.modal} data-onboarding="assign-area">
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
                  style={[styles.truckCard, assigningId === truck.id && { borderColor: T.success, borderWidth: 2 }]}
                  onPress={() => handleAssign(truck.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.truckEmoji}>🚛</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.truckName}>{truck.name} · {truck.driver}</Text>
                    <Text style={styles.truckInfo}>
                      📍 {cityState(truck.currentCity)} · HOS: {(Math.round(truck.hoursLeft * 10) / 10).toFixed(1)}ч · Настроение: {truck.mood}%
                    </Text>
                    <Text style={styles.truckStatus}>{statusBadge}</Text>
                  </View>
                  <View style={[styles.assignBtn, assigningId === truck.id && { backgroundColor: '#16a34a' }]} pointerEvents="none">
                    <Text style={styles.assignBtnText}>
                      {assigningId === truck.id ? '✓ Назначен' : 'Назначить'}
                    </Text>
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

function makeStyles(T: ThemeColors) {
  return StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal: {
    backgroundColor: T.bgCard, borderRadius: 20,
    borderWidth: 1, borderColor: T.border, padding: 20,
    width: '100%', maxWidth: 480, maxHeight: '80%' as any,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 4 },
  },
  title: { fontSize: 18, fontWeight: '800', color: T.text, marginBottom: 4 },
  sub: { fontSize: 13, color: T.textMuted, marginBottom: 16 },
  trucks: { maxHeight: 400, marginBottom: 14 },
  truckCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: T.bgCardHover, borderRadius: 14,
    borderWidth: 1, borderColor: T.border, padding: 14,
  },
  truckEmoji: { fontSize: 28 },
  truckName: { fontSize: 14, fontWeight: '700', color: T.text },
  truckInfo: { fontSize: 11, color: T.textMuted, marginTop: 3 },
  truckStatus: { fontSize: 10, color: T.primary, marginTop: 2, fontWeight: '600' },
  assignBtn: {
    backgroundColor: T.success, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  assignBtnText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  cancelBtn: {
    padding: 12, alignItems: 'center',
    backgroundColor: T.bgCardHover, borderRadius: 12,
    borderWidth: 1, borderColor: T.border,
  },
  cancelText: { fontSize: 14, color: T.textMuted, fontWeight: '600' },
  });
}
