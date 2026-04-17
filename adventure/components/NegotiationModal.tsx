import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Modal, ScrollView, Animated,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useGameStore, LoadOffer, ActiveLoad } from '../store/gameStore';
import { cityState } from '../constants/config';
import BrokerProfileModal from './BrokerProfileModal';

interface Props {
  onAssign: (load: ActiveLoad) => void;
}

type MsgType = 'broker' | 'you' | 'system';
interface ChatMsg { type: MsgType; text: string; amount?: number }

export default function NegotiationModal({ onAssign }: Props) {
  const { negotiation, makeOffer, closeNegotiation, brokers } = useGameStore();
  const [myOffer, setMyOffer] = useState('');
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [typing, setTyping] = useState(false);
  const [done, setDone] = useState(false);
  const [showBrokerProfile, setShowBrokerProfile] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }).start();
  }, []);

  if (!negotiation.open || !negotiation.load) return null;
  const load = negotiation.load;
  const broker = brokers.find(b => b.id === load.brokerId);
  const rpm = load.postedRate / load.miles;

  // Инициализация чата
  useEffect(() => {
    if (chat.length === 0) {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setChat([{
          type: 'broker',
          text: `Hi! ${broker?.name} here from ${broker?.company}. I have a load for you — ${cityState(load.fromCity)} to ${cityState(load.toCity)}, ${load.miles} miles. ${load.commodity}. I can offer $${load.postedRate.toLocaleString()}. Interested?`,
        }]);
      }, 1200);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [chat, typing]);

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  function handleOffer() {
    const amount = parseInt(myOffer.replace(/\D/g, ''));
    if (!amount || amount < 500 || amount > 20000) { shake(); return; }

    const newChat: ChatMsg[] = [...chat, { type: 'you', text: `I need $${amount.toLocaleString()} for this load.`, amount }];
    setChat(newChat);
    setMyOffer('');
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      const outcome = makeOffer(amount);

      if (outcome === 'accepted') {
        const agreedRate = amount;
        const activeLoad: ActiveLoad = {
          ...load, agreedRate, truckId: '', phase: 'to_pickup',
          detentionMinutes: 0, detentionPaid: false,
        };
        setChat(c => [...c,
          { type: 'broker', text: `Deal! $${agreedRate.toLocaleString()} works for me. I'll send the Rate Con right away. Which truck are you sending?` },
          { type: 'system', text: `✅ Договорились на $${agreedRate.toLocaleString()} ($${(agreedRate / load.miles).toFixed(2)}/mile) — груз сохранён в "Мои грузы"` },
        ]);
        setDone(true);
        setTimeout(() => {
          onAssign(activeLoad);
          closeNegotiation();
        }, 2000);
      } else if (outcome === 'counter') {
        const counter = negotiation.currentOffer;
        const mood = negotiation.brokerMood;
        const responses: Record<string, string[]> = {
          happy: [
            `That's fair! How about we meet at $${counter.toLocaleString()}?`,
            `I like working with you. $${counter.toLocaleString()} and we have a deal?`,
          ],
          neutral: [
            `Hmm, that's a bit high. Best I can do is $${counter.toLocaleString()}.`,
            `I understand, but my budget is $${counter.toLocaleString()}. Can you work with that?`,
          ],
          annoyed: [
            `Look, I'm trying to work with you here. $${counter.toLocaleString()} is my best offer.`,
            `That's too high for this lane. $${counter.toLocaleString()} — take it or leave it.`,
          ],
          angry: [
            `$${counter.toLocaleString()}. That's it. I have other carriers waiting.`,
            `You're wasting my time. $${counter.toLocaleString()} final offer.`,
          ],
        };
        const msgs = responses[mood] || responses.neutral;
        const msg = msgs[Math.floor(Math.random() * msgs.length)];
        setChat(c => [...c, { type: 'broker', text: msg, amount: counter }]);
        setMyOffer(counter.toString());
      } else {
        setChat(c => [...c,
          { type: 'broker', text: `Sorry, I can't go that high. I'll find another carrier. Good luck!` },
          { type: 'system', text: '❌ Брокер отказал. Груз ушёл другому.' },
        ]);
        setDone(true);
        setTimeout(() => { closeNegotiation(); }, 2500);
      }
    }, 1000 + Math.random() * 800);
  }

  function handleAccept() {
    setMyOffer(load.postedRate.toString());
  }

  function handleCounter(pct: number) {
    const amount = Math.floor(load.postedRate * (1 + pct));
    setMyOffer(amount.toString());
  }

  const moodEmoji = { happy: '😊', neutral: '😐', annoyed: '😤', angry: '😠' }[negotiation.brokerMood];

  return (
    <>
    <Modal transparent animationType="none" visible>
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, { transform: [{ translateY: slideAnim }, { translateX: shakeAnim }] }]}>

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.brokerInfo}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarEmoji}>{broker?.avatar ?? '👨‍💼'}</Text>
                <View style={[styles.onlineDot, done && styles.onlineDotOff]} />
              </View>
              <View>
                <Text style={styles.brokerName}>{broker?.name}</Text>
                <Text style={styles.brokerCompany}>{broker?.company}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowBrokerProfile(true)} style={{ padding: 4 }}>
                <Text style={{ fontSize: 16 }}>ℹ️</Text>
              </TouchableOpacity>
              <Text style={styles.moodEmoji}>{moodEmoji}</Text>
            </View>
            <TouchableOpacity onPress={() => { closeNegotiation(); }} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* LOAD SUMMARY */}
          <View style={styles.loadSummary}>
            <Text style={styles.loadRoute}>{cityState(load.fromCity)} → {cityState(load.toCity)}</Text>
            <Text style={styles.loadDetails}>{load.commodity} · {load.miles} mi · {load.equipment}</Text>
            <View style={styles.loadStats}>
              <Text style={styles.loadStat}>Предложение: <Text style={{ color: Colors.warning, fontWeight: '800' }}>${load.postedRate.toLocaleString()}</Text></Text>
              <Text style={styles.loadStat}>Рынок: ~<Text style={{ color: Colors.success, fontWeight: '800' }}>${load.marketRate.toLocaleString()}</Text></Text>
            </View>
          </View>

          {/* CHAT */}
          <ScrollView
            ref={scrollRef}
            style={styles.chat}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {chat.map((msg, i) => (
              <View key={i} style={[
                styles.msgWrap,
                msg.type === 'you' && styles.msgWrapYou,
                msg.type === 'system' && styles.msgWrapSystem,
              ]}>
                {msg.type === 'broker' && (
                  <Text style={styles.msgAvatar}>{broker?.avatar ?? '👨‍💼'}</Text>
                )}
                <View style={[
                  styles.msgBubble,
                  msg.type === 'you' && styles.msgBubbleYou,
                  msg.type === 'system' && styles.msgBubbleSystem,
                ]}>
                  <Text style={[
                    styles.msgText,
                    msg.type === 'you' && styles.msgTextYou,
                    msg.type === 'system' && styles.msgTextSystem,
                  ]}>{msg.text}</Text>
                </View>
              </View>
            ))}
            {typing && (
              <View style={styles.msgWrap}>
                <Text style={styles.msgAvatar}>{broker?.avatar ?? '👨‍💼'}</Text>
                <View style={styles.typingBubble}>
                  <Text style={styles.typingDots}>●●●</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* INPUT */}
          {!done && (
            <>
              <View style={styles.quickBtns}>
                <TouchableOpacity style={styles.quickBtn} onPress={handleAccept}>
                  <Text style={styles.quickBtnText}>Принять ${load.postedRate.toLocaleString()}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickBtn} onPress={() => handleCounter(0.1)}>
                  <Text style={styles.quickBtnText}>+10% ${Math.floor(load.postedRate * 1.1).toLocaleString()}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickBtn} onPress={() => handleCounter(0.2)}>
                  <Text style={styles.quickBtnText}>+20% ${Math.floor(load.postedRate * 1.2).toLocaleString()}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputDollar}>$</Text>
                  <TextInput
                    style={styles.input}
                    value={myOffer}
                    onChangeText={setMyOffer}
                    keyboardType="numeric"
                    placeholder="Введи сумму..."
                    placeholderTextColor={Colors.textDim}
                    onSubmitEditing={handleOffer}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.sendBtn, (!myOffer || typing) && styles.sendBtnOff]}
                  onPress={handleOffer}
                  disabled={!myOffer || typing}
                >
                  <Text style={styles.sendBtnText}>Отправить ↗</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

        </Animated.View>
      </View>
    </Modal>
    {showBrokerProfile && broker && <BrokerProfileModal broker={broker} onClose={() => setShowBrokerProfile(false)} />}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#080e1c',
    borderRadius: 28,
    borderWidth: 1, borderColor: '#1e2d45',
    maxHeight: '88%',
    width: '100%',
    maxWidth: 520,
  },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 18, borderBottomWidth: 1, borderBottomColor: '#1e2d45',
  },
  brokerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: { position: 'relative' },
  avatarEmoji: { fontSize: 36 },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.success, borderWidth: 2, borderColor: '#080e1c',
  },
  onlineDotOff: { backgroundColor: Colors.textDim },
  brokerName: { fontSize: 16, fontWeight: '800', color: '#fff' },
  brokerCompany: { fontSize: 11, color: Colors.textDim, marginTop: 1 },
  moodEmoji: { fontSize: 24, marginLeft: 8 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 14, color: Colors.textMuted },

  loadSummary: {
    margin: 14, padding: 14,
    backgroundColor: '#0d1526', borderRadius: 14,
    borderWidth: 1, borderColor: '#1e2d45', gap: 4,
  },
  loadRoute: { fontSize: 16, fontWeight: '900', color: '#fff' },
  loadDetails: { fontSize: 12, color: Colors.textMuted },
  loadStats: { flexDirection: 'row', gap: 16, marginTop: 4 },
  loadStat: { fontSize: 12, color: Colors.textMuted },

  chat: { maxHeight: 220, paddingHorizontal: 14 },
  chatContent: { gap: 10, paddingVertical: 8 },

  msgWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgWrapYou: { flexDirection: 'row-reverse' },
  msgWrapSystem: { justifyContent: 'center' },
  msgAvatar: { fontSize: 22, marginBottom: 2 },
  msgBubble: {
    maxWidth: '75%', backgroundColor: '#1e2d45',
    borderRadius: 16, borderBottomLeftRadius: 4,
    padding: 12,
  },
  msgBubbleYou: {
    backgroundColor: 'rgba(6,182,212,0.2)',
    borderRadius: 16, borderBottomRightRadius: 4,
    borderWidth: 1, borderColor: 'rgba(6,182,212,0.4)',
  },
  msgBubbleSystem: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
    alignSelf: 'center',
  },
  msgText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  msgTextYou: { color: '#67e8f9' },
  msgTextSystem: { color: Colors.success, fontWeight: '700', fontSize: 12 },

  typingBubble: {
    backgroundColor: '#1e2d45', borderRadius: 16, borderBottomLeftRadius: 4,
    padding: 12,
  },
  typingDots: { fontSize: 12, color: Colors.textDim, letterSpacing: 3 },

  quickBtns: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingTop: 10,
  },
  quickBtn: {
    flex: 1, backgroundColor: '#0d1526', borderRadius: 10,
    borderWidth: 1, borderColor: '#1e2d45',
    paddingVertical: 8, alignItems: 'center',
  },
  quickBtnText: { fontSize: 10, color: Colors.textMuted, fontWeight: '700' },

  inputRow: {
    flexDirection: 'row', gap: 10, padding: 14, paddingTop: 10,
  },
  inputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d1526', borderRadius: 14,
    borderWidth: 1, borderColor: '#1e2d45', paddingHorizontal: 14,
  },
  inputDollar: { fontSize: 18, color: Colors.success, fontWeight: '900', marginRight: 4 },
  input: { flex: 1, fontSize: 20, fontWeight: '800', color: '#fff', paddingVertical: 12 },
  sendBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingHorizontal: 18, justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5, shadowRadius: 8, elevation: 5,
  },
  sendBtnOff: { backgroundColor: Colors.bgCard, shadowOpacity: 0 },
  sendBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },
});
