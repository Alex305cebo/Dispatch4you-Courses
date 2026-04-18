import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Animated } from 'react-native';
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
  onRepairComplete?: () => void;
}

interface ChatMessage {
  id: string;
  from: 'dispatcher' | 'mechanic';
  text: string;
  time: string;
}

// Стадии ремонта
type RepairStage = 'pending' | 'driving' | 'arrived' | 'repairing' | 'done';

const MECHANIC_NAMES = ['Mike (Roadside)', 'Dave (AAA Truck)', 'Tony (Road Rescue)', 'Sam (Fleet Repair)'];

// Скрипты по стадиям
function getStageScript(stage: RepairStage, name: string, eta: number, cost: number, label: string) {
  switch (stage) {
    case 'driving':
      return [
        `Got the dispatch! This is ${name}. I'm heading to your location now.`,
        `ETA to your truck: ~${Math.round(eta * 0.4 * 10) / 10}h. I'll call when I'm close.`,
        `Tell your driver to stay with the vehicle, hazard lights on, and have VIN + insurance ready.`,
      ];
    case 'arrived':
      return [
        `I'm on site. Found your truck — assessing the situation now.`,
        `Confirmed: ${label}. This is fixable on the road.`,
        `Final estimate: $${cost}. Repair time ~${Math.round(eta * 0.6 * 10) / 10}h. Confirm to proceed?`,
      ];
    case 'repairing':
      return [
        `Started the repair. Driver is watching — good guy.`,
        `About halfway done. No surprises so far.`,
        `Almost finished. Running final checks on the system.`,
      ];
    case 'done':
      return [
        `✅ Repair complete! Truck is road-ready.`,
        `Invoice: $${cost}. I'll send it to your email.`,
        `Driver confirmed everything looks good. Safe travels!`,
      ];
    default:
      return [];
  }
}

// Быстрые ответы по стадиям
const QUICK_REPLIES: Record<RepairStage, string[]> = {
  pending: [],
  driving: [
    'How far are you?',
    'Driver is waiting at the truck.',
    'Hazard lights are on.',
    'Can you go faster?',
    'What do you need from us?',
  ],
  arrived: [
    'Confirm — proceed with repair.',
    'How long exactly?',
    'Is the truck safe to leave?',
    'Can the driver help?',
  ],
  repairing: [
    'How much longer?',
    'Any complications?',
    'Driver says it sounds bad.',
    'Keep me posted.',
  ],
  done: [
    'Thanks! Send the invoice.',
    'Great work!',
    'Driver is heading out now.',
  ],
};

