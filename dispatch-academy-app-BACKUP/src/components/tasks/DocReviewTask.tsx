import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { DocReviewData } from '../../types/index';
import { calculateDocReviewScore } from '../../logic/scoring';

interface DocReviewTaskProps {
  data: DocReviewData;
  onAnswer: (correct: boolean, score: number) => void;
}

export default function DocReviewTask({ data, onAnswer }: DocReviewTaskProps) {
  const [tappedFields, setTappedFields] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number>(0);

  const documentTitle = data.documentType === 'rate-con' ? 'Rate Confirmation' : 'Bill of Lading';

  const toggleField = useCallback(
    (fieldId: string) => {
      if (submitted) return;
      setTappedFields((prev) => {
        const next = new Set(prev);
        if (next.has(fieldId)) {
          next.delete(fieldId);
        } else {
          next.add(fieldId);
        }
        return next;
      });
    },
    [submitted]
  );

  const handleSubmit = useCallback(() => {
    if (submitted) return;

    const totalErrors = data.fields.filter((f) => f.hasError).length;
    const incorrectTaps = data.fields.filter(
      (f) => tappedFields.has(f.id) && !f.hasError
    ).length;
    const missedErrors = data.fields.filter(
      (f) => f.hasError && !tappedFields.has(f.id)
    ).length;

    const calculatedScore = calculateDocReviewScore(totalErrors, incorrectTaps, missedErrors);
    setScore(calculatedScore);
    setSubmitted(true);
    onAnswer(calculatedScore >= 70, calculatedScore);
  }, [submitted, data.fields, tappedFields, onAnswer]);

  const getFieldClasses = (field: { id: string; hasError: boolean }): string => {
    const base =
      'w-full min-h-[44px] px-4 py-3 border-2 rounded-lg text-left transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-white';

    if (!submitted) {
      const isTapped = tappedFields.has(field.id);
      if (isTapped) {
        return `${base} border-cyan-500 bg-cyan-50 ring-1 ring-cyan-300`;
      }
      return `${base} border-gray-300 bg-white hover:border-cyan-400 hover:bg-gray-50`;
    }

    // After submission: show results
    const isTapped = tappedFields.has(field.id);
    if (isTapped && field.hasError) {
      // Correct tap — green
      return `${base} border-green-500 bg-green-50 cursor-default`;
    }
    if (!isTapped && field.hasError) {
      // Missed error — yellow
      return `${base} border-yellow-500 bg-yellow-50 cursor-default`;
    }
    if (isTapped && !field.hasError) {
      // Incorrect tap — red
      return `${base} border-red-500 bg-red-50 cursor-default`;
    }
    // Not tapped, no error — neutral
    return `${base} border-gray-200 bg-white opacity-60 cursor-default`;
  };

  const getFieldIcon = (field: { id: string; hasError: boolean }): string | null => {
    if (!submitted) {
      return tappedFields.has(field.id) ? '🔍' : null;
    }

    const isTapped = tappedFields.has(field.id);
    if (isTapped && field.hasError) return '✅';
    if (!isTapped && field.hasError) return '⚠️';
    if (isTapped && !field.hasError) return '❌';
    return null;
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      {/* Document card with dark outer */}
      <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-white/10">
        {/* Document header */}
        <div className="bg-slate-900 border border-white/20 rounded-lg px-4 py-3 mb-4 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            {data.documentType === 'rate-con' ? '📄 Rate Con' : '📄 BOL'}
          </p>
          <h2 className="text-white font-bold text-lg">{documentTitle}</h2>
        </div>

        {/* Instruction */}
        {!submitted && (
          <p className="text-slate-300 text-sm mb-4 text-center">
            Нажмите на поля, в которых вы видите ошибку
          </p>
        )}

        {/* Document body — white background for doc feel */}
        <div className="bg-white rounded-lg p-4 md:p-5 shadow-inner">
          <div
            className="flex flex-col gap-3"
            role="group"
            aria-label="Поля документа для проверки"
          >
            {data.fields.map((field) => {
              const icon = getFieldIcon(field);
              return (
                <motion.button
                  key={field.id}
                  type="button"
                  className={getFieldClasses(field)}
                  onClick={() => toggleField(field.id)}
                  disabled={submitted}
                  aria-pressed={tappedFields.has(field.id)}
                  aria-label={`${field.label}: ${field.value}${tappedFields.has(field.id) ? ' (отмечено)' : ''}`}
                  whileTap={!submitted ? { scale: 0.98 } : undefined}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                        {field.label}
                      </p>
                      <p className="text-sm font-medium text-black truncate">
                        {field.value}
                      </p>
                    </div>
                    {icon && (
                      <span className="text-lg flex-shrink-0" aria-hidden="true">
                        {icon}
                      </span>
                    )}
                  </div>

                  {/* Show error explanation after submit for missed/found errors */}
                  {submitted && field.hasError && field.errorExplanation && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 text-xs text-gray-600 border-t border-gray-200 pt-2 leading-relaxed"
                    >
                      {field.errorExplanation}
                    </motion.p>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Submit button */}
        {!submitted && (
          <motion.button
            type="button"
            onClick={handleSubmit}
            className="w-full min-h-[44px] mt-4 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-base rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            whileTap={{ scale: 0.97 }}
            aria-label="Проверить выбранные поля"
          >
            Проверить
          </motion.button>
        )}

        {/* Results summary */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className={`mt-4 p-4 rounded-xl border-2 ${
              score >= 70
                ? 'bg-green-500/10 border-green-500/40'
                : 'bg-red-500/10 border-red-500/40'
            }`}
            role="alert"
            aria-live="assertive"
          >
            <p
              className={`font-bold text-base mb-2 ${
                score >= 70 ? 'text-green-300' : 'text-red-300'
              }`}
            >
              {score >= 70 ? '✅ Хорошая работа!' : '❌ Нужно больше практики'}
            </p>
            <p className="text-sm text-slate-300">
              Ваш результат:{' '}
              <span className="font-bold text-white">{score}%</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                Найдено верно
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
                Пропущено
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                Неверная отметка
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
