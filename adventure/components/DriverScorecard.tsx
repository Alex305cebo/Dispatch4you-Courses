import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { Truck } from '../store/gameStore';
import { cityState } from '../constants/config';

interface Props {
  truck: Truck | null;
  onClose: () => void;
}

export default function DriverScorecard({ truck, onClose }: Props) {
  if (!truck) return null;

  // Определяем рейтинг по safety score
  const getRating = (score: number) => {
    if (score >= 95) return { label: 'Excellent', color: Colors.success, icon: '⭐⭐⭐⭐⭐' };
    if (score >= 90) return { label: 'Very Good', color: Colors.success, icon: '⭐⭐⭐⭐' };
    if (score >= 80) return { label: 'Good', color: Colors.primary, icon: '⭐⭐⭐' };
    if (score >= 70) return { label: 'Fair', color: Colors.warning, icon: '⭐⭐' };
    return { label: 'Needs Improvement', color: Colors.danger, icon: '⭐' };
  };

  const rating = getRating(truck.safetyScore);
  
  // История последних грузов (симуляция)
  const recentLoads = [
    { from: 'Los Angeles CA', to: 'Phoenix AZ', miles: 373, rate: 1850, rpm: 4.96, onTime: true, date: '3 days ago' },
    { from: 'Phoenix AZ', to: 'Dallas TX', miles: 1067, rate: 2800, rpm: 2.62, onTime: true, date: '5 days ago' },
    { from: 'Dallas TX', to: 'Houston TX', miles: 239, rate: 950, rpm: 3.97, onTime: false, date: '7 days ago' },
  ];
  
  // Предпочтения водителя (AI анализ)
  const driverPreferences = {
    preferredLanes: ['West Coast', 'Southwest', 'Texas Triangle'],
    avoidedStates: ['NY', 'NJ', 'CA (LA traffic)'],
    preferredMiles: '500-800 miles/day',
    homeBase: 'Phoenix AZ',
    daysOutPreference: '10-14 days',
    equipmentExperience: ['Dry Van', 'Reefer'],
  };
  
  // AI рекомендации по маршрутам
  const aiRecommendations = {
    bestLanes: [
      { lane: 'Phoenix AZ → Dallas TX', reason: 'Высокая ставка ($2.80/mi), знакомый маршрут, 1067 миль', score: 95 },
      { lane: 'Los Angeles CA → Phoenix AZ', reason: 'Короткий хоп (373 mi), отличный RPM ($4.96/mi), близко к дому', score: 92 },
      { lane: 'Houston TX → Atlanta GA', reason: 'Длинный хол (789 mi), стабильный фрахт, хорошая ставка', score: 88 },
    ],
    avoidLanes: [
      { lane: 'New York NY → Boston MA', reason: 'Трафик, низкие ставки, водитель не любит Northeast', score: 35 },
      { lane: 'Los Angeles CA → Seattle WA', reason: 'Слишком длинный (1135 mi), водитель предпочитает Southwest', score: 42 },
    ],
  };
  
  // Финансовая аналитика
  const avgRPM = recentLoads.reduce((sum, load) => sum + load.rpm, 0) / recentLoads.length;
  const totalRevenue = recentLoads.reduce((sum, load) => sum + load.rate, 0);
  const totalMilesRecent = recentLoads.reduce((sum, load) => sum + load.miles, 0);
  const onTimePercentage = (recentLoads.filter(l => l.onTime).length / recentLoads.length) * 100;

  return (
    <Modal visible={true} transparent animationType="fade">
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.modal} 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Driver Performance & Analytics</Text>
                <Text style={styles.subtitle}>{truck.driver} • {truck.name}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Key Metrics - компактная сетка */}
            <View style={styles.metricsCompact}>
              <View style={styles.metricCompactCard}>
                <Text style={styles.metricCompactValue}>{truck.safetyScore}</Text>
                <Text style={styles.metricCompactLabel}>Safety</Text>
                <View style={styles.progressBarSmall}>
                  <View style={[styles.progressFill, { 
                    width: `${truck.safetyScore}%`,
                    backgroundColor: rating.color 
                  }]} />
                </View>
              </View>

              <View style={styles.metricCompactCard}>
                <Text style={[styles.metricCompactValue, { color: Colors.primary }]}>
                  {truck.fuelEfficiency}
                </Text>
                <Text style={styles.metricCompactLabel}>MPG</Text>
                <View style={styles.progressBarSmall}>
                  <View style={[styles.progressFill, { 
                    width: `${(truck.fuelEfficiency / 10) * 100}%`,
                    backgroundColor: truck.fuelEfficiency >= 7.0 ? Colors.success : Colors.warning
                  }]} />
                </View>
              </View>

              <View style={styles.metricCompactCard}>
                <Text style={[styles.metricCompactValue, { color: Colors.success }]}>
                  {truck.onTimeRate}%
                </Text>
                <Text style={styles.metricCompactLabel}>On-Time</Text>
                <View style={styles.progressBarSmall}>
                  <View style={[styles.progressFill, { 
                    width: `${truck.onTimeRate}%`,
                    backgroundColor: Colors.success 
                  }]} />
                </View>
              </View>

              <View style={styles.metricCompactCard}>
                <Text style={[styles.metricCompactValue, { 
                  color: truck.complianceRate >= 98 ? Colors.success : Colors.warning 
                }]}>
                  {truck.complianceRate}%
                </Text>
                <Text style={styles.metricCompactLabel}>HOS</Text>
                <View style={styles.progressBarSmall}>
                  <View style={[styles.progressFill, { 
                    width: `${truck.complianceRate}%`,
                    backgroundColor: truck.complianceRate >= 98 ? Colors.success : Colors.warning 
                  }]} />
                </View>
              </View>
            </View>

            {/* Recent Loads History */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📦 История последних грузов</Text>
              {recentLoads.map((load, i) => (
                <View key={i} style={styles.loadHistoryCard}>
                  <View style={styles.loadHistoryHeader}>
                    <Text style={styles.loadRoute}>
                      {load.from} → {load.to}
                    </Text>
                    <Text style={[styles.loadOnTime, { color: load.onTime ? Colors.success : Colors.danger }]}>
                      {load.onTime ? '✅ On Time' : '⚠️ Late'}
                    </Text>
                  </View>
                  <View style={styles.loadHistoryStats}>
                    <View style={styles.loadHistoryStat}>
                      <Text style={styles.loadHistoryLabel}>Мили</Text>
                      <Text style={styles.loadHistoryValue}>{load.miles}</Text>
                    </View>
                    <View style={styles.loadHistoryStat}>
                      <Text style={styles.loadHistoryLabel}>Ставка</Text>
                      <Text style={styles.loadHistoryValue}>${load.rate.toLocaleString()}</Text>
                    </View>
                    <View style={styles.loadHistoryStat}>
                      <Text style={styles.loadHistoryLabel}>RPM</Text>
                      <Text style={[styles.loadHistoryValue, { 
                        color: load.rpm >= 3.0 ? Colors.success : load.rpm >= 2.0 ? Colors.warning : Colors.danger 
                      }]}>
                        ${load.rpm}/mi
                      </Text>
                    </View>
                    <View style={styles.loadHistoryStat}>
                      <Text style={styles.loadHistoryLabel}>Когда</Text>
                      <Text style={styles.loadHistoryValue}>{load.date}</Text>
                    </View>
                  </View>
                </View>
              ))}
              
              {/* Financial Summary */}
              <View style={styles.financialSummary}>
                <Text style={styles.financialTitle}>💰 Финансовая сводка (последние 3 груза)</Text>
                <View style={styles.financialGrid}>
                  <View style={styles.financialItem}>
                    <Text style={styles.financialLabel}>Общий доход</Text>
                    <Text style={styles.financialValue}>${totalRevenue.toLocaleString()}</Text>
                  </View>
                  <View style={styles.financialItem}>
                    <Text style={styles.financialLabel}>Всего миль</Text>
                    <Text style={styles.financialValue}>{totalMilesRecent}</Text>
                  </View>
                  <View style={styles.financialItem}>
                    <Text style={styles.financialLabel}>Средний RPM</Text>
                    <Text style={[styles.financialValue, { 
                      color: avgRPM >= 3.0 ? Colors.success : avgRPM >= 2.0 ? Colors.warning : Colors.danger 
                    }]}>
                      ${avgRPM.toFixed(2)}/mi
                    </Text>
                  </View>
                  <View style={styles.financialItem}>
                    <Text style={styles.financialLabel}>On-Time %</Text>
                    <Text style={[styles.financialValue, { color: onTimePercentage >= 90 ? Colors.success : Colors.warning }]}>
                      {onTimePercentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Driver Preferences */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👤 Предпочтения водителя</Text>
              <View style={styles.preferenceCard}>
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>🎯 Любимые маршруты:</Text>
                  <Text style={styles.preferenceValue}>{driverPreferences.preferredLanes.join(', ')}</Text>
                </View>
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>🚫 Избегает:</Text>
                  <Text style={styles.preferenceValue}>{driverPreferences.avoidedStates.join(', ')}</Text>
                </View>
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>📏 Предпочитаемая дистанция:</Text>
                  <Text style={styles.preferenceValue}>{driverPreferences.preferredMiles}</Text>
                </View>
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>🏠 Домашняя база:</Text>
                  <Text style={styles.preferenceValue}>{driverPreferences.homeBase}</Text>
                </View>
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>📅 Дней в рейсе:</Text>
                  <Text style={styles.preferenceValue}>{driverPreferences.daysOutPreference}</Text>
                </View>
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>🚛 Опыт с оборудованием:</Text>
                  <Text style={styles.preferenceValue}>{driverPreferences.equipmentExperience.join(', ')}</Text>
                </View>
              </View>
            </View>

            {/* AI Recommendations */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🤖 AI Рекомендации по маршрутам</Text>
              
              <Text style={styles.aiSubtitle}>✅ Лучшие маршруты для этого водителя:</Text>
              {aiRecommendations.bestLanes.map((rec, i) => (
                <View key={i} style={styles.aiRecommendation}>
                  <View style={styles.aiRecommendationHeader}>
                    <Text style={styles.aiLane}>{rec.lane}</Text>
                    <View style={[styles.aiScore, { backgroundColor: 'rgba(34,197,94,0.2)' }]}>
                      <Text style={[styles.aiScoreText, { color: Colors.success }]}>{rec.score}</Text>
                    </View>
                  </View>
                  <Text style={styles.aiReason}>{rec.reason}</Text>
                </View>
              ))}
              
              <Text style={[styles.aiSubtitle, { marginTop: 12 }]}>⚠️ Избегать эти маршруты:</Text>
              {aiRecommendations.avoidLanes.map((rec, i) => (
                <View key={i} style={[styles.aiRecommendation, { borderLeftColor: Colors.danger }]}>
                  <View style={styles.aiRecommendationHeader}>
                    <Text style={styles.aiLane}>{rec.lane}</Text>
                    <View style={[styles.aiScore, { backgroundColor: 'rgba(239,68,68,0.2)' }]}>
                      <Text style={[styles.aiScoreText, { color: Colors.danger }]}>{rec.score}</Text>
                    </View>
                  </View>
                  <Text style={styles.aiReason}>{rec.reason}</Text>
                </View>
              ))}
            </View>

            {/* Statistics */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>📊 Career Statistics</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{truck.totalMiles.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Total Miles</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{truck.totalDeliveries}</Text>
                  <Text style={styles.statLabel}>Deliveries</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, truck.hosViolations > 0 && { color: Colors.danger }]}>
                    {truck.hosViolations}
                  </Text>
                  <Text style={styles.statLabel}>HOS Violations</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {Math.round(truck.totalMiles / truck.totalDeliveries)}
                  </Text>
                  <Text style={styles.statLabel}>Avg Miles/Load</Text>
                </View>
              </View>
            </View>

            {/* Current Status */}
            <View style={styles.statusSection}>
              <Text style={styles.sectionTitle}>📍 Current Status</Text>
              <View style={styles.statusGrid}>
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>Location</Text>
                  <Text style={styles.statusValue}>📍 {cityState(truck.currentCity)}</Text>
                </View>
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>HOS Remaining</Text>
                  <Text style={[styles.statusValue, truck.hoursLeft < 4 && { color: Colors.warning }]}>
                    ⏰ {truck.hoursLeft.toFixed(1)} hours
                  </Text>
                </View>
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>Mood</Text>
                  <Text style={[styles.statusValue, { 
                    color: truck.mood > 80 ? Colors.success : truck.mood > 60 ? Colors.warning : Colors.danger 
                  }]}>
                    {truck.mood > 80 ? '😊' : truck.mood > 60 ? '😐' : '😞'} {truck.mood}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Driver Details - дополнительная информация */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👤 Подробнее о водителе</Text>
              
              <View style={styles.driverDetailsCard}>
                <View style={styles.driverDetailRow}>
                  <Text style={styles.driverDetailLabel}>📅 Опыт работы:</Text>
                  <Text style={styles.driverDetailValue}>
                    {Math.floor(truck.totalDeliveries / 50)} лет ({truck.totalDeliveries} доставок)
                  </Text>
                </View>
                
                <View style={styles.driverDetailRow}>
                  <Text style={styles.driverDetailLabel}>🚛 Специализация:</Text>
                  <Text style={styles.driverDetailValue}>Dry Van, Reefer</Text>
                </View>
                
                <View style={styles.driverDetailRow}>
                  <Text style={styles.driverDetailLabel}>🏠 Домашняя база:</Text>
                  <Text style={styles.driverDetailValue}>Phoenix AZ</Text>
                </View>
                
                <View style={styles.driverDetailRow}>
                  <Text style={styles.driverDetailLabel}>📞 Связь:</Text>
                  <Text style={styles.driverDetailValue}>Отвечает быстро (avg 5 мин)</Text>
                </View>
                
                <View style={styles.driverDetailRow}>
                  <Text style={styles.driverDetailLabel}>⭐ Рейтинг брокеров:</Text>
                  <Text style={[styles.driverDetailValue, { color: Colors.success }]}>
                    4.9/5.0 (отличный)
                  </Text>
                </View>
                
                <View style={styles.driverDetailRow}>
                  <Text style={styles.driverDetailLabel}>🎯 Любимые маршруты:</Text>
                  <Text style={styles.driverDetailValue}>Southwest, Texas Triangle</Text>
                </View>
                
                <View style={styles.driverDetailRow}>
                  <Text style={styles.driverDetailLabel}>💰 Средний заработок:</Text>
                  <Text style={[styles.driverDetailValue, { color: Colors.primary }]}>
                    ${Math.round(avgRPM * 2500)}/неделя
                  </Text>
                </View>
                
                <View style={styles.driverDetailRow}>
                  <Text style={styles.driverDetailLabel}>🏆 Достижения:</Text>
                  <View style={styles.achievementBadges}>
                    {truck.safetyScore >= 95 && (
                      <View style={styles.achievementBadge}>
                        <Text style={styles.achievementText}>🛡️ Safe Driver</Text>
                      </View>
                    )}
                    {truck.onTimeRate >= 98 && (
                      <View style={styles.achievementBadge}>
                        <Text style={styles.achievementText}>⏰ Always On Time</Text>
                      </View>
                    )}
                    {truck.hosViolations === 0 && (
                      <View style={styles.achievementBadge}>
                        <Text style={styles.achievementText}>✅ HOS Master</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.driverDetailRow}>
                  <Text style={styles.driverDetailLabel}>📝 Заметки диспетчера:</Text>
                  <Text style={styles.driverDetailValue}>
                    {truck.mood > 80 
                      ? "Отличный водитель, всегда готов помочь. Предпочитает длинные хаулы."
                      : truck.mood > 60
                      ? "Надежный водитель, иногда нужна мотивация. Любит Southwest регион."
                      : "Требует внимания. Проверяй настроение чаще, предлагай бонусы."}
                  </Text>
                </View>
              </View>
            </View>

            {/* Recommendations */}
            <View style={styles.recommendationsSection}>
              <Text style={styles.sectionTitle}>💡 Recommendations</Text>
              {truck.safetyScore < 90 && (
                <View style={styles.recommendation}>
                  <Text style={styles.recommendationText}>
                    • Schedule safety training to improve driving score
                  </Text>
                </View>
              )}
              {truck.fuelEfficiency < 7.0 && (
                <View style={styles.recommendation}>
                  <Text style={styles.recommendationText}>
                    • Review fuel efficiency practices with driver
                  </Text>
                </View>
              )}
              {truck.hoursLeft < 4 && (
                <View style={styles.recommendation}>
                  <Text style={[styles.recommendationText, { color: Colors.warning }]}>
                    • ⚠️ Plan for mandatory rest break soon
                  </Text>
                </View>
              )}
              {truck.hosViolations > 0 && (
                <View style={styles.recommendation}>
                  <Text style={[styles.recommendationText, { color: Colors.danger }]}>
                    • 🚨 Review HOS violations and implement corrective actions
                  </Text>
                </View>
              )}
              {truck.mood < 70 && (
                <View style={styles.recommendation}>
                  <Text style={styles.recommendationText}>
                    • Check in with driver - low morale detected
                  </Text>
                </View>
              )}
              {avgRPM < 2.5 && (
                <View style={styles.recommendation}>
                  <Text style={styles.recommendationText}>
                    • Средний RPM низкий (${avgRPM.toFixed(2)}/mi) - торгуйся агрессивнее или ищи лучшие лейны
                  </Text>
                </View>
              )}
              {truck.safetyScore >= 95 && truck.complianceRate === 100 && truck.hosViolations === 0 && (
                <View style={styles.recommendation}>
                  <Text style={[styles.recommendationText, { color: Colors.success }]}>
                    • ✅ Excellent performance! Consider driver recognition program
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
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
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    overflow: 'hidden',
  },
  content: {
    padding: 14,
    gap: 10,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 18,
    color: Colors.textMuted,
    fontWeight: '700',
  },

  // Compact Metrics
  metricsCompact: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  metricCompactCard: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  metricCompactValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  metricCompactLabel: {
    fontSize: 10,
    color: '#cbd5e1',
    marginTop: 2,
    marginBottom: 4,
  },
  metricCompactNote: {
    fontSize: 12,
    marginTop: 2,
  },
  progressBarSmall: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  statsSection: {},
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 10,
    color: '#cbd5e1',
    marginTop: 3,
    textAlign: 'center',
  },

  statusSection: {},
  statusGrid: {
    gap: 6,
  },
  statusItem: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 10,
  },
  statusLabel: {
    fontSize: 10,
    color: '#cbd5e1',
    marginBottom: 3,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },

  recommendationsSection: {},
  recommendation: {
    backgroundColor: 'rgba(6,182,212,0.08)',
    borderRadius: 6,
    padding: 8,
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 11,
    color: '#e2e8f0',
    lineHeight: 15,
  },
  
  // Load History
  section: {
    marginTop: 4,
  },
  loadHistoryCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  loadHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  loadRoute: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
  },
  loadOnTime: {
    fontSize: 10,
    fontWeight: '700',
  },
  loadHistoryStats: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  loadHistoryStat: {
    flex: 1,
    minWidth: '22%',
  },
  loadHistoryLabel: {
    fontSize: 9,
    color: '#cbd5e1',
    marginBottom: 2,
  },
  loadHistoryValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  
  // Financial Summary
  financialSummary: {
    marginTop: 8,
    backgroundColor: 'rgba(6,182,212,0.08)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
  },
  financialTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  financialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  financialItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    padding: 8,
  },
  financialLabel: {
    fontSize: 9,
    color: '#cbd5e1',
    marginBottom: 3,
  },
  financialValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  
  // Driver Preferences
  preferenceCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  preferenceRow: {
    gap: 2,
  },
  preferenceLabel: {
    fontSize: 10,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  preferenceValue: {
    fontSize: 11,
    color: '#fff',
    lineHeight: 15,
  },
  
  // AI Recommendations
  aiSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 6,
    marginTop: 2,
  },
  aiRecommendation: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  aiRecommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiLane: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  aiScore: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  aiScoreText: {
    fontSize: 11,
    fontWeight: '800',
  },
  aiReason: {
    fontSize: 10,
    color: '#cbd5e1',
    lineHeight: 14,
  },
  
  // Driver Details
  driverDetailsCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  driverDetailRow: {
    gap: 4,
  },
  driverDetailLabel: {
    fontSize: 10,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  driverDetailValue: {
    fontSize: 11,
    color: '#fff',
    lineHeight: 16,
  },
  achievementBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  achievementBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(6,182,212,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
  },
  achievementText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#67e8f9',
  },
});
