import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { useGameStore, LoadOffer, formatTimeWithDate } from '../store/gameStore';
import { cityState } from '../constants/config';

interface Props {
  load: LoadOffer | null;
  onClose: () => void;
  onNegotiate: () => void;
}

export default function LoadDetailModal({ load, onClose, onNegotiate }: Props) {
  const { trucks, gameMinute, brokers } = useGameStore();
  
  if (!load) return null;

  // Включаем траки которые скоро освободятся
  const availableTrucks = trucks.filter(t => 
    t.status === 'idle' || t.status === 'at_delivery' || t.status === 'at_pickup'
  );
  const rpm = load.postedRate / load.miles;
  const timeLeft = load.expiresAt - gameMinute;
  const isExpiringSoon = timeLeft < 20;
  const rpmColor = rpm >= 2.5 ? Colors.success : rpm >= 2.0 ? Colors.warning : Colors.danger;
  const equipmentIcon = load.equipment === 'Reefer' ? '❄️' : load.equipment === 'Flatbed' ? '🏗️' : '📦';
  
  const broker = brokers.find(b => b.name === load.brokerName);
  const deadhead = Math.floor(Math.random() * 150); // Примерное расстояние до погрузки
  const estimatedProfit = load.postedRate - (load.miles * 1.5) - 200; // Примерная прибыль

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.loadId}>Load #{load.id}</Text>
                {load.isUrgent && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentText}>🔥 HOT LOAD</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Route */}
            <View style={styles.route}>
              <View style={styles.routePoint}>
                <Text style={styles.routeLabel}>PICKUP</Text>
                <Text style={styles.routeCity}>{cityState(load.fromCity)}</Text>
                <Text style={styles.routeTime}>{formatTimeWithDate(load.pickupTime)}</Text>
              </View>
              <View style={styles.routeArrow}>
                <Text style={styles.miles}>{load.miles} mi</Text>
                <Text style={styles.arrow}>━━━━▶</Text>
              </View>
              <View style={[styles.routePoint, { alignItems: 'flex-end' }]}>
                <Text style={styles.routeLabel}>DELIVERY</Text>
                <Text style={styles.routeCity}>{cityState(load.toCity)}</Text>
                <Text style={styles.routeTime}>{formatTimeWithDate(load.deliveryTime)}</Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.content}>
            {/* Rate Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💰 Rate Information</Text>
              <View style={styles.rateGrid}>
                <View style={styles.rateBox}>
                  <Text style={styles.rateLabel}>Posted Rate</Text>
                  <Text style={styles.rateValue}>${load.postedRate.toLocaleString()}</Text>
                </View>
                <View style={styles.rateBox}>
                  <Text style={styles.rateLabel}>Per Mile</Text>
                  <Text style={[styles.rateValue, { color: rpmColor }]}>${rpm.toFixed(2)}</Text>
                </View>
                <View style={styles.rateBox}>
                  <Text style={styles.rateLabel}>Est. Profit</Text>
                  <Text style={[styles.rateValue, { color: estimatedProfit > 0 ? Colors.success : Colors.danger }]}>
                    ${estimatedProfit.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Load Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📦 Load Details</Text>
              <View style={styles.detailGrid}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Equipment:</Text>
                  <Text style={styles.detailValue}>{equipmentIcon} {load.equipment}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Commodity:</Text>
                  <Text style={styles.detailValue}>{load.commodity}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Weight:</Text>
                  <Text style={styles.detailValue}>{(load.weight / 1000).toFixed(1)}K lbs</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Distance:</Text>
                  <Text style={styles.detailValue}>{load.miles} miles</Text>
                </View>
                {load.equipment_notes && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Notes:</Text>
                    <Text style={styles.detailValue}>{load.equipment_notes}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Broker Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🤝 Broker Information</Text>
              <View style={styles.brokerCard}>
                <View style={styles.brokerHeader}>
                  <View>
                    <Text style={styles.brokerName}>{load.brokerName}</Text>
                    <Text style={styles.brokerCompany}>{load.brokerCompany}</Text>
                  </View>
                  {broker && (
                    <View style={styles.relationshipBadge}>
                      <Text style={styles.relationshipText}>
                        {broker.relationship >= 70 ? '⭐' : broker.relationship >= 40 ? '👍' : '👎'} {broker.relationship}%
                      </Text>
                    </View>
                  )}
                </View>
                {broker && (
                  <View style={styles.brokerStats}>
                    <Text style={styles.brokerStat}>📞 {broker.callsAnswered} calls</Text>
                    <Text style={styles.brokerStat}>📦 {broker.loadsCompleted} loads</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Trip Analysis */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Trip Analysis</Text>
              <View style={styles.analysisGrid}>
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>Deadhead</Text>
                  <Text style={styles.analysisValue}>{deadhead} mi</Text>
                </View>
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>Total Miles</Text>
                  <Text style={styles.analysisValue}>{deadhead + load.miles} mi</Text>
                </View>
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>Drive Time</Text>
                  <Text style={styles.analysisValue}>{Math.ceil(load.miles / 50)}h</Text>
                </View>
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>Expires In</Text>
                  <Text style={[styles.analysisValue, isExpiringSoon && { color: Colors.danger }]}>
                    {timeLeft} min
                  </Text>
                </View>
              </View>
            </View>

            {/* Available Trucks */}
            {availableTrucks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🚛 Available Trucks</Text>
                <View style={styles.trucksInfo}>
                  <Text style={styles.trucksText}>
                    {availableTrucks.length} truck{availableTrucks.length > 1 ? 's' : ''} available
                  </Text>
                  {availableTrucks.map(truck => {
                    let statusText = '';
                    if (truck.status === 'at_delivery') {
                      statusText = '🔄 Finishing delivery';
                    } else if (truck.status === 'at_pickup') {
                      statusText = '🔄 Finishing pickup';
                    } else {
                      statusText = '✅ Ready';
                    }
                    
                    return (
                      <View key={truck.id} style={styles.truckChip}>
                        <Text style={styles.truckChipText}>
                          {truck.name} · {truck.driver} · {truck.hoursLeft}h HOS
                        </Text>
                        <Text style={styles.truckStatus}>{statusText}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            {availableTrucks.length === 0 ? (
              <View style={styles.noTrucksWarning}>
                <Text style={styles.noTrucksText}>🚫 No available trucks</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity style={styles.bookBtn} onPress={onNegotiate}>
                  <Text style={styles.bookBtnText}>📞 Call Broker</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickBookBtn} onPress={onNegotiate}>
                  <Text style={styles.quickBookBtnText}>⚡ Quick Book at ${load.postedRate.toLocaleString()}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
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
    backgroundColor: '#0a0f1e',
    borderRadius: 20,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  loadId: {
    fontSize: 14,
    color: Colors.textDim,
    marginBottom: 4,
  },
  urgentBadge: {
    backgroundColor: 'rgba(249,115,22,0.2)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.4)',
    alignSelf: 'flex-start',
  },
  urgentText: { fontSize: 11, fontWeight: '800', color: '#f97316' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: { fontSize: 18, color: '#e5e7eb' },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routePoint: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 10,
    color: Colors.textDim,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  routeCity: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 2,
  },
  routeTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  routeArrow: {
    alignItems: 'center',
  },
  miles: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  arrow: {
    fontSize: 16,
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  rateGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  rateBox: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  rateLabel: {
    fontSize: 10,
    color: Colors.textDim,
    marginBottom: 4,
  },
  rateValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  detailGrid: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textDim,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  brokerCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  brokerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  brokerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  brokerCompany: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  relationshipBadge: {
    backgroundColor: 'rgba(6,182,212,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  relationshipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  brokerStats: {
    flexDirection: 'row',
    gap: 16,
  },
  brokerStat: {
    fontSize: 11,
    color: Colors.textDim,
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  analysisItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  analysisLabel: {
    fontSize: 10,
    color: Colors.textDim,
    marginBottom: 4,
  },
  analysisValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  trucksInfo: {
    gap: 8,
  },
  trucksText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  truckChip: {
    backgroundColor: 'rgba(6,182,212,0.1)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
  },
  truckChipText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  truckStatus: {
    fontSize: 10,
    color: Colors.textDim,
    marginTop: 2,
  },
  actions: {
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  noTrucksWarning: {
    padding: 14,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  noTrucksText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.danger,
    textAlign: 'center',
  },
  bookBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  bookBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  quickBookBtn: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  quickBookBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.success,
  },
});
