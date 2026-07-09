import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { QuizData } from '../../types/index';

interface QuizTaskProps {
  data: QuizData;
  onAnswer: (correct: boolean, selectedIndex: number) => void;
}

export default function QuizTask({ data, onAnswer }: QuizTaskProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const isCorrect = selectedIndex !== null && selectedIndex === data.correctIndex;

  const handleSelect = useCallback(
    (index: number) => {
      if (answered) return;
      setSelectedIndex(index);
      setAnswered(true);
      onAnswer(index === data.correctIndex, index);
    },
    [answered, data.correctIndex, onAnswer]
  );

  const getOptionClasses = (index: number): string => {
    const base =
      'relative w-full min-h-[44px] px-4 py-3 rounded-lg text-left text-[14px] md:text-[15px] leading-snug transition-all duration-200 ease-in-out';

    if (!answered) {
      return `${base} bg-gray-700 hover:bg-gray-600 active:bg-gray-600 text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900`;
    }

    // After answering — highlight correct green, incorrect red, dim others
    if (index === data.correctIndex) {
      return `${base} bg-green-600 text-white cursor-default`;
    }
    if (index === selectedIndex && index !== data.correctIndex) {
      return `${base} bg-red-600 text-white cursor-default`;
    }
    return `${base} bg-gray-700 text-gray-400 cursor-default opacity-60`;
  };

  const getIcon = (index: number): string | null => {
    if (!answered) return null;
    if (index === data.correctIndex) return '✓';
    if (index === selectedIndex && index !== data.correctIndex) return '✗';
    return null;
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-xl p-4 md:p-6 flex flex-col gap-4">
      {/* Question */}
      <h2 className="text-white font-bold text-base md:text-lg leading-relaxed">
        {data.question}
      </h2>

      {/* Options */}
      <div
        className="flex flex-col gap-3"
        role="group"
        aria-label="Варианты ответа"
      >
        {data.options.map((option, index) => (
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
              answered && index === selectedIndex && index !== data.correctIndex
                ? { x: [0, -6, 6, -4, 4, -2, 2, 0] }
                : {}
            }
            transition={{ duration: 0.3 }}
          >
            <span className="flex items-center justify-between gap-2">
              <span>{option}</span>
              {getIcon(index) && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="text-lg font-bold flex-shrink-0"
                  aria-hidden="true"
                >
                  {getIcon(index)}
                </motion.span>
              )}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Explanation after answer */}
      {answered && data.explanation && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-2 text-gray-300 italic text-sm leading-relaxed"
        >
          {data.explanation}
        </motion.p>
      )}
    </div>
  );
}