export default function MechanicChatModal({
  truck, repairCost, repairLabel, repairMinutes,
  roadsideOrdered, onClose, onCallRoadside, onRepairComplete,
}: Props) {
  const { gameMinute } = useGameStore();
  const mechanicName = useRef(MECHANIC_NAMES[Math.floor(Math.random() * MECHANIC_NAMES.length)]).current;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [called, setCalled] = useState(roadsideOrdered);
  const [stage, setStage] = useState<RepairStage>(roadsideOrdered ? 'driving' : 'pending');
  const [closing, setClosing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const stageScriptIdx = useRef(0);

  // Анимация линий прогресса (4 линии между 5 шагами)
  const lineAnims = useRef([
    new Animated.Value(roadsideOrdered ? 1 : 0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const eta = Math.round(repairMinutes / 60 * 10) / 10;
  const etaArrival = Math.max(0.3, Math.round(repairMinutes * 0.35 / 60 * 10) / 10);

  // Авто-скролл
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  // Если уже вызван — начинаем с driving стадии
  useEffect(() => {
    if (roadsideOrdered && messages.length === 0) {
      addMechanicMsg(`Hey dispatcher, this is ${mechanicName}. I'm already en route. ETA ~${etaArrival}h.`);
      scheduleStageProgression('driving');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addMechanicMsg(text: string) {
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      from: 'mechanic', text,
      time: formatTimeShort(gameMinute),
    }]);
  }

  function addDispatcherMsg(text: string) {
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      from: 'dispatcher', text,
      time: formatTimeShort(gameMinute),
    }]);
  }

  // Анимируем линию при переходе в новую стадию
  function animateLine(lineIdx: number, duration: number) {
    lineAnims[lineIdx].setValue(0);
    Animated.timing(lineAnims[lineIdx], {
      toValue: 1,
      duration,
      useNativeDriver: false,
    }).start();
  }

  // Автоматическое продвижение по стадиям
  function scheduleStageProgression(currentStage: RepairStage) {
    const delays: Record<RepairStage, number> = {
      pending: 0,
      driving:   etaArrival * 60 * 1000 * 0.15,
      arrived:   8000,
      repairing: repairMinutes * 1000 * 0.08,
      done:      0,
    };

    const nextStage: Partial<Record<RepairStage, RepairStage>> = {
      driving: 'arrived',
      arrived: 'repairing',
      repairing: 'done',
    };

    // Индекс линии для каждого перехода
    const lineIndex: Partial<Record<RepairStage, number>> = {
      driving:   1, // линия между "Едет" и "На месте"
      arrived:   2, // линия между "На месте" и "Ремонт"
      repairing: 3, // линия между "Ремонт" и "Готово"
    };

    const delay = Math.max(6000, Math.min(delays[currentStage], 20000));
    const next = nextStage[currentStage];
    if (!next) return;

    // Анимируем линию ДО следующей стадии за время delay
    const lIdx = lineIndex[currentStage];
    if (lIdx !== undefined) animateLine(lIdx, delay);

    setTimeout(() => {
      setStage(next);
      stageScriptIdx.current = 0;
      const script = getStageScript(next, mechanicName, eta, repairCost, repairLabel);
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        addMechanicMsg(script[0]);
        if (script[1]) {
          setTimeout(() => {
            setTyping(true);
            setTimeout(() => { setTyping(false); addMechanicMsg(script[1]); }, 1500);
          }, 2500);
        }
        if (next === 'done') {
          setTimeout(() => {
            addMechanicMsg(script[2] || 'Safe travels!');
            setTimeout(() => {
              onRepairComplete?.();   // ← восстанавливаем трак
              setClosing(true);
              setTimeout(onClose, 2500);
            }, 3000);
          }, 5000);
        } else {
          scheduleStageProgression(next);
        }
      }, 1200);
    }, delay);
  }

  function sendMessage(text: string) {
    if (!text.trim() || closing) return;
    addDispatcherMsg(text.trim());
    setInput('');
    // Механик отвечает из скрипта текущей стадии
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const script = getStageScript(stage, mechanicName, eta, repairCost, repairLabel);
      stageScriptIdx.current = (stageScriptIdx.current + 1) % Math.max(script.length, 1);
      const reply = script[stageScriptIdx.current] || `Copy that. I'll keep you posted.`;
      addMechanicMsg(reply);
    }, 1000 + Math.random() * 800);
  }

  function handleCallRoadside() {
    setCalled(true);
    setStage('driving');
    stageScriptIdx.current = 0;
    onCallRoadside();
    // Анимируем первую линию (Вызов → Едет) мгновенно
    animateLine(0, 500);
    const script = getStageScript('driving', mechanicName, eta, repairCost, repairLabel);
    setTimeout(() => addMechanicMsg(script[0]), 600);
    setTimeout(() => { setTyping(true); setTimeout(() => { setTyping(false); addMechanicMsg(script[1]); }, 1200); }, 2500);
    setTimeout(() => { setTyping(true); setTimeout(() => { setTyping(false); addMechanicMsg(script[2]); }, 1200); }, 5000);
    scheduleStageProgression('driving');
  }

  // Шаги прогресса
  const STEPS: { label: string; icon: string; s: RepairStage }[] = [
    { label: 'Вызов',    icon: '📞', s: 'driving'   },
    { label: 'Едет',     icon: '🚐', s: 'driving'   },
    { label: 'На месте', icon: '🔧', s: 'arrived'   },
    { label: 'Ремонт',   icon: '⚙️', s: 'repairing' },
    { label: 'Готово',   icon: '✅', s: 'done'      },
  ];
  const stageOrder: RepairStage[] = ['pending', 'driving', 'arrived', 'repairing', 'done'];
  const stageIdx = stageOrder.indexOf(stage);

  const quickReplies = QUICK_REPLIES[stage];

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={s.modal} activeOpacity={1} onPress={e => e.stopPropagation()}>

          {/* ── ШАПКА ── */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <View style={[s.avatar, stage === 'done' && { borderColor: 'rgba(74,222,128,0.6)', backgroundColor: 'rgba(74,222,128,0.15)' }]}>
                <Text style={{ fontSize: 22 }}>{stage === 'done' ? '✅' : '🔧'}</Text>
              </View>
              <View>
                <Text style={s.title}>Техпомощь</Text>
                <Text style={s.sub}>{truck.driver} · {truck.currentCity}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ── СТАТУС ── */}
          <View style={[s.statusCard,
            stage === 'done' ? s.statusDone :
            called ? s.statusCardActive : s.statusCardPending
          ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 22 }}>
                {stage === 'done' ? '✅' : stage === 'repairing' ? '⚙️' : stage === 'arrived' ? '🔧' : called ? '🚐' : '🚨'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.statusTitle, {
                  color: stage === 'done' ? '#4ade80' : stage === 'repairing' ? '#fbbf24' : called ? '#38bdf8' : '#ef4444'
                }]}>
                  {stage === 'done'      ? '✅ Ремонт завершён!'
                  : stage === 'repairing' ? '⚙️ Идёт ремонт...'
                  : stage === 'arrived'   ? '🔧 Механик на месте'
                  : called               ? '🚐 Техпомощь едет'
                  :                        '🚨 ' + repairLabel}
                </Text>
                <Text style={s.statusSub}>
                  {stage === 'done'       ? `Трак готов к работе · Счёт: $${repairCost}`
                  : stage === 'repairing'  ? `Ремонт в процессе · ~${Math.round(eta * 0.6 * 10) / 10}h`
                  : stage === 'arrived'    ? `Механик осматривает трак · $${repairCost}`
                  : called                ? `ETA прибытие: ~${etaArrival}h · Ремонт: ~${eta}h · $${repairCost}`
                  :                         `Трак стоит · Стоимость ремонта: $${repairCost}`}
                </Text>
              </View>
            </View>

            {/* Прогресс-шаги с линиями */}
            <View style={s.steps}>
              {STEPS.map((step, i) => {
                const stepStageIdx = stageOrder.indexOf(step.s);
                const isDone = stageIdx >= stepStageIdx && called;
                const isCurrent = stageIdx === stepStageIdx && called;
                const isLast = i === STEPS.length - 1;
                return (
                  <View key={i} style={s.stepWrap}>
                    {/* Линия слева (кроме первого) */}
                    {i > 0 && (
                      <View style={s.lineTrack}>
                        <Animated.View style={[
                          s.lineFill,
                          { width: lineAnims[i - 1].interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
                          isDone ? s.lineFillDone : s.lineFillCurrent,
                        ]} />
                      </View>
                    )}
                    <View style={s.step}>
                      <View style={[s.stepDot, isDone && s.stepDotDone, isCurrent && s.stepDotCurrent]}>
                        <Text style={{ fontSize: 10 }}>{step.icon}</Text>
                      </View>
                      <Text style={[s.stepLabel, isDone && { color: '#4ade80' }, isCurrent && { color: '#38bdf8' }]}>
                        {step.label}
                      </Text>
                    </View>
                    {/* Линия справа (кроме последнего) */}
                    {!isLast && (
                      <View style={s.lineTrack}>
                        <Animated.View style={[
                          s.lineFill,
                          { width: lineAnims[i].interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
                          stageIdx > stepStageIdx && called ? s.lineFillDone : s.lineFillCurrent,
                        ]} />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Кнопка вызова */}
            {!called && (
              <TouchableOpacity style={s.callBtn} onPress={handleCallRoadside} activeOpacity={0.8}>
                <Text style={s.callBtnText}>🔧 Вызвать техпомощь · ${repairCost}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── ЧАТ ── */}
          <View style={s.chatHeader}>
            <Text style={s.chatTitle}>💬 Чат с механиком</Text>
            {called && <View style={[s.onlineDot, stage === 'done' && { backgroundColor: '#64748b' }]} />}
            {called && <Text style={[s.onlineTxt, stage === 'done' && { color: '#64748b' }]}>
              {stage === 'done' ? 'Завершён' : 'Online'}
            </Text>}
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
              <View key={msg.id} style={[s.bubble, msg.from === 'dispatcher' ? s.bubbleRight : s.bubbleLeft]}>
                {msg.from === 'mechanic' && <Text style={s.bubbleName}>🔧 {mechanicName}</Text>}
                <Text style={[s.bubbleText, msg.from === 'dispatcher' && { color: '#fff' }]}>{msg.text}</Text>
                <Text style={s.bubbleTime}>{msg.time}</Text>
              </View>
            ))}
            {typing && (
              <View style={[s.bubble, s.bubbleLeft]}>
                <Text style={s.bubbleName}>🔧 {mechanicName}</Text>
                <Text style={s.typingDots}>● ● ●</Text>
              </View>
            )}
            {closing && (
              <View style={s.closingHint}>
                <Text style={s.closingTxt}>🚛 Трак готов. Окно закрывается...</Text>
              </View>
            )}
          </ScrollView>

          {/* ── БЫСТРЫЕ ОТВЕТЫ (меняются по стадии) ── */}
          {called && quickReplies.length > 0 && !closing && (
            <ScrollView
              horizontal showsHorizontalScrollIndicator={false}
              style={s.quickReplies}
              contentContainerStyle={{ gap: 6, paddingHorizontal: 12 }}
            >
              {quickReplies.map((r, i) => (
                <TouchableOpacity key={i} style={s.quickBtn} onPress={() => sendMessage(r)} activeOpacity={0.75}>
                  <Text style={s.quickBtnTxt}>{r}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* ── ИНПУТ ── */}
          {called && !closing && (
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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modal: { backgroundColor: '#0f172a', borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.3)', maxHeight: '88%', width: '100%', maxWidth: 480 },

  header: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 2, borderColor: 'rgba(239,68,68,0.5)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '900', color: '#fff' },
  sub: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  closeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  closeTxt: { fontSize: 14, color: '#94a3b8' },

  statusCard: { margin: 10, padding: 12, borderRadius: 14, borderWidth: 1.5, gap: 10 },
  statusCardPending:  { borderColor: 'rgba(239,68,68,0.5)',  backgroundColor: 'rgba(239,68,68,0.08)'  },
  statusCardActive:   { borderColor: 'rgba(56,189,248,0.4)', backgroundColor: 'rgba(56,189,248,0.06)' },
  statusDone:         { borderColor: 'rgba(74,222,128,0.4)', backgroundColor: 'rgba(74,222,128,0.06)' },
  statusTitle: { fontSize: 14, fontWeight: '900' },
  statusSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },

  steps: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 2 },
  stepWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  step: { alignItems: 'center', gap: 3 },
  stepDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  stepDotDone:    { backgroundColor: 'rgba(74,222,128,0.2)',  borderColor: 'rgba(74,222,128,0.5)'  },
  stepDotCurrent: { backgroundColor: 'rgba(56,189,248,0.2)',  borderColor: 'rgba(56,189,248,0.6)'  },
  stepLabel: { fontSize: 9, color: '#64748b', fontWeight: '700' },
  lineTrack: { flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 12, overflow: 'hidden' },
  lineFill:        { height: '100%' as any, borderRadius: 2, backgroundColor: 'rgba(56,189,248,0.5)' },
  lineFillDone:    { backgroundColor: '#4ade80' },
  lineFillCurrent: { backgroundColor: '#38bdf8' },

  callBtn: { padding: 11, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.6)', backgroundColor: 'rgba(239,68,68,0.15)', alignItems: 'center' },
  callBtnText: { fontSize: 13, fontWeight: '900', color: '#ef4444' },

  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  chatTitle: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' },
  onlineTxt: { fontSize: 10, color: '#4ade80', fontWeight: '700' },

  chatScroll: { maxHeight: 200 },
  emptyChatHint: { padding: 20, alignItems: 'center' },
  emptyChatTxt: { fontSize: 13, color: '#475569', textAlign: 'center' },

  bubble: { maxWidth: '80%', padding: 9, borderRadius: 14, gap: 2 },
  bubbleLeft:  { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderBottomLeftRadius: 4 },
  bubbleRight: { alignSelf: 'flex-end',   backgroundColor: 'rgba(6,182,212,0.2)',    borderWidth: 1, borderColor: 'rgba(6,182,212,0.35)',    borderBottomRightRadius: 4 },
  bubbleName: { fontSize: 10, fontWeight: '800', color: '#ef4444', marginBottom: 1 },
  bubbleText: { fontSize: 12, color: '#e2e8f0', lineHeight: 17 },
  bubbleTime: { fontSize: 9, color: '#475569', alignSelf: 'flex-end' },
  typingDots: { fontSize: 13, color: '#64748b', letterSpacing: 4 },

  closingHint: { padding: 12, alignItems: 'center', backgroundColor: 'rgba(74,222,128,0.08)', borderRadius: 10, marginTop: 4 },
  closingTxt: { fontSize: 12, color: '#4ade80', fontWeight: '700' },

  quickReplies: { maxHeight: 38, marginBottom: 2 },
  quickBtn: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: 'rgba(6,182,212,0.1)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.25)', borderRadius: 20 },
  quickBtnTxt: { fontSize: 11, color: '#67e8f9', fontWeight: '600', whiteSpace: 'nowrap' as any },

  inputRow: { flexDirection: 'row', gap: 8, padding: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)' },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, color: '#e2e8f0' },
  sendBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(6,182,212,0.2)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.4)', alignItems: 'center', justifyContent: 'center' },
  sendBtnTxt: { fontSize: 17, color: '#06b6d4' },
});
