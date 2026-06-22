import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task, QuizData, EmailSimData, FillBlankData, PhoneDialogData, MapRoutingData, AudioTermData, DragMatchData, CrisisData, CalculatorData, DocReviewData } from '../../types/index';
import type { TaskResult } from '../../types/progress';
import { useUIStore } from '../../store/useUIStore';
import AudioTermTask from './AudioTermTask';
import EmailSimTask from './EmailSimTask';
import FillBlankTask from './FillBlankTask';
import PhoneDialogTask from './PhoneDialogTask';
import MapRoutingTask from './MapRoutingTask';
import DragMatchTask from './DragMatchTask';
import CrisisTask from './CrisisTask';
import CalculatorTask from './CalculatorTask';
import DocReviewTask from './DocReviewTask';

// === Props Interface ===

export interface TaskRendererProps {
  task: Task;
  onComplete: (result: TaskResult) => void;
  isRetry: boolean;
}

// === Placeholder label map for unimplemented task types ===

const PLACEHOLDER_LABELS: Record<string, string> = {
  flashcard: 'Flashcard Task',
  'email-sim': 'Email Simulation',
  'phone-dialog': 'Phone Dialog',
  calculator: 'Calculator Task',
  'map-routing': 'Map Routing',
  crisis: 'Crisis Task',
  'document-review': 'Document Review',
  'drag-match': 'Drag & Match',
  'fill-blank': 'Fill in the Blank',
  'audio-term': 'Audio Term',
};

// === Inline QuizTask (renders quiz with 4 options) ===

interface QuizTaskInternalProps {
  data: QuizData;
  onAnswer: (isCorrect: boolean) => void;
}

