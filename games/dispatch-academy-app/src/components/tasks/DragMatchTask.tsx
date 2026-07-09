import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { DragMatchData } from '../../types/index';

interface DragMatchTaskProps {
  data: DragMatchData;
  onAnswer: (correct: boolean) => void;
}

/**
 * DragMatchTask — Step-by-step matching on mobile.
 * Shows ONE term at a time, student picks the correct definition from shuffled options.
 * Much more compact and mobile-friendly than two-column layout.
 */
export default function DragMatchTask({ data, onAnswer }: DragMatchTaskProps) {
  const pairs = data.pairs;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedDef, setSelectedDef] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  // Shuffle definitions for current term
  const shuffledDefs = useMemo(() => {
    const defs = pairs.map(p => p.definition);
    const shuffled = [...defs];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    return shuffled;
  }, [pairs]);

  const currentTerm = pairs[currentIndex]?.term ?? '';
  const correctDef = pairs[currentIndex]?.definition ?? '';
  const correctDefIndex = shuffledDefs.indexOf(correctDef);

  const handleSelect = useCallback((defIndex: number) => {
    if (showResult) return;
    setSelectedDef(defIndex);
    setShowResult(true);

    const isCorrect = shuffledDefs[defIndex] === correctDef;
    if (isCorrect) setCorrectCount(c => c + 1);

    // Auto-advance after 1 second
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= pairs.length) {
        setFinished(true);
        const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
        onAnswer(finalCorrect === pairs.length);
      } else {
        setCurrentIndex(nextIndex);
        setSelectedDef(null);
        setShowResult(false);
      }
    }, 1200);
  }, [showResult, shuffledDefs, correctDef, currentIndex, pairs.length, correctCount, onAnswer]);

  if (finished) {
    return (
      <div className="w-full text-center py-4">
        <p className="text-lg font-bold text-white mb-2">
          {correctCount === pairs.length ? '✅ Все верно!' : `${correctCount}/${pairs.length} правильно`}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 mb-3">
        {pairs.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i < currentIndex ? 'bg-green-400' :
              i === currentIndex ? 'bg-cyan-400' : 'bg-slate-600'
            }`}
          />
        ))}
      </div>

      {/* Current term — big and prominent */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">📌 Найдите определение для:</p>
        <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border-2 border-cyan-500/50 rounded-2xl py-4 px-5">
          <p className="text-2xl lg:text-3xl font-bold text-cyan-100 mb-1">{currentTerm}</p>
          <p className="text-xs text-slate-400 italic">выберите правильное определение ниже</p>
        </div>
      </motion.div>

      {/* Definition options */}
      <div className="flex flex-col gap-2.5">
        {shuffledDefs.map((def, i) => {
          let classes = 'w-full min-h-[52px] lg:min-h-[60px] px-4 lg:px-5 py-3 lg:py-4 rounded-xl text-left text-[14px] lg:text-[15px] font-medium border-2 transition-all flex items-center gap-3 ';

          if (!showResult) {
            classes += 'bg-slate-700/60 border-slate-600/40 text-white hover:bg-slate-600/70 hover:border-cyan-500/40 cursor-pointer active:bg-slate-600/80';
          } else if (i === correctDefIndex) {
            classes += 'bg-green-500/30 border-green-500/60 text-green-100 font-semibold';
          } else if (i === selectedDef && i !== correctDefIndex) {
            classes += 'bg-red-500/30 border-red-500/60 text-red-100 font-semibold';
          } else {
            classes += 'bg-slate-800/40 border-slate-700/30 text-slate-500 opacity-60';
          }

          return (
            <motion.button
              key={i}
              className={classes}
              onClick={() => handleSelect(i)}
              disabled={showResult}
              whileTap={!showResult ? { scale: 0.97 } : undefined}
            >
              <span className="text-lg font-bold flex-shrink-0 w-6 h-6 rounded-full bg-slate-600/50 flex items-center justify-center">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{def}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
