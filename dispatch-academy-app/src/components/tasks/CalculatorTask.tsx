import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { CalculatorData } from '../../types/index';
import { generateCalculatorOptions } from '../../logic/calculator-options';

interface CalculatorTaskProps {
  data: CalculatorData;
  onAnswer: (correct: boolean) => void;
}

export default function CalculatorTask({ data, onAnswer }: CalculatorTaskProps) {
  const { options, correctIndex } = useMemo(
    () => generateCalculatorOptions(data.correctAnswer, data.unit),
    [data.correctAnswer, data.unit]
  );

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const isCorrect = selectedIndex === correctIndex;

  const handleSelect = useCallback(
    (index: number) => {
      if (answered) return;
      setSelectedIndex(index);
      setAnswered(true);
      onAnswer(index === correctIndex);
    },
    [answered, correctIndex, onAnswer]
  );

  const getOptionClasses = (index: number): string => {
    const base =
      'relative w-full min-h-[44px] px-4 py-3 rounded-lg text-left text-[14px] md:text-[15px] leading-snug transition-all duration-200 ease-in-out font-medium';

    if (!answered) {
      return `${base} bg-gray-700 hover:bg-gray-600 active:bg-gray-600 text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900`;
    }

    if (index === correctIndex) {
      return `${base} bg-green-600 text-white cursor-default`;
    }
    if (index === selectedIndex) {
      return `${base} bg-red-600 text-white cursor-default`;
    }
    return `${base} bg-gray-700 text-gray-400 cursor-default opacity-60`;
  };

  const getIcon = (index: number): string | null => {
    if (!answered) return null;
    if (index === correctIndex) return '✓';
    if (index === selectedIndex) return '✗';
    return null;
  };

  const correctLabel = options[correctIndex];

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-xl p-4 md:p-6 flex flex-col gap-4">
      <h2 className="text-white font-bold text-lg md:text-xl leading-relaxed">
        {data.problem}
      </h2>

      {data.context && (
        <p className="text-gray-400 text-sm md:text-base leading-relaxed">
          {data.context}
        </p>
      )}

      <p className="text-gray-300 text-sm font-medium">
        Выберите правильный ответ:
      </p>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        role="group"
        aria-label="Варианты ответа"
      >
        {options.map((option, index) => (
          <motion.button
            key={index}
            type="button"
            aria-label={`Вариант ${index + 1}: ${option}`}
            aria-disabled={answered}
            disabled={answered}
            className={getOptionClasses(index)}
            onClick={() => handleSelect(index)}
            whileTap={!answered ? { scale: 0.98 } : undefined}
            animate={
              answered && index === selectedIndex && index !== correctIndex
                ? { x: [0, -6, 6, -4, 4, -2, 2, 0] }
                : {}
            }
            transition={{ duration: 0.3 }}
          >
            <span className="flex items-center justify-between gap-2">
              <span>{option}</span>
              {getIcon(index) && (
                <span className="text-lg font-bold shrink-0">{getIcon(index)}</span>
              )}
            </span>
          </motion.button>
        ))}
      </div>

      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className={`mt-1 p-4 rounded-lg text-base font-medium ${
            isCorrect
              ? 'bg-green-900/40 border border-green-600 text-green-300'
              : 'bg-red-900/40 border border-red-600 text-red-300'
          }`}
          role="alert"
          aria-live="polite"
        >
          {isCorrect
            ? `Верно! Ответ: ${correctLabel}`
            : `Неверно. Правильный ответ: ${correctLabel}`}
        </motion.div>
      )}
    </div>
  );
}
