import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PhoneDialogData } from '../../types/index';

interface PhoneDialogTaskProps {
  data: PhoneDialogData;
  onAnswer: (correct: boolean) => void;
}

export default function PhoneDialogTask({ data, onAnswer }: PhoneDialogTaskProps) {
  const [currentTurn, setCurrentTurn] = useState(0);
  const [showReplies, setShowReplies] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [allCorrect, setAllCorrect] = useState(true);
  const [completed, setCompleted] = useState(false);

  // Show replies after a delay on mount and after each turn
  useEffect(() => {
    if (!feedback && !completed) {
      const timer = setTimeout(() => setShowReplies(true), 500);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, feedback, completed]);

  const handleReply = useCallback(
    (replyIndex: number) => {
      if (completed || feedback) return;

      const turn = data.turns[currentTurn];
      if (!turn) return;
      const reply = turn.replies[replyIndex];
      if (!reply) return;

      // Track correctness
      const isReplyCorrect = reply.isCorrect;
      if (!isReplyCorrect) {
        setAllCorrect(false);
      }

      setShowReplies(false);
      setFeedback({ text: reply.feedback, isCorrect: isReplyCorrect });

      // Advance to next turn or finish
      setTimeout(() => {
        setFeedback(null);

        const nextTurn = currentTurn + 1;
        if (nextTurn < data.turns.length) {
          setCurrentTurn(nextTurn);
        } else {
          // Conversation complete
          setCompleted(true);
          onAnswer(allCorrect && isReplyCorrect);
        }
      }, 2000);
    },
    [currentTurn, data.turns, completed, feedback, allCorrect, onAnswer]
  );

  const currentTurn_data = data.turns[currentTurn];
  const currentReplies = currentTurn_data?.replies ?? [];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      {/* Context box */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-600/30 rounded-xl p-4"
      >
        <p className="text-cyan-300 text-[13px] font-semibold uppercase mb-2">📋 Ситуация</p>
        <p className="text-white text-[14px] leading-relaxed">{data.context}</p>
      </motion.div>

      {/* Dialogue section */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 space-y-4">
        {/* Current speaker line */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTurn}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Speaker label and message */}
            <div className="space-y-2">
              <p className="text-cyan-400 text-[12px] font-bold uppercase tracking-wide">
                📞 {currentTurn_data?.speaker}
              </p>
              <div className="bg-gray-700/40 border-l-2 border-cyan-500/40 rounded-lg px-4 py-3">
                <p className="text-white text-[15px] leading-relaxed">
                  {currentTurn_data?.message}
                </p>
              </div>
            </div>

            {/* Prompt for response */}
            <div className="pt-2 border-t border-gray-700/30">
              <p className="text-cyan-300 text-[13px] font-semibold mb-3">Что вы ответите?</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Feedback bubble */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`px-4 py-3 rounded-lg text-[14px] leading-relaxed border ${
                feedback.isCorrect
                  ? 'bg-green-900/30 border-green-600/40 text-green-200'
                  : 'bg-red-900/30 border-red-600/40 text-red-200'
              }`}
            >
              <span className="font-bold">{feedback.isCorrect ? '✓ Правильно!' : '✗ Не совсем!'}</span>
              <p className="mt-1">{feedback.text}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reply options */}
      <AnimatePresence>
        {showReplies && !completed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-2"
            role="group"
            aria-label="Варианты ответа"
          >
            {currentReplies.map((reply, index) => (
              <motion.button
                key={`${currentTurn}-${index}`}
                type="button"
                onClick={() => handleReply(index)}
                className="w-full px-4 py-3 rounded-lg text-left text-[14px] leading-snug bg-cyan-600/15 hover:bg-cyan-600/25 active:bg-cyan-600/30 border border-cyan-500/30 hover:border-cyan-400/50 text-white cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-950"
                whileTap={{ scale: 0.98 }}
                aria-label={`Вариант ${index + 1}: ${reply.text}`}
              >
                <span className="inline-block mr-3 text-cyan-400 font-bold">
                  {String.fromCharCode(65 + index)}.
                </span>
                {reply.text}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completed state */}
      {completed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4 px-4 bg-gray-800/50 rounded-lg border border-gray-700/50"
        >
          <p className="text-slate-300 text-[14px] font-medium">
            {allCorrect ? '✓ Переговоры завершены успешно!' : '✓ Переговоры завершены (с ошибками)'}
          </p>
        </motion.div>
      )}

      {/* Progress indicator */}
      <div className="text-center">
        <p className="text-slate-400 text-[12px]">
          Шаг {currentTurn + 1} из {data.turns.length}
        </p>
      </div>
    </div>
  );
}
