import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { formatTimeShort } from '../store/gameStore';

interface Props {
  truck: any;
  repairCost: number;
  repairLabel: string;
  repairMinutes: number;
  roadsideOrdered: boolean;
  onClose: () => void;
  onCallRoadside: () => void;
}

interface ChatMessage {
  id: string;
  from: 'dispatcher' | 'mechanic';
  text: string;
  time: string;
}

const MECHANIC_NAMES = ['Mike (Roadside)', 'Dave (AAA Truck)', 'Tony (Road Rescue)', 'Sam (Fleet Repair)'];

// Скрипты механика в зависимости от типа поломки
function getMechanicScript(label: string, repairMinutes: number, cost: number): string[] {
  const eta = Math.round(repairMinutes / 60 * 10) / 10;
  const base = [
    `Hey, this is ${MECHANIC_NAMES[Math.floor(Math.random() * MECHANIC_NAMES.length)]}. Got your call about the breakdown.`,
    `What's the issue? Can you describe what happened?`,
  ];
  if (label.toLowerCase().includes('tire') || label.toLowerCase().includes('шин')) {
    return [
      ...base,
      `Sounds like a tire blowout. I'm about ${Math.round(eta * 0.4 * 10) / 10}h away from your location.`,
      `I'll bring a replacement tire. Make sure the driver is off the road and has hazard lights on.`,
      `ETA to your truck: ~${Math.round(eta * 0.4 * 10) / 10}h. Total repair time: ~${eta}h. Cost: $${cost}.`,
    ];
  }
  if (label.toLowerCase().includes('engine') || label.toLowerCase().includes('двигател')) {
    return [
      ...base,
      `Engine issue — that's more serious. I need to tow it to the nearest shop.`,
      `Nearest truck-capable shop is about 12 miles from your location.`,
      `ETA: ~${Math.round(eta * 0.3 * 10) / 10}h to arrive, total repair ~${eta}h. Cost: $${cost}.`,
    ];
  }
  return [
    ...base,
    `I'm dispatching a unit to your location now. ETA ~${Math.round(eta * 0.35 * 10) / 10}h.`,
    `Once I assess the situation on-site I'll give you a final estimate. Ballpark: $${cost}.`,
    `Make sure the driver has the truck's paperwork ready. I'll need VIN and insurance info.`,
  ];
}

const DISPATCHER_QUICK_REPLIES = [
  'How long will the repair take?',
  'Can you give me an ETA?',
  'What exactly is broken?',
  'Do you need the driver to do anything?',
  'Is the truck safe where it is?',
  'Can we get it done faster?',
];

