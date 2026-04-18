import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Truck } from '../store/gameStore';

interface Props {
  truck: Truck;
  onClose: () => void;
  initialTab?: 'hos' | 'eld';
}

export default function HOSELDModal({ truck, onClose, initialTab = 'hos' }: Props) {
  const [activeTab, setActiveTab] = useState<'hos' | 'eld'>(initialTab);

  const drivingLimit = 11;
  const onDutyLimit = 14;
  const restRequired = 10;
  const hoursLeft = truck.hoursLeft ?? 11;
  const drivingUsed = drivingLimit - hoursLeft;
  const onDutyExtra = Math.min(3, (truck.totalDeliveries || 0) % 5) * 0.5;
  const onDutyUsed = Math.min(onDutyLimit, drivingUsed + onDutyExtra);
  const violations = truck.hosViolations ?? 0;
  const compliance = truck.complianceRate ?? 100;
  const statusColor = hoursLeft >= 4 ? '#22c55e' : hoursLeft >= 2 ? '#ffd60a' : '#ef4444';

  return (
    <Modal visible transparent animationType="fade">
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={s.modal} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          
          {/* Хедер с вкладками */}
          <View style={s.header}>
            <View style={s.tabs}>
              <TouchableOpacity 
                style={[s.tab, activeTab === 'hos' && s.tabActive]} 
                onPress={() => setActiveTab('hos')}
                activeOpacity={0.8}
              >
                <Text style={s.tabIcon}>📊</Text>
                <Text style={[s.tabText, activeTab === 'hos' && s.tabTextActive]}>HOS</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[s.tab, activeTab === 'eld' && s.tabActive]} 
                onPress={() => setActiveTab('eld')}
                activeOpacity={0.8}
              >
                <Text style={s.tabIcon}>📈</Text>
                <Text style={[s.tabText, activeTab === 'eld' && s.tabTextActive]}>ELD График</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={s.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Контент */}
          <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
            {activeTab === 'hos' ? (
              <View style={s.section}>
                <Text style={s.sectionTitle}>⏱ HOS Status — {truck.name}</Text>
                
                {/* Status Badge */}
                <View style={[s.statusBadge, { borderColor: statusColor + '55', backgroundColor: statusColor + '15' }]}>
                  <Text style={[s.statusText, { color: statusColor }]}>
                    {hoursLeft >= 4 ? '✅ Compliant' : hoursLeft >= 2 ? '⚠️ Running Low' : '🚨 Critical'}
                  </Text>
                  <Text style={s.statusSub}>{hoursLeft.toFixed(1)}h driving time left</Text>
                </View>

                {/* Bars */}
                <HosBar label="Driving" used={drivingUsed} total={drivingLimit} color={statusColor} />
                <HosBar label="On-Duty" used={onDutyUsed} total={onDutyLimit} color="#06b6d4" />
                <HosBar label="Rest Required" used={restRequired - (restRequired * (hoursLeft / drivingLimit))} total={restRequired} color="#22c55e" />

                {/* Stats */}
                <View style={s.statsRow}>
                  <View style={s.statBox}>
                    <Text style={s.statValue}>{violations}</Text>
                    <Text style={s.statLabel}>Violations</Text>
                  </View>
                  <View style={s.statBox}>
                    <Text style={[s.statValue, { color: '#22c55e' }]}>{compliance}%</Text>
                    <Text style={s.statLabel}>Compliance</Text>
                  </View>
                </View>

                {/* Info */}
                <View style={s.infoBox}>
                  <Text style={s.infoText}>💡 Federal HOS rules: 11h driving max, 14h on-duty max, 10h rest required.</Text>
                </View>
              </View>
            ) : (
              <View style={s.section}>
                <Text style={s.sectionTitle}>📈 ELD График — {truck.name}</Text>
                <Text style={[s.infoText, { textAlign: 'center', marginTop: 40, marginBottom: 40 }]}>
                  📊 ELD график в разработке
                </Text>
              </View>
            )}
          </ScrollView>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function HosBar({ label, used, total, color }: { label: string; used: number; total: number; color: string }) {
  const pct = Math.min(100, (used / total) * 100);
  const remaining = Math.max(0, total - used);

  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: '800', color }}>
          {used.toFixed(1)}h / {total}h
        </Text>
      </View>
      <View style={{ height: 18, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: 9 }} />
      </View>
      <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{remaining.toFixed(1)}h remaining</Text>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    backgroundColor: '#111827',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(6,182,212,0.3)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(6,182,212,0.05)',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tabActive: {
    backgroundColor: 'rgba(6,182,212,0.15)',
    borderColor: 'rgba(6,182,212,0.5)',
  },
  tabIcon: {
    fontSize: 18,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#06b6d4',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  closeText: {
    fontSize: 18,
    color: '#94a3b8',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 16,
  },
  statusBadge: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 2,
  },
  statusSub: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  statBox: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoBox: {
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(6,182,212,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
  },
  infoText: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
  },
});
