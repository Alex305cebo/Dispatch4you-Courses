/**
 * MENTOR TIP CARD — Слой 2 «Подсказка Майка»
 * Компактная карточка в панели чата/уведомлений
 * Показывает контекстный квиз, привязанный к событию в игре
 */
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLessonStore } from '../store/lessonStore';
import { getDialogById } from '../data/duolingoDialogs';
import type { DuolingoDialog } from '../data/duolingoDialogs';

interface Props {
  lessonId: string;
  prompt: string;
  onDismiss: () => void;
}

type CardPhase = 'invite' | 'question' | 'result';

export default function MentorTipCard({ lessonId, prompt, onDismiss }: Props) {
  const { completeLesson, completedLessons, markContextTriggered } = useLessonStore();
  const [phase, setPhase] = useState<CardPhase>('invite');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  const dialog = getDialogById(lessonId);
  if (!dialog) return null;

  // Уже пройден — не показываем
  const alreadyDone = completedLessons.includes(lessonId);

  const questionStep = dialog.dialogs.find(s => s.question);
  if (!questionStep?.question) return null;

  const q = questionStep.question;

  function handleStartQuiz() {
    setPhase('question');
  }

  function handleSelectOption(index: number) {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const correct = index === q.correctAnswer;
    setIsCorrect(correct);
    const xp = correct ? dialog!.xp : Math.round(dialog!.xp * 0.3);

    setTimeout(() => {
      setPhase('result');
      if (!alreadyDone) {
        completeLesson(dialog!.id, xp);
      }
      markContextTriggered(lessonId);
    }, 800);
  }

  function handleDismiss() {
    markContextTriggered(lessonId);
    onDismiss();
  }

  // ── INVITE ──
  if (phase === 'invite') {
    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={s.mentorAvatar}>
            <Text style={{ fontSize: 18 }}>👨‍💼</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.mentorName}>Майк · Наставник</Text>
            <Text style={s.tipBadge}>💡 Мини-урок</Text>
          </View>
          <TouchableOpacity onPress={handleDismiss} style={s.dismissBtn}>
            <Text style={s.dismissTxt}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.promptText}>{prompt}</Text>
        <View style={s.actionRow}>
          <TouchableOpacity onPress={handleStartQuiz} style={s.quizBtn}>
            <Text style={s.quizBtnText}>Пройти мини-урок →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDismiss} style={s.laterBtn}>
            <Text style={s.laterBtnText}>Позже</Text>
          </TouchableOpacity>
        </View>
        {!alreadyDone && (
          <Text style={s.xpHint}>+{dialog.xp} XP за правильный ответ</Text>
        )}
      </View>
    );
  }

  // ── QUESTION ──
  if (phase === 'question') {
    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={s.mentorAvatar}>
            <Text style={{ fontSize: 18 }}>{questionStep.avatar}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.mentorName}>{dialog.topic}</Text>
            <Text style={s.tipBadge}>{dialog.module}</Text>
          </View>
        </View>

        <View style={s.questionBox}>
          <Text style={s.questionText}>❓ {q.text}</Text>
        </View>

        <View style={s.optionsWrap}>
          {q.options.map((opt, i) => {
            const isSelected = selectedOption === i;
            const isRight = i === q.correctAnswer;
            const showResult = selectedOption !== null;

            return (
              <TouchableOpacity
                key={i}
                onPress={() => handleSelectOption(i)}
                disabled={selectedOption !== null}
                activeOpacity={0.7}
                style={[
                  s.option,
                  showResult && isRight && s.optionCorrect,
                  showResult && isSelected && !isRight && s.optionWrong,
                ]}
              >
                <Text style={s.optionLetter}>
                  {showResult && isRight ? '✅' : showResult && isSelected ? '❌' : String.fromCharCode(65 + i)}
                </Text>
                <Text style={[
                  s.optionText,
                  showResult && (isRight || isSelected) && { color: '#fff', fontWeight: '800' as any },
                ]}>{opt.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  // ── RESULT ──
  return (
    <View style={s.card}>
      <View style={[s.resultBanner, isCorrect ? s.resultCorrect : s.resultWrong]}>
        <Text style={s.resultIcon}>{isCorrect ? '✅' : '❌'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.resultTitle}>{isCorrect ? 'Верно!' : 'Неверно'}</Text>
          <Text style={s.resultXp}>
            {isCorrect ? `+${dialog.xp} XP` : `+${Math.round(dialog.xp * 0.3)} XP`}
          </Text>
        </View>
      </View>

      {!isCorrect && (
        <Text style={s.correctAnswer}>
          Ответ: {q.options[q.correctAnswer].text}
        </Text>
      )}

      <View style={s.explanationBox}>
        <Text style={s.explanationText}>💡 {q.explanation}</Text>
      </View>

      <TouchableOpacity onPress={onDismiss} style={s.doneBtn}>
        <Text style={s.doneBtnText}>Понятно ✓</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(10,132,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(10,132,255,0.2)',
    borderRadius: 16,
    padding: 12,
    gap: 8,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mentorAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(10,132,255,0.15)',
    borderWidth: 1.5, borderColor: 'rgba(10,132,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  mentorName: {
    fontSize: 13, fontWeight: '800', color: '#e2e8f0',
  },
  tipBadge: {
    fontSize: 10, color: '#0a84ff', fontWeight: '700',
  },
  dismissBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  dismissTxt: { fontSize: 11, color: '#64748b', fontWeight: '700' },

  promptText: {
    fontSize: 13, color: '#cbd5e1', lineHeight: 18, fontWeight: '500',
  },

  actionRow: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
  },
  quizBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'rgba(10,132,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(10,132,255,0.3)',
    borderRadius: 10,
    alignItems: 'center',
    // @ts-ignore
    cursor: 'pointer',
  },
  quizBtnText: {
    fontSize: 12, fontWeight: '800', color: '#0a84ff',
  },
  laterBtn: {
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 10,
    // @ts-ignore
    cursor: 'pointer',
  },
  laterBtnText: {
    fontSize: 12, fontWeight: '600', color: '#64748b',
  },
  xpHint: {
    fontSize: 10, color: '#ffd60a', fontWeight: '700', textAlign: 'center',
  },

  // Question
  questionBox: {
    backgroundColor: 'rgba(10,132,255,0.08)',
    borderRadius: 10, padding: 10,
  },
  questionText: {
    fontSize: 13, fontWeight: '700', color: '#fff', lineHeight: 18,
  },
  optionsWrap: { gap: 4 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    // @ts-ignore
    cursor: 'pointer',
  },
  optionCorrect: {
    borderColor: '#30d158', backgroundColor: 'rgba(48,209,88,0.2)',
  },
  optionWrong: {
    borderColor: '#ff453a', backgroundColor: 'rgba(255,69,58,0.2)',
  },
  optionLetter: {
    fontSize: 12, fontWeight: '900', color: '#64748b', width: 22, textAlign: 'center',
  },
  optionText: {
    fontSize: 12, color: '#e2e8f0', fontWeight: '600', flex: 1,
  },

  // Result
  resultBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, borderRadius: 12,
  },
  resultCorrect: { backgroundColor: 'rgba(48,209,88,0.12)' },
  resultWrong: { backgroundColor: 'rgba(255,69,58,0.12)' },
  resultIcon: { fontSize: 22 },
  resultTitle: { fontSize: 15, fontWeight: '900', color: '#fff' },
  resultXp: { fontSize: 12, fontWeight: '800', color: '#ffd60a' },
  correctAnswer: {
    fontSize: 12, color: '#fbbf24', fontWeight: '700', paddingHorizontal: 4,
  },
  explanationBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10, padding: 10,
  },
  explanationText: {
    fontSize: 12, color: '#94a3b8', lineHeight: 17, fontWeight: '500',
  },
  doneBtn: {
    alignSelf: 'center',
    paddingHorizontal: 20, paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    // @ts-ignore
    cursor: 'pointer',
  },
  doneBtnText: {
    fontSize: 12, fontWeight: '700', color: '#94a3b8',
  },
});
