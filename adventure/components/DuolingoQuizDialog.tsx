/**
 * DUOLINGO QUIZ DIALOG
 * Квиз в формате чат-пузырей (как CharacterDialog)
 * Аватары + пузыри + варианты ответов + feedback
 * Без отдельного окна — поверх игры как drawer снизу
 */
import { useState, useEffect, useRef } from 'react';
import { Modal } from 'react-native';
import { useLessonStore } from '../store/lessonStore';
import { getDialogById } from '../data/duolingoDialogs';
import type { DuolingoDialog, DuolingoDialogStep } from '../data/duolingoDialogs';

interface Props {
  lessonId: string;
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
  /** Заголовок в хедере (напр. "Совет дня" или "Мини-урок") */
  title?: string;
}

const AVATARS: Record<string, { name: string; img: string }> = {
  mentor: {
    name: 'Майк',
    img: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Person%20White%20Hair.png',
  },
  broker: {
    name: 'Сара',
    img: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Person%20Light%20Skin%20Tone%2C%20Curly%20Hair.png',
  },
  driver: {
    name: 'Джон',
    img: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Man%20Office%20Worker%20Light%20Skin%20Tone.png',
  },
  player: {
    name: 'Ты',
    img: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Man%20Technologist%20Medium-Light%20Skin%20Tone.png',
  },
};

type BubbleMsg = {
  from: 'left' | 'right';
  text: string;
  avatar: string;
  name: string;
  isQuestion?: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  isXP?: boolean;
};

