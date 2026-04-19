import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';

interface TutorialStep {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  dialog: string;
  character: string;
  characterAvatar: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  completed: boolean;
}

interface TutorialGuideProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function TutorialGuide({ visible, onClose, onComplete }: TutorialGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showDialog, setShowDialog] = useState(true);
  
  const [steps, setSteps] = useState<TutorialStep[]>([
    {
      id: 1,
      title: 'Найди груз',
      subtitle: 'Вкладка «Грузы»',
      icon: '📦',
      dialog: 'Привет! Я Майк, старший диспетчер. Сегодня твой первый день. Давай начнём с простого — найди груз для трака.',
      character: 'Майк',
      characterAvatar: '👨🏻‍💼',
      action: {
        label: '→ Открыть Грузы',
        onPress: () => completeStep(0),
      },
      completed: false,
    },
    {
      id: 2,
      title: 'Назначь трак',
      subtitle: 'После переговоров',
      icon: '🚛',
      dialog: 'Отлично! Теперь выбери груз, договорись о ставке с брокером и назначь трак. Это основа работы диспетчера.',
      character: 'Майк',
      characterAvatar: '👨🏻‍💼',
      completed: false,
    },
    {
      id: 3,
      title: 'Следи за картой',
      subtitle: 'Вкладка «Карта»',
      icon: '🗺️',
      dialog: 'Траки всегда в движении. Открой карту и посмотри где едет твой трак. Следи за HOS — часами вождения.',
      character: 'Майк',
      characterAvatar: '👨🏻‍💼',
      action: {
        label: '→ Открыть Карту',
        onPress: () => completeStep(2),
      },
      completed: false,
    },
    {
      id: 4,
      title: 'Проверь почту',
      subtitle: 'Вкладка «Почта»',
      icon: '📧',
      dialog: 'Брокеры присылают документы — Rate Con, POD, detention claims. Проверяй почту регулярно, там важная инфа.',
      character: 'Майк',
      characterAvatar: '👨🏻‍💼',
      action: {
        label: '→ Открыть Почту',
        onPress: () => completeStep(3),
      },
      completed: false,
    },
    {
      id: 5,
      title: 'Получи оплату',
      subtitle: 'Автоматически при доставке',
      icon: '💰',
      dialog: 'Когда трак доставит груз — ты получишь деньги. Следи за балансом и расходами. Твой P&L — твой рейтинг.',
      character: 'Майк',
      characterAvatar: '👨🏻‍💼',
      completed: false,
    },
    {
      id: 6,
      title: 'Закрой смену',
      subtitle: 'Цель: $2,500+',
      icon: '🏁',
      dialog: 'Смена длится 8 часов игрового времени. Цель — заработать минимум $2,500. Оценка A или выше — ты молодец!',
      character: 'Майк',
      characterAvatar: '👨🏻‍💼',
      completed: false,
    },
  ]);

  function completeStep(index: number) {
    const updated = [...steps];
    updated[index].completed = true;
    setSteps(updated);
    
    // Переходим к следующему шагу
    if (index < steps.length - 1) {
      setCurrentStep(index + 1);
      setShowDialog(true);
    } else {
      // Все шаги завершены
      onComplete();
    }
  }

  const completedCount = steps.filter(s => s.completed).length;
  const progress = completedCount / steps.length;
  const step = steps[currentStep];

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.overlay}>
        <View style={s.container}>
          
          {/* Header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Text style={s.headerIcon}>📚</Text>
              <View>
                <Text style={s.headerTitle}>DISPATCH OFFICE · ГАЙД</Text>
                <Text style={s.headerSub}>Ты — диспетчер грузовых перевозок США.</Text>
              </View>
            </View>
            <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Progress */}
          <View style={s.progressSection}>
            <Text style={s.progressLabel}>Прогресс обучения</Text>
            <View style={s.progressRow}>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={s.progressText}>{completedCount}/{steps.length}</Text>
            </View>
          </View>

          {/* Dialog или Steps */}
          {showDialog ? (
            <ScrollView style={s.dialogSection} showsVerticalScrollIndicator={false}>
              {/* Character */}
              <View style={s.characterCard}>
                <View style={s.characterAvatar}>
                  <Text style={s.characterAvatarText}>{step.characterAvatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.characterName}>{step.character}</Text>
                  <Text style={s.characterRole}>Старший диспетчер</Text>
                </View>
              </View>

              {/* Dialog bubble */}
              <View style={s.dialogBubble}>
                <Text style={s.dialogText}>{step.dialog}</Text>
              </View>

              {/* Current step card */}
              <View style={s.currentStepCard}>
                <View style={s.currentStepHeader}>
                  <Text style={s.currentStepIcon}>{step.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={s.currentStepBadge}>
                      <Text style={s.currentStepBadgeText}>СЕЙЧАС</Text>
                    </View>
                    <Text style={s.currentStepTitle}>{step.title}</Text>
                    <Text style={s.currentStepSub}>{step.subtitle}</Text>
                  </View>
                </View>

                {/* Action button */}
                {step.action && (
                  <TouchableOpacity
                    style={s.actionBtn}
                    onPress={step.action.onPress}
                    activeOpacity={0.8}
                  >
                    <Text style={s.actionBtnText}>{step.action.label}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Show all steps button */}
              <TouchableOpacity
                style={s.showStepsBtn}
                onPress={() => setShowDialog(false)}
                activeOpacity={0.7}
              >
                <Text style={s.showStepsBtnText}>Показать все шаги →</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <ScrollView style={s.stepsSection} showsVerticalScrollIndicator={false}>
              {steps.map((st, i) => (
                <TouchableOpacity
                  key={st.id}
                  style={[
                    s.stepCard,
                    st.completed && s.stepCardCompleted,
                    i === currentStep && !st.completed && s.stepCardActive,
                  ]}
                  onPress={() => {
                    if (i === currentStep) {
                      setShowDialog(true);
                    }
                  }}
                  activeOpacity={0.8}
                  disabled={st.completed || i > currentStep}
                >
                  <View style={s.stepCardHeader}>
                    <View style={[s.stepIcon, st.completed && s.stepIconCompleted]}>
                      <Text style={s.stepIconText}>{st.completed ? '✓' : st.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.stepTitle, st.completed && s.stepTitleCompleted]}>
                        {st.id}. {st.title}
                      </Text>
                      <Text style={s.stepSub}>{st.subtitle}</Text>
                    </View>
                    {i === currentStep && !st.completed && (
                      <View style={s.stepBadge}>
                        <Text style={s.stepBadgeText}>▶</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              {/* Back to dialog */}
              <TouchableOpacity
                style={s.backBtn}
                onPress={() => setShowDialog(true)}
                activeOpacity={0.7}
              >
                <Text style={s.backBtnText}>← Вернуться к диалогу</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* Goal */}
          <View style={s.goal}>
            <Text style={s.goalIcon}>🏆</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.goalTitle}>Цель смены</Text>
              <Text style={s.goalDesc}>Заработай $2,500+ · Оценка A или выше</Text>
            </View>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: '#0f1729',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(6,182,212,0.3)',
    overflow: 'hidden',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(6,182,212,0.05)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  headerIcon: { fontSize: 24 },
  headerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#06b6d4',
    letterSpacing: 0.5,
  },
  headerSub: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 18, color: '#94a3b8', fontWeight: '300' },

  // Progress
  progressSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#06b6d4',
    borderRadius: 4,
  },
  progressText: { fontSize: 12, fontWeight: '800', color: '#06b6d4', width: 40 },

  // Dialog section
  dialogSection: { flex: 1, padding: 16 },
  characterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  characterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(6,182,212,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(6,182,212,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterAvatarText: { fontSize: 20 },
  characterName: { fontSize: 14, fontWeight: '800', color: '#e2e8f0' },
  characterRole: { fontSize: 11, color: '#64748b', marginTop: 1 },

  dialogBubble: {
    backgroundColor: 'rgba(6,182,212,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.25)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  dialogText: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 20,
  },

  currentStepCard: {
    backgroundColor: 'rgba(6,182,212,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(6,182,212,0.4)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  currentStepHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  currentStepIcon: { fontSize: 28 },
  currentStepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(6,182,212,0.2)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  currentStepBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#06b6d4',
    letterSpacing: 0.5,
  },
  currentStepTitle: { fontSize: 16, fontWeight: '800', color: '#e2e8f0', marginBottom: 2 },
  currentStepSub: { fontSize: 12, color: '#94a3b8' },

  actionBtn: {
    backgroundColor: '#06b6d4',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  showStepsBtn: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  showStepsBtnText: { fontSize: 13, fontWeight: '700', color: '#64748b' },

  // Steps section
  stepsSection: { flex: 1, padding: 16 },
  stepCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  stepCardCompleted: {
    backgroundColor: 'rgba(52,211,153,0.08)',
    borderColor: 'rgba(52,211,153,0.25)',
  },
  stepCardActive: {
    backgroundColor: 'rgba(6,182,212,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(6,182,212,0.4)',
  },
  stepCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconCompleted: { backgroundColor: 'rgba(52,211,153,0.2)' },
  stepIconText: { fontSize: 18 },
  stepTitle: { fontSize: 14, fontWeight: '700', color: '#e2e8f0', marginBottom: 2 },
  stepTitleCompleted: { color: '#34d399' },
  stepSub: { fontSize: 11, color: '#64748b' },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(6,182,212,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: { fontSize: 10, color: '#06b6d4' },

  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  backBtnText: { fontSize: 13, fontWeight: '700', color: '#64748b' },

  // Goal
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: 'rgba(251,191,36,0.08)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(251,191,36,0.25)',
  },
  goalIcon: { fontSize: 24 },
  goalTitle: { fontSize: 12, fontWeight: '800', color: '#fbbf24', marginBottom: 2 },
  goalDesc: { fontSize: 11, color: '#94a3b8' },
});
