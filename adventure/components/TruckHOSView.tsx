import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { Truck } from '../store/gameStore';
import { cityState } from '../constants/config';

interface Props {
  truck: Truck | null;
  onClose: () => void;
}

// Круговой индикатор в стиле ZigZag
function CircularProgress({ 
  value, 
  max, 
  label, 
  color, 
  size = 80 
}: { 
  value: number; 
  max: number; 
  label: string; 
  color: string; 
  size?: number;
}) {
  const percentage = (value / max) * 100;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      <svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="6"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <View style={styles.circularContent}>
        <Text style={styles.circularValue}>{value}</Text>
        <Text style={styles.circularLabel}>{label}</Text>
      </View>
    </View>
  );
}

export default function TruckHOSView({ truck, onClose }: Props) {
  if (!truck) return null;

  // HOS breakdown (simplified - в реальности это сложнее)
  const breakTime = Math.max(0, 8 - truck.hoursLeft); // время на перерывах
  const drivingTime = Math.min(10, 11 - truck.hoursLeft); // время вождения
  const shiftTime = 14 - (truck.hoursLeft > 11 ? 14 - truck.hoursLeft : 0); // время смены
  const cycleTime = 60; // недельный цикл (упрощённо)

  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>{truck.driver}</Text>
                <Text style={styles.subtitle}>
                  {truck.name} • #{truck.id.replace('T', '82734')}
                </Text>
                <View style={[styles.statusBadge, { 
                  backgroundColor: truck.status === 'idle' ? 'rgba(34,197,94,0.15)' : 'rgba(6,182,212,0.15)',
                  borderColor: truck.status === 'idle' ? Colors.success : Colors.primary,
                }]}>
                  <View style={[styles.statusDot, { 
                    backgroundColor: truck.status === 'idle' ? Colors.success : Colors.primary 
                  }]} />
                  <Text style={[styles.statusText, { 
                    color: truck.status === 'idle' ? Colors.success : Colors.primary 
                  }]}>
                    {truck.status === 'idle' ? 'Connected' : 'Driving'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* HOS Circular Indicators - ZigZag Style */}
            <View style={styles.hosGrid}>
              <View style={styles.hosItem}>
                <CircularProgress 
                  value={breakTime} 
                  max={8} 
                  label="Break" 
                  color="#f59e0b" 
                  size={90}
                />
              </View>
              <View style={styles.hosItem}>
                <CircularProgress 
                  value={drivingTime} 
                  max={11} 
                  label="Driving" 
                  color="#22c55e" 
                  size={90}
                />
              </View>
              <View style={styles.hosItem}>
                <CircularProgress 
                  value={shiftTime} 
                  max={14} 
                  label="Shift" 
                  color="#8b5cf6" 
                  size={90}
                />
              </View>
              <View style={styles.hosItem}>
                <CircularProgress 
                  value={cycleTime} 
                  max={70} 
                  label="Cycle" 
                  color="#64748b" 
                  size={90}
                />
              </View>
            </View>

            {/* Current Location & Status */}
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationTitle}>📍 Current Location</Text>
                <TouchableOpacity style={styles.openBtn}>
                  <Text style={styles.openBtnText}>Open</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.locationAddress}>
                {cityState(truck.currentCity)}
              </Text>
              <Text style={styles.locationTime}>1 sec ago</Text>
              
              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <View style={styles.quickStat}>
                  <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(34,197,94,0.15)' }]}>
                    <Text style={styles.quickStatEmoji}>🚗</Text>
                  </View>
                  <View>
                    <Text style={styles.quickStatValue}>
                      {truck.currentLoad ? '65 mph' : '0 mph'}
                    </Text>
                    <Text style={styles.quickStatLabel}>Speed</Text>
                  </View>
                </View>
                
                <View style={styles.quickStat}>
                  <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(6,182,212,0.15)' }]}>
                    <Text style={styles.quickStatEmoji}>⛽</Text>
                  </View>
                  <View>
                    <Text style={styles.quickStatValue}>{Math.round((truck.fuelEfficiency / 8) * 100)}%</Text>
                    <Text style={styles.quickStatLabel}>Fuel</Text>
                  </View>
                </View>
                
                <View style={styles.quickStat}>
                  <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(139,92,246,0.15)' }]}>
                    <Text style={styles.quickStatEmoji}>📞</Text>
                  </View>
                  <View>
                    <Text style={styles.quickStatValue}>(216) 678-9110</Text>
                    <Text style={styles.quickStatLabel}>Phone</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Performance Metrics */}
            <View style={styles.metricsSection}>
              <Text style={styles.sectionTitle}>Performance Metrics</Text>
              
              <View style={styles.metricRow}>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricLabel}>Safety Score</Text>
                  <Text style={[styles.metricValue, { 
                    color: truck.safetyScore >= 95 ? Colors.success : 
                           truck.safetyScore >= 85 ? Colors.warning : Colors.danger 
                  }]}>
                    {truck.safetyScore}/100
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { 
                    width: `${truck.safetyScore}%`,
                    backgroundColor: truck.safetyScore >= 95 ? Colors.success : 
                                   truck.safetyScore >= 85 ? Colors.warning : Colors.danger
                  }]} />
                </View>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricLabel}>Fuel Efficiency</Text>
                  <Text style={[styles.metricValue, { color: Colors.primary }]}>
                    {truck.fuelEfficiency} MPG
                  </Text>
                </View>
                <Text style={styles.metricNote}>
                  {truck.fuelEfficiency >= 7.0 ? '✅ Above average' : '⚠️ Below average'}
                </Text>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricLabel}>On-Time Delivery</Text>
                  <Text style={[styles.metricValue, { color: Colors.success }]}>
                    {truck.onTimeRate}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { 
                    width: `${truck.onTimeRate}%`,
                    backgroundColor: Colors.success 
                  }]} />
                </View>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricLabel}>HOS Compliance</Text>
                  <Text style={[styles.metricValue, { 
                    color: truck.complianceRate >= 98 ? Colors.success : Colors.warning 
                  }]}>
                    {truck.complianceRate}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { 
                    width: `${truck.complianceRate}%`,
                    backgroundColor: truck.complianceRate >= 98 ? Colors.success : Colors.warning 
                  }]} />
                </View>
              </View>
            </View>

            {/* Career Stats */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Career Statistics</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{truck.totalMiles.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Total Miles</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{truck.totalDeliveries}</Text>
                  <Text style={styles.statLabel}>Deliveries</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={[styles.statValue, truck.hosViolations > 0 && { color: Colors.danger }]}>
                    {truck.hosViolations}
                  </Text>
                  <Text style={styles.statLabel}>HOS Violations</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {Math.round(truck.totalMiles / truck.totalDeliveries)}
                  </Text>
                  <Text style={styles.statLabel}>Avg Miles/Load</Text>
                </View>
              </View>
            </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '95%',
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    overflow: 'hidden',
  },
  content: {
    padding: 20,
    gap: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textDim,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 20,
    color: Colors.textMuted,
    fontWeight: '600',
  },

  // HOS Circular Indicators
  hosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    padding: 16,
  },
  hosItem: {
    alignItems: 'center',
  },
  circularContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularContent: {
    alignItems: 'center',
  },
  circularValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  circularLabel: {
    fontSize: 10,
    color: Colors.textDim,
    fontWeight: '600',
    marginTop: 2,
  },

  // Location Card
  locationCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  openBtn: {
    backgroundColor: 'rgba(6,182,212,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  openBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  locationAddress: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  locationTime: {
    fontSize: 11,
    color: Colors.textDim,
    marginBottom: 16,
  },
  quickStats: {
    gap: 12,
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatEmoji: {
    fontSize: 18,
  },
  quickStatValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  quickStatLabel: {
    fontSize: 10,
    color: Colors.textDim,
  },

  // Metrics Section
  metricsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  metricRow: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  metricInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textDim,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  metricNote: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Stats Section
  statsSection: {},
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textDim,
    textAlign: 'center',
  },
});
