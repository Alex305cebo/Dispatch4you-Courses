import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { CalculatorData } from '../../types/index';
import { validateCalculatorAnswer } from '../../logic/scoring';

interface CalculatorTaskProps {
  data: CalculatorData;
  onAnswer: (correct: boolean) => void;
}

export default function CalculatorTask({ data, onAnswer }: CalculatorTaskProps) {
  const [inputValue, setInputValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Allow digits, one decimal point, and optional leading minus sign
      if (/^-?\d*\.?\d*$/.test(value)) {
        setInputValue(value);
      }
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent non-numeric characters at the keyboard level
      const allowedKeys = [
        'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
        'Tab', 'Home', 'End', 'Enter',
      ];
      if (allowedKeys.includes(e.key)) return;
      if (e.key === '-' && inputValue === '') return;
      if (e.key === '.' && !inputValue.includes('.')) return;
      if (/^\d$/.test(e.key)) return;
      e.preventDefault();
    },
    [inputValue]
  );

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    const numericValue = parseFloat(inputValue);
    if (inputValue === '' || isNaN(numericValue)) return;

    // Use tolerancePercent from data for validation
    let correct: boolean;
    if (data.tolerancePercent === 2) {
      correct = validateCalculatorAnswer(numericValue, data.correctAnswer);
    } else {
      // Custom tolerance
      if (data.correctAnswer === 0) {
        correct = numericValue === 0;
      } else {
        correct =
          Math.abs(numericValue - data.correctAnswer) /
            Math.abs(data.correctAnswer) <=
          data.tolerancePercent / 100;
      }
    }

    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(correct);
  }, [submitted, inputValue, data, onAnswer]);

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleSubmit();
    },
    [handleSubmit]
  );

  const isSubmitDisabled =
    submitted || inputValue === '' || isNaN(parseFloat(inputValue));

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-xl p-4 md:p-6 flex flex-col gap-4">
      {/* Problem text */}
      <h2 className="text-white font-bold text-lg md:text-xl leading-relaxed">
        {data.problem}
      </h2>

      {/* Context */}
      {data.context && (
        <p className="text-gray-400 text-sm md:text-base leading-relaxed">
          {data.context}
        </p>
      )}

      {/* Input area */}
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 mt-2">
        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="decimal"
            aria-label="Ваш ответ"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={submitted}
            placeholder="Введите число"
            className={`flex-1 min-h-[44px] px-4 py-3 rounded-lg text-white text-base
              bg-gray-700 border transition-colors duration-200
              placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900
              disabled:opacity-60 disabled:cursor-not-allowed
              ${submitted
                ? isCorrect
                  ? 'border-green-500'
                  : 'border-red-500'
                : 'border-gray-600 hover:border-gray-500'
              }`}
          />
          <span className="text-gray-300 text-sm md:text-base font-medium whitespace-nowrap">
            {data.unit}
          </span>
        </div>

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={isSubmitDisabled}
          className={`min-h-[44px] px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900
            ${isSubmitDisabled
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white cursor-pointer'
            }`}
          whileTap={!isSubmitDisabled ? { scale: 0.98 } : undefined}
        >
          Проверить
        </motion.button>
      </form>

      {/* Result feedback */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className={`mt-2 p-4 rounded-lg text-base font-medium ${
            isCorrect
              ? 'bg-green-900/40 border border-green-600 text-green-300'
              : 'bg-red-900/40 border border-red-600 text-red-300'
          }`}
          role="alert"
          aria-live="polite"
        >
          {isCorrect
            ? `Верно! Ответ: ${data.correctAnswer} ${data.unit}`
            : `Неверно. Правильный ответ: ${data.correctAnswer} ${data.unit}`}
        </motion.div>
      )}
    </div>
  );
}
