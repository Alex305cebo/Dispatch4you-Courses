import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { Truck } from '../store/gameStore';
import { cityState } from '../constants/config';
import DriverScorecard from './DriverScorecard';
import ELDGraph from './ELDGraph';

interface Props {
  truck: Truck | null;
  onClose: () => void;
  onFindLoad: () => void;
}

export default function TruckDetailModal({ truck, onClose, onFindLoad }: Props) {
  const [showScorecard, setShowScorecard] = useState(false);
  
  if (!truck) return null;

  const hoursWorked = 11 - truck.hoursLeft;
  const needsRest = truck.hoursLeft < 2;
  const rpm = truck.currentLoad ? (truck.currentLoad.agreedRate / truck.currentLoad.miles).toFixed(2) : '0.00';

  // ─── АНАЛИТИКА И РЕКОМЕНДАЦИИ ───────────────────────────────────────────────
  
  // Текущий статус трака
  let currentStatus = '';
  let statusColor = '';
  let statusIcon = '';
  
  if (truck.status === 'loaded') {
    const eta = Math.round((1 - truck.progress) * (truck.currentLoad?.miles || 1000) / 60); // часы
    currentStatus = `Везёт груз → ${cityState(truck.destinationCity!)}`;
    statusColor = '#67e8f9';
    statusIcon = '🚛';
  } else if (truck.status === 'driving') {
    const eta = Math.round((1 - truck.progress) * 500 / 60);
    currentStatus = `Едет к погрузке → ${cityState(truck.destinationCity!)}`;
    statusColor = '#06b6d4';
    statusIcon = '🚛';
  } else if (truck.status === 'at_delivery') {
    currentStatus = `На разгрузке в ${cityState(truck.currentCity)}`;
    statusColor = '#fbbf24';
    statusIcon = '📦';
  } else if (truck.status === 'at_pickup') {
    currentStatus = `На погрузке в ${cityState(truck.currentCity)}`;
    statusColor = '#f59e0b';
    statusIcon = '📦';
  } else if (truck.status === 'idle') {
    currentStatus = `Свободен в ${cityState(truck.currentCity)}`;
    statusColor = '#4ade80';
    statusIcon = '✅';
  } else if (truck.status === 'breakdown') {
    currentStatus = `Поломка в ${cityState(truck.currentCity)}`;
    statusColor = '#ef4444';
    statusIcon = '⚠️';
  }

  // Что делать дальше (приоритетные действия)
  const nextActions: Array<{ priority: 'critical' | 'high' | 'medium' | 'low'; text: string; icon: string }> = [];
  
  if (truck.status === 'at_delivery' || truck.status === 'idle') {
    nextActions.push({
      priority: 'critical',
      text: `Найти груз из ${cityState(truck.currentCity)} (deadhead = 0 миль)`,
      icon: '🔍'
    });
  }
  
  if (truck.status === 'loaded' && truck.progress > 0.7) {
    nextActions.push({
      priority: 'high',
      text: `Начать искать следующий груз из ${cityState(truck.destinationCity!)}`,
      icon: '📋'
    });
  }
  
  if (needsRest) {
    nextActions.push({
      priority: 'critical',
      text: 'Водитель скоро должен отдыхать! Учти это при планировании',
      icon: '⏰'
    });
  }
  
  if (truck.mood < 70) {
    nextActions.push({
      priority: 'medium',
      text: 'Настроение водителя падает — позвони, поддержи',
      icon: '📞'
    });
  }
  
  if (truck.currentLoad && parseFloat(rpm) < 2.0) {
    nextActions.push({
      priority: 'low',
      text: `Низкая ставка ($${rpm}/mi) — в следующий раз торгуйся лучше`,
      icon: '💰'
    });
  }
  
  if (truck.status === 'loaded' || truck.status === 'driving') {
    nextActions.push({
      priority: 'low',
      text: 'Мониторь прогресс — проверяй каждые 2 часа',
      icon: '📡'
    });
  }

  // AI подсказка (главная рекомендация)
  let aiAdvice = '';
  if (truck.status === 'at_delivery') {
    aiAdvice = `🎯 ГЛАВНОЕ: Водитель разгружается прямо сейчас. Открой Load Board и найди груз из ${cityState(truck.currentCity)} — это даст тебе 0 deadhead миль и максимальную прибыль!`;
  } else if (truck.status === 'loaded') {
    const eta = Math.round((1 - truck.progress) * (truck.currentLoad?.miles || 1000) / 60);
    aiAdvice = `🎯 ГЛАВНОЕ: Трак приедет в ${cityState(truck.destinationCity!)} через ~${eta}ч. Уже сейчас можешь начать искать следующий груз оттуда — не теряй время!`;
  } else if (truck.status === 'idle') {
    aiAdvice = `🎯 ГЛАВНОЕ: Трак простаивает! Каждая минута без груза = потерянные деньги. Срочно открой Load Board и найди груз из ${cityState(truck.currentCity)}.`;
  } else if (truck.status === 'at_pickup') {
    aiAdvice = `🎯 ГЛАВНОЕ: Водитель грузится. Скоро поедет в ${cityState(truck.destinationCity!)} — можешь уже искать следующий груз оттуда.`;
  } else if (truck.status === 'driving') {
    const eta = Math.round((1 - truck.progress) * 500 / 60);
    aiAdvice = `🎯 ГЛАВНОЕ: Трак едет к погрузке (прибудет через ~${eta}ч). Пока всё идёт по плану — мониторь прогресс.`;
  }

  // HOS Logbook - визуализация как в настоящем ELD (США стандарт)
  // Создаём реалистичный график с переходами между статусами
  
  // Симуляция реального дня водителя
  const eldPoints: Array<{ hour: number; status: 'OFF' | 'SB' | 'D' | 'ON' }> = [];
  
  // Пример реального дня (как на скриншоте):
  // 00:00-06:00 = SB (спал в sleeper berth)
  // 06:00-07:00 = ON (pre-trip inspection, paperwork)
  // 07:00-11:00 = D (driving)
  // 11:00-11:30 = OFF (30-min break)
  // 11:30-14:00 = D (driving)
  // 14:00+ = текущий статус
  
  const currentHour = 6 + hoursWorked;
  
  // Строим точки графика (каждые 15 минут для плавности)
  for (let h = 0; h <= 24; h += 0.25) {
    let status: 'OFF' | 'SB' | 'D' | 'ON' = 'OFF';
    
    if (h < 6) {
      status = 'SB'; // Ночной отдых
    } else if (h >= 6 && h < 7) {
      status = 'ON'; // Pre-trip, paperwork
    } else if (h >= 7 && h < 11) {
      status = 'D'; // Driving
    } else if (h >= 11 && h < 11.5) {
      status = 'OFF'; // 30-min break
    } else if (h >= 11.5 && h < currentHour) {
      // Продолжаем работать
      if (truck.status === 'loaded' || truck.status === 'driving') {
        status = 'D';
      } else if (truck.status === 'at_pickup' || truck.status === 'at_delivery') {
        status = 'ON';
      } else {
        status = 'D';
      }
    } else if (h >= currentHour && h < currentHour + 0.5) {
      // Текущий момент
      if (truck.status === 'loaded' || truck.status === 'driving') {
        status = 'D';
      } else if (truck.status === 'at_pickup' || truck.status === 'at_delivery') {
        status = 'ON';
      } else if (truck.status === 'idle') {
        status = 'OFF';
      } else {
        status = 'D';
      }
    } else {
      status = 'OFF'; // Будущее
    }
    
    eldPoints.push({ hour: h, status });
  }

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
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
          <ScrollView>
            {/* Header - стильный и кликабельный */}
            <View style={styles.headerContainer}>
              <TouchableOpacity 
                style={styles.driverHeader} 
                onPress={() => setShowScorecard(true)}
                activeOpacity={0.8}
              >
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverAvatarText}>👤</Text>
                </View>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{truck.driver}</Text>
                  <Text style={styles.truckNameSub}>{truck.name}</Text>
                  <View style={styles.driverBadges}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>⭐ {truck.safetyScore}</Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>🎯 {truck.onTimeRate}%</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.driverArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </TouchableOpacity>
              
              {/* Quick Load Search Block */}
              {(truck.status === 'idle' || truck.status === 'at_delivery' || truck.status === 'at_pickup') && (
                <TouchableOpacity 
                  style={styles.quickLoadSearch}
                  onPress={onFindLoad}
                  activeOpacity={0.85}
                >
                  <View style={styles.quickLoadIcon}>
                    <Text style={styles.quickLoadIconText}>🔍</Text>
                  </View>
                  <View style={styles.quickLoadContent}>
                    <Text style={styles.quickLoadTitle}>Найти груз</Text>
                    <Text style={styles.quickLoadSub}>из {cityState(truck.currentCity)}</Text>
                  </View>
                  <View style={styles.quickLoadArrow}>
                    <Text style={styles.quickLoadArrowText}>→</Text>
                  </View>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* HOS Logbook - ПЕРВЫМ! */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 HOS LOGBOOK (ELD)</Text>
              
              {/* HOS Summary Cards - компактные */}
              <View style={styles.hosSummary}>
                <View style={[styles.hosCard, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
                  <View style={styles.circularProgress}>
                    <svg width="60" height="60" viewBox="0 0 60 60">
                      <circle cx="30" cy="30" r="26" stroke="#ef4444" strokeWidth="5" fill="none" opacity="0.2" />
                      <circle 
                        cx="30" cy="30" r="26" 
                        stroke="#ef4444" 
                        strokeWidth="5" 
                        fill="none"
                        strokeDasharray={`${(truck.hoursLeft / 11) * 163} 163`}
                        strokeLinecap="round"
                        transform="rotate(-90 30 30)"
                      />
                    </svg>
                    <View style={styles.circularContent}>
                      <Text style={styles.circularValue}>{truck.hoursLeft.toFixed(0)}:{String(Math.round((truck.hoursLeft % 1) * 60)).padStart(2, '0')}</Text>
                    </View>
                  </View>
                  <Text style={styles.hosCardLabel}>DRIVE</Text>
                </View>
                
                <View style={[styles.hosCard, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
                  <View style={styles.circularProgress}>
                    <svg width="60" height="60" viewBox="0 0 60 60">
                      <circle cx="30" cy="30" r="26" stroke="#22c55e" strokeWidth="5" fill="none" opacity="0.2" />
                      <circle 
                        cx="30" cy="30" r="26" 
                        stroke="#22c55e" 
                        strokeWidth="5" 
                        fill="none"
                        strokeDasharray={`${((14 - hoursWorked - 1) / 14) * 163} 163`}
                        strokeLinecap="round"
                        transform="rotate(-90 30 30)"
                      />
                    </svg>
                    <View style={styles.circularContent}>
                      <Text style={styles.circularValue}>{14 - hoursWorked - 1}:00</Text>
                    </View>
                  </View>
                  <Text style={styles.hosCardLabel}>SHIFT</Text>
                </View>
                
                <View style={[styles.hosCard, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
                  <View style={styles.circularProgress}>
                    <svg width="60" height="60" viewBox="0 0 60 60">
                      <circle cx="30" cy="30" r="26" stroke="#22c55e" strokeWidth="5" fill="none" opacity="0.2" />
                      <circle 
                        cx="30" cy="30" r="26" 
                        stroke="#22c55e" 
                        strokeWidth="5" 
                        fill="none"
                        strokeDasharray={`${(52 / 70) * 163} 163`}
                        strokeLinecap="round"
                        transform="rotate(-90 30 30)"
                      />
                    </svg>
                    <View style={styles.circularContent}>
                      <Text style={styles.circularValue}>52:19</Text>
                    </View>
                  </View>
                  <Text style={styles.hosCardLabel}>CYCLE</Text>
                </View>
                
                <View style={[styles.hosCard, { backgroundColor: 'rgba(148,163,184,0.12)' }]}>
                  <View style={styles.circularProgress}>
                    <svg width="60" height="60" viewBox="0 0 60 60">
                      <circle cx="30" cy="30" r="26" stroke="#cbd5e1" strokeWidth="5" fill="none" opacity="0.2" />
                      <circle 
                        cx="30" cy="30" r="26" 
                        stroke="#cbd5e1" 
                        strokeWidth="5" 
                        fill="none"
                        strokeDasharray="0 163"
                        strokeLinecap="round"
                        transform="rotate(-90 30 30)"
                      />
                    </svg>
                    <View style={styles.circularContent}>
                      <Text style={styles.circularValue}>00:00</Text>
                    </View>
                  </View>
                  <Text style={styles.hosCardLabel}>BREAK</Text>
                </View>
              </View>
              
              {needsRest && (
                <View style={styles.hosAlert}>
                  <Text style={styles.hosAlertIcon}>⚠️</Text>
                  <View style={styles.hosAlertContent}>
                    <Text style={styles.hosAlertTitle}>Требуется 10-часовой перерыв!</Text>
                    <Text style={styles.hosAlertText}>
                      Водитель должен отдохнуть минимум 10 часов (Sleeper Berth) перед следующей сменой.
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Текущий статус + Груз - объединённый блок */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Текущий статус</Text>
              <View style={[styles.statusCard, { borderLeftColor: statusColor }]}>
                <Text style={styles.statusIcon}>{statusIcon}</Text>
                <View style={styles.statusContent}>
                  <Text style={[styles.statusMainText, { color: statusColor }]}>{currentStatus}</Text>
                  {truck.status === 'loaded' && truck.currentLoad && (
                    <Text style={styles.statusSubText}>
                      Прогресс: {Math.round(truck.progress * 100)}% • ETA: ~{Math.round((1 - truck.progress) * (truck.currentLoad.miles / 60))}ч
                    </Text>
                  )}
                  {truck.status === 'at_delivery' && (
                    <Text style={styles.statusSubText}>Разгрузка займёт ~30-60 минут</Text>
                  )}
                </View>
              </View>
              
              {/* Current Load - если есть */}
              {truck.currentLoad && (
                <View style={styles.loadInfoCompact}>
                  <Text style={styles.loadRoute}>
                    📦 {cityState(truck.currentLoad.fromCity)} → {cityState(truck.currentLoad.toCity)}
                  </Text>
                  <View style={styles.loadStats}>
                    <View style={styles.loadStat}>
                      <Text style={styles.loadStatLabel}>Ставка</Text>
                      <Text style={styles.loadStatValue}>${truck.currentLoad.agreedRate.toLocaleString()}</Text>
                    </View>
                    <View style={styles.loadStat}>
                      <Text style={styles.loadStatLabel}>RPM</Text>
                      <Text style={styles.loadStatValue}>${rpm}/mi</Text>
                    </View>
                    <View style={styles.loadStat}>
                      <Text style={styles.loadStatLabel}>Мили</Text>
                      <Text style={styles.loadStatValue}>{truck.currentLoad.miles}</Text>
                    </View>
                  </View>
                </View>
              )}
              
              {/* AI Advice */}
              <View style={styles.aiAdviceInline}>
                <Text style={styles.aiTitleInline}>🤖 AI Диспетчер</Text>
                <Text style={styles.aiTextInline}>{aiAdvice}</Text>
              </View>
            </View>

            {/* Что делать дальше + Location + Mood - объединённая секция */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✅ Твои действия</Text>
              {nextActions.map((action, i) => (
                <View key={i} style={[
                  styles.actionCard,
                  action.priority === 'critical' && styles.actionCritical,
                  action.priority === 'high' && styles.actionHigh,
                ]}>
                  <View style={[
                    styles.actionPriority,
                    action.priority === 'critical' && styles.priorityCritical,
                    action.priority === 'high' && styles.priorityHigh,
                    action.priority === 'medium' && styles.priorityMedium,
                  ]}>
                    <Text style={styles.actionIcon}>{action.icon}</Text>
                  </View>
                  <Text style={styles.actionText}>{action.text}</Text>
                </View>
              ))}
              
              {/* Location info - компактно */}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📍 Локация:</Text>
                <Text style={styles.infoValue}>{cityState(truck.currentCity)}</Text>
                {truck.destinationCity && (
                  <Text style={styles.infoSub}>→ {cityState(truck.destinationCity)} ({Math.round(truck.progress * 100)}%)</Text>
                )}
              </View>
              
              {/* Mood - компактно */}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>😊 Настроение:</Text>
                <View style={styles.moodBarCompact}>
                  <View style={[styles.moodBarFill, {
                    width: `${truck.mood}%`,
                    backgroundColor: truck.mood > 80 ? '#22c55e' : truck.mood > 50 ? '#fbbf24' : '#ef4444'
                  }]} />
                </View>
                <Text style={styles.infoValue}>{truck.mood}%</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={{ gap: 8 }}>
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: 'rgba(6,182,212,0.15)' }]} 
                onPress={() => setShowScorecard(true)} 
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnText}>📊 Driver Performance & Stats</Text>
              </TouchableOpacity>
              
              {truck.status === 'idle' || truck.status === 'at_delivery' ? (
                <TouchableOpacity style={styles.actionBtn} onPress={onFindLoad} activeOpacity={0.85}>
                  <Text style={styles.actionBtnText}>🔍 Найти груз для {truck.name}</Text>
                </TouchableOpacity>
              ) : null}
            </View>

          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Driver Scorecard Modal */}
      {showScorecard && (
        <DriverScorecard 
          truck={truck} 
          onClose={() => setShowScorecard(false)} 
        />
      )}
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
    maxWidth: 520,
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(6,182,212,0.4)',
    backgroundColor: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(14,165,233,0.08))',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    flexWrap: 'wrap',
    gap: 10,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(6,182,212,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(6,182,212,0.4)',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    minWidth: 280,
  },
  quickLoadSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(34,197,94,0.4)',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    minWidth: 200,
  },
  quickLoadIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(34,197,94,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(34,197,94,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  quickLoadIconText: {
    fontSize: 22,
  },
  quickLoadContent: {
    flex: 1,
  },
  quickLoadTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#4ade80',
    textShadowColor: 'rgba(34,197,94,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  quickLoadSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#cbd5e1',
    marginTop: 2,
  },
  quickLoadArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(34,197,94,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(34,197,94,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  quickLoadArrowText: {
    fontSize: 16,
    color: '#4ade80',
    fontWeight: '900',
  },
  driverAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(14,165,233,0.2))',
    borderWidth: 3,
    borderColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  driverAvatarText: {
    fontSize: 32,
  },
  driverInfo: {
    flex: 1,
    gap: 4,
  },
  driverName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#67e8f9',
    textShadowColor: 'rgba(6,182,212,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  truckNameSub: {
    fontSize: 14,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  driverBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(6,182,212,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(6,182,212,0.4)',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#67e8f9',
  },
  driverArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(6,182,212,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(6,182,212,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  arrowText: {
    fontSize: 20,
    color: '#67e8f9',
    fontWeight: '900',
  },
  truckName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
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
    color: '#cbd5e1',
  },
  statusBadge: {
    margin: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  sectionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  sectionSub: {
    fontSize: 13,
    color: '#cbd5e1',
    marginTop: 4,
  },
  hosBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  hosBarFill: {
    height: '100%',
  },
  warning: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  moodBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  moodBarFill: {
    height: '100%',
  },
  loadRoute: {
    fontSize: 14,
    fontWeight: '600',
    color: '#67e8f9',
    marginBottom: 10,
  },
  loadInfoCompact: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(6,182,212,0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
  },
  loadStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  loadStat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 8,
    borderRadius: 6,
  },
  loadStatLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 3,
  },
  loadStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  aiAdviceInline: {
    marginTop: 12,
    padding: 10,
    backgroundColor: 'rgba(6,182,212,0.15)',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(6,182,212,0.4)',
  },
  aiTitleInline: {
    fontSize: 11,
    fontWeight: '700',
    color: '#67e8f9',
    marginBottom: 4,
  },
  aiTextInline: {
    fontSize: 11,
    color: '#e2e8f0',
    lineHeight: 16,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    gap: 10,
  },
  statusIcon: {
    fontSize: 24,
  },
  statusContent: {
    flex: 1,
  },
  statusMainText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusSubText: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    gap: 10,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(100,116,139,0.5)',
  },
  actionCritical: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderLeftColor: '#ef4444',
  },
  actionHigh: {
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderLeftColor: '#fbbf24',
  },
  actionPriority: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(100,116,139,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityCritical: {
    backgroundColor: 'rgba(239,68,68,0.2)',
  },
  priorityHigh: {
    backgroundColor: 'rgba(251,191,36,0.2)',
  },
  priorityMedium: {
    backgroundColor: 'rgba(6,182,212,0.2)',
  },
  actionIcon: {
    fontSize: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 12,
    color: '#e2e8f0',
    lineHeight: 16,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    color: '#e2e8f0',
    fontWeight: '700',
  },
  infoSub: {
    fontSize: 11,
    color: '#94a3b8',
  },
  moodBarCompact: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    minWidth: 80,
  },
  // ELD Graph Styles
  eldContainer: {
    flexDirection: 'row',
    height: 140,
    marginBottom: 8,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  eldStatusLabels: {
    width: 40,
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#0f172a',
    borderRightWidth: 2,
    borderRightColor: '#334155',
  },
  eldStatusLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
    textAlign: 'center',
  },
  eldGraph: {
    flex: 1,
    position: 'relative',
  },
  eldBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column',
  },
  eldZone: {
    flex: 1,
  },
  eldVerticalLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eldVerticalLine: {
    width: 1,
    height: '100%',
    backgroundColor: '#e2e8f0',
  },
  eldVerticalLineBold: {
    backgroundColor: '#cbd5e1',
    width: 2,
  },
  eldHorizontalLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-around',
  },
  eldHorizontalLine: {
    height: 1,
    backgroundColor: '#cbd5e1',
  },
  eldStatusLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  eldTimeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginBottom: 12,
  },
  eldTimeLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    width: 14,
    textAlign: 'center',
  },
  
  // HOS Summary Cards
  hosSummary: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  hosCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(6,182,212,0.3)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  hosCardCritical: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderColor: 'rgba(239,68,68,0.4)',
  },
  hosCardWarning: {
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderColor: 'rgba(251,191,36,0.4)',
  },
  circularProgress: {
    position: 'relative',
    width: 60,
    height: 60,
    marginBottom: 4,
  },
  circularContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#67e8f9',
  },
  hosCardIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  hosCardValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 2,
  },
  hosCardLabel: {
    fontSize: 11,
    color: '#cbd5e1',
    textAlign: 'center',
    fontWeight: '600',
  },
  hosAlert: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(239,68,68,0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  hosAlertIcon: {
    fontSize: 24,
  },
  hosAlertContent: {
    flex: 1,
  },
  hosAlertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 4,
  },
  hosAlertText: {
    fontSize: 11,
    color: '#e2e8f0',
    lineHeight: 16,
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
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
