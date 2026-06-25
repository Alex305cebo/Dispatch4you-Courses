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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`w-full max-w-lg mx-auto mt-3 p-3 rounded-xl border-2 relative overflow-hidden ${
        isCorrect
          ? 'bg-green-500/10 border-green-500/40'
          : 'bg-red-500/10 border-red-500/40'
      }`}
      role="alert"
      aria-live="assertive"
      aria-label={isCorrect ? 'Правильно' : 'Неправильно'}
    >
      {/* CSS-only confetti dots for correct answer */}
      {isCorrect && <ConfettiDots />}

      <div className="flex items-start gap-2 relative z-10">
        {/* Icon */}
        <span className="text-lg flex-shrink-0" aria-hidden="true">
          {isCorrect ? '✅' : '❌'}
        </span>
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p
            className={`font-bold text-sm mb-0.5 ${
              isCorrect ? 'text-green-300' : 'text-red-300'
            }`}
          >
            {isCorrect ? 'Правильно!' : 'Неправильно'}
          </p>
          {/* Correct answer (only on incorrect) */}
          {!isCorrect && correctAnswer && (
            <p className="text-sm text-slate-200 mb-2">
              Правильный ответ:{' '}
              <span className="font-semibold text-green-300">{correctAnswer}</span>
            </p>
          )}
          {/* Explanation */}
          {explanation && (
            <p className="text-xs text-slate-300 leading-snug line-clamp-3">{explanation}</p>
          )}
        </div>
      </div>

      {/* "Далее" button — always shown, calls onComplete with result */}
      <button
        onClick={onNext}
        className="w-full min-h-[40px] mt-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 relative z-10"
        aria-label="Перейти к следующему заданию"
      >
        Далее →
      </button>
    </motion.div>
  );
}

// === Main TaskRenderer Component ===

export default function TaskRenderer({ task, onComplete, isRetry }: TaskRendererProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const startTimeRef = useRef<Date>(new Date());
  const hasCompletedRef = useRef(false);
  const soundEnabled = useUIStore((state) => state.soundEnabled);

  const handleAnswer = useCallback(
    (correct: boolean) => {
      setIsCorrect(correct);
      setShowFeedback(true);

      // Play success sound if correct and sound is enabled
      if (correct && soundEnabled) {
        try {
          const audio = new Audio('/sounds/success.mp3');
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
    switch (task.type) {
      case 'quiz': {
        const quizData = task.data as QuizData;
        return {
          explanation: quizData.explanation,
          correctAnswer: !isCorrect
            ? quizData.options[quizData.correctIndex]
            : undefined,
        };
      }
      case 'fill-blank': {
        const fillData = task.data as FillBlankData;
        return {
          explanation: '',
          correctAnswer: !isCorrect
            ? fillData.blanks.map((b) => b.correctAnswer).join(', ')
            : undefined,
        };
      }
      case 'email-sim': {
        // EmailSimTask displays its own inline feedback;
        // TaskRenderer overlay just provides the "Далее" button
        return { explanation: '' };
      }
      case 'map-routing': {
        const mapData = task.data as MapRoutingData;
        const optimal = mapData.routes.find((r) => r.isOptimal);
        return {
          explanation: optimal
            ? `Оптимальный маршрут: ${optimal.name} — $${(optimal.miles * optimal.rate).toFixed(2)}`
            : '',
          correctAnswer: !isCorrect && optimal ? optimal.name : undefined,
        };
      }
      case 'audio-term': {
        const audioData = task.data as AudioTermData;
        return {
          explanation: '',
          correctAnswer: !isCorrect ? audioData.correctTerm : undefined,
        };
      }
      default:
        return { explanation: '' };
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
      {/* Task instruction — big, bold, beautiful */}
      <p
        className="text-center mb-4 lg:mb-6 font-bold text-white px-2"
        style={{ fontSize: 'clamp(18px, 4.5vw, 28px)', lineHeight: '1.3' }}
      >
        {task.type === 'quiz' ? '🎯 Выберите правильный ответ' :
         task.type === 'fill-blank' ? '✏️ Заполните пропуски' :
         task.type === 'drag-match' ? '🔗 Выберите определение для термина' :
         task.type === 'email-sim' ? '📧 Ответьте на письмо' :
         task.type === 'phone-dialog' ? '📞 Ведите диалог' :
         task.type === 'calculator' ? '🧮 Рассчитайте число' :
         task.type === 'crisis' ? '🚨 Примите решение!' :
         task.type === 'map-routing' ? '🗺️ Выберите маршрут' :
         task.type === 'document-review' ? '📄 Найдите ошибки' :
         task.type === 'audio-term' ? '🔊 Определите термин' :
         task.type === 'flashcard' ? '🃏 Запомните термин' :
         '📚 Выполните задание'}
      </p>

      {/* Task component */}
      {renderTaskComponent()}

      {/* Feedback overlay with "Далее" button */}
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
