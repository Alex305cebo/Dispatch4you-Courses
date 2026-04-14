import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, useWindowDimensions, Animated,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useGameStore } from '../store/gameStore';

export default function EventScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const {
    currentRoute, currentStopIndex,
    hearts, xp, answerCorrect, answerWrong, advanceStop, completeDelivery,
  } = useGameStore();

  const stop = currentRoute[currentStopIndex];
  const event = stop?.event;

  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (!event) {
    router.back();
    return null;
  }

  const isLastStop = currentStopIndex === currentRoute.length - 1;

  function handleAnswer(key: string, correct: boolean) {
    if (answered) return;
    setSelected(key);
    setAnswered(true);
    setIsCorrect(correct);
    if (correct) {
      answerCorrect(event!.xp);
    } else {
      answerWrong();
    }
  }

  function handleNext() {
    if (isLastStop) {
      completeDelivery();
      router.replace('/finish');
    } else {
      advanceStop();
      router.replace('/map');
    }
  }

  const avatarColors: Record<string, string[]> = {
    broker: ['#1e3a5f', '#1e40af'],
    driver: ['#1a2e1a', '#166534'],
    shipper: ['#3b1f1f', '#7f1d1d'],
  };

  return (
    <View style={styles.container}>
      {/* HUD */}
      <View style={styles.hud}>
        <View style={styles.hudProgress}>
          <View style={[styles.hudFill, { width: `${(currentStopIndex / (currentRoute.length - 1)) * 100}%` }]} />
        </View>
        <View style={styles.hudHearts}>
          {[1, 2, 3].map((i) => (
            <Text key={i} style={[styles.hudHeart, i > hearts && styles.hudHeartDead]}>❤️</Text>
          ))}
        </View>
        <View style={styles.hudXP}><Text style={styles.hudXPText}>⚡ {xp}</Text></View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}
        showsVerticalScrollIndicator={false}
      >
        {/* LOCATION + TYPE */}
        <View style={styles.topRow}>
          <View style={styles.locationBadge}>
            <Text style={styles.locationText}>📍 {event.city}</Text>
          </View>
          <Text style={styles.eventType}>{event.type === 'crisis' ? '🚨 КРИЗИС' : event.type === 'broker_call' ? '📞 БРОКЕР' : event.type === 'driver_call' ? '🚛 ВОДИТЕЛЬ' : '📄 ДОКУМЕНТ'}</Text>
        </View>

        {/* CHAT BUBBLE */}
        <View style={styles.chatBubble}>
          <View style={styles.chatWho}>
            <View style={[styles.chatAvatar, { backgroundColor: avatarColors[event.speaker.avatar][0] }]}>
              <Text style={styles.chatAvatarEmoji}>{event.speaker.emoji}</Text>
            </View>
            <View>
              <Text style={styles.chatRole}>{event.speaker.role}</Text>
              <Text style={styles.chatName}>{event.speaker.name}</Text>
            </View>
          </View>
          <Text style={styles.chatText}>{event.message.replace(/<b>/g, '').replace(/<\/b>/g, '')}</Text>
          <View style={styles.tagRow}>
            {event.tags.map((tag) => (
              <View key={tag.text} style={[styles.tag, styles[`tag_${tag.color}` as keyof typeof styles]]}>
                <Text style={[styles.tagText, styles[`tagText_${tag.color}` as keyof typeof styles]]}>{tag.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* QUESTION */}
        <Text style={styles.question}>{event.question}</Text>

        {/* OPTIONS */}
        <View style={styles.opts}>
          {event.options.map((opt) => {
            const isSelected = selected === opt.key;
            const showCorrect = answered && opt.correct;
            const showWrong = answered && isSelected && !opt.correct;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.opt,
                  showCorrect && styles.optCorrect,
                  showWrong && styles.optWrong,
                  isSelected && !answered && styles.optSelected,
                ]}
                onPress={() => handleAnswer(opt.key, opt.correct)}
                disabled={answered}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.optKey,
                  showCorrect && styles.optKeyCorrect,
                  showWrong && styles.optKeyWrong,
                ]}>
                  <Text style={styles.optKeyText}>{opt.key}</Text>
                </View>
                <Text style={styles.optText}>{opt.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* FEEDBACK */}
        {answered && (
          <View style={[styles.feedback, isCorrect ? styles.feedbackOk : styles.feedbackFail]}>
            <Text style={styles.feedbackIcon}>{isCorrect ? '✅' : '❌'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.feedbackTitle, isCorrect ? styles.feedbackTitleOk : styles.feedbackTitleFail]}>
                {isCorrect ? event.feedback.correct.title : event.feedback.wrong.title}
              </Text>
              <Text style={styles.feedbackDesc}>
                {isCorrect ? event.feedback.correct.desc : event.feedback.wrong.desc}
              </Text>
              {isCorrect && (
                <Text style={styles.feedbackXP}>+{event.xp} XP</Text>
              )}
            </View>
          </View>
        )}

        {/* NEXT BUTTON */}
        {answered && (
          <TouchableOpacity
            style={[styles.nextBtn, isCorrect ? styles.nextBtnOk : styles.nextBtnFail]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>
              {isLastStop ? '🏁 ЗАВЕРШИТЬ ДОСТАВКУ' : '🚛 ПРОДОЛЖИТЬ МАРШРУТ'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  hud: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingTop: 50, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: Colors.bg, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  hudProgress: { flex: 1, height: 10, backgroundColor: Colors.bgCard, borderRadius: 5, overflow: 'hidden' },
  hudFill: { height: '100%', backgroundColor: Colors.success, borderRadius: 5 },
  hudHearts: { flexDirection: 'row', gap: 2 },
  hudHeart: { fontSize: 18 },
  hudHeartDead: { opacity: 0.2 },
  hudXP: { backgroundColor: Colors.bgCard, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 8, paddingVertical: 3 },
  hudXPText: { fontSize: 12, fontWeight: '700', color: Colors.xp },

  scroll: { padding: 16, paddingBottom: 40 },
  scrollWide: { maxWidth: 680, alignSelf: 'center', width: '100%' },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  locationBadge: { backgroundColor: 'rgba(6,182,212,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(6,182,212,0.25)', paddingHorizontal: 12, paddingVertical: 6 },
  locationText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  eventType: { fontSize: 12, fontWeight: '800', color: Colors.textDim },

  chatBubble: {
    backgroundColor: Colors.bgCard, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border,
    padding: 18, marginBottom: 20,
  },
  chatWho: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  chatAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  chatAvatarEmoji: { fontSize: 20 },
  chatRole: { fontSize: 10, fontWeight: '700', color: Colors.textDim, textTransform: 'uppercase', letterSpacing: 1 },
  chatName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  chatText: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 12 },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  tagText: { fontSize: 11, fontWeight: '600' },
  tag_red: { backgroundColor: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)' },
  tagText_red: { color: '#fca5a5' },
  tag_blue: { backgroundColor: 'rgba(6,182,212,0.12)', borderColor: 'rgba(6,182,212,0.3)' },
  tagText_blue: { color: '#67e8f9' },
  tag_yellow: { backgroundColor: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.3)' },
  tagText_yellow: { color: '#fde68a' },
  tag_green: { backgroundColor: 'rgba(34,197,94,0.12)', borderColor: 'rgba(34,197,94,0.3)' },
  tagText_green: { color: '#86efac' },

  question: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 16, lineHeight: 26 },

  opts: { gap: 10, marginBottom: 20 },
  opt: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.bgCard, borderRadius: 16,
    borderWidth: 2, borderColor: Colors.border,
    padding: 16,
  },
  optSelected: { borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.1)' },
  optCorrect: { borderColor: Colors.successDark, backgroundColor: 'rgba(22,163,74,0.1)' },
  optWrong: { borderColor: Colors.dangerDark, backgroundColor: 'rgba(220,38,38,0.1)' },
  optKey: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: Colors.bgCardHover, borderWidth: 2, borderColor: Colors.borderLight,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  optKeyCorrect: { backgroundColor: Colors.successDark, borderColor: Colors.success },
  optKeyWrong: { backgroundColor: Colors.dangerDark, borderColor: Colors.danger },
  optKeyText: { fontSize: 12, fontWeight: '800', color: Colors.textMuted },
  optText: { flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },

  feedback: {
    flexDirection: 'row', gap: 14, borderRadius: 16,
    padding: 16, marginBottom: 16, borderWidth: 1,
  },
  feedbackOk: { backgroundColor: 'rgba(22,163,74,0.12)', borderColor: Colors.successDark },
  feedbackFail: { backgroundColor: 'rgba(220,38,38,0.12)', borderColor: Colors.dangerDark },
  feedbackIcon: { fontSize: 28 },
  feedbackTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  feedbackTitleOk: { color: '#86efac' },
  feedbackTitleFail: { color: '#fca5a5' },
  feedbackDesc: { fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 18 },
  feedbackXP: { fontSize: 13, fontWeight: '800', color: Colors.xp, marginTop: 6 },

  nextBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  nextBtnOk: { backgroundColor: Colors.success },
  nextBtnFail: { backgroundColor: Colors.danger },
  nextBtnText: { fontSize: 15, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
});
