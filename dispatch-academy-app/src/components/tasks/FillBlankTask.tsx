import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { FillBlankData } from '../../types/index';

interface FillBlankTaskProps {
  data: FillBlankData;
  onAnswer: (correct: boolean) => void;
}

export default function FillBlankTask({ data, onAnswer }: FillBlankTaskProps) {
  const [answers, setAnswers] = useState<string[]>(
    () => data.blanks.map(() => '')
  );
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const handleInputChange = useCallback(
    (index: number, value: string) => {
      if (submitted) return;
      setAnswers((prev) => {
        const next = [...prev];
        next[index] = value;
        return next;
      });
    },
    [submitted]
  );

  const handleWordBankSelect = useCallback(
    (blankIndex: number, word: string) => {
      if (submitted) return;
      setAnswers((prev) => {
        const next = [...prev];
        // Toggle: if already selected, deselect
        next[blankIndex] = prev[blankIndex] === word ? '' : word;
        return next;
      });
    },
    [submitted]
  );

  const handleSubmit = useCallback(() => {
    if (submitted) return;

    const blankResults = data.blanks.map((blank, index) => {
      const userAnswer = answers[index].trim().toLowerCase();
      const correctAnswer = blank.correctAnswer.trim().toLowerCase();
      return userAnswer === correctAnswer;
    });

    setResults(blankResults);
    setSubmitted(true);

    const allCorrect = blankResults.every((r) => r);
    onAnswer(allCorrect);
  }, [submitted, data.blanks, answers, onAnswer]);

  // Shuffle word banks on mount (so correct answer isn't always first)
  const shuffledBlanks = useState(() => 
    data.blanks.map(blank => ({
      ...blank,
      wordBank: blank.wordBank ? [...blank.wordBank].sort(() => Math.random() - 0.5) : undefined,
    }))
  )[0];
  const cleanParts: string[] = [];
  const rawSentence = data.sentence;
  const regex = /(\{\d+\}|___)/g;
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(rawSentence)) !== null) {
    cleanParts.push(rawSentence.slice(lastIndex, match.index));
    lastIndex = match.index + match[0].length;
  }
  cleanParts.push(rawSentence.slice(lastIndex));
  
  const finalParts = cleanParts;

  // Check if submit is possible (all blanks filled)
  const canSubmit = answers.every((a) => a.trim().length > 0);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Sentence with blanks */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 mb-4">
        <p className="text-white text-base md:text-lg leading-relaxed flex flex-wrap items-center gap-1">
          {finalParts.map((part, partIndex) => (
            <span key={partIndex} className="inline-flex items-center flex-wrap gap-1">
              {/* Text part */}
              {part && <span>{part}</span>}

              {/* Blank input/button (not after the last part) */}
              {partIndex < finalParts.length - 1 && (
                <BlankField
                  index={partIndex}
                  blank={data.blanks[partIndex]}
                  value={answers[partIndex]}
                  submitted={submitted}
                  isCorrect={results[partIndex]}
                  onInputChange={handleInputChange}
                  onWordSelect={handleWordBankSelect}
                />
              )}
            </span>
          ))}
        </p>
      </div>

      {/* Word banks (rendered below sentence for blanks that have them) */}
      {!submitted &&
        shuffledBlanks.map(
          (blank, index) =>
            blank.wordBank &&
            blank.wordBank.length > 0 && (
              <div key={index} className="mb-3">
                {data.blanks.length > 1 && (
                  <p className="text-xs text-slate-400 mb-1.5">
                    Пропуск {index + 1}:
                  </p>
                )}
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label={`Варианты для пропуска ${index + 1}`}
                >
                  {blank.wordBank.map((word) => (
                    <button
                      key={word}
                      type="button"
                      onClick={() => handleWordBankSelect(index, word)}
                      className={`min-h-[44px] px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                        answers[index] === word
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                      }`}
                      aria-pressed={answers[index] === word}
                      aria-label={`Выбрать слово: ${word}`}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )
        )}

      {/* Correct answers displayed after submission */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4"
        >
          {data.blanks.map((blank, index) => (
            <div key={index} className="flex items-center gap-2 mb-1.5">
              <span
                className={`text-sm font-semibold ${
                  results[index] ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {results[index] ? '✓' : '✗'}
              </span>
              <span className="text-sm text-slate-300">
                {results[index] ? (
                  `Пропуск ${index + 1}: ${answers[index]}`
                ) : (
                  <>
                    Пропуск {index + 1}: <span className="line-through text-red-300">{answers[index]}</span>{' '}
                    → <span className="text-green-300 font-medium">{blank.correctAnswer}</span>
                  </>
                )}
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Submit button */}
      {!submitted && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full min-h-[44px] px-6 py-3 rounded-xl text-base font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
            canSubmit
              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-900 cursor-pointer'
              : 'bg-white/10 text-slate-500 cursor-not-allowed'
          }`}
          aria-label="Проверить ответ"
        >
          Проверить
        </button>
      )}
    </div>
  );
}

// === BlankField Sub-component ===

interface BlankFieldProps {
  index: number;
  blank: { correctAnswer: string; wordBank?: string[] };
  value: string;
  submitted: boolean;
  isCorrect?: boolean;
  onInputChange: (index: number, value: string) => void;
  onWordSelect: (index: number, word: string) => void;
}

function BlankField({
  index,
  blank,
  value,
  submitted,
  isCorrect,
  onInputChange,
}: BlankFieldProps) {
  // Determine styling based on state
  const getFieldClasses = (): string => {
    const base =
      'inline-block min-w-[80px] max-w-[160px] min-h-[36px] px-3 py-1.5 rounded-lg text-sm font-medium text-center border-2 transition-all duration-200';

    if (!submitted) {
      if (value) {
        return `${base} bg-cyan-500/10 border-cyan-400/50 text-cyan-200`;
      }
      return `${base} bg-white/5 border-dashed border-white/20 text-white`;
    }

    // After submission
    if (isCorrect) {
      return `${base} bg-green-500/20 border-green-500 text-green-300`;
    }
    return `${base} bg-red-500/20 border-red-500 text-red-300`;
  };

  // If wordBank exists, display as a read-only field showing selected word
  if (blank.wordBank && blank.wordBank.length > 0) {
    return (
      <span
        className={getFieldClasses()}
        role="status"
        aria-label={`Пропуск ${index + 1}: ${value || 'не заполнено'}`}
      >
        {value || '___'}
      </span>
    );
  }

  // Text input mode
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onInputChange(index, e.target.value)}
      disabled={submitted}
      placeholder="..."
      className={`${getFieldClasses()} focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400`}
      aria-label={`Ввести ответ для пропуска ${index + 1}`}
      style={{ minHeight: '44px', fontSize: '14px' }}
    />
  );
}
