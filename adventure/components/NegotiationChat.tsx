import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { useGameStore, LoadOffer } from '../store/gameStore';

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
  const diff = myOffer - load.postedRate;
  const pct = diff / load.postedRate;

  if (myOffer >= market) {
    return { text: `Deal! $${myOffer.toLocaleString()} works for me. I'll send the Rate Con right away.`, counterOffer: myOffer, mood: 'happy', accepted: true, rejected: false };
  }
  if (myOffer >= min) {
    if (round >= 2) return { text: `Alright, you got me. $${myOffer.toLocaleString()} — deal. Sending Rate Con.`, counterOffer: myOffer, mood: 'neutral', accepted: true, rejected: false };
    const counter = Math.round((myOffer + market) / 2);
    return { text: `Hmm, I can't go that low. How about $${counter.toLocaleString()}? That's my best.`, counterOffer: counter, mood: 'neutral', accepted: false, rejected: false };
  }
  if (pct > 0.25) {
    return { text: `Come on, that's way too high. I'm not paying $${myOffer.toLocaleString()} for this lane. No deal.`, counterOffer: 0, mood: 'angry', accepted: false, rejected: true };
  }
  if (round >= 3) {
    return { text: `Look, I've been patient but we're going in circles. I'll pass on this one.`, counterOffer: 0, mood: 'angry', accepted: false, rejected: true };
  }
  const counter = Math.round(load.postedRate + (market - load.postedRate) * 0.4);
  return { text: `I hear you, but $${myOffer.toLocaleString()} is too much. I can do $${counter.toLocaleString()} — final offer.`, counterOffer: counter, mood: 'annoyed', accepted: false, rejected: false };
}

function getMyOfferTiles(currentOffer: number, load: LoadOffer): { label: string; value: number; tag?: string }[] {
  const market = load.marketRate;
  const posted = load.postedRate;
  return [
    { label: `$${Math.round(posted * 1.05).toLocaleString()}`, value: Math.round(posted * 1.05), tag: '+5%' },
    { label: `$${Math.round(posted * 1.10).toLocaleString()}`, value: Math.round(posted * 1.10), tag: '+10%' },
    { label: `$${Math.round(posted * 1.15).toLocaleString()}`, value: Math.round(posted * 1.15), tag: '+15%' },
    { label: `$${Math.round(market).toLocaleString()}`, value: Math.round(market), tag: 'Market' },
    { label: `$${Math.round(market * 1.05).toLocaleString()}`, value: Math.round(market * 1.05), tag: '+5% market' },
  ];
}

const MOOD_EMOJI = { happy: '😊', neutral: '😐', annoyed: '😤', angry: '😠' };

