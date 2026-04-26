import { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { useGameStore, LoadOffer, ActiveLoad, Truck } from '../store/gameStore';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../constants/themes';
import { cityState, CITIES } from '../constants/config';

interface Message {
  from: 'broker' | 'me';
  text: string;
  time: number;
}

interface Props {
  visible: boolean;
  load: LoadOffer | null;
  onClose: () => void;
  onAccepted: (agreedRate: number) => void;
  preselectedTruckId?: string | null; // опциональный предвыбранный трак
}

function getBrokerReply(myOffer: number, load: LoadOffer, round: number): {
  text: string;
  counterOffer: number;
  mood: 'happy' | 'neutral' | 'annoyed' | 'angry';
  accepted: boolean;
  rejected: boolean;
} {
  const market = load.marketRate;
  const min = load.minRate;

  if (myOffer >= market) {
    return { text: `Deal! ${myOffer.toLocaleString()} works for me. I'll send the Rate Con right away.`, counterOffer: myOffer, mood: 'happy', accepted: true, rejected: false };
  }
  if (myOffer >= min) {
    if (round >= 2) return { text: `Alright, you got me. ${myOffer.toLocaleString()} — deal. Sending Rate Con.`, counterOffer: myOffer, mood: 'neutral', accepted: true, rejected: false };
    const counter = Math.round((myOffer + market) / 2);
    return { text: `Hmm, I can't go that low. How about ${counter.toLocaleString()}? That's my best.`, counterOffer: counter, mood: 'neutral', accepted: false, rejected: false };
  }
  if (round >= 3) {
    return { text: `Look, I've been patient but we're going in circles. I'll pass on this one.`, counterOffer: 0, mood: 'angry', accepted: false, rejected: true };
  }
  const counter = Math.round(load.postedRate + (market - load.postedRate) * 0.4);
  return { text: `I hear you, but ${myOffer.toLocaleString()} is too much. I can do ${counter.toLocaleString()} — final offer.`, counterOffer: counter, mood: 'annoyed', accepted: false, rejected: false };
}

const MOOD_EMOJI: Record<string, string> = { happy: '😊', neutral: '😐', annoyed: '😤', angry: '😠' };

// Функция расчёта расстояния между городами (deadhead)
function calculateDeadhead(fromCity: string, toCity: string): number {
  const from = CITIES[fromCity];
  const to = CITIES[toCity];
  if (!from || !to) return 0;
  
  const [lng1, lat1] = from;
  const [lng2, lat2] = to;
  const R = 3958.8; // радиус Земли в милях
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// Функция выбора лучшего трака автоматически
function selectBestTruck(trucks: Truck[], load: LoadOffer): Truck | null {
  // Фильтруем доступные траки
  const available = trucks.filter(t => 
    t.status === 'idle' || t.status === 'at_delivery' || t.status === 'at_pickup'
  );
  
  if (available.length === 0) return null;
  
  // Сортируем по приоритету:
  // 1. Ближайший к точке погрузки (меньше deadhead)
  // 2. Больше HOS часов
  // 3. Лучшее настроение
  const scored = available.map(truck => {
    const deadhead = calculateDeadhead(truck.currentCity, load.fromCity);
    const hosScore = truck.hoursLeft * 10; // больше HOS = лучше
    const moodScore = truck.mood / 10; // настроение 0-100 → 0-10
    const deadheadPenalty = deadhead * 2; // каждая миля deadhead = -2 балла
    
    // Бонус для idle траков (они готовы сразу)
    const statusBonus = truck.status === 'idle' ? 50 : 0;
    
    const totalScore = hosScore + moodScore + statusBonus - deadheadPenalty;
    
    return { truck, deadhead, score: totalScore };
  });
  
  // Сортируем по убыванию score
  scored.sort((a, b) => b.score - a.score);
  
  return scored[0].truck;
}

export default function NegotiationChat({ visible, load, onClose, onAccepted, preselectedTruckId }: Props) {
  const T = useTheme();
  const s = useMemo(() => makeStyles(T), [T]);
  const { brokers, trucks, assignLoadToTruck } = useGameStore();
  const scrollRef = useRef<ScrollView>(null);
  const gameMinute = useGameStore(s => s.gameMinute);

  const [messages, setMessages] = useState<Message[]>([]);
  const [round, setRound] = useState(0);
  const [currentOffer, setCurrentOffer] = useState(0);
  const [mood, setMood] = useState<'happy' | 'neutral' | 'annoyed' | 'angry'>('neutral');
  const [done, setDone] = useState<'accepted' | 'rejected' | null>(null);
  const [agreedRate, setAgreedRate] = useState(0);
  
  // Новое состояние для выбора трака
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [showTruckSelector, setShowTruckSelector] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (visible && load) {
      setMessages([{
        from: 'broker',
        text: `Hey! I've got a load for you: ${load.fromCity} → ${load.toCity}, ${load.miles} miles, ${load.commodity}. I'm posting at ${load.postedRate.toLocaleString()}. Interested?`,
        time: gameMinute,
      }]);
      setRound(0);
      setCurrentOffer(load.postedRate);
      setMood('neutral');
      setDone(null);
      setAgreedRate(0);
      setShowTruckSelector(false);
      setIsAssigning(false);
      
      // Автоматический выбор лучшего трака
      if (preselectedTruckId) {
        setSelectedTruckId(preselectedTruckId);
      } else {
        const bestTruck = selectBestTruck(trucks, load);
        setSelectedTruckId(bestTruck?.id || null);
      }
    }
  }, [visible, load, preselectedTruckId, trucks, gameMinute]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  if (!load) return null;

  const broker = brokers.find(b => b.id === load.brokerId);
  const tiles = [
    { label: `${Math.round(load.postedRate * 1.05).toLocaleString()}`, value: Math.round(load.postedRate * 1.05), tag: '+5%' },
    { label: `${Math.round(load.postedRate * 1.10).toLocaleString()}`, value: Math.round(load.postedRate * 1.10), tag: '+10%' },
    { label: `${Math.round(load.postedRate * 1.15).toLocaleString()}`, value: Math.round(load.postedRate * 1.15), tag: '+15%' },
    { label: `${Math.round(load.marketRate).toLocaleString()}`, value: Math.round(load.marketRate), tag: 'Market' },
  ];

  // Доступные траки для выбора
  const availableTrucks = trucks.filter(t => 
    t.status === 'idle' || t.status === 'at_delivery' || t.status === 'at_pickup'
  );

  const selectedTruck = selectedTruckId ? trucks.find(t => t.id === selectedTruckId) : null;
  const deadhead = selectedTruck ? calculateDeadhead(selectedTruck.currentCity, load.fromCity) : 0;

  function handleOffer(offerValue: number) {
    if (done || !load) return;
    const newRound = round + 1;
    setRound(newRound);

    const myMsg: Message = {
      from: 'me',
      text: `I can do ${offerValue.toLocaleString()} for this load. That's ${load.miles} miles at ${(offerValue / load.miles).toFixed(2)}/mile.`,
      time: gameMinute + newRound,
    };

    const reply = getBrokerReply(offerValue, load, newRound);
    setMood(reply.mood);

    const brokerMsg: Message = { from: 'broker', text: reply.text, time: gameMinute + newRound };
    setMessages(prev => [...prev, myMsg, brokerMsg]);

    if (reply.accepted) { setDone('accepted'); setAgreedRate(offerValue); }
    else if (reply.rejected) { setDone('rejected'); }
    else { setCurrentOffer(reply.counterOffer); }
  }

  function handleAcceptCounter() {
    if (done || !load) return;
    setMessages(prev => [...prev,
      { from: 'me', text: `OK, I'll take ${currentOffer.toLocaleString()}. Send me the Rate Con.`, time: gameMinute + round + 1 },
      { from: 'broker', text: `Perfect! Rate Con coming your way. Thanks for working with us!`, time: gameMinute + round + 1 },
    ]);
    setDone('accepted');
    setAgreedRate(currentOffer);
  }

  async function handleConfirmDeal() {
    if (!selectedTruckId || !load || agreedRate === 0 || isAssigning) return;
    
    setIsAssigning(true);
    
    // Создаём ActiveLoad
    const activeLoad: ActiveLoad = {
      ...load,
      agreedRate,
      truckId: selectedTruckId,
      phase: 'to_pickup',
      detentionMinutes: 0,
      detentionPaid: false,
    };
    
    // Назначаем трак
    try {
      await assignLoadToTruck(activeLoad, selectedTruckId);
      onAccepted(agreedRate);
      onClose();
    } catch (error) {
      console.error('Failed to assign load:', error);
      setIsAssigning(false);
    }
  }

  function handleCancelDeal() {
    // Можно отменить и выбрать другой трак
    setShowTruckSelector(false);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.modal}>

          {/* Header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Text style={s.brokerAvatar}>{broker?.avatar || '👨‍💼'}</Text>
              <View>
                <Text style={s.brokerName}>{load.brokerName} {MOOD_EMOJI[mood]}</Text>
                <Text style={s.brokerCompany}>{load.brokerCompany}</Text>
              </View>
            </View>
            <View style={s.headerRight}>
              <Text style={s.loadRoute}>{load.fromCity} → {load.toCity}</Text>
              <Text style={s.loadMeta}>{load.miles} mi · Posted: ${load.postedRate.toLocaleString()} (${(load.postedRate / load.miles).toFixed(2)}/mi)</Text>
              <Text style={s.loadMarket}>Market: ${load.marketRate.toLocaleString()} (${(load.marketRate / load.miles).toFixed(2)}/mi)</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Chat */}
          <ScrollView ref={scrollRef} style={s.chat} contentContainerStyle={s.chatContent}>
            {messages.map((msg, i) => (
              <View key={i} style={[s.bubble, msg.from === 'me' ? s.bubbleMe : s.bubbleBroker]}>
                {msg.from === 'broker' && <Text style={s.bubbleAvatar}>{broker?.avatar || '👨‍💼'}</Text>}
                <View style={[s.bubbleBody, msg.from === 'me' ? s.bubbleBodyMe : s.bubbleBodyBroker]}>
                  <Text style={[s.bubbleText, msg.from === 'me' ? s.bubbleTextMe : s.bubbleTextBroker]}>{msg.text}</Text>
                </View>
              </View>
            ))}
            {done === 'accepted' && (
              <View style={s.dealBanner}>
                <Text style={s.dealIcon}>🤝</Text>
                <Text style={s.dealText}>Deal at ${agreedRate.toLocaleString()}!</Text>
                <Text style={s.dealRpm}>${(agreedRate / load.miles).toFixed(2)}/mile</Text>
              </View>
            )}
            {done === 'rejected' && (
              <View style={s.rejectBanner}>
                <Text style={s.rejectIcon}>❌</Text>
                <Text style={s.rejectText}>No deal. Broker walked away.</Text>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          {!done ? (
            <View style={s.actions}>
              <Text style={s.actionsLabel}>Твоё предложение:</Text>
              <View style={s.tiles}>
                {tiles.map((t, i) => (
                  <TouchableOpacity key={i} style={s.tile} onPress={() => handleOffer(t.value)} activeOpacity={0.75}>
                    <Text style={s.tileVal}>{t.label}</Text>
                    {t.tag && <Text style={s.tileTag}>{t.tag}</Text>}
                  </TouchableOpacity>
                ))}
              </View>
              {round > 0 && (
                <TouchableOpacity style={s.acceptCounterBtn} onPress={handleAcceptCounter}>
                  <Text style={s.acceptCounterText}>✅ Принять ${currentOffer.toLocaleString()}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : done === 'accepted' ? (
            <>
              {/* Карточка выбранного трака */}
              {selectedTruck && !showTruckSelector && (
                <View style={s.truckCard}>
                  <View style={s.truckCardHeader}>
                    <Text style={s.truckCardTitle}>🚛 Выбранный трак</Text>
                    {availableTrucks.length > 1 && (
                      <TouchableOpacity onPress={() => setShowTruckSelector(true)} style={s.changeTruckBtn}>
                        <Text style={s.changeTruckText}>Изменить</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={s.truckCardBody}>
                    <Text style={s.truckName}>{selectedTruck.name} · {selectedTruck.driver}</Text>
                    <Text style={s.truckInfo}>
                      📍 {cityState(selectedTruck.currentCity)} · HOS: {(Math.round(selectedTruck.hoursLeft * 10) / 10).toFixed(1)}ч · Настроение: {selectedTruck.mood}%
                    </Text>
                    {deadhead > 0 && (
                      <Text style={s.truckDeadhead}>🛣️ Deadhead: {deadhead} миль до погрузки</Text>
                    )}
                    {selectedTruck.status !== 'idle' && (
                      <Text style={s.truckStatus}>
                        {selectedTruck.status === 'at_delivery' ? '🔄 Заканчивает разгрузку — начнёт после' : '🔄 Заканчивает погрузку — начнёт после'}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Список траков для выбора */}
              {showTruckSelector && (
                <View style={s.truckSelector}>
                  <Text style={s.truckSelectorTitle}>Выбери трак для груза:</Text>
                  <ScrollView style={s.truckList} contentContainerStyle={{ gap: 8 }} showsVerticalScrollIndicator={false}>
                    {availableTrucks.map(truck => {
                      const isSelected = truck.id === selectedTruckId;
                      const truckDeadhead = calculateDeadhead(truck.currentCity, load.fromCity);
                      return (
                        <TouchableOpacity
                          key={truck.id}
                          style={[s.truckItem, isSelected && s.truckItemSelected]}
                          onPress={() => {
                            setSelectedTruckId(truck.id);
                            setShowTruckSelector(false);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={s.truckItemEmoji}>🚛</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={s.truckItemName}>{truck.name} · {truck.driver}</Text>
                            <Text style={s.truckItemInfo}>
                              📍 {cityState(truck.currentCity)} · HOS: {(Math.round(truck.hoursLeft * 10) / 10).toFixed(1)}ч
                            </Text>
                            {truckDeadhead > 0 && (
                              <Text style={s.truckItemDeadhead}>🛣️ {truckDeadhead} миль deadhead</Text>
                            )}
                          </View>
                          {isSelected && <Text style={s.truckItemCheck}>✓</Text>}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Footer с кнопками */}
              {!showTruckSelector && (
                <View style={s.footer}>
                  <TouchableOpacity style={s.cancelBtn} onPress={handleCancelDeal}>
                    <Text style={s.cancelText}>Отмена</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[s.confirmBtn, (!selectedTruckId || isAssigning) && s.confirmBtnDisabled]} 
                    onPress={handleConfirmDeal}
                    disabled={!selectedTruckId || isAssigning}
                  >
                    <Text style={s.confirmText}>
                      {isAssigning ? '⏳ Назначаем...' : '✅ Подтвердить'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={s.footer}>
              <TouchableOpacity style={s.confirmBtn} onPress={onClose}>
                <Text style={s.confirmText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}

function makeStyles(T: ThemeColors) {
  return StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modal: { backgroundColor: T.bg, borderRadius: 22, borderWidth: 1, borderColor: T.bgCard, maxHeight: '90%', width: '100%', maxWidth: 520 },
  header: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderBottomWidth: 1, borderBottomColor: T.bgCard, gap: 10 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brokerAvatar: { fontSize: 28 },
  brokerName: { fontSize: 14, fontWeight: '800', color: T.text },
  brokerCompany: { fontSize: 11, color: T.textMuted },
  headerRight: { flex: 1 },
  loadRoute: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  loadMeta: { fontSize: 10, color: T.textMuted, marginTop: 2 },
  loadMarket: { fontSize: 10, color: '#4ade80', marginTop: 1 },
  closeBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: T.border, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 13, color: T.textMuted },
  chat: { flex: 1, maxHeight: 300 },
  chatContent: { padding: 14, gap: 10 },
  bubble: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  bubbleMe: { justifyContent: 'flex-end' },
  bubbleBroker: { justifyContent: 'flex-start' },
  bubbleAvatar: { fontSize: 20, marginBottom: 2 },
  bubbleBody: { maxWidth: '78%', borderRadius: 14, padding: 10 },
  bubbleBodyMe: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleBodyBroker: { backgroundColor: T.bgCard, borderWidth: 1, borderColor: T.border, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 13, lineHeight: 19 },
  bubbleTextMe: { color: '#fff', fontWeight: '600' },
  bubbleTextBroker: { color: T.textSecondary },
  dealBanner: { alignItems: 'center', padding: 14, backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', marginTop: 8 },
  dealIcon: { fontSize: 28, marginBottom: 4 },
  dealText: { fontSize: 16, fontWeight: '900', color: '#4ade80' },
  dealRpm: { fontSize: 12, color: '#86efac', marginTop: 2 },
  rejectBanner: { alignItems: 'center', padding: 14, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', marginTop: 8 },
  rejectIcon: { fontSize: 28, marginBottom: 4 },
  rejectText: { fontSize: 14, fontWeight: '700', color: '#f87171' },
  actions: { padding: 14, borderTopWidth: 1, borderTopColor: T.border, gap: 10 },
  actionsLabel: { fontSize: 10, fontWeight: '700', color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: T.bgCard, borderRadius: 12, borderWidth: 1.5, borderColor: T.border, alignItems: 'center' },
  tileVal: { fontSize: 14, fontWeight: '800', color: T.text },
  tileTag: { fontSize: 9, color: '#4ade80', fontWeight: '700', marginTop: 2 },
  acceptCounterBtn: { paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', alignItems: 'center' },
  acceptCounterText: { fontSize: 14, fontWeight: '800', color: '#4ade80' },
  
  // Карточка выбранного трака
  truckCard: {
    margin: 14,
    marginTop: 0,
    backgroundColor: T.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.primary,
    overflow: 'hidden',
  },
  truckCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  truckCardTitle: { fontSize: 13, fontWeight: '800', color: T.text },
  changeTruckBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(6,182,212,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
  },
  changeTruckText: { fontSize: 11, fontWeight: '700', color: T.primary },
  truckCardBody: { padding: 12, gap: 4 },
  truckName: { fontSize: 14, fontWeight: '700', color: T.text },
  truckInfo: { fontSize: 12, color: T.textMuted },
  truckDeadhead: { fontSize: 11, color: '#fb923c', fontWeight: '600', marginTop: 2 },
  truckStatus: { fontSize: 11, color: T.primary, fontWeight: '600', marginTop: 2 },
  
  // Селектор траков
  truckSelector: {
    margin: 14,
    marginTop: 0,
    maxHeight: 240,
  },
  truckSelectorTitle: { fontSize: 13, fontWeight: '800', color: T.text, marginBottom: 10 },
  truckList: { maxHeight: 200 },
  truckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: T.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border,
  },
  truckItemSelected: {
    borderColor: T.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(6,182,212,0.08)',
  },
  truckItemEmoji: { fontSize: 24 },
  truckItemName: { fontSize: 13, fontWeight: '700', color: T.text },
  truckItemInfo: { fontSize: 11, color: T.textMuted, marginTop: 2 },
  truckItemDeadhead: { fontSize: 10, color: '#fb923c', fontWeight: '600', marginTop: 2 },
  truckItemCheck: { fontSize: 20, color: T.primary, fontWeight: '900' },
  
  footer: { flexDirection: 'row', gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: T.border },
  cancelBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: T.border, borderWidth: 1, borderColor: T.border, alignItems: 'center' },
  cancelText: { fontSize: 14, color: T.textMuted, fontWeight: '600' },
  confirmBtn: { flex: 2, paddingVertical: 13, borderRadius: 12, backgroundColor: '#22c55e', alignItems: 'center' },
  confirmBtnDisabled: { backgroundColor: T.bgCardHover, opacity: 0.5 },
  confirmText: { fontSize: 14, fontWeight: '900', color: '#fff' },
  });
}
