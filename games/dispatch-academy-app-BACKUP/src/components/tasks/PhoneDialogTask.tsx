import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PhoneDialogData } from '../../types/index';

interface PhoneDialogTaskProps {
  data: PhoneDialogData;
  onAnswer: (correct: boolean) => void;
}

interface ChatMessage {
  type: 'npc' | 'student';
  text: string;
}

export default function PhoneDialogTask({ data, onAnswer }: PhoneDialogTaskProps) {
  const [currentTurn, setCurrentTurn] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [allCorrect, setAllCorrect] = useState(true);
  const [completed, setCompleted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Show the first NPC message on mount
  useEffect(() => {
    const firstTurn = data.turns[0];
    if (firstTurn) {
      setMessages([{ type: 'npc', text: firstTurn.text }]);
      // Small delay before showing reply options
      const timer = setTimeout(() => setShowReplies(true), 600);
      return () => clearTimeout(timer);
    }
  }, [data.turns]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showReplies, feedback]);

  const handleReply = useCallback(
    (replyIndex: number) => {
      if (completed || feedback) return;

      const turn = data.turns[currentTurn];
      if (!turn) return;
      const reply = turn.replies[replyIndex];
      if (!reply) return;

      // Add student message to chat
      setMessages((prev) => [...prev, { type: 'student', text: reply.text }]);
      setShowReplies(false);

      // Track correctness
      const isReplyCorrect = reply.isCorrect;
      if (!isReplyCorrect) {
        setAllCorrect(false);
      }

      // Show feedback
      setFeedback({ text: reply.feedback, isCorrect: isReplyCorrect });

      // After feedback delay, advance to next turn or finish
      setTimeout(() => {
        setFeedback(null);

        const nextTurn = currentTurn + 1;
        if (nextTurn < data.turns.length) {
          // Show next NPC message
          const nextNpc = data.turns[nextTurn];
          if (nextNpc) {
            setMessages((prev) => [...prev, { type: 'npc', text: nextNpc.text }]);
          }
          setCurrentTurn(nextTurn);
          // Small delay before showing reply options
          setTimeout(() => setShowReplies(true), 600);
        } else {
          // Conversation complete
          setCompleted(true);
          const finalCorrect = isReplyCorrect ? allCorrect : false;
          onAnswer(finalCorrect);
        }
      }, 2000);
    },
    [currentTurn, data.turns, completed, feedback, allCorrect, onAnswer]
  );

  const currentReplies = data.turns[currentTurn]?.replies ?? [];

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-0">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 rounded-t-xl border border-gray-700 border-b-0">
        <div className="w-9 h-9 rounded-full bg-cyan-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold" aria-hidden="true">📞</span>
        </div>
        <div>
          <p className="text-white text-[14px] font-semibold leading-tight">Телефонный разговор</p>
          <p className="text-slate-400 text-[12px] leading-tight">Выберите правильный ответ</p>
        </div>
      </div>

      {/* Chat messages area */}
      <div
        className="flex flex-col gap-3 px-4 py-4 bg-gray-900 border-l border-r border-gray-700 overflow-y-auto"
        style={{ minHeight: '280px', maxHeight: '420px' }}
        role="log"
        aria-label="Диалог телефонного разговора"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.type === 'student' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed ${
                  msg.type === 'npc'
                    ? 'bg-gray-700 text-white rounded-bl-sm'
                    : 'bg-cyan-600 text-white rounded-br-sm'
                }`}
              >
                {msg.type === 'npc' && (
                  <p className="text-[11px] text-cyan-300 font-semibold mb-1">Собеседник</p>
                )}
                <p className="text-[14px] text-white leading-relaxed">{msg.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Feedback bubble */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="flex justify-center"
            >
              <div
                className={`px-4 py-2 rounded-xl text-[13px] leading-relaxed ${
                  feedback.isCorrect
                    ? 'bg-green-900/50 border border-green-600/40 text-green-200'
                    : 'bg-red-900/50 border border-red-600/40 text-red-200'
                }`}
              >
                {feedback.isCorrect ? '✓ ' : '✗ '}
                {feedback.text}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll anchor */}
        <div ref={chatEndRef} />
      </div>

      {/* Reply options area */}
      <div className="px-4 py-3 bg-gray-800 rounded-b-xl border border-gray-700 border-t-0">
        <AnimatePresence>
          {showReplies && !completed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
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
                  className="w-full min-h-[44px] px-4 py-3 rounded-xl text-left text-[14px] leading-snug bg-gray-700 hover:bg-gray-600 active:bg-gray-600 text-white cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                  whileTap={{ scale: 0.98 }}
                  aria-label={`Вариант ${index + 1}: ${reply.text}`}
                >
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
            className="text-center py-2"
          >
            <p className="text-slate-400 text-[13px]">Разговор завершён</p>
          </motion.div>
        )}

        {/* Waiting state while feedback is shown */}
        {!showReplies && !completed && !feedback && messages.length > 0 && (
          <div className="flex items-center gap-2 py-2">
            <span className="text-slate-500 text-[13px]">Набирает...</span>
            <span className="flex gap-1" aria-hidden="true">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