export default function NegotiationChat({ visible, load, onClose, onAccepted }: Props) {
  const { brokers, addMoney, bookLoad, availableLoads, openNegotiation, makeOffer, closeNegotiation } = useGameStore();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [round, setRound] = useState(0);
  const [currentOffer, setCurrentOffer] = useState(0);
  const [mood, setMood] = useState<'happy' | 'neutral' | 'annoyed' | 'angry'>('neutral');
  const [done, setDone] = useState<'accepted' | 'rejected' | null>(null);
  const [agreedRate, setAgreedRate] = useState(0);
  const [gameMinute] = useState(useGameStore.getState().gameMinute);

  useEffect(() => {
    if (visible && load) {
      const broker = brokers.find(b => b.id === load.brokerId);
      setMessages([{
        from: 'broker',
        text: `Hey! I've got a load for you: ${load.fromCity} → ${load.toCity}, ${load.miles} miles, ${load.commodity}. I'm posting at $${load.postedRate.toLocaleString()}. Interested?`,
        time: gameMinute,
      }]);
      setRound(0);
      setCurrentOffer(load.postedRate);
      setMood('neutral');
      setDone(null);
      setAgreedRate(0);
    }
  }, [visible, load]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  if (!load) return null;

  const broker = brokers.find(b => b.id === load.brokerId);
  const tiles = getMyOfferTiles(currentOffer, load);

  function handleOffer(offerValue: number) {
    if (done || !load) return;
    const newRound = round + 1;
    setRound(newRound);

    const myMsg: Message = {
      from: 'me',
      text: `I can do $${offerValue.toLocaleString()} for this load. That's ${load.miles} miles at $${(offerValue / load.miles).toFixed(2)}/mile.`,
      time: gameMinute + newRound,
    };

    const reply = getBrokerReply(offerValue, load, newRound);
    setMood(reply.mood);

    const brokerMsg: Message = {
      from: 'broker',
      text: reply.text,
      time: gameMinute + newRound,
    };

    setMessages(prev => [...prev, myMsg, brokerMsg]);

    if (reply.accepted) {
      setDone('accepted');
      setAgreedRate(offerValue);
    } else if (reply.rejected) {
      setDone('rejected');
    } else {
      setCurrentOffer(reply.counterOffer);
    }
  }

  function handleAcceptCounter() {
    if (done || !load) return;
    const myMsg: Message = {
      from: 'me',
      text: `OK, I'll take $${currentOffer.toLocaleString()}. Send me the Rate Con.`,
      time: gameMinute + round + 1,
    };
    const brokerMsg: Message = {
      from: 'broker',
      text: `Perfect! Rate Con coming your way. Thanks for working with us!`,
      time: gameMinute + round + 1,
    };
    setMessages(prev => [...prev, myMsg, brokerMsg]);
    setDone('accepted');
    setAgreedRate(currentOffer);
  }

  function handleConfirmDeal() {
    if (agreedRate > 0) onAccepted(agreedRate);
    onClose();
  }

  const rpmPosted = (load.postedRate / load.miles).toFixed(2);
  const rpmMarket = (load.marketRate / load.miles).toFixed(2);

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
              <Text style={s.loadMeta}>{load.miles} mi · Posted: ${load.postedRate.toLocaleString()} (${rpmPosted}/mi)</Text>
              <Text style={s.loadMarket}>Market: ${load.marketRate.toLocaleString()} (${rpmMarket}/mi)</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Chat */}
          <ScrollView ref={scrollRef} style={s.chat} contentContainerStyle={s.chatContent}>
            {messages.map((msg, i) => (
              <View key={i} style={[s.bubble, msg.from === 'me' ? s.bubbleMe : s.bubbleBroker]}>
                {msg.from === 'broker' && (
                  <Text style={s.bubbleAvatar}>{broker?.avatar || '👨‍💼'}</Text>
                )}
                <View style={[s.bubbleBody, msg.from === 'me' ? s.bubbleBodyMe : s.bubbleBodyBroker]}>
                  <Text style={[s.bubbleText, msg.from === 'me' ? s.bubbleTextMe : s.bubbleTextBroker]}>
                    {msg.text}
                  </Text>
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
            <View style={s.footer}>
              <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
                <Text style={s.cancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.confirmBtn} onPress={handleConfirmDeal}>
                <Text style={s.confirmText}>🚛 Назначить трак</Text>
              </TouchableOpacity>
            </View>
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

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modal: { backgroundColor: '#080e1c', borderRadius: 22, borderWidth: 1, borderColor: '#1e2d45', maxHeight: '90%', width: '100%', maxWidth: 520 },

  header: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderBottomWidth: 1, borderBottomColor: '#1e2d45', gap: 10 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brokerAvatar: { fontSize: 28 },
  brokerName: { fontSize: 14, fontWeight: '800', color: '#fff' },
  brokerCompany: { fontSize: 11, color: '#64748b' },
  headerRight: { flex: 1 },
  loadRoute: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  loadMeta: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  loadMarket: { fontSize: 10, color: '#4ade80', marginTop: 1 },
  closeBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 13, color: '#94a3b8' },

  chat: { flex: 1, maxHeight: 300 },
  chatContent: { padding: 14, gap: 10 },

  bubble: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  bubbleMe: { justifyContent: 'flex-end' },
  bubbleBroker: { justifyContent: 'flex-start' },
  bubbleAvatar: { fontSize: 20, marginBottom: 2 },
  bubbleBody: { maxWidth: '78%', borderRadius: 14, padding: 10 },
  bubbleBodyMe: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleBodyBroker: { backgroundColor: '#0d1526', borderWidth: 1, borderColor: '#1e2d45', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 13, lineHeight: 19 },
  bubbleTextMe: { color: '#fff', fontWeight: '600' },
  bubbleTextBroker: { color: '#e2e8f0' },

  dealBanner: { alignItems: 'center', padding: 14, backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', marginTop: 8 },
  dealIcon: { fontSize: 28, marginBottom: 4 },
  dealText: { fontSize: 16, fontWeight: '900', color: '#4ade80' },
  dealRpm: { fontSize: 12, color: '#86efac', marginTop: 2 },

  rejectBanner: { alignItems: 'center', padding: 14, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', marginTop: 8 },
  rejectIcon: { fontSize: 28, marginBottom: 4 },
  rejectText: { fontSize: 14, fontWeight: '700', color: '#f87171' },

  actions: { padding: 14, borderTopWidth: 1, borderTopColor: '#1e2d45', gap: 10 },
  actionsLabel: { fontSize: 10, fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#0d1526', borderRadius: 12, borderWidth: 1.5, borderColor: '#1e2d45', alignItems: 'center' },
  tileVal: { fontSize: 14, fontWeight: '800', color: '#fff' },
  tileTag: { fontSize: 9, color: '#4ade80', fontWeight: '700', marginTop: 2 },
  acceptCounterBtn: { paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', alignItems: 'center' },
  acceptCounterText: { fontSize: 14, fontWeight: '800', color: '#4ade80' },

  footer: { flexDirection: 'row', gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: '#1e2d45' },
  cancelBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: '#1e2d45', alignItems: 'center' },
  cancelText: { fontSize: 14, color: '#94a3b8', fontWeight: '600' },
  confirmBtn: { flex: 2, paddingVertical: 13, borderRadius: 12, backgroundColor: '#22c55e', alignItems: 'center' },
  confirmText: { fontSize: 14, fontWeight: '900', color: '#fff' },
});

