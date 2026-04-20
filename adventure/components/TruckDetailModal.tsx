import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Truck, useGameStore } from '../store/gameStore';
import { cityState } from '../constants/config';
import HOSELDModal from './HOSELDModal';
import DriverCommunicationModal from './DriverCommunicationModal';
import CallModal from './CallModal';
import CancelLoadModal from './CancelLoadModal';
import MechanicChatModal from './MechanicChatModal';
import BrokerChatModal from './BrokerChatModal';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../constants/themes';

interface Props {
  truck: Truck | null;
  onClose: () => void;
  onFindLoad: (city: string) => void;
}

// Хук для live-подписки на трак по id
function useLiveTruck(id: string | undefined): Truck | null {
  return useGameStore(s => id ? (s.trucks.find(t => t.id === id) ?? null) : null);
}

const STATUS_COLOR: Record<string, string> = {
  loaded: '#67e8f9', driving: '#06b6d4', at_delivery: '#fbbf24',
  at_pickup: '#f59e0b', idle: '#4ade80', breakdown: '#ef4444', waiting: '#fb923c',
};
const STATUS_ICON: Record<string, string> = {
  loaded: '🚛', driving: '🚛', at_delivery: '📦',
  at_pickup: '📦', idle: '✅', breakdown: '⚠️', waiting: '⏳',
};
const STATUS_LABEL: Record<string, string> = {
  loaded: 'Везёт груз', driving: 'Едет к погрузке', at_delivery: 'На разгрузке',
  at_pickup: 'На погрузке', idle: 'Свободен', breakdown: 'Поломка', waiting: 'Detention',
};

