import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CalculatorData } from '../../types/index';
import { generateCalculatorOptions } from '../../logic/calculator-options';

interface CalculatorTaskProps {
  data: CalculatorData;
  onAnswer: (correct: boolean) => void;
}

// === Mini Calculator Component ===
function MiniCalculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);

  const handleButton = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
      setExpression('');
      setJustEvaluated(false);
      return;
    }

    if (val === '⌫') {
      if (display.length > 1) {
        setDisplay(display.slice(0, -1));
      } else {
        setDisplay('0');
      }
      return;
    }

    if (val === '=') {
      try {
        // Replace × with * and ÷ with /
        const expr = expression.replace(/×/g, '*').replace(/÷/g, '/');
        // Safe eval using Function
        const result = Function('"use strict"; return (' + expr + ')')();
        const rounded = parseFloat(result.toFixed(4));
        setDisplay(String(rounded));
        setExpression(String(rounded));
        setJustEvaluated(true);
      } catch {
        setDisplay('Ошибка');
        setExpression('');
      }
      return;
    }

    const isOperator = ['×', '÷', '+', '-'].includes(val);

    if (justEvaluated && !isOperator) {
      setDisplay(val);
      setExpression(val);
      setJustEvaluated(false);
      return;
    }

    if (justEvaluated && isOperator) {
      setExpression(expression + val);
      setDisplay(expression + val);
      setJustEvaluated(false);
      return;
    }

    if (val === '.' && display.includes('.')) return;

    const newExpr = expression + val;
    setExpression(newExpr);
    setDisplay(newExpr);
  };

  const buttons = [
    ['C', '⌫', '÷', '×'],
    ['7', '8', '9', '-'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '='],
    ['0', '.', '', ''],
  ];

  const getButtonStyle = (val: string) => {
    if (val === '=') return 'bg-cyan-500 hover:bg-cyan-400 text-white font-bold';
    if (val === 'C') return 'bg-red-500/80 hover:bg-red-400 text-white font-bold';
    if (val === '⌫') return 'bg-amber-500/80 hover:bg-amber-400 text-white font-bold';
    if (['÷', '×', '+', '-'].includes(val)) return 'bg-slate-600 hover:bg-slate-500 text-cyan-300 font-bold';
    if (val === '') return 'invisible';
    return 'bg-slate-700 hover:bg-slate-600 text-white';
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(15,23,42,0.98), rgba(30,41,59,0.95))',
        border: '1px solid rgba(6,182,212,0.25)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Display */}
      <div className="px-4 py-3 text-right border-b border-white/10">
        <p className="text-slate-400 text-[11px] h-4 overflow-hidden truncate">&nbsp;</p>
        <p
          className="text-white font-mono font-bold mt-1 truncate"
          style={{ fontSize: 'clamp(18px, 4vw, 26px)' }}
        >
          {display}
        </p>
      </div>

      {/* Buttons */}
      <div className="p-2 grid grid-cols-4 gap-1.5">
        {buttons.flat().map((val, i) => (
          <button
            key={i}
            onClick={() => val && handleButton(val)}
            className={`${getButtonStyle(val)} rounded-xl text-[15px] font-semibold transition-all active:scale-95 ${
              val === '=' ? 'row-span-1' : ''
            } ${val === '0' ? 'col-span-2' : ''}`}
            style={{ minHeight: '44px' }}
          >
            {val}
          </button>
        ))}
      </div>
    </div>
  );
}

// === Main CalculatorTask Component ===
export default function CalculatorTask({ data, onAnswer }: CalculatorTaskProps) {
  const { options, correctIndex } = useMemo(
    () => generateCalculatorOptions(data.correctAnswer, data.unit),
    [data.correctAnswer, data.unit]
  );

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

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
      'relative w-full min-h-[44px] px-4 py-3 rounded-xl text-center text-[14px] md:text-[15px] leading-snug transition-all duration-200 font-semibold';

    if (!answered) {
      return `${base} bg-slate-800/80 border border-slate-600/60 text-white hover:bg-slate-700/80 hover:border-cyan-400/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400`;
    }
    if (index === correctIndex) {
      return `${base} bg-green-500/20 border border-green-500 text-green-200`;
    }
    if (index === selectedIndex) {
      return `${base} bg-red-500/20 border border-red-500 text-red-200`;
    }
    return `${base} bg-slate-800/40 border border-slate-700/40 text-slate-500 opacity-50`;
  };

  const correctLabel = options[correctIndex];

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-4">

      {/* Problem card */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-white font-bold text-[15px] leading-snug mb-2">{data.problem}</p>
        {data.context && (
          <p className="text-cyan-200/80 text-[13px] leading-relaxed">{data.context}</p>
        )}
      </div>

      {/* Calculator toggle */}
      <button
        onClick={() => setShowCalc(v => !v)}
        className="flex items-center gap-2 self-center px-4 py-2 rounded-xl text-[13px] font-semibold transition-all border"
        style={{
          background: showCalc ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.05)',
          borderColor: showCalc ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.12)',
          color: showCalc ? '#67e8f9' : '#94a3b8',
        }}
      >
        <span>🧮</span>
        <span>{showCalc ? 'Скрыть калькулятор' : 'Открыть калькулятор'}</span>
      </button>

      {/* Calculator */}
      <AnimatePresence>
        {showCalc && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.96 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <MiniCalculator />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer options */}
      <div>
        <p className="text-slate-400 text-[12px] font-medium mb-2 text-center">Выберите правильный ответ:</p>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Варианты ответа">
          {options.map((option, index) => (
            <motion.button
              key={index}
              type="button"
              aria-label={`Вариант ${index + 1}: ${option}`}
              disabled={answered}
              className={getOptionClasses(index)}
              onClick={() => handleSelect(index)}
              whileTap={!answered ? { scale: 0.97 } : undefined}
              animate={
                answered && index === selectedIndex && index !== correctIndex
                  ? { x: [0, -6, 6, -4, 4, -2, 2, 0] }
                  : {}
              }
              transition={{ duration: 0.3 }}
            >
              {option}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Result feedback */}
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={`p-3 rounded-xl text-[13px] font-medium text-center ${
            isCorrect
              ? 'bg-green-500/10 border border-green-500/30 text-green-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}
        >
          {isCorrect ? `✓ Правильно! Ответ: ${correctLabel}` : `✗ Неверно. Правильный ответ: ${correctLabel}`}
        </motion.div>
      )}
    </div>
  );
}
