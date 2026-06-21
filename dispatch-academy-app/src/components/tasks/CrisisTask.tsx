import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { CrisisData } from '../../types/index';

interface CrisisTaskProps {
  data: CrisisData;
  onAnswer: (correct: boolean) => void;
}

export default function CrisisTask({ data, onAnswer }: CrisisTaskProps) {
  const timeLimit = data.timeLimitSeconds || 60;
  const [secondsLeft, setSecondsLeft] = useState(timeLimit);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answeredRef = useRef(false);

  const answered = selectedIndex !== null || timedOut;

  // Timer countdown
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Time's up
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (!answeredRef.current) {
            answeredRef.current = true;
            setTimedOut(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Call onAnswer when timed out
  useEffect(() => {
    if (timedOut) {
      onAnswer(false);
    }
  }, [timedOut, onAnswer]);

  const handleSelect = useCallback(
    (index: number) => {
      if (answered || answeredRef.current) return;
      answeredRef.current = true;

      // Stop the timer
      if (intervalRef.current) clearInterval(intervalRef.current);

      setSelectedIndex(index);
      const correct = data.options[index].isCorrect;
      onAnswer(correct);
    },
    [answered, data.options, onAnswer]
  );

  // Timer color classes based on time remaining
  const getTimerClasses = (): string => {
    if (secondsLeft > 30) return 'text-white';
    if (secondsLeft > 10) return 'text-yellow-400';
    return 'text-red-500 animate-pulse';
  };

  // Border urgency
  const getBorderClass = (): string => {
    if (secondsLeft <= 10 && !answered) return 'border-red-500';
    return 'border-white/10';
  };

  // Find the correct option for displaying after answer
  const correctOption = data.options.find((opt) => opt.isCorrect);
  const selectedOption = selectedIndex !== null ? data.options[selectedIndex] : null;
  const isCorrect = selectedOption?.isCorrect ?? false;

  // Get explanation to display
  const getExplanation = (): string => {
    if (selectedOption) return selectedOption.explanation;
    if (correctOption) return correctOption.explanation;
    return '';
  };

  const getOptionClasses = (index: number): string => {
    const base =
      'w-full min-h-[44px] px-4 py-3 rounded-xl text-left text-sm font-medium transition-all duration-200 border-2';

    if (!answered) {
      return `${base} bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-cyan-400/40 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900`;
    }

    // After answering or timeout
    if (data.options[index].isCorrect) {
      return `${base} bg-green-500/20 border-green-500 text-green-300 cursor-default`;
    }
    if (index === selectedIndex && !data.options[index].isCorrect) {
      return `${base} bg-red-500/20 border-red-500 text-red-300 cursor-default`;
    }
    return `${base} bg-white/5 border-white/10 text-slate-400 opacity-60 cursor-default`;
  };

  return (
    <div
      className={`w-full max-w-2xl mx-auto bg-gray-800 rounded-xl p-4 md:p-6 flex flex-col gap-4 border-2 transition-colors duration-300 ${getBorderClass()}`}
    >
      {/* Countdown Timer */}
      <div className="flex justify-center" aria-live="polite" aria-atomic="true">
        <span
          className={`text-4xl md:text-5xl font-bold tabular-nums ${getTimerClasses()}`}
          role="timer"
          aria-label={`Осталось ${secondsLeft} секунд`}
        >
          {secondsLeft}
        </span>
      </div>

      {/* Scenario */}
      <p className="text-white text-base md:text-lg leading-relaxed font-semibold">
        {data.scenario}
      </p>

      {/* Options */}
      <div
        className="flex flex-col gap-3"
        role="group"
        aria-label="Варианты действий"
      >
        {data.options.map((option, index) => (
          <motion.button
            key={index}
            type="button"
            aria-label={`Вариант ${index + 1}: ${option.text}`}
            aria-disabled={answered}
            disabled={answered}
            className={getOptionClasses(index)}
            onClick={() => handleSelect(index)}
            whileTap={!answered ? { scale: 0.97 } : undefined}
            animate={
              answered && index === selectedIndex && !data.options[index].isCorrect
                ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                : {}
            }
            transition={{ duration: 0.3 }}
          >
            {option.text}
          </motion.button>
        ))}
      </div>

      {/* Feedback after answer or timeout */}
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className={`mt-2 p-4 rounded-xl border-2 ${
            timedOut
              ? 'bg-red-500/10 border-red-500/40'
              : isCorrect
                ? 'bg-green-500/10 border-green-500/40'
                : 'bg-red-500/10 border-red-500/40'
          }`}
          role="alert"
          aria-live="assertive"
        >
          {/* Result header */}
          <p
            className={`font-bold text-base mb-2 ${
              timedOut
                ? 'text-red-300'
                : isCorrect
                  ? 'text-green-300'
                  : 'text-red-300'
            }`}
          >
            {timedOut
              ? '⏰ Время вышло!'
              : isCorrect
                ? '✅ Верно!'
                : '❌ Неверно'}
          </p>

          {/* Show correct answer on failure/timeout */}
          {(timedOut || !isCorrect) && correctOption && (
            <p className="text-sm text-slate-200 mb-2">
              Правильный ответ:{' '}
              <span className="font-semibold text-green-300">
                {correctOption.text}
              </span>
            </p>
          )}

          {/* Explanation */}
          {getExplanation() && (
            <p className="text-sm text-slate-300 leading-relaxed">
              {getExplanation()}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