export default function TruckDetailModal({ truck: truckProp, onClose, onFindLoad }: Props) {
  const T = useTheme();
  const s = useMemo(() => makeStyles(T), [T]);
  const [showHOSELD, setShowHOSELD] = useState(false);
  const [hoseldTab, setHoseldTab] = useState<'hos' | 'eld'>('hos');
  const [showSMS, setShowSMS] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [showBrokerCall, setShowBrokerCall] = useState(false);
  const [showBrokerSMS, setShowBrokerSMS] = useState(false);
  const [showCancelLoad, setShowCancelLoad] = useState(false);
  const [showMechanic, setShowMechanic] = useState(false);
  const { gameMinute, removeMoney } = useGameStore();

  // Live-подписка: всегда берём актуальный трак из store
  const liveTruck = useLiveTruck(truckProp?.id);
  const truck = liveTruck ?? truckProp;

  if (!truck) return null;

  const isBreakdown = truck.status === 'breakdown';
  const roadsideOrdered = (truck as any).breakdownRoadsideOrdered ?? false;
  const repairCost = (truck as any).breakdownRepairCost ?? 450;
  const repairLabel = (truck as any).breakdownLabel ?? 'Поломка';
  const repairMinutes = (truck as any).breakdownRepairMinutes ?? 90;

  const callRoadside = () => {
    if (roadsideOrdered) return;
    useGameStore.setState(s => ({
      trucks: s.trucks.map(t => t.id === truck.id ? {
        ...t,
        breakdownRoadsideOrdered: true,
        outOfOrderUntil: gameMinute + repairMinutes,
      } as any : t),
    }));
    removeMoney(repairCost, `Roadside Assist — ${truck.name}: ${repairLabel}`);
    useGameStore.getState().addNotification({
      type: 'text', priority: 'medium', from: truck.driver,
      subject: `🔧 Техпомощь вызвана — ${truck.name}`,
      message: `Roadside assistance вызвана. Ремонт: ${repairLabel}. Стоимость: $${repairCost}. Ожидаемое время: ~${Math.round(repairMinutes / 60 * 10) / 10}ч.`,
      actionRequired: false, relatedTruckId: truck.id,
    });
  };

  const hoursWorked = 11 - truck.hoursLeft;
  const needsRest = truck.hoursLeft < 2;
  const rpm = truck.currentLoad
    ? (truck.currentLoad.agreedRate / truck.currentLoad.miles).toFixed(2) : '0.00';
  const sc = STATUS_COLOR[truck.status] || '#94a3b8';
  const dest = truck.destinationCity ? ` → ${cityState(truck.destinationCity)}` : '';

  // Вызывается когда MechanicChatModal достигает стадии done
  const handleRepairComplete = () => {
    const resumeStatus = truck.currentLoad ? 'loaded' : 'idle';
    useGameStore.setState(s => ({
      trucks: s.trucks.map(t => t.id === truck.id ? {
        ...t,
        status: resumeStatus as any,
        outOfOrderUntil: 0,
        breakdownRoadsideOrdered: false,
        breakdownLabel: undefined,
        breakdownRepairCost: undefined,
        breakdownRepairMinutes: undefined,
        mood: Math.max(50, (t.mood ?? 65) - 5),
      } as any : t),
    }));
    useGameStore.getState().addNotification({
      type: 'text', priority: 'medium', from: truck.driver,
      subject: `✅ ${truck.name} отремонтирован — готов к работе`,
      message: truck.currentLoad
        ? `Ремонт завершён. ${truck.driver} продолжает маршрут в ${truck.currentLoad.toCity}.`
        : `Ремонт завершён. ${truck.driver} свободен — назначь новый груз.`,
      actionRequired: !truck.currentLoad,
      relatedTruckId: truck.id,
    });
    window.dispatchEvent(new CustomEvent('mapToast', {
      detail: {
        message: `✅ ${truck.name} отремонтирован — ${truck.currentLoad ? 'продолжает маршрут' : 'свободен'}`,
        color: '#4ade80',
      }
    }));
  };
  const canFind = truck.status === 'idle' || truck.status === 'at_delivery' || truck.status === 'at_pickup';

  function getAiMessage(): { icon: string; title: string; text: string; color: string; action?: () => void; actionLabel?: string } {
    if (needsRest) return {
      icon: '😴', color: '#ef4444',
      title: 'Требуется отдых',
      text: `У ${truck!.driver} осталось ${truck!.hoursLeft.toFixed(1)}ч HOS. Нельзя назначать длинные рейсы. После отдыха (10ч) — полный сброс HOS.`,
      action: () => { setHoseldTab('hos'); setShowHOSELD(true); }, actionLabel: '⏱ Открыть HOS',
    };
    if (truck.status === 'idle') {
      const idleWarn = (truck as any).idleWarningLevel ?? 0;
      if (idleWarn >= 3) return {
        icon: '🚨', color: '#ef4444',
        title: 'Критично — трак стоит слишком долго!',
        text: `${truck.driver} свободен уже более 5 часов в ${cityState(truck.currentCity)}. Каждый час простоя = потеря денег. Срочно найди груз!`,
        action: () => onFindLoad(truck!.currentCity), actionLabel: '🔍 Найти груз',
      };
      if (idleWarn >= 1) return {
        icon: '⚠️', color: '#f97316',
        title: 'Трак простаивает',
        text: `${truck.driver} ждёт груз в ${cityState(truck.currentCity)}. Найди загрузку — чем быстрее, тем лучше.`,
        action: () => onFindLoad(truck!.currentCity), actionLabel: '🔍 Найти груз',
      };
      return {
        icon: '✅', color: '#4ade80',
        title: 'Готов к следующему грузу',
        text: `${truck.driver} свободен в ${cityState(truck.currentCity)}. Ищи груз из этого города — 0 deadhead миль. HOS: ${truck.hoursLeft.toFixed(0)}ч.`,
        action: () => onFindLoad(truck!.currentCity), actionLabel: '🔍 Найти груз',
      };
    }
    if (truck.status === 'at_delivery') return {
      icon: '📦', color: '#fbbf24',
      title: 'Разгружается — готовь следующий груз',
      text: `${truck.driver} на разгрузке в ${cityState(truck.currentCity)}. Самое время найти следующий груз!`,
      action: () => onFindLoad(truck!.currentCity), actionLabel: '🔍 Найти груз',
    };
    if (truck.status === 'at_pickup') return {
      icon: '🔄', color: '#f59e0b',
      title: 'Загружается',
      text: `${truck.driver} на погрузке в ${cityState(truck.currentCity)}. Груз: ${truck.currentLoad?.toCity ? `→ ${cityState(truck.currentLoad.toCity)}` : '—'}. Скоро выедет.`,
      action: () => setShowSMS(true), actionLabel: '💬 SMS водителю',
    };
    if (truck.status === 'loaded') {
      const pct = Math.round(truck.progress * 100);
      const eta = truck.currentLoad ? Math.round((1 - truck.progress) * truck.currentLoad.miles / 60) : 0;
      if (pct > 70) return {
        icon: '🎯', color: '#06b6d4',
        title: 'Скоро прибудет — ищи следующий груз!',
        text: `${truck.driver} проехал ${pct}% маршрута. ETA ~${eta}ч до ${cityState(truck.currentLoad?.toCity || '')}. Найди следующий груз!`,
        action: () => onFindLoad(truck!.currentLoad?.toCity || truck!.currentCity), actionLabel: '🔍 Найти груз',
      };
      return {
        icon: '🚛', color: '#38bdf8',
        title: 'В пути с грузом',
        text: `${truck.driver} везёт груз в ${cityState(truck.currentLoad?.toCity || '')}. Прогресс: ${pct}%, ETA ~${eta}ч.`,
        action: () => setShowSMS(true), actionLabel: '💬 SMS водителю',
      };
    }
    if (truck.status === 'driving') return {
      icon: '🔵', color: '#38bdf8',
      title: 'Едет к погрузке',
      text: `${truck.driver} едет к pickup в ${cityState(truck.destinationCity || '')}. Убедись что Rate Con подписан.`,
      action: () => setShowSMS(true), actionLabel: '💬 SMS водителю',
    };
    if (truck.status === 'breakdown') return {
      icon: '🔧', color: '#ef4444',
      title: 'Поломка — требуется действие',
      text: `${truck.driver} сломался! Свяжись с техпомощью, уведоми брокера о задержке. Зафиксируй время для страховки.`,
      action: () => setShowMechanic(true), actionLabel: '🔧 Вызвать техпомощь',
    };
    return {
      icon: '🤖', color: '#06b6d4',
      title: 'AI Диспетчер',
      text: 'Мониторь статус трака и реагируй на изменения.',
    };
  }

  const ai = getAiMessage();

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={s.modal} activeOpacity={1} onPress={e => e.stopPropagation()}>

          {/* ── ШАПКА ── */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <View style={s.avatar}><Text style={s.avatarText}>👤</Text></View>
              <View>
                <Text style={s.driverName}>{truck.driver}</Text>
                <Text style={s.truckSub}>{truck.name} · {cityState(truck.currentCity)}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* ── СТАТУС ── */}
            <View style={[s.statusBar, { backgroundColor: sc + '18', borderColor: sc + '44' }]}>
              <Text style={s.statusIcon}>{STATUS_ICON[truck.status] || '🚛'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.statusLabel, { color: sc }]}>
                  {STATUS_LABEL[truck.status] || truck.status}{dest}
                </Text>
                {truck.status === 'loaded' && truck.currentLoad && (
                  <Text style={s.statusSub}>
                    {Math.round(truck.progress * 100)}% пути · ETA ~{Math.round((1 - truck.progress) * truck.currentLoad.miles / 60)}ч
                  </Text>
                )}
              </View>
              {needsRest && (
                <View style={s.restBadge}><Text style={s.restBadgeText}>⚠️ Отдых!</Text></View>
              )}
            </View>

            {/* ── AI ДИСПЕТЧЕР ── */}
            <TouchableOpacity
              activeOpacity={ai.action ? 0.75 : 1}
              onPress={ai.action}
              disabled={!ai.action}
              style={[s.aiCard, {
                borderColor: ai.color + '66',
                backgroundColor: ai.color + '14',
                shadowColor: ai.color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: ai.action ? 0.55 : 0.2,
                shadowRadius: ai.action ? 12 : 4,
                elevation: ai.action ? 8 : 2,
              }]}
            >
              <View style={s.aiHeader}>
                <Text style={s.aiIcon}>{ai.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.aiLabel}>🤖 AI Диспетчер</Text>
                  <Text style={[s.aiTitle, { color: ai.color }]}>{ai.title}</Text>
                </View>
                {ai.action && (
                  <Text style={{ fontSize: 18, color: ai.color, opacity: 0.8 }}>›</Text>
                )}
              </View>
              <Text style={s.aiText}>{ai.text}</Text>
              {ai.action && ai.actionLabel && (
                <View style={[s.aiActionBtn, { borderColor: ai.color + '55', backgroundColor: ai.color + '20' }]}>
                  <Text style={[s.aiActionBtnText, { color: ai.color }]}>{ai.actionLabel}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* ── БЛОК ПОЛОМКИ ── */}
            {isBreakdown && (
              <View style={[s.breakdownCard, roadsideOrdered && s.breakdownCardActive]}>
                <Text style={s.breakdownTitle}>🚨 {repairLabel}</Text>
                <Text style={s.breakdownSub}>Трак стоит · Стоимость ремонта: ${repairCost.toLocaleString()}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  <TouchableOpacity
                    style={[s.roadsideBtn, roadsideOrdered && s.roadsideBtnDone]}
                    onPress={() => setShowMechanic(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.roadsideBtnText, roadsideOrdered && { color: '#4ade80' }]}>
                      {roadsideOrdered ? '✅ Техпомощь едет — открыть чат 💬' : `🔧 Вызвать техпомощь ($${repairCost})`}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <TouchableOpacity style={s.breakdownActionBtn} onPress={() => setShowCall(true)} activeOpacity={0.8}>
                    <Text style={[s.breakdownActionText, { color: '#30d158' }]}>📞 Позвонить</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.breakdownActionBtn} onPress={() => setShowSMS(true)} activeOpacity={0.8}>
                    <Text style={[s.breakdownActionText, { color: '#0a84ff' }]}>💬 SMS</Text>
                  </TouchableOpacity>
                  {truck.currentLoad && (
                    <TouchableOpacity style={s.breakdownActionBtn} onPress={() => setShowCancelLoad(true)} activeOpacity={0.8}>
                      <Text style={[s.breakdownActionText, { color: '#ff453a' }]}>⚠️ TONU</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* ── БЕЙДЖИ ── */}
            <View style={s.badgesRow}>
              <View style={s.badge}><Text style={s.badgeText}>⭐ {truck.safetyScore}</Text><Text style={s.badgeLabel}>Safety</Text></View>
              <View style={s.badge}><Text style={s.badgeText}>🎯 {truck.onTimeRate}%</Text><Text style={s.badgeLabel}>On Time</Text></View>
              <View style={s.badge}><Text style={s.badgeText}>😊 {truck.mood}%</Text><Text style={s.badgeLabel}>Mood</Text></View>
              <View style={s.badge}><Text style={s.badgeText}>⛽ {truck.fuelEfficiency}</Text><Text style={s.badgeLabel}>MPG</Text></View>
            </View>

            {/* ── HOS ── */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>⏰ HOS — Hours of Service</Text>
              <View style={s.hosRow}>
                <HosBar label="Drive" value={truck.hoursLeft} max={11} color={needsRest ? '#ef4444' : '#06b6d4'} styles={s} />
                <HosBar label="Shift" value={Math.max(0, 14 - hoursWorked - 1)} max={14} color="#22c55e" styles={s} />
                <HosBar label="Cycle" value={52} max={70} color="#94a3b8" styles={s} />
              </View>
              {needsRest && (
                <Text style={s.hosWarn}>⚠️ Требуется 10-часовой отдых перед следующей сменой</Text>
              )}
            </View>

            {/* ── ТЕКУЩИЙ ГРУЗ ── */}
            {truck.currentLoad && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>📦 Текущий груз</Text>
                <Text style={s.loadRoute}>
                  {cityState(truck.currentLoad.fromCity)} → {cityState(truck.currentLoad.toCity)}
                </Text>
                <View style={s.loadStats}>
                  <LoadStat label="Ставка" value={`${truck.currentLoad.agreedRate.toLocaleString()}`} styles={s} />
                  <LoadStat label="$/миля" value={`${rpm}`} styles={s} />
                  <LoadStat label="Миль" value={String(truck.currentLoad.miles)} styles={s} />
                  <LoadStat label="Груз" value={truck.currentLoad.commodity} styles={s} />
                </View>
              </View>
            )}

            {/* ── ДЕЙСТВИЯ ── */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>✅ Действия</Text>

              {/* Найти груз */}
              {canFind && (
                <TouchableOpacity style={s.findBtn} onPress={() => onFindLoad(truck.currentCity)} activeOpacity={0.85}>
                  <Text style={s.findBtnIcon}>🔍</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.findBtnTitle}>Найти груз</Text>
                    <Text style={s.findBtnSub}>из {cityState(truck.currentCity)}</Text>
                  </View>
                  <Text style={s.findBtnArrow}>→</Text>
                </TouchableOpacity>
              )}

              {/* Водитель + Брокер — 2 карточки рядом */}
              <View style={{ flexDirection: 'row', gap: 8 }}>

                {/* Водитель */}
                <View style={{ flex: 1, backgroundColor: 'rgba(6,182,212,0.08)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.35)', borderRadius: 14, padding: 10, gap: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#06b6d4', textAlign: 'center', letterSpacing: 0.5 }}>🚛 ВОДИТЕЛЬ</Text>
                  <Text style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', marginTop: -4 }}>{truck.driver}</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      style={{ flex: 1, backgroundColor: 'rgba(6,182,212,0.15)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.4)', borderRadius: 10, paddingVertical: 10, alignItems: 'center', gap: 3 }}
                      onPress={() => setShowSMS(true)} activeOpacity={0.8}
                    >
                      <Text style={{ fontSize: 18 }}>💬</Text>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#06b6d4' }}>SMS</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ flex: 1, backgroundColor: 'rgba(236,72,153,0.15)', borderWidth: 1, borderColor: 'rgba(236,72,153,0.4)', borderRadius: 10, paddingVertical: 10, alignItems: 'center', gap: 3 }}
                      onPress={() => setShowCall(true)} activeOpacity={0.8}
                    >
                      <Text style={{ fontSize: 18 }}>📞</Text>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#ec4899' }}>Звонок</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Брокер — только если есть груз */}
                {truck.currentLoad ? (
                  <View style={{ flex: 1, backgroundColor: 'rgba(251,146,60,0.08)', borderWidth: 1, borderColor: 'rgba(251,146,60,0.35)', borderRadius: 14, padding: 10, gap: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#fb923c', textAlign: 'center', letterSpacing: 0.5 }}>📋 БРОКЕР</Text>
                    <Text style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', marginTop: -4 }}>{truck.currentLoad.brokerName}</Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <TouchableOpacity
                        style={{ flex: 1, backgroundColor: 'rgba(251,146,60,0.15)', borderWidth: 1, borderColor: 'rgba(251,146,60,0.4)', borderRadius: 10, paddingVertical: 10, alignItems: 'center', gap: 3 }}
                        onPress={() => setShowBrokerSMS(true)} activeOpacity={0.8}
                      >
                        <Text style={{ fontSize: 18 }}>💬</Text>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#fb923c' }}>SMS</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ flex: 1, backgroundColor: 'rgba(251,146,60,0.15)', borderWidth: 1, borderColor: 'rgba(251,146,60,0.4)', borderRadius: 10, paddingVertical: 10, alignItems: 'center', gap: 3 }}
                        onPress={() => setShowBrokerCall(true)} activeOpacity={0.8}
                      >
                        <Text style={{ fontSize: 18 }}>📞</Text>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#fb923c' }}>Звонок</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: T.border, borderRadius: 14, padding: 10, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 20, marginBottom: 4 }}>📋</Text>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: T.textMuted, textAlign: 'center' }}>Нет груза</Text>
                    <Text style={{ fontSize: 9, color: T.textDim, textAlign: 'center', marginTop: 2 }}>Брокер недоступен</Text>
                  </View>
                )}
              </View>

              {/* HOS + ELD */}
              <TouchableOpacity 
                style={[s.actionBtn, { backgroundColor: 'rgba(168,85,247,0.12)', borderColor: 'rgba(168,85,247,0.4)', flexDirection: 'row', alignItems: 'center', gap: 10 }]} 
                onPress={() => { setHoseldTab('hos'); setShowHOSELD(true); }}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 22 }}>📊</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.actionBtnText, { color: '#a855f7' }]}>HOS + ELD График</Text>
                  <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{truck.hoursLeft.toFixed(1)}h осталось</Text>
                </View>
                <Text style={{ fontSize: 16, color: '#a855f7' }}>→</Text>
              </TouchableOpacity>

              {/* TONU */}
              {truck.currentLoad && (
                <TouchableOpacity style={[s.actionBtn, { borderColor: 'rgba(255,69,58,0.25)', backgroundColor: 'rgba(255,69,58,0.06)' }]} onPress={() => setShowCancelLoad(true)} activeOpacity={0.85}>
                  <Text style={[s.actionBtnText, { color: '#ff453a' }]}>⚠️ Отменить груз (TONU)</Text>
                </TouchableOpacity>
              )}
            </View>

          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>

      {showHOSELD && <HOSELDModal truck={truck} onClose={() => setShowHOSELD(false)} initialTab={hoseldTab} />}
      {showSMS && <DriverCommunicationModal truck={truck} onClose={() => setShowSMS(false)} onCall={() => { setShowSMS(false); setShowCall(true); }} />}
      {showCall && <CallModal contactName={truck.driver} contactRole="driver" truckId={truck.id} onClose={() => setShowCall(false)} />}
      {showBrokerCall && truck.currentLoad && <CallModal contactName={truck.currentLoad.brokerName || 'Broker'} contactRole="broker" truckId={truck.id} onClose={() => setShowBrokerCall(false)} />}
      {showBrokerSMS && truck.currentLoad && <BrokerChatModal brokerName={truck.currentLoad.brokerName || 'Broker'} truckId={truck.id} loadInfo={{ fromCity: truck.currentLoad.fromCity, toCity: truck.currentLoad.toCity, agreedRate: truck.currentLoad.agreedRate, commodity: truck.currentLoad.commodity }} onClose={() => setShowBrokerSMS(false)} />}
      {showCancelLoad && truck.currentLoad && <CancelLoadModal load={truck.currentLoad} onClose={() => setShowCancelLoad(false)} />}
      {showMechanic && (
        <MechanicChatModal
          truck={truck}
          repairCost={repairCost}
          repairLabel={repairLabel}
          repairMinutes={repairMinutes}
          roadsideOrdered={roadsideOrdered}
          onClose={() => setShowMechanic(false)}
          onCallRoadside={callRoadside}
          onRepairComplete={handleRepairComplete}
        />
      )}
    </Modal>
  );
}

