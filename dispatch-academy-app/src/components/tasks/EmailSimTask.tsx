import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { EmailSimData } from '../../types/index';

interface EmailSimTaskProps {
  data: EmailSimData;
  onAnswer: (correct: boolean) => void;
}

/**
 * Extracts initials from a sender name (first letter of each word, max 2).
 */
function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w): w is string => w.length > 0)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join('');
}

export default function EmailSimTask({ data, onAnswer }: EmailSimTaskProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const isCorrect =
    selectedIndex !== null && data.responses[selectedIndex]?.isCorrect === true;

  const handleSelect = useCallback(
    (index: number) => {
      if (answered) return;
      setSelectedIndex(index);
      setAnswered(true);
      onAnswer(data.responses[index]?.isCorrect === true);
    },
    [answered, data.responses, onAnswer]
  );

  const getOptionClasses = (index: number): string => {
    const base =
      'relative w-full min-h-[44px] px-4 py-3 rounded-lg text-left text-[14px] md:text-[15px] leading-snug transition-all duration-200 ease-in-out';

    if (!answered) {
      return `${base} bg-gray-700 hover:bg-gray-600 active:bg-gray-600 text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900`;
    }

    if (data.responses[index]?.isCorrect) {
      return `${base} bg-green-600 text-white cursor-default`;
    }
    if (index === selectedIndex && !data.responses[index]?.isCorrect) {
      return `${base} bg-red-600 text-white cursor-default`;
    }
    return `${base} bg-gray-700 text-gray-400 cursor-default opacity-60`;
  };

  const getIcon = (index: number): string | null => {
    if (!answered) return null;
    if (data.responses[index]?.isCorrect) return '✓';
    if (index === selectedIndex && !data.responses[index]?.isCorrect) return '✗';
    return null;
  };

  const initials = getInitials(data.senderName);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5">
      {/* Email inbox card */}
      <div className="rounded-xl overflow-hidden border border-gray-600/50 bg-gray-800 shadow-lg">
        {/* Email header with avatar */}
        <div className="px-4 py-3 border-b border-gray-700 flex items-start gap-3">
          {/* Sender avatar — initials circle */}
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-white text-sm font-bold leading-none">
              {initials}
            </span>
          </div>

          {/* Sender info */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-[14px] md:text-[15px] font-semibold leading-tight truncate">
              {data.senderName}
            </p>
            <p className="text-slate-300 text-[13px] md:text-[14px] leading-tight mt-0.5">
              {data.subject}
            </p>
          </div>

          {/* Inbox badge */}
          <span className="text-cyan-400 text-[11px] font-semibold uppercase tracking-wide flex-shrink-0 mt-0.5">
            Входящее
          </span>
        </div>

        {/* Email body */}
        <div className="px-4 py-4 md:px-5 md:py-5">
          <p className="text-slate-200 text-[14px] md:text-[15px] leading-relaxed whitespace-pre-wrap">
            {data.body}
          </p>
        </div>
      </div>

      {/* Response options */}
      <div className="flex flex-col gap-3">
        <h3 className="text-slate-300 font-semibold text-[14px] md:text-[15px]">
          Ваш ответ:
        </h3>

        <div
          className="flex flex-col gap-3"
          role="group"
          aria-label="Варианты ответа на письмо"
        >
          {data.responses.map((response, index) => (
            <motion.button
              key={index}
              type="button"
              aria-label={`Вариант ${index + 1}: ${response.text}`}
              aria-disabled={answered}
              disabled={answered}
              className={getOptionClasses(index)}
              onClick={() => handleSelect(index)}
              whileTap={!answered ? { scale: 0.98 } : undefined}
              animate={
                answered &&
                index === selectedIndex &&
                !data.responses[index]?.isCorrect
                  ? { x: [0, -6, 6, -4, 4, -2, 2, 0] }
                  : {}
              }
              transition={{ duration: 0.3 }}
            >
              <span className="flex items-center justify-between gap-2">
                <span>{response.text}</span>
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
      </div>

      {/* Feedback after selection */}
      {answered && selectedIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`mt-1 p-3 rounded-lg text-[13px] md:text-[14px] leading-relaxed ${
            isCorrect
              ? 'bg-green-900/40 border border-green-600/40 text-green-200'
              : 'bg-red-900/40 border border-red-600/40 text-red-200'
          }`}
          role="alert"
          aria-live="polite"
        >
          {data.responses[selectedIndex]?.feedback}
        </motion.div>
      )}
    </div>
  );
}
