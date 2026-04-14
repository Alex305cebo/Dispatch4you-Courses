import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useState } from 'react';
import { Colors } from '../constants/colors';
import { useGameStore, ActiveLoad } from '../store/gameStore';

interface Props {
  load: ActiveLoad;
  onClose: () => void;
}

const CANCEL_REASONS = [
  {
    id: 'breakdown',
    label: '🔧 Поломка трака',
    description: 'Механическая неисправность',
    tonuFee: 150,
    reputationHit: -5,
  },
  {
    id: 'hos_violation',
    label: '⏰ Нарушение HOS',
    description: 'Водитель не успевает по часам',
    tonuFee: 200,
    reputationHit: -8,
  },
  {
    id: 'driver_emergency',
    label: '🚨 Экстренная ситуация',
    description: 'Личная проблема водителя',
    tonuFee: 100,
    reputationHit: -3,
  },
  {
    id: 'weather',
    label: '🌨️ Погодные условия',
    description: 'Опасная погода на маршруте',
    tonuFee: 50,
    reputationHit: -2,
  },
  {
    id: 'better_rate',
    label: '💰 Нашли лучший груз',
    description: 'Отказ без уважительной причины',
    tonuFee: 300,
    reputationHit: -15,
  },
];

export default function CancelLoadModal({ load, onClose }: Props) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const { cancelLoad, brokers } = useGameStore();

  const reason = CANCEL_REASONS.find(r => r.id === selectedReason);
  const broker = brokers.find(b => b.name === load.brokerName);

  const handleCancel = () => {
    if (!reason) return;
    
    cancelLoad(load.id, {
      reason: reason.id,
      tonuFee: reason.tonuFee,
      reputationHit: reason.reputationHit,
    });
    
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.panel}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>🚫 Отменить груз</Text>
              <Text style={styles.subtitle}>Выберите причину отмены</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Load Info */}
          <View style={styles.loadInfo}>
            <Text style={styles.loadRoute}>{load.fromCity} → {load.toCity}</Text>
            <Text style={styles.loadDetails}>{load.commodity} · ${load.agreedRate.toLocaleString()}</Text>
            <Text style={styles.loadBroker}>Брокер: {load.brokerName}</Text>
          </View>

          {/* Warning */}
          <View style={styles.warning}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.warningTitle}>Последствия отмены</Text>
              <Text style={styles.warningText}>
                Брокер может выставить TONU fee (Truck Ordered Not Used) и ваша репутация пострадает
              </Text>
            </View>
          </View>

          {/* Reasons */}
          <ScrollView style={styles.reasonsList}>
            {CANCEL_REASONS.map(r => (
              <TouchableOpacity
                key={r.id}
                style={[
                  styles.reasonCard,
                  selectedReason === r.id && styles.reasonCardSelected,
                ]}
                onPress={() => setSelectedReason(r.id)}
                activeOpacity={0.7}
              >
                <View style={styles.reasonHeader}>
                  <Text style={styles.reasonLabel}>{r.label}</Text>
                  {selectedReason === r.id && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.reasonDesc}>{r.description}</Text>
                <View style={styles.reasonPenalty}>
                  <View style={styles.penaltyItem}>
                    <Text style={styles.penaltyLabel}>TONU Fee:</Text>
                    <Text style={styles.penaltyValue}>-${r.tonuFee}</Text>
                  </View>
                  <View style={styles.penaltyItem}>
                    <Text style={styles.penaltyLabel}>Репутация:</Text>
                    <Text style={[styles.penaltyValue, { color: '#ef4444' }]}>{r.reputationHit}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Confirmation */}
          {selectedReason && !confirming && (
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => setConfirming(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmBtnText}>Продолжить отмену</Text>
            </TouchableOpacity>
          )}

          {/* Final Confirmation */}
          {confirming && reason && (
            <View style={styles.finalConfirm}>
              <Text style={styles.finalTitle}>⚠️ Подтвердите отмену</Text>
              <View style={styles.finalSummary}>
                <Text style={styles.finalText}>Причина: {reason.label}</Text>
                <Text style={styles.finalText}>TONU Fee: -${reason.tonuFee}</Text>
                <Text style={styles.finalText}>Репутация с {load.brokerName}: {reason.reputationHit}</Text>
                {broker && (
                  <Text style={styles.finalText}>
                    Новая репутация: {broker.relationship + reason.reputationHit}/100
                  </Text>
                )}
              </View>
              <View style={styles.finalActions}>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setConfirming(false)}
                >
                  <Text style={styles.backBtnText}>← Назад</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelBtnText}>Отменить груз</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  panel: {
    backgroundColor: '#111827',
    borderRadius: 20,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
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
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#e5e7eb',
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
    color: '#e5e7eb',
  },
  loadInfo: {
    padding: 16,
    backgroundColor: 'rgba(6,182,212,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  loadRoute: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  loadDetails: {
    fontSize: 13,
    color: '#e5e7eb',
    marginBottom: 2,
  },
  loadBroker: {
    fontSize: 12,
    color: '#9ca3af',
  },
  warning: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  warningIcon: {
    fontSize: 24,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#e5e7eb',
    lineHeight: 16,
  },
  reasonsList: {
    flex: 1,
    padding: 16,
  },
  reasonCard: {
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 10,
  },
  reasonCardSelected: {
    borderColor: '#06b6d4',
    backgroundColor: 'rgba(6,182,212,0.08)',
  },
  reasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reasonLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  checkmark: {
    fontSize: 18,
    color: '#06b6d4',
  },
  reasonDesc: {
    fontSize: 12,
    color: '#e5e7eb',
    marginBottom: 10,
  },
  reasonPenalty: {
    flexDirection: 'row',
    gap: 16,
  },
  penaltyItem: {
    flex: 1,
  },
  penaltyLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 2,
  },
  penaltyValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fbbf24',
  },
  confirmBtn: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  finalConfirm: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  finalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  finalSummary: {
    padding: 14,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 10,
    marginBottom: 12,
    gap: 6,
  },
  finalText: {
    fontSize: 13,
    color: '#e5e7eb',
  },
  finalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  backBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e5e7eb',
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