function HosBar({ label, value, max, color, styles }: { label: string; value: number; max: number; color: string; styles: any }) {
  return (
    <View style={styles.hosItem}>
      <Text style={[styles.hosVal, { color }]}>{value.toFixed(0)}h</Text>
      <View style={styles.hosBarTrack}>
        <View style={[styles.hosBarFill, { width: `${Math.min(1, value / max) * 100}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={styles.hosLabel}>{label}</Text>
    </View>
  );
}

function LoadStat({ label, value, styles }: { label: string; value: string; styles: any }) {
  return (
    <View style={styles.loadStat}>
      <Text style={styles.loadStatVal}>{value}</Text>
      <Text style={styles.loadStatLabel}>{label}</Text>
    </View>
  );
}

function makeStyles(T: ThemeColors) {
  return StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modal: { backgroundColor: T.bgCard, borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '88%', borderWidth: 1.5, borderColor: 'rgba(6,182,212,0.35)' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: T.border },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(6,182,212,0.2)', borderWidth: 2, borderColor: '#06b6d4', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24 },
  driverName: { fontSize: 16, fontWeight: '900', color: '#67e8f9' },
  truckSub: { fontSize: 13, color: T.textSecondary, marginTop: 1 },
  closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: T.border, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 16, color: T.textSecondary },
  statusBar: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 12, marginBottom: 0, padding: 12, borderRadius: 12, borderWidth: 1 },
  statusIcon: { fontSize: 22 },
  statusLabel: { fontSize: 14, fontWeight: '700' },
  statusSub: { fontSize: 13, color: T.textSecondary, marginTop: 2 },
  restBadge: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 8 },
  restBadgeText: { fontSize: 12, fontWeight: '800', color: '#ef4444' },
  badgesRow: { flexDirection: 'row', gap: 8, margin: 12, marginBottom: 0 },
  badge: { flex: 1, backgroundColor: T.border, borderRadius: 10, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: T.border },
  badgeText: { fontSize: 13, fontWeight: '800', color: T.text },
  badgeLabel: { fontSize: 13, color: T.textSecondary, marginTop: 2, textTransform: 'uppercase' },
  section: { margin: 12, marginBottom: 0, padding: 12, backgroundColor: T.bgCard, borderRadius: 12, borderWidth: 1, borderColor: T.border, gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: T.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  hosRow: { flexDirection: 'row', gap: 10 },
  hosItem: { flex: 1, alignItems: 'center', gap: 4 },
  hosVal: { fontSize: 18, fontWeight: '900' },
  hosBarTrack: { width: '100%', height: 6, backgroundColor: T.border, borderRadius: 3, overflow: 'hidden' },
  hosBarFill: { height: '100%', borderRadius: 3 },
  hosLabel: { fontSize: 13, color: T.textSecondary, fontWeight: '700', textTransform: 'uppercase' },
  hosWarn: { fontSize: 13, color: '#ef4444', fontWeight: '600', textAlign: 'center' },
  loadRoute: { fontSize: 14, fontWeight: '700', color: '#67e8f9' },
  loadStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  loadStat: { minWidth: '22%', flex: 1, backgroundColor: T.border, borderRadius: 8, padding: 8, alignItems: 'center' },
  loadStatVal: { fontSize: 13, fontWeight: '800', color: T.text },
  loadStatLabel: { fontSize: 13, color: T.textSecondary, marginTop: 2, textTransform: 'uppercase' },
  findBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: 'rgba(34,197,94,0.12)', borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(34,197,94,0.3)' },
  findBtnIcon: { fontSize: 22 },
  findBtnTitle: { fontSize: 14, fontWeight: '800', color: '#4ade80' },
  findBtnSub: { fontSize: 13, color: T.textSecondary },
  findBtnArrow: { fontSize: 18, color: '#4ade80', fontWeight: '900' },
  statsBtn: { padding: 12, backgroundColor: 'rgba(6,182,212,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)', alignItems: 'center' },
  statsBtnText: { fontSize: 13, fontWeight: '700', color: '#06b6d4' },
  actionBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  actionBtnText: { fontSize: 14, fontWeight: '700' },
  aiCard: { margin: 12, marginBottom: 0, padding: 12, borderRadius: 12, borderWidth: 1.5, gap: 8 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiIcon: { fontSize: 26 },
  aiLabel: { fontSize: 10, fontWeight: '800', color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  aiTitle: { fontSize: 14, fontWeight: '900', marginTop: 1 },
  aiText: { fontSize: 13, color: T.text, lineHeight: 20 },
  aiActionBtn: { marginTop: 4, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, alignSelf: 'flex-start' },
  aiActionBtnText: { fontSize: 13, fontWeight: '800' },
  breakdownCard: { margin: 12, marginBottom: 0, padding: 12, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(239,68,68,0.5)', backgroundColor: 'rgba(239,68,68,0.08)', gap: 4 },
  breakdownCardActive: { borderColor: 'rgba(74,222,128,0.4)', backgroundColor: 'rgba(74,222,128,0.06)' },
  breakdownTitle: { fontSize: 15, fontWeight: '900', color: '#ef4444' },
  breakdownSub: { fontSize: 12, color: T.textMuted },
  roadsideBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.5)', backgroundColor: 'rgba(239,68,68,0.12)', alignItems: 'center' },
  roadsideBtnDone: { borderColor: 'rgba(74,222,128,0.4)', backgroundColor: 'rgba(74,222,128,0.08)' },
  roadsideBtnText: { fontSize: 14, fontWeight: '900', color: '#ef4444' },
  breakdownActionBtn: { flex: 1, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: T.border, backgroundColor: T.bgCard, alignItems: 'center' },
  breakdownActionText: { fontSize: 12, fontWeight: '700' },
  });
}
