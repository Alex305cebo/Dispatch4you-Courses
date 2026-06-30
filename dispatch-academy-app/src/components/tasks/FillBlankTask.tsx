import { useState, useCallback } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      const userAnswer = (answers[index] ?? '').trim().toLowerCase();
      const correctAnswer = (blank?.correctAnswer ?? '').trim().toLowerCase();
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
        <p className="text-white text-[15px] md:text-[17px] lg:text-[18px] leading-relaxed font-medium">
          {finalParts.map((part, partIndex) => (
            <span key={partIndex}>
              {/* Text part — inline */}
              {part && <span>{part}</span>}

              {/* Blank input/button — inline with text */}
              {partIndex < finalParts.length - 1 && (
                <BlankField
                  index={partIndex}
                  blank={data.blanks[partIndex] ?? { correctAnswer: '' }}
                  value={answers[partIndex] ?? ''}
                  submitted={submitted}
                  isCorrect={results[partIndex] ?? false}
                  onInputChange={handleInputChange}
                  onWordSelect={handleWordBankSelect}
                />
              )}
            </span>
          ))}
        </p>
      </div>

      {/* Submit button — appears first when all blanks filled */}
      {!submitted && canSubmit && (
        <motion.button
          type="button"
          onClick={handleSubmit}
          className="w-full min-h-[44px] px-6 py-3 rounded-xl text-base font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 bg-cyan-500 hover:bg-cyan-400 text-slate-900 cursor-pointer mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          aria-label="Проверить ответ"
        >
          ✓ Проверить ответ
        </motion.button>
      )}

      {/* Word banks (rendered below sentence for blanks that have them) */}
      {!submitted &&
        shuffledBlanks
          .map((blank, index) => ({ blank, index }))
          .sort((a, b) => {
            // Selected blocks go to the end
            const aSelected = answers[a.index] ? 1 : 0;
            const bSelected = answers[b.index] ? 1 : 0;
            return aSelected - bSelected;
          })
          .map(({ blank, index }) =>
            blank.wordBank &&
            blank.wordBank.length > 0 && (
              <motion.div
                key={index}
                className="mb-6"
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
              >
                {/* Section header — shows the sentence with highlighted blank */}
                <div className={`px-3 py-3 rounded-t-lg mb-0 border-l-4 flex items-start gap-2.5 ${
                  index === 0 ? 'bg-purple-500/20 border-purple-400' :
                  index === 1 ? 'bg-blue-500/20 border-blue-400' :
                  index === 2 ? 'bg-cyan-500/20 border-cyan-400' :
                  index === 3 ? 'bg-green-500/20 border-green-400' :
                  'bg-orange-500/20 border-orange-400'
                }`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 mt-0.5 ${
                    index === 0 ? 'bg-purple-500' :
                    index === 1 ? 'bg-blue-500' :
                    index === 2 ? 'bg-cyan-500' :
                    index === 3 ? 'bg-green-500' :
                    'bg-orange-500'
                  }`}>
                    {index + 1}
                  </span>
                  {/* Full sentence — current blank = ?, filled blanks = answer, unfilled = ___ */}
                  <p className="text-[14px] lg:text-[15px] leading-relaxed text-white flex-1 font-medium">
                    {(() => {
                      const sentence = data.sentence;
                      const blankRegex = /\{(\d+)\}/g;
                      const allMatches: { idx: number; start: number; end: number }[] = [];
                      let m;
                      while ((m = blankRegex.exec(sentence)) !== null) {
                        allMatches.push({ idx: parseInt(m[1] ?? '0'), start: m.index, end: m.index + (m[0]?.length ?? 0) });
                      }

                      const highlightColor =
                        index === 0 ? 'text-purple-100 bg-purple-500/40 border-purple-300' :
                        index === 1 ? 'text-blue-100 bg-blue-500/40 border-blue-300' :
                        index === 2 ? 'text-cyan-100 bg-cyan-500/40 border-cyan-300' :
                        index === 3 ? 'text-green-100 bg-green-500/40 border-green-300' :
                        'text-orange-100 bg-orange-500/40 border-orange-300';

                      const nodes: React.ReactNode[] = [];
                      let lastEnd = 0;
                      allMatches.forEach((match, mi) => {
                        if (match.start > lastEnd) {
                          nodes.push(<span key={`t${mi}`}>{sentence.slice(lastEnd, match.start)}</span>);
                        }
                        if (match.idx === index) {
                          nodes.push(
                            <span key={`b${mi}`} className={`inline-block px-2 py-0 rounded font-bold border mx-0.5 ${highlightColor}`}>?</span>
                          );
                        } else {
                          const val = answers[match.idx];
                          nodes.push(
                            <span key={`b${mi}`} className={`inline-block px-1.5 font-semibold mx-0.5 rounded ${val ? 'text-white bg-white/15' : 'text-white/50'}`}>
                              {val || '___'}
                            </span>
                          );
                        }
                        lastEnd = match.end;
                      });
                      if (lastEnd < sentence.length) {
                        nodes.push(<span key="tail">{sentence.slice(lastEnd)}</span>);
                      }
                      return nodes;
                    })()}
                  </p>
                </div>

                {/* Options grid */}
                <div
                  className={`grid grid-cols-2 gap-2 p-3 rounded-b-lg ${
                    index === 0 ? 'bg-purple-500/5' :
                    index === 1 ? 'bg-blue-500/5' :
                    index === 2 ? 'bg-cyan-500/5' :
                    index === 3 ? 'bg-green-500/5' :
                    'bg-orange-500/5'
                  }`}
                  role="group"
                  aria-label={`Варианты для пропуска ${index + 1}`}
                >
                  <AnimatePresence>
                    {blank.wordBank.map((word) => (
                      <motion.button
                        key={word}
                        type="button"
                        onClick={() => handleWordBankSelect(index, word)}
                        className={`px-4 py-2.5 rounded-lg text-[14px] lg:text-[15px] font-semibold transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 ${
                          answers[index] === word
                            ? index === 0 ? 'bg-purple-500/30 border-purple-400 text-purple-200 shadow-lg shadow-purple-500/20' :
                              index === 1 ? 'bg-blue-500/30 border-blue-400 text-blue-200 shadow-lg shadow-blue-500/20' :
                              index === 2 ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/20' :
                              index === 3 ? 'bg-green-500/30 border-green-400 text-green-200 shadow-lg shadow-green-500/20' :
                              'bg-orange-500/30 border-orange-400 text-orange-200 shadow-lg shadow-orange-500/20'
                            : 'bg-slate-700/60 border-slate-600/50 text-white hover:bg-slate-600/70 hover:border-slate-500/60'
                        }`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
                        aria-pressed={answers[index] === word}
                        aria-label={`Выбрать: ${word}`}
                      >
                        {answers[index] === word ? `✓ ${word}` : word}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
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

      {/* Submit button — disabled version when not all filled */}
      {!submitted && !canSubmit && (
        <button
          type="button"
          disabled
          className="w-full min-h-[44px] px-6 py-3 rounded-xl text-base font-bold transition-all duration-200 focus:outline-none bg-white/10 text-slate-500 cursor-not-allowed mb-6"
          aria-label="Заполните все пропуски"
        >
          Заполните все пропуски
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
  // Get color and label based on blank index
  const getColorAndLabel = (): { bg: string; bgEmpty: string; border: string; borderEmpty: string; text: string; ring: string; label: string } => {
    const labels = ['①', '②', '③', '④', '⑤'];
    const label = labels[index % 5] || `(${index + 1})`;
    
    switch (index % 5) {
      case 0:
        return { 
          bg: 'bg-purple-500/25', 
          bgEmpty: 'bg-purple-500/10',
          border: 'border-purple-400/80', 
          borderEmpty: 'border-purple-400/40',
          text: 'text-purple-200', 
          ring: 'focus:ring-purple-400',
          label
        };
      case 1:
        return { 
          bg: 'bg-blue-500/25',
          bgEmpty: 'bg-blue-500/10',
          border: 'border-blue-400/80',
          borderEmpty: 'border-blue-400/40',
          text: 'text-blue-200', 
          ring: 'focus:ring-blue-400',
          label
        };
      case 2:
        return { 
          bg: 'bg-cyan-500/25',
          bgEmpty: 'bg-cyan-500/10',
          border: 'border-cyan-400/80',
          borderEmpty: 'border-cyan-400/40',
          text: 'text-cyan-200', 
          ring: 'focus:ring-cyan-400',
          label
        };
      case 3:
        return { 
          bg: 'bg-green-500/25',
          bgEmpty: 'bg-green-500/10',
          border: 'border-green-400/80',
          borderEmpty: 'border-green-400/40',
          text: 'text-green-200', 
          ring: 'focus:ring-green-400',
          label
        };
      default:
        return { 
          bg: 'bg-orange-500/25',
          bgEmpty: 'bg-orange-500/10',
          border: 'border-orange-400/80',
          borderEmpty: 'border-orange-400/40',
          text: 'text-orange-200', 
          ring: 'focus:ring-orange-400',
          label
        };
    }
  };

  const colors = getColorAndLabel();

  // Determine styling based on state
  const getFieldClasses = (): string => {
    const base =
      'inline-block mx-0.5 min-w-[56px] max-w-[100px] min-h-[32px] px-2 py-1 rounded-md text-xs sm:text-sm font-semibold text-center border-2 align-baseline transition-all duration-200 flex items-center justify-center';

    if (!submitted) {
      if (value) {
        return `${base} ${colors.bg} ${colors.border} ${colors.text}`;
      }
      return `${base} ${colors.bgEmpty} border-dashed ${colors.borderEmpty} ${colors.text}`;
    }

    // After submission
    if (isCorrect) {
      return `${base} bg-green-500/30 border-green-500/70 text-green-300`;
    }
    return `${base} bg-red-500/30 border-red-500/70 text-red-300`;
  };

  // If wordBank exists, display as a read-only field showing selected word
  if (blank.wordBank && blank.wordBank.length > 0) {
    // If filled, show as plain text with subtle color highlight
    if (value) {
      const highlightClass = 
        index % 5 === 0 ? 'text-purple-300 bg-purple-500/10 px-1 rounded' :
        index % 5 === 1 ? 'text-blue-300 bg-blue-500/10 px-1 rounded' :
        index % 5 === 2 ? 'text-cyan-300 bg-cyan-500/10 px-1 rounded' :
        index % 5 === 3 ? 'text-green-300 bg-green-500/10 px-1 rounded' :
        'text-orange-300 bg-orange-500/10 px-1 rounded';
      
      return <span className={`font-semibold ${highlightClass}`}>{value}</span>;
    }
    
    // If empty, show colored placeholder
    return (
      <span
        className={getFieldClasses()}
        role="status"
        aria-label={`Пропуск ${index + 1}: не заполнено`}
      >
        <span className="text-xs opacity-60">{colors.label}</span>
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
      placeholder={colors.label}
      className={`${getFieldClasses()} focus:outline-none focus:ring-2 ${colors.ring} focus:border-current placeholder-shown:text-xs placeholder-opacity-60`}
      aria-label={`Ввести ответ для пропуска ${index + 1}`}
      style={{ minHeight: '32px', fontSize: '13px' }}
    />
  );
}
