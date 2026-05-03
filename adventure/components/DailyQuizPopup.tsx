/**
 * DAILY QUIZ POPUP — «Совет дня»
 * Duolingo-style мини-квиз перед началом игры
 * Показывает один урок из следующего непройденного
 */
import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLessonStore } from '../store/lessonStore';
import { allDuolingoDialogs, getDialogById } from '../data/duolingoDialogs';
import type { DuolingoDialog, DuolingoDialogStep } from '../data/duolingoDialogs';

interface Props {
  onClose: () => void;       // Закрыть попап (пропустить)
  onComplete: () => void;    // Урок пройден → продолжить в игру
}

type Phase = 'intro' | 'question' | 'feedback' | 'outro';

export default function DailyQuizPopup({ onClose, onComplete }: Props) {
  const { width: W } = useWindowDimensions();
  const isMobile = W < 500;
  const cardW = isMobile ? W - 40 : 420;

  const { getNextLesson, completeLesson, markDailyQuizShown, completedLessons, totalXP, streak } = useLessonStore();

  const [dialog, setDialog] = useState<DuolingoDialog | null>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [showXpAnim, setShowXpAnim] = useState(false);

  // Загружаем следующий непройденный урок
  useEffect(() => {
    const nextId = getNextLesson();
    if (nextId) {
      const d = getDialogById(nextId);
      if (d) {
        setDialog(d);
        markDailyQuizShown();
      }
    }
  }, []);

  if (!dialog) return null;

  const steps = dialog.dialogs;
  const currentStep = steps[stepIndex];

  // Находим шаг с вопросом
  const questionStep = steps.find(s => s.question);
  // Находим последний шаг (outro)
  const outroStep = steps[steps.length - 1];

  function handleNext() {
    if (phase === 'intro') {
      // Переходим к вопросу
      setPhase('question');
    } else if (phase === 'feedback') {
      // Переходим к завершению
      setPhase('outro');
    } else if (phase === 'outro') {
      // Завершаем урок
      completeLesson(dialog!.id, xpEarned);
      onComplete();
    }
  }

  function handleSelectOption(index: number) {
    if (selectedOption !== null) return; // уже выбрали
    setSelectedOption(index);

    const q = questionStep?.question;
    if (!q) return;

    const correct = index === q.correctAnswer;
    setIsCorrect(correct);
    const earned = correct ? dialog!.xp : Math.round(dialog!.xp * 0.3);
    setXpEarned(earned);

    // Показываем анимацию XP
    setTimeout(() => setShowXpAnim(true), 300);

    // Автопереход к feedback
    setTimeout(() => setPhase('feedback'), 1200);
  }

  function handleSkip() {
    markDailyQuizShown();
    onClose();
  }

  // ── DIFFICULTY BADGE ──
  const diffColor = dialog.difficulty === 'beginner' ? '#30d158'
    : dialog.difficulty === 'intermediate' ? '#ffd60a' : '#ff453a';
  const diffLabel = dialog.difficulty === 'beginner' ? 'Новичок'
    : dialog.difficulty === 'intermediate' ? 'Средний' : 'Эксперт';

  // ── RENDER ──
  return (
    <View style={s.overlay}>
      {/* CSS animations */}
      <style>{`
        @keyframes quizSlideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes xpPop { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.3); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes optionCorrect { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .quiz-card { animation: quizSlideUp 0.4s ease-out; }
        .xp-pop { animation: xpPop 0.5s ease-out forwards; }
        .option-correct { animation: optionCorrect 0.3s ease-out; }
      `}</style>

      <View
        // @ts-ignore
        className="quiz-card"
        style={[s.card, { width: cardW, maxWidth: '95%' }]}
      >
        {/* Glass background */}
        <View style={s.cardGlass} />

        {/* ── HEADER ── */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={s.headerIcon}>💡</Text>
              <Text style={s.headerTitle}>Совет дня</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <View style={[s.diffBadge, { borderColor: diffColor + '60', backgroundColor: diffColor + '18' }]}>
                <Text style={[s.diffText, { color: diffColor }]}>{diffLabel}</Text>
              </View>
              <Text style={s.moduleName}>{dialog.module} · {dialog.topic}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleSkip} style={s.closeBtn}>
            <Text style={s.closeTxt}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* ── PROGRESS BAR ── */}
        <View style={s.progressWrap}>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, {
              width: phase === 'intro' ? '25%' : phase === 'question' ? '50%' : phase === 'feedback' ? '75%' : '100%',
            } as any]} />
          </View>
        </View>

        {/* ── CONTENT ── */}
        <View style={s.content}>

          {/* INTRO — первая реплика ментора */}
          {phase === 'intro' && (
            <View style={s.dialogBlock}>
              <View style={s.avatarRow}>
                <View style={s.avatar}>
                  <Text style={{ fontSize: 24 }}>{steps[0].avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.charName}>
                    {steps[0].character === 'mentor' ? 'Майк' : steps[0].character === 'broker' ? 'Брокер' : steps[0].character === 'driver' ? 'Водитель' : 'Ты'}
                  </Text>
                  <Text style={s.charRole}>
                    {steps[0].character === 'mentor' ? 'Наставник' : steps[0].character === 'broker' ? 'Брокерская компания' : steps[0].character === 'driver' ? 'Водитель трака' : 'Диспетчер'}
                  </Text>
                </View>
              </View>
              <View style={s.bubble}>
                <Text style={s.bubbleText}>{steps[0].text}</Text>
              </View>
              <TouchableOpacity onPress={handleNext} style={s.nextBtn}>
                <Text style={s.nextBtnText}>Далее →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* QUESTION — вопрос с вариантами */}
          {phase === 'question' && questionStep && (
            <View style={s.dialogBlock}>
              <View style={s.avatarRow}>
                <View style={s.avatar}>
                  <Text style={{ fontSize: 24 }}>{questionStep.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.charName}>
                    {questionStep.character === 'mentor' ? 'Майк' : 'Персонаж'}
                  </Text>
                </View>
              </View>
              <View style={s.bubble}>
                <Text style={s.bubbleText}>{questionStep.text}</Text>
              </View>

              {/* Вопрос */}
              <View style={s.questionBox}>
                <Text style={s.questionText}>❓ {questionStep.question!.text}</Text>
              </View>

              {/* Варианты ответов */}
              <View style={s.optionsWrap}>
                {questionStep.question!.options.map((opt, i) => {
                  const isSelected = selectedOption === i;
                  const isRight = i === questionStep.question!.correctAnswer;
                  const showResult = selectedOption !== null;

                  let optStyle = s.option;
                  let optTextStyle = s.optionText;

                  if (showResult && isRight) {
                    optStyle = { ...s.option, ...s.optionCorrect } as any;
                    optTextStyle = { ...s.optionText, color: '#fff', fontWeight: '800' } as any;
                  } else if (showResult && isSelected && !isRight) {
                    optStyle = { ...s.option, ...s.optionWrong } as any;
                    optTextStyle = { ...s.optionText, color: '#fff', fontWeight: '800' } as any;
                  }

                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => handleSelectOption(i)}
                      activeOpacity={0.7}
                      disabled={selectedOption !== null}
                      // @ts-ignore
                      className={showResult && isRight ? 'option-correct' : ''}
                      style={optStyle}
                    >
                      <Text style={s.optionLetter}>
                        {showResult && isRight ? '✅' : showResult && isSelected ? '❌' : String.fromCharCode(65 + i)}
                      </Text>
                      <Text style={optTextStyle}>{opt.text}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* XP animation */}
              {showXpAnim && (
                <View
                  // @ts-ignore
                  className="xp-pop"
                  style={s.xpPopup}
                >
                  <Text style={s.xpPopupText}>
                    {isCorrect ? `+${dialog.xp} XP ⭐` : `+${Math.round(dialog.xp * 0.3)} XP`}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* FEEDBACK — объяснение */}
          {phase === 'feedback' && questionStep?.question && (
            <View style={s.dialogBlock}>
              <View style={[s.feedbackBox, isCorrect ? s.feedbackCorrect : s.feedbackWrong]}>
                <Text style={s.feedbackTitle}>
                  {isCorrect ? '✅ Верно!' : '❌ Неверно'}
                </Text>
                {!isCorrect && (
                  <Text style={s.feedbackAnswer}>
                    Правильный ответ: {questionStep.question.options[questionStep.question.correctAnswer].text}
                  </Text>
                )}
                {isCorrect && questionStep.question.options[questionStep.question.correctAnswer].feedback && (
                  <Text style={s.feedbackDetail}>
                    {questionStep.question.options[questionStep.question.correctAnswer].feedback}
                  </Text>
                )}
                <View style={s.explanationBox}>
                  <Text style={s.explanationLabel}>💡 Объяснение:</Text>
                  <Text style={s.explanationText}>{questionStep.question.explanation}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleNext} style={s.nextBtn}>
                <Text style={s.nextBtnText}>Далее →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* OUTRO — финальная реплика */}
          {phase === 'outro' && (
            <View style={s.dialogBlock}>
              <View style={s.avatarRow}>
                <View style={s.avatar}>
                  <Text style={{ fontSize: 24 }}>{outroStep.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.charName}>Майк</Text>
                  <Text style={s.charRole}>Наставник</Text>
                </View>
              </View>
              <View style={s.bubble}>
                <Text style={s.bubbleText}>{outroStep.text}</Text>
              </View>

              {/* Итог */}
              <View style={s.resultBox}>
                <View style={s.resultRow}>
                  <Text style={s.resultLabel}>Заработано XP</Text>
                  <Text style={s.resultValue}>+{xpEarned} ⭐</Text>
                </View>
                <View style={s.resultRow}>
                  <Text style={s.resultLabel}>Всего XP</Text>
                  <Text style={s.resultValueSmall}>{totalXP + xpEarned}</Text>
                </View>
                <View style={s.resultRow}>
                  <Text style={s.resultLabel}>Пройдено уроков</Text>
                  <Text style={s.resultValueSmall}>{completedLessons.length + 1} / 39</Text>
                </View>
                {streak > 0 && (
                  <View style={s.resultRow}>
                    <Text style={s.resultLabel}>Серия</Text>
                    <Text style={[s.resultValue, { color: '#ff9f0a' }]}>🔥 {streak} дн.</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity onPress={handleNext} style={s.startBtn}>
                <LinearGradient
                  colors={['#0a84ff', '#0071e3']}
                  style={s.startBtnGrad}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  <Text style={s.startBtnText}>Начать смену 🚛</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── FOOTER ── */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            📊 {completedLessons.length}/39 уроков · {totalXP} XP · {dialog.module}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ═══ STYLES ═══
const s = StyleSheet.create({
  overlay: {
    position: 'absolute' as any,
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    // @ts-ignore
    backdropFilter: 'blur(12px)',
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative' as any,
    maxHeight: '90%',
    // @ts-ignore
    boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(10,132,255,0.15)',
  },
  cardGlass: {
    position: 'absolute' as any,
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15,23,42,0.95)',
    // @ts-ignore
    backdropFilter: 'blur(40px)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 8,
    zIndex: 1,
  },
  headerIcon: { fontSize: 22 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  moduleName: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  diffText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    // @ts-ignore
    cursor: 'pointer',
  },
  closeTxt: { fontSize: 14, color: '#94a3b8', fontWeight: '700' },

  // Progress
  progressWrap: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 1,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0a84ff',
    borderRadius: 2,
    // @ts-ignore
    transition: 'width 0.4s ease',
  },

  // Content
  content: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 1,
    // @ts-ignore
    overflowY: 'auto',
    maxHeight: 500,
  },

  // Dialog block
  dialogBlock: { gap: 10 },

  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(10,132,255,0.15)',
    borderWidth: 2, borderColor: 'rgba(10,132,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  charName: {
    fontSize: 14, fontWeight: '800', color: '#fff',
  },
  charRole: {
    fontSize: 11, color: '#64748b', fontWeight: '600',
  },

  // Bubble
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 14,
  },
  bubbleText: {
    fontSize: 14, color: '#e2e8f0', lineHeight: 20, fontWeight: '500',
  },

  // Question
  questionBox: {
    backgroundColor: 'rgba(10,132,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(10,132,255,0.25)',
    borderRadius: 12,
    padding: 12,
  },
  questionText: {
    fontSize: 14, fontWeight: '700', color: '#fff', lineHeight: 20,
  },

  // Options
  optionsWrap: { gap: 6 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    // @ts-ignore
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  optionCorrect: {
    borderColor: '#30d158',
    backgroundColor: 'rgba(48,209,88,0.2)',
  },
  optionWrong: {
    borderColor: '#ff453a',
    backgroundColor: 'rgba(255,69,58,0.2)',
  },
  optionLetter: {
    fontSize: 13, fontWeight: '900', color: '#64748b',
    width: 24, textAlign: 'center',
  },
  optionText: {
    fontSize: 13, color: '#e2e8f0', fontWeight: '600', flex: 1,
  },

  // XP popup
  xpPopup: {
    alignSelf: 'center',
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: 'rgba(255,214,10,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,214,10,0.4)',
    borderRadius: 20,
  },
  xpPopupText: {
    fontSize: 16, fontWeight: '900', color: '#ffd60a',
  },

  // Feedback
  feedbackBox: {
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
  },
  feedbackCorrect: {
    backgroundColor: 'rgba(48,209,88,0.1)',
    borderColor: 'rgba(48,209,88,0.3)',
  },
  feedbackWrong: {
    backgroundColor: 'rgba(255,69,58,0.1)',
    borderColor: 'rgba(255,69,58,0.3)',
  },
  feedbackTitle: {
    fontSize: 18, fontWeight: '900', color: '#fff',
  },
  feedbackAnswer: {
    fontSize: 13, color: '#fbbf24', fontWeight: '700',
  },
  feedbackDetail: {
    fontSize: 13, color: '#94a3b8', fontWeight: '500', fontStyle: 'italic',
  },
  explanationBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  explanationLabel: {
    fontSize: 12, fontWeight: '800', color: '#0a84ff', marginBottom: 4,
  },
  explanationText: {
    fontSize: 13, color: '#cbd5e1', lineHeight: 19, fontWeight: '500',
  },

  // Result box
  resultBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 13, color: '#94a3b8', fontWeight: '600',
  },
  resultValue: {
    fontSize: 16, fontWeight: '900', color: '#ffd60a',
  },
  resultValueSmall: {
    fontSize: 14, fontWeight: '800', color: '#e2e8f0',
  },

  // Buttons
  nextBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: 'rgba(10,132,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(10,132,255,0.3)',
    borderRadius: 12,
    // @ts-ignore
    cursor: 'pointer',
  },
  nextBtnText: {
    fontSize: 14, fontWeight: '800', color: '#0a84ff',
  },
  startBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    // @ts-ignore
    cursor: 'pointer',
  },
  startBtnGrad: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
  },
  startBtnText: {
    fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 0.5,
  },

  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    zIndex: 1,
  },
  footerText: {
    fontSize: 11, color: '#64748b', fontWeight: '600', textAlign: 'center',
  },
});