export default function MechanicChatModal({
  truck, repairCost, repairLabel, repairMinutes,
  roadsideOrdered, onClose, onCallRoadside,
}: Props) {
  const { gameMinute } = useGameStore();
  const mechanicName = useRef(MECHANIC_NAMES[Math.floor(Math.random() * MECHANIC_NAMES.length)]).current;
  const script = useRef(getMechanicScript(repairLabel, repairMinutes, repairCost)).current;
  const scriptIdx = useRef(0);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [called, setCalled] = useState(roadsideOrdered);
  const scrollRef = useRef<ScrollView>(null);

  const eta = Math.round(repairMinutes / 60 * 10) / 10;
  const etaArrival = Math.round(repairMinutes * 0.35 / 60 * 10) / 10;

  // Авто-скролл вниз
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  // Первое сообщение механика при открытии (если уже вызван)
  useEffect(() => {
    if (roadsideOrdered && messages.length === 0) {
      addMechanicMsg(`Hey dispatcher, this is ${mechanicName}. I'm already en route to your truck. ETA ~${etaArrival}h.`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addMechanicMsg(text: string) {
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      from: 'mechanic',
      text,
      time: formatTimeShort(gameMinute),
    }]);
  }

  function sendMessage(text: string) {
    if (!text.trim()) return;
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      from: 'dispatcher',
      text: text.trim(),
      time: formatTimeShort(gameMinute),
    }]);
    setInput('');
    // Механик печатает и отвечает
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = script[scriptIdx.current % script.length];
      scriptIdx.current++;
      addMechanicMsg(reply);
    }, 1200 + Math.random() * 800);
  }

  function handleCallRoadside() {
    setCalled(true);
    onCallRoadside();
    // Механик сразу пишет
    setTimeout(() => {
      addMechanicMsg(`Got the dispatch! This is ${mechanicName}. I'm heading to your location now.`);
    }, 600);
    setTimeout(() => {
      addMechanicMsg(`ETA to your truck: ~${etaArrival}h. Total repair time: ~${eta}h. Cost confirmed: $${repairCost}.`);
    }, 2200);
    setTimeout(() => {
      addMechanicMsg(`Tell your driver to stay with the vehicle, hazard lights on, and have the paperwork ready.`);
    }, 4000);
  }

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={s.modal} activeOpacity={1} onPress={e => e.stopPropagation()}>

          {/* ── ШАПКА ── */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <View style={s.avatar}><Text style={{ fontSize: 22 }}>🔧</Text></View>
              <View>
                <Text style={s.title}>Техпомощь</Text>
                <Text style={s.sub}>{truck.driver} · {truck.currentCity}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ── СТАТУС РЕМОНТА ── */}
          <View style={[s.statusCard, called ? s.statusCardActive : s.statusCardPending]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 24 }}>{called ? '🚐' : '🚨'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.statusTitle, { color: called ? '#4ade80' : '#ef4444' }]}>
                  {called ? '✅ Техпомощь едет' : '🚨 ' + repairLabel}
                </Text>
                <Text style={s.statusSub}>
                  {called
                    ? `ETA прибытие: ~${etaArrival}h · Ремонт: ~${eta}h · $${repairCost}`
                    : `Трак стоит · Стоимость ремонта: $${repairCost}`}
                </Text>
              </View>
            </View>

            {/* Прогресс-шаги */}
            <View style={s.steps}>
              {[
                { label: 'Вызов', done: called, icon: '📞' },
                { label: 'Едет', done: called, icon: '🚐' },
                { label: 'На месте', done: false, icon: '🔧' },
                { label: 'Готово', done: false, icon: '✅' },
              ].map((step, i) => (
                <View key={i} style={s.step}>
                  <View style={[s.stepDot, step.done && s.stepDotDone]}>
                    <Text style={{ fontSize: 10 }}>{step.icon}</Text>
                  </View>
                  <Text style={[s.stepLabel, step.done && { color: '#4ade80' }]}>{step.label}</Text>
                </View>
              ))}
            </View>

            {/* Кнопка вызова */}
            {!called && (
              <TouchableOpacity style={s.callBtn} onPress={handleCallRoadside} activeOpacity={0.8}>
                <Text style={s.callBtnText}>🔧 Вызвать техпомощь (${repairCost})</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── ЧАТ ── */}
          <View style={s.chatHeader}>
            <Text style={s.chatTitle}>💬 Чат с механиком</Text>
            {called && <View style={s.onlineDot} />}
            {called && <Text style={s.onlineTxt}>Online</Text>}
          </View>

          <ScrollView
            ref={scrollRef}
            style={s.chatScroll}
            contentContainerStyle={{ padding: 12, gap: 8 }}
            showsVerticalScrollIndicator={false}
          >
            {!called && messages.length === 0 && (
              <View style={s.emptyChatHint}>
                <Text style={s.emptyChatTxt}>Вызови техпомощь чтобы начать чат с механиком</Text>
              </View>
            )}
            {messages.map(msg => (
              <View key={msg.id} style={[
                s.bubble,
                msg.from === 'dispatcher' ? s.bubbleRight : s.bubbleLeft,
              ]}>
                {msg.from === 'mechanic' && (
                  <Text style={s.bubbleName}>🔧 {mechanicName}</Text>
                )}
                <Text style={[s.bubbleText, msg.from === 'dispatcher' && { color: '#fff' }]}>
                  {msg.text}
                </Text>
                <Text style={s.bubbleTime}>{msg.time}</Text>
              </View>
            ))}
            {typing && (
              <View style={[s.bubble, s.bubbleLeft]}>
                <Text style={s.bubbleName}>🔧 {mechanicName}</Text>
                <Text style={s.typingDots}>● ● ●</Text>
              </View>
            )}
          </ScrollView>

          {/* ── БЫСТРЫЕ ОТВЕТЫ ── */}
          {called && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.quickReplies}
              contentContainerStyle={{ gap: 6, paddingHorizontal: 12 }}
            >
              {DISPATCHER_QUICK_REPLIES.map((r, i) => (
                <TouchableOpacity key={i} style={s.quickBtn} onPress={() => sendMessage(r)} activeOpacity={0.75}>
                  <Text style={s.quickBtnTxt}>{r}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* ── ИНПУТ ── */}
          {called && (
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                value={input}
                onChangeText={setInput}
                placeholder="Написать механику..."
                placeholderTextColor="#475569"
                onSubmitEditing={() => sendMessage(input)}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[s.sendBtn, !input.trim() && { opacity: 0.4 }]}
                onPress={() => sendMessage(input)}
                disabled={!input.trim()}
                activeOpacity={0.8}
              >
                <Text style={s.sendBtnTxt}>➤</Text>
              </TouchableOpacity>
            </View>
          )}

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.3)',
    maxHeight: '90%',
  },

  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 2, borderColor: 'rgba(239,68,68,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '900', color: '#fff' },
  sub: { fontSize: 12, color: '#94a3b8', marginTop: 1 },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center',
  },
  closeTxt: { fontSize: 15, color: '#94a3b8' },

  // Status card
  statusCard: {
    margin: 12, padding: 14, borderRadius: 14, borderWidth: 1.5, gap: 12,
  },
  statusCardPending: { borderColor: 'rgba(239,68,68,0.5)', backgroundColor: 'rgba(239,68,68,0.08)' },
  statusCardActive: { borderColor: 'rgba(74,222,128,0.4)', backgroundColor: 'rgba(74,222,128,0.06)' },
  statusTitle: { fontSize: 15, fontWeight: '900' },
  statusSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },

  steps: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  step: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotDone: { backgroundColor: 'rgba(74,222,128,0.2)', borderColor: 'rgba(74,222,128,0.5)' },
  stepLabel: { fontSize: 10, color: '#64748b', fontWeight: '700' },

  callBtn: {
    padding: 12, borderRadius: 12, borderWidth: 1.5,
    borderColor: 'rgba(239,68,68,0.6)', backgroundColor: 'rgba(239,68,68,0.15)',
    alignItems: 'center',
  },
  callBtnText: { fontSize: 14, fontWeight: '900', color: '#ef4444' },

  // Chat
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
  },
  chatTitle: { fontSize: 12, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ade80' },
  onlineTxt: { fontSize: 11, color: '#4ade80', fontWeight: '700' },

  chatScroll: { maxHeight: 220 },

  emptyChatHint: {
    padding: 20, alignItems: 'center',
  },
  emptyChatTxt: { fontSize: 13, color: '#475569', textAlign: 'center' },

  bubble: {
    maxWidth: '80%', padding: 10, borderRadius: 14, gap: 3,
  },
  bubbleLeft: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(6,182,212,0.2)',
    borderWidth: 1, borderColor: 'rgba(6,182,212,0.35)',
    borderBottomRightRadius: 4,
  },
  bubbleName: { fontSize: 10, fontWeight: '800', color: '#ef4444', marginBottom: 2 },
  bubbleText: { fontSize: 13, color: '#e2e8f0', lineHeight: 18 },
  bubbleTime: { fontSize: 10, color: '#475569', alignSelf: 'flex-end' },
  typingDots: { fontSize: 14, color: '#64748b', letterSpacing: 4 },

  // Quick replies
  quickReplies: { maxHeight: 40, marginBottom: 4 },
  quickBtn: {
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: 'rgba(6,182,212,0.1)',
    borderWidth: 1, borderColor: 'rgba(6,182,212,0.25)',
    borderRadius: 20,
  },
  quickBtnTxt: { fontSize: 11, color: '#67e8f9', fontWeight: '600', whiteSpace: 'nowrap' as any },

  // Input
  inputRow: {
    flexDirection: 'row', gap: 8, padding: 12,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)',
  },
  input: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 13, color: '#e2e8f0',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(6,182,212,0.2)',
    borderWidth: 1, borderColor: 'rgba(6,182,212,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnTxt: { fontSize: 18, color: '#06b6d4' },
});