function QuizTaskInternal({ data, onAnswer }: QuizTaskInternalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelectedIndex(index);
    setAnswered(true);
    onAnswer(index === data.correctIndex);
  };

  return (
    <div className="w-full max-w-lg lg:max-w-2xl mx-auto h-full flex flex-col justify-end pb-1">
      <h2
        className="text-center mb-3 lg:mb-5 leading-tight text-gradient font-extrabold"
        style={{
          fontSize: 'clamp(16px, 4vw, 32px)',
          lineHeight: '1.25',
          filter: 'drop-shadow(0 2px 4px rgba(255,255,255,0.15)) drop-shadow(0 0 20px rgba(6,182,212,0.25))',
        }}
      >
        {data.question}
      </h2>
      <div className="flex flex-col gap-2 lg:gap-3" role="group" aria-label="Варианты ответа">
        {data.options.map((option, index) => {
          let optionClasses =
            'w-full min-h-[44px] lg:min-h-[52px] px-4 lg:px-5 py-2 lg:py-3 flex items-center justify-center rounded-xl text-center font-semibold transition-all duration-200 border shadow-sm '
            + 'text-[13px] lg:text-[16px] leading-[1.3] ';

          if (!answered) {
            optionClasses +=
              'bg-slate-800/80 border-slate-600/60 text-white hover:bg-slate-700/80 hover:border-cyan-400/50 hover:shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400';
          } else if (index === data.correctIndex) {
            optionClasses += 'bg-green-500/20 border-green-500 text-green-200 shadow-lg shadow-green-500/10';
          } else if (index === selectedIndex && index !== data.correctIndex) {
            optionClasses += 'bg-red-500/20 border-red-500 text-red-200 shadow-lg shadow-red-500/10';
          } else {
            optionClasses += 'bg-slate-800/40 border-slate-700/40 text-slate-500 opacity-50';
          }

          return (
            <motion.button
              key={index}
              className={optionClasses}
              onClick={() => handleSelect(index)}
              disabled={answered}
              animate={
                answered && index === selectedIndex && index !== data.correctIndex
                  ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                  : {}
              }
              transition={{ duration: 0.3 }}
              aria-label={`Вариант ${index + 1}: ${option}`}
            >
              {option}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// === Placeholder for unimplemented task types ===

interface PlaceholderTaskProps {
  task: Task;
  label: string;
  onAnswer: (isCorrect: boolean) => void;
}

function PlaceholderTask({ task, label, onAnswer }: PlaceholderTaskProps) {
  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <p className="text-slate-300 text-sm mb-2">{label}</p>
        <p className="text-white font-semibold text-lg mb-4">{task.title}</p>
        <p className="text-slate-400 text-sm mb-6">
          Этот тип задания будет реализован позже.
        </p>
        <button
          className="min-h-[44px] px-6 py-3 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-300 font-medium hover:bg-cyan-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          onClick={() => onAnswer(true)}
          aria-label="Пропустить задание"
        >
          Пропустить →
        </button>
      </div>
    </div>
  );
}

// === CSS Confetti Dots (green dots animation for correct answers) ===

function ConfettiDots() {
  return (
    <div className="confetti-container" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="confetti-dot"
          style={{
            left: `${10 + (i * 7) % 80}%`,
            animationDelay: `${i * 0.08}s`,
            backgroundColor: i % 3 === 0 ? '#22c55e' : i % 3 === 1 ? '#4ade80' : '#86efac',
          }}
        />
      ))}
    </div>
  );
}

// === Feedback Overlay ===

interface FeedbackOverlayProps {
  isCorrect: boolean;
  explanation: string;
  correctAnswer?: string;
  onNext: () => void;
}

function FeedbackOverlay({ isCorrect, explanation, correctAnswer, onNext }: FeedbackOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={isCorrect ? 'Правильно' : 'Неправильно'}
      onClick={onNext}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`w-full max-w-sm rounded-2xl border-2 p-5 shadow-2xl relative overflow-hidden ${
          isCorrect
            ? 'bg-slate-900 border-green-500/50'
            : 'bg-slate-900 border-red-500/50'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onNext}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white text-sm transition-colors z-20"
          aria-label="Закрыть"
        >
          ✕
        </button>

        {/* CSS-only confetti dots for correct answer */}
        {isCorrect && <ConfettiDots />}

        {/* Icon + Title */}
        <div className="flex flex-col items-center text-center relative z-10 mb-3">
          <span className="text-4xl mb-2" aria-hidden="true">
            {isCorrect ? '🎉' : '😔'}
          </span>
          <p
            className={`font-bold text-lg ${
              isCorrect ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {isCorrect ? 'Правильно!' : 'Неправильно'}
          </p>
        </div>

        {/* Correct answer — always shown */}
        {correctAnswer && (
          <div className="relative z-10 mb-3 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <p className="text-sm text-slate-200 text-center">
              ✓ Ответ:{' '}
              <span className="font-bold text-cyan-300">{correctAnswer}</span>
            </p>
          </div>
        )}

        {/* Explanation — detailed info */}
        {explanation && (
          <p className="relative z-10 text-sm text-slate-300 leading-relaxed text-center mb-4">
            {explanation}
          </p>
        )}

        {/* "Далее" button */}
        <button
          onClick={onNext}
          className="relative z-10 w-full min-h-[44px] px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-base rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-lg"
          aria-label="Перейти к следующему заданию"
        >
          Далее →
        </button>
      </motion.div>
    </motion.div>
  );
}

// === Main TaskRenderer Component ===

export default function TaskRenderer({ task, onComplete, isRetry }: TaskRendererProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [customFeedback, setCustomFeedback] = useState('');
  const startTimeRef = useRef<Date>(new Date());
  const hasCompletedRef = useRef(false);
  const soundEnabled = useUIStore((state) => state.soundEnabled);

  const handleAnswer = useCallback(
    (correct: boolean, _selectedIndex?: number, feedbackText?: string) => {
      setIsCorrect(correct);
      if (feedbackText) setCustomFeedback(feedbackText);
      setShowFeedback(true);

      // Play success sound if correct and sound is enabled
      if (correct && soundEnabled) {
        try {
          const audio = new Audio('/dispatch-academy-app/sounds/success.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {
            // Silently fail if audio can't play (autoplay policy, missing file)
          });
        } catch {
          // Audio API not available
        }
      }
    },
    [soundEnabled]
  );

  const handleNext = useCallback(() => {
    // Prevent double-calling onComplete
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    setShowFeedback(false);

    const timeSpentSeconds = Math.round(
      (Date.now() - startTimeRef.current.getTime()) / 1000
    );

    const result: TaskResult = {
      taskId: task.id,
      score: isCorrect ? 100 : 0,
      correct: isCorrect,
      timeSpentSeconds,
      attempts: isRetry ? 2 : 1,
    };

    onComplete(result);
  }, [task.id, isCorrect, isRetry, onComplete]);

  // Get explanation and correct answer for feedback display
  const getFeedbackData = (): { explanation: string; correctAnswer?: string } => {
    // If custom feedback from the task component, use it
    if (customFeedback) {
      switch (task.type) {
        case 'quiz': {
          const q = task.data as QuizData;
          return { explanation: customFeedback, correctAnswer: q.options[q.correctIndex] };
        }
        case 'email-sim': {
          const e = task.data as EmailSimData;
          return { explanation: customFeedback, correctAnswer: e.responses.find((r) => r.isCorrect)?.text };
        }
        default:
          return { explanation: customFeedback };
      }
    }

    switch (task.type) {
      case 'quiz': {
        const quizData = task.data as QuizData;
        return {
          explanation: quizData.explanation || 'Запомните этот ответ — он пригодится в работе диспетчера.',
          correctAnswer: quizData.options[quizData.correctIndex],
        };
      }
      case 'fill-blank': {
        const fillData = task.data as FillBlankData;
        return {
          explanation: isCorrect
            ? 'Отлично! Вы правильно заполнили все пропуски.'
            : 'Обратите внимание на правильные ответы — они важны для ежедневной работы.',
          correctAnswer: fillData.blanks.map((b) => b.correctAnswer).join(', '),
        };
      }
      case 'email-sim': {
        const emailData = task.data as EmailSimData;
        const correctResponse = emailData.responses.find((r) => r.isCorrect);
        return {
          explanation: correctResponse?.feedback || 'Всегда уточняйте детали перед принятием решения по грузу.',
          correctAnswer: correctResponse?.text,
        };
      }
      case 'map-routing': {
        const mapData = task.data as MapRoutingData;
        const optimal = mapData.routes.find((r) => r.isOptimal);
        return {
          explanation: optimal
            ? `Оптимальный маршрут: ${optimal.name}. ${optimal.miles} миль × $${optimal.rate}/миля = $${(optimal.miles * optimal.rate).toFixed(0)}. Всегда сравнивайте RPM при выборе маршрута.`
            : '',
          correctAnswer: optimal ? optimal.name : undefined,
        };
      }
      case 'audio-term': {
        const audioData = task.data as AudioTermData;
        return {
          explanation: isCorrect
            ? 'Правильно! Знание терминологии — ключ к профессиональному общению.'
            : 'Запомните этот термин — он часто используется в переговорах.',
          correctAnswer: audioData.correctTerm,
        };
      }
      case 'drag-match':
        return {
          explanation: isCorrect
            ? 'Отлично! Вы правильно сопоставили все термины с определениями.'
            : 'Изучите правильные соответствия — эти термины используются ежедневно.',
        };
      case 'calculator': {
        const calcData = task.data as CalculatorData;
        return {
          explanation: `Правильный ответ: ${calcData.correctAnswer} ${calcData.unit}. Точные расчёты — основа прибыльных рейсов.`,
          correctAnswer: `${calcData.correctAnswer} ${calcData.unit}`,
        };
      }
      case 'crisis': {
        const crisisData = task.data as CrisisData;
        const correctOption = crisisData.options.find((o) => o.isCorrect);
        return {
          explanation: correctOption
            ? `Верное действие: «${correctOption.text}». В кризисных ситуациях действуйте быстро и профессионально.`
            : 'Главное — безопасность водителя и груза.',
          correctAnswer: correctOption?.text,
        };
      }
      case 'document-review':
        return {
          explanation: isCorrect
            ? 'Вы нашли все ошибки. Внимательная проверка документов предотвращает финансовые потери.'
            : 'Проверяйте каждое поле — ошибки могут стоить сотни долларов.',
        };
      case 'phone-dialog':
        return {
          explanation: isCorrect
            ? 'Отличная коммуникация! Профессиональный тон — ключ к успешным отношениям.'
            : 'Обратите внимание на тон ответов. Чёткость и профессионализм — обязательны.',
        };
      default:
        return { explanation: 'Задание завершено.' };
    }
  };

  // Render the appropriate task component based on type
  const renderTaskComponent = () => {
    switch (task.type) {
      case 'quiz':
        return (
          <QuizTaskInternal
            data={task.data as QuizData}
            onAnswer={handleAnswer}
          />
        );
      case 'phone-dialog':
        return (
          <PhoneDialogTask
            data={task.data as PhoneDialogData}
            onAnswer={handleAnswer}
          />
        );
      case 'map-routing':
        return (
          <MapRoutingTask
            data={task.data as MapRoutingData}
            onAnswer={handleAnswer}
          />
        );
      case 'email-sim':
        return (
          <EmailSimTask
            data={task.data as EmailSimData}
            onAnswer={handleAnswer}
          />
        );
      case 'audio-term':
        return (
          <AudioTermTask
            data={task.data as AudioTermData}
            onAnswer={handleAnswer}
          />
        );
      case 'flashcard':
        return (
          <PlaceholderTask
            task={task}
            label={PLACEHOLDER_LABELS[task.type] ?? task.type}
            onAnswer={handleAnswer}
          />
        );
      case 'calculator':
        return (
          <CalculatorTask
            data={task.data as CalculatorData}
            onAnswer={handleAnswer}
          />
        );
      case 'crisis':
        return (
          <CrisisTask
            data={task.data as CrisisData}
            onAnswer={handleAnswer}
          />
        );
      case 'document-review':
        return (
          <DocReviewTask
            data={task.data as DocReviewData}
            onAnswer={(correct) => handleAnswer(correct)}
          />
        );
      case 'drag-match':
        return (
          <DragMatchTask
            data={task.data as DragMatchData}
            onAnswer={handleAnswer}
          />
        );
      case 'fill-blank':
        return (
          <FillBlankTask
            data={task.data as FillBlankData}
            onAnswer={handleAnswer}
          />
        );
      default:
        return (
          <PlaceholderTask
            task={task}
            label="Unknown Task"
            onAnswer={handleAnswer}
          />
        );
    }
  };

  const feedbackData = getFeedbackData();

  return (
    <div className="w-full flex flex-col items-center">
      {/* Task instruction — hidden when feedback popup is showing */}
      {!showFeedback && (
        <p
          className="text-center mb-4 lg:mb-6 font-bold text-white px-2"
          style={{ fontSize: 'clamp(18px, 4.5vw, 28px)', lineHeight: '1.3' }}
        >
          {task.type === 'quiz' ? '🎯 Выберите правильный ответ' :
           task.type === 'fill-blank' ? '✏️ Заполните пропуски' :
           task.type === 'drag-match' ? '🔗 Выберите определение для термина' :
           task.type === 'email-sim' ? '📧 Ответьте на письмо' :
           task.type === 'phone-dialog' ? '📞 Ведите диалог' :
           task.type === 'calculator' ? '🧮 Выберите правильный ответ' :
           task.type === 'crisis' ? '🚨 Примите решение!' :
           task.type === 'map-routing' ? '🗺️ Выберите маршрут' :
           task.type === 'document-review' ? '📄 Найдите ошибки' :
           task.type === 'audio-term' ? '🔊 Определите термин' :
           task.type === 'flashcard' ? '🃏 Запомните термин' :
           '📚 Выполните задание'}
        </p>
      )}

      {/* Task component — hidden when feedback popup is showing */}
      {!showFeedback && renderTaskComponent()}

      {/* Feedback popup — centered modal with all info */}
      <AnimatePresence>
        {showFeedback && (
          <FeedbackOverlay
            isCorrect={isCorrect}
            explanation={feedbackData.explanation}
            correctAnswer={feedbackData.correctAnswer}
            onNext={handleNext}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