export default function DuolingoQuizDialog({ lessonId, visible, onClose, onComplete, title }: Props) {
  const { completeLesson, completedLessons, totalXP, streak } = useLessonStore();

  const [messages, setMessages] = useState<BubbleMsg[]>([]);
  const [typing, setTyping] = useState(false);
  const [typingAvatar, setTypingAvatar] = useState('');
  const [options, setOptions] = useState<{ text: string; index: number }[] | null>(null);
  const [answered, setAnswered] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [finished, setFinished] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const processedRef = useRef(false);

  const dialog = getDialogById(lessonId);

  useEffect(() => {
    if (!visible || !dialog) {
      setMessages([]);
      setOptions(null);
      setAnswered(false);
      setXpEarned(0);
      setFinished(false);
      processedRef.current = false;
      return;
    }
    if (processedRef.current) return;
    processedRef.current = true;
    runDialog(dialog);
  }, [visible, lessonId]);

  function scroll() {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }

  function getChar(character: string) {
    return AVATARS[character] || AVATARS.mentor;
  }

  async function runDialog(d: DuolingoDialog) {
    const steps = d.dialogs;
    let msgs: BubbleMsg[] = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const char = getChar(step.character);
      const isPlayer = step.character === 'player';

      // Typing animation
      setTypingAvatar(char.img);
      setTyping(true);
      await wait(900 + Math.random() * 400);
      setTyping(false);

      // Add message bubble
      const bubble: BubbleMsg = {
        from: isPlayer ? 'right' : 'left',
        text: step.text,
        avatar: char.img,
        name: char.name,
      };
      msgs = [...msgs, bubble];
      setMessages([...msgs]);
      scroll();

      // If this step has a question — show options and wait
      if (step.question) {
        await wait(400);
        const q = step.question;
        setOptions(q.options.map((o, idx) => ({ text: o.text, index: idx })));
        scroll();

        // Wait for user answer
        const answerIdx = await waitForAnswer();
        setOptions(null);

        const correct = answerIdx === q.correctAnswer;
        const xp = correct ? d.xp : Math.round(d.xp * 0.3);
        setXpEarned(xp);
        setAnswered(true);

        // Player's answer bubble
        const playerBubble: BubbleMsg = {
          from: 'right',
          text: q.options[answerIdx].text,
          avatar: AVATARS.player.img,
          name: 'Ты',
          isCorrect: correct && answerIdx === q.correctAnswer,
          isWrong: !correct,
        };
        msgs = [...msgs, playerBubble];
        setMessages([...msgs]);
        scroll();

        await wait(600);

        // Feedback bubble from mentor
        const feedbackText = correct
          ? `✅ Верно! ${q.options[q.correctAnswer].feedback || ''}`
          : `❌ Неверно. Правильный ответ: ${q.options[q.correctAnswer].text}`;
        const feedbackBubble: BubbleMsg = {
          from: 'left',
          text: feedbackText,
          avatar: AVATARS.mentor.img,
          name: 'Майк',
        };
        msgs = [...msgs, feedbackBubble];
        setMessages([...msgs]);
        scroll();

        await wait(500);

        // Explanation bubble
        const explBubble: BubbleMsg = {
          from: 'left',
          text: `💡 ${q.explanation}`,
          avatar: AVATARS.mentor.img,
          name: 'Майк',
        };
        msgs = [...msgs, explBubble];
        setMessages([...msgs]);
        scroll();

        await wait(400);

        // XP bubble
        const xpBubble: BubbleMsg = {
          from: 'left',
          text: `+${xp} XP ⭐`,
          avatar: AVATARS.mentor.img,
          name: 'Майк',
          isXP: true,
        };
        msgs = [...msgs, xpBubble];
        setMessages([...msgs]);
        scroll();
      }

      await wait(300);
    }

    // Complete
    if (!completedLessons.includes(d.id)) {
      completeLesson(d.id, xpEarned || d.xp);
    }
    setFinished(true);
    scroll();
  }

  // Promise that resolves when user picks an option
  let resolveAnswer: ((idx: number) => void) | null = null;
  function waitForAnswer(): Promise<number> {
    return new Promise(resolve => { resolveAnswer = resolve; });
  }

  function handleOptionClick(idx: number) {
    if (resolveAnswer) {
      resolveAnswer(idx);
      resolveAnswer = null;
    }
  }

  function handleDone() {
    onComplete();
  }

  if (!visible || !dialog) return null;

  const diffColor = dialog.difficulty === 'beginner' ? '#58cc02'
    : dialog.difficulty === 'intermediate' ? '#ffc800' : '#ff4b4b';
  const diffLabel = dialog.difficulty === 'beginner' ? 'Новичок'
    : dialog.difficulty === 'intermediate' ? 'Средний' : 'Эксперт';

  return (
    <Modal visible={visible} transparent animationType="slide">
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', alignItems: 'center',
        zIndex: 9999,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      } as any}>

        {/* Backdrop — карта видна */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(1px)',
        } as any} onClick={onClose} />

        {/* Drawer */}
        <div style={{
          position: 'relative', width: '100%', maxWidth: 480,
          height: '75vh',
          background: '#fff', borderRadius: '24px 24px 0 0',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
        } as any}>

          {/* HEADER */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', borderBottom: '2px solid #f0f0f0',
            position: 'relative',
          } as any}>
            <div style={{
              position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
              width: 40, height: 4, borderRadius: 2, background: '#d1d5db',
            } as any} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 } as any}>
              <img src={AVATARS.mentor.img} width={42} height={42}
                style={{ borderRadius: '50%', border: '2px solid #e5e7eb', objectFit: 'contain', background: '#f9fafb' } as any}
              />
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' } as any}>
                  {title || '💡 Совет дня'}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' } as any}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: diffColor,
                    background: diffColor + '18', padding: '1px 8px', borderRadius: 6,
                    border: `1.5px solid ${diffColor}40`,
                  } as any}>{diffLabel}</span>
                  <span style={{ fontSize: 12, color: '#6b7280' } as any}>
                    {dialog.module} · {dialog.topic}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 34, height: 34, borderRadius: '50%',
              background: '#f3f4f6', border: 'none', cursor: 'pointer',
              fontSize: 16, color: '#6b7280',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            } as any}>✕</button>
          </div>

          {/* MESSAGES */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px 16px',
            display: 'flex', flexDirection: 'column', gap: 14,
          } as any}>

            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: msg.from === 'right' ? 'row-reverse' : 'row',
                alignItems: 'flex-end', gap: 10,
                animation: 'bubbleIn 0.3s ease-out',
              } as any}>
                <img src={msg.avatar} width={52} height={52}
                  style={{ flexShrink: 0, objectFit: 'contain' } as any}
                  onError={(e: any) => { e.target.style.opacity = '0'; }}
                />
                <div style={{
                  maxWidth: '70%',
                  background: msg.isXP ? '#fff8e1'
                    : msg.isCorrect ? '#f0fdf4'
                    : msg.isWrong ? '#fef2f2'
                    : msg.from === 'right' ? '#dbeafe' : '#f3f4f6',
                  border: msg.isXP ? '2px solid #ffd60a'
                    : msg.isCorrect ? '2px solid #86efac'
                    : msg.isWrong ? '2px solid #fca5a5'
                    : msg.from === 'right' ? '2px solid #bfdbfe' : '2px solid #e5e7eb',
                  borderRadius: msg.from === 'right' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '12px 14px',
                } as any}>
                  <div style={{
                    fontSize: msg.isXP ? 18 : 14,
                    fontWeight: msg.isXP ? 900 : 600,
                    lineHeight: 1.5,
                    color: msg.isXP ? '#f59e0b'
                      : msg.isCorrect ? '#166534'
                      : msg.isWrong ? '#991b1b'
                      : msg.from === 'right' ? '#1e40af' : '#111827',
                  } as any}>{msg.text}</div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 } as any}>
                <img src={typingAvatar} width={52} height={52}
                  style={{ flexShrink: 0, objectFit: 'contain' } as any}
                />
                <div style={{
                  background: '#f3f4f6', border: '2px solid #e5e7eb',
                  borderRadius: '18px 18px 18px 4px', padding: '14px 18px',
                  display: 'flex', gap: 5, alignItems: 'center',
                } as any}>
                  {[0,1,2].map(j => (
                    <div key={j} style={{
                      width: 9, height: 9, borderRadius: '50%', background: '#9ca3af',
                      animation: `typingBounce 1.2s ease-in-out ${j * 0.2}s infinite`,
                    } as any} />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* OPTIONS / DONE BUTTON */}
          {options && (
            <div style={{
              padding: '12px 16px 20px', borderTop: '2px solid #f0f0f0',
              display: 'flex', flexDirection: 'column', gap: 8,
            } as any}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#9ca3af',
                textTransform: 'uppercase', letterSpacing: 0.5,
              } as any}>Выбери ответ:</div>
              {options.map((opt, i) => (
                <button key={i} onClick={() => handleOptionClick(opt.index)} style={{
                  padding: '12px 16px',
                  background: '#fff', border: '2px solid #e5e7eb',
                  borderRadius: 14, fontSize: 14, fontWeight: 700, color: '#111827',
                  cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 0 #e5e7eb', transition: 'all 0.15s',
                } as any}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.borderColor = '#58cc02';
                    e.currentTarget.style.background = '#f0fdf4';
                    e.currentTarget.style.color = '#166534';
                    e.currentTarget.style.boxShadow = '0 2px 0 #58cc02';
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.color = '#111827';
                    e.currentTarget.style.boxShadow = '0 2px 0 #e5e7eb';
                  }}
                >
                  <span style={{ marginRight: 8, fontSize: 15 } as any}>
                    {['🅐','🅑','🅒','🅓'][i]}
                  </span>
                  {opt.text}
                </button>
              ))}
            </div>
          )}

          {finished && (
            <div style={{
              padding: '12px 16px 20px', borderTop: '2px solid #f0f0f0',
              display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center',
            } as any}>
              <div style={{
                display: 'flex', gap: 16, justifyContent: 'center',
                fontSize: 13, color: '#6b7280', fontWeight: 600,
              } as any}>
                <span>📊 {completedLessons.length + 1}/39</span>
                <span>⭐ {totalXP + xpEarned} XP</span>
                {streak > 0 && <span>🔥 {streak} дн.</span>}
              </div>
              <button onClick={handleDone} style={{
                width: '100%', padding: '14px',
                background: '#58cc02', border: '2px solid #46a302',
                borderRadius: 14, fontSize: 16, fontWeight: 800, color: '#fff',
                cursor: 'pointer', boxShadow: '0 4px 0 #46a302',
                transition: 'all 0.15s',
              } as any}
                onMouseEnter={(e: any) => { e.currentTarget.style.background = '#46a302'; }}
                onMouseLeave={(e: any) => { e.currentTarget.style.background = '#58cc02'; }}
              >
                Продолжить →
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-7px); opacity: 1; }
        }
        @keyframes bubbleIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Modal>
  );
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
