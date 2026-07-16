/**
 * LESSON POPUP — единая система обучения.
 * Объединяет бывшие DuolingoQuizDialog + DailyQuizPopup + MentorTipCard
 * в один красивый ЦЕНТРИРОВАННЫЙ pop-up с анимированными аватарами.
 *
 * Открывается из любого контекста: модуль Academy, ежедневный заход,
 * контекстная подсказка по событию в игре. Везы — один и тот же UI.
 */
import { useState, useEffect, useRef } from 'react';
import { Modal } from 'react-native';
import { useLessonStore } from '../store/lessonStore';
import { getDialogById } from '../data/duolingoDialogs';
import type { DuolingoDialog } from '../data/duolingoDialogs';

interface Props {
  lessonId: string;
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
  /** Подпись контекста в хедере: "Совет дня", "Мини-урок", "Урок" и т.п. */
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
  isCorrect?: boolean;
  isWrong?: boolean;
  isXP?: boolean;
  isQuestion?: boolean;
};

export default function LessonPopup({ lessonId, visible, onClose, onComplete, title }: Props) {
  const { completeLesson, completedLessons, totalXP, streak } = useLessonStore();

  const [messages, setMessages] = useState<BubbleMsg[]>([]);
  const [typing, setTyping] = useState(false);
  const [typingAvatar, setTypingAvatar] = useState('');
  const [options, setOptions] = useState<{ text: string; index: number }[] | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 по шагам урока
  const [finished, setFinished] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const processedRef = useRef(false);
  const resolveAnswerRef = useRef<((idx: number) => void) | null>(null);

  const dialog = getDialogById(lessonId);

  useEffect(() => {
    if (!visible || !dialog) {
      setMessages([]); setOptions(null); setXpEarned(0);
      setProgress(0); setFinished(false);
      processedRef.current = false;
      return;
    }
    if (processedRef.current) return;
    processedRef.current = true;
    runDialog(dialog);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, lessonId]);

  function scroll() {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }
  const getChar = (c: string) => AVATARS[c] || AVATARS.mentor;

  async function runDialog(d: DuolingoDialog) {
    const steps = d.dialogs;
    let msgs: BubbleMsg[] = [];
    let earned = 0;

    for (let i = 0; i < steps.length; i++) {
      setProgress((i) / steps.length);
      const step = steps[i];
      const char = getChar(step.character);
      const isPlayer = step.character === 'player';

      setTypingAvatar(char.img);
      setTyping(true);
      await wait(800 + Math.random() * 400);
      setTyping(false);

      msgs = [...msgs, { from: isPlayer ? 'right' : 'left', text: step.text, avatar: char.img, name: char.name }];
      setMessages([...msgs]);
      scroll();

      if (step.question) {
        const q = step.question;
        // Показываем сам вопрос отдельным пузырём (раньше его не было видно — игрок отвечал вслепую)
        await wait(450);
        setTypingAvatar(AVATARS.mentor.img);
        setTyping(true);
        await wait(700);
        setTyping(false);
        msgs = [...msgs, { from: 'left', text: `❓ ${q.text}`, avatar: AVATARS.mentor.img, name: 'Майк', isQuestion: true }];
        setMessages([...msgs]);
        scroll();
        await wait(300);
        setOptions(q.options.map((o, idx) => ({ text: o.text, index: idx })));
        scroll();

        const answerIdx = await waitForAnswer();
        setOptions(null);

        const correct = answerIdx === q.correctAnswer;
        const xp = correct ? d.xp : Math.round(d.xp * 0.3);
        earned = xp;
        setXpEarned(xp);

        msgs = [...msgs, {
          from: 'right', text: q.options[answerIdx].text,
          avatar: AVATARS.player.img, name: 'Ты',
          isCorrect: correct, isWrong: !correct,
        }];
        setMessages([...msgs]); scroll();
        await wait(550);

        msgs = [...msgs, {
          from: 'left',
          text: correct
            ? `✅ Верно! ${q.options[q.correctAnswer].feedback || ''}`
            : `❌ Неверно. Правильный ответ: ${q.options[q.correctAnswer].text}`,
          avatar: AVATARS.mentor.img, name: 'Майк',
        }];
        setMessages([...msgs]); scroll();
        await wait(450);

        msgs = [...msgs, { from: 'left', text: `💡 ${q.explanation}`, avatar: AVATARS.mentor.img, name: 'Майк' }];
        setMessages([...msgs]); scroll();
        await wait(350);

        msgs = [...msgs, { from: 'left', text: `+${xp} XP ⭐`, avatar: AVATARS.mentor.img, name: 'Майк', isXP: true }];
        setMessages([...msgs]); scroll();
      }
      await wait(250);
    }

    setProgress(1);
    if (!completedLessons.includes(d.id)) completeLesson(d.id, earned || d.xp);
    setFinished(true);
    scroll();
  }

  function waitForAnswer(): Promise<number> {
    return new Promise(resolve => { resolveAnswerRef.current = resolve; });
  }
  function handleOptionClick(idx: number) {
    if (resolveAnswerRef.current) { resolveAnswerRef.current(idx); resolveAnswerRef.current = null; }
  }

  if (!visible || !dialog) return null;

  const diffColor = dialog.difficulty === 'beginner' ? '#58cc02'
    : dialog.difficulty === 'intermediate' ? '#ffc800' : '#ff4b4b';
  const diffLabel = dialog.difficulty === 'beginner' ? 'Новичок'
    : dialog.difficulty === 'intermediate' ? 'Средний' : 'Эксперт';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: 16, zIndex: 9999,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      } as any}>

        {/* Backdrop */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(2,5,16,0.66)', backdropFilter: 'blur(4px)',
        } as any} onClick={onClose} />

        {/* CENTERED CARD */}
        <div style={{
          position: 'relative', width: '100%', maxWidth: 460,
          maxHeight: '86vh', background: '#fff', borderRadius: 24,
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          animation: 'lessonIn 0.32s cubic-bezier(0.34,1.56,0.64,1)',
        } as any}>

          {/* HEADER + progress */}
          <div style={{ padding: '14px 18px 12px', borderBottom: '2px solid #f0f0f0' } as any}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as any}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 } as any}>
                <img src={AVATARS.mentor.img} width={44} height={44}
                  style={{ borderRadius: '50%', border: '2px solid #e5e7eb', objectFit: 'contain', background: '#f9fafb', animation: 'avatarPulse 2.4s ease-in-out infinite' } as any} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' } as any}>{title || '🎓 Урок'}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 } as any}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: diffColor, background: diffColor + '18', padding: '1px 8px', borderRadius: 6, border: `1.5px solid ${diffColor}40` } as any}>{diffLabel}</span>
                    <span style={{ fontSize: 12, color: '#6b7280' } as any}>{dialog.module} · {dialog.topic}</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } as any}>✕</button>
            </div>
            {/* Progress bar */}
            <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, marginTop: 12, overflow: 'hidden' } as any}>
              <div style={{ height: '100%', width: `${Math.round(progress * 100)}%`, background: 'linear-gradient(90deg,#58cc02,#46a302)', borderRadius: 4, transition: 'width 0.5s ease' } as any} />
            </div>
          </div>

          {/* MESSAGES */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 220 } as any}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: msg.from === 'right' ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 10, animation: 'bubbleIn 0.3s ease-out' } as any}>
                <img src={msg.avatar} width={50} height={50} style={{ flexShrink: 0, objectFit: 'contain' } as any} onError={(e: any) => { e.target.style.opacity = '0'; }} />
                <div style={{
                  maxWidth: '72%',
                  background: msg.isQuestion ? '#eef2ff' : msg.isXP ? '#fff8e1' : msg.isCorrect ? '#f0fdf4' : msg.isWrong ? '#fef2f2' : msg.from === 'right' ? '#dbeafe' : '#f3f4f6',
                  border: msg.isQuestion ? '2px solid #c7d2fe' : msg.isXP ? '2px solid #ffd60a' : msg.isCorrect ? '2px solid #86efac' : msg.isWrong ? '2px solid #fca5a5' : msg.from === 'right' ? '2px solid #bfdbfe' : '2px solid #e5e7eb',
                  borderRadius: msg.from === 'right' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '12px 14px',
                } as any}>
                  <div style={{ fontSize: msg.isXP ? 18 : msg.isQuestion ? 15 : 14, fontWeight: msg.isXP ? 900 : msg.isQuestion ? 800 : 600, lineHeight: 1.5, color: msg.isXP ? '#f59e0b' : msg.isQuestion ? '#3730a3' : msg.isCorrect ? '#166534' : msg.isWrong ? '#991b1b' : msg.from === 'right' ? '#1e40af' : '#111827' } as any}>{msg.text}</div>
                </div>
              </div>
            ))}

            {typing && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 } as any}>
                <img src={typingAvatar} width={50} height={50} style={{ flexShrink: 0, objectFit: 'contain' } as any} />
                <div style={{ background: '#f3f4f6', border: '2px solid #e5e7eb', borderRadius: '18px 18px 18px 4px', padding: '14px 18px', display: 'flex', gap: 5, alignItems: 'center' } as any}>
                  {[0,1,2].map(j => (
                    <div key={j} style={{ width: 9, height: 9, borderRadius: '50%', background: '#9ca3af', animation: `typingBounce 1.2s ease-in-out ${j * 0.2}s infinite` } as any} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* OPTIONS */}
          {options && (
            <div style={{ padding: '12px 16px 18px', borderTop: '2px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 8 } as any}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 } as any}>Выбери ответ:</div>
              {options.map((opt, i) => (
                <button key={i} onClick={() => handleOptionClick(opt.index)} style={{ padding: '12px 16px', background: '#fff', border: '2px solid #e5e7eb', borderRadius: 14, fontSize: 14, fontWeight: 700, color: '#111827', cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 0 #e5e7eb', transition: 'all 0.15s' } as any}
                  onMouseEnter={(e: any) => { e.currentTarget.style.borderColor = '#58cc02'; e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#166534'; e.currentTarget.style.boxShadow = '0 2px 0 #58cc02'; }}
                  onMouseLeave={(e: any) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#111827'; e.currentTarget.style.boxShadow = '0 2px 0 #e5e7eb'; }}>
                  <span style={{ marginRight: 8, fontSize: 15 } as any}>{['🅐','🅑','🅒','🅓'][i]}</span>{opt.text}
                </button>
              ))}
            </div>
          )}

          {finished && (
            <div style={{ padding: '12px 16px 18px', borderTop: '2px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' } as any}>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: 13, color: '#6b7280', fontWeight: 600 } as any}>
                <span>📊 {completedLessons.length + 1}/39</span>
                <span>⭐ {totalXP + xpEarned} XP</span>
                {streak > 0 && <span>🔥 {streak} дн.</span>}
              </div>
              <button onClick={onComplete} style={{ width: '100%', padding: '14px', background: '#58cc02', border: '2px solid #46a302', borderRadius: 14, fontSize: 16, fontWeight: 800, color: '#fff', cursor: 'pointer', boxShadow: '0 4px 0 #46a302', transition: 'all 0.15s' } as any}
                onMouseEnter={(e: any) => { e.currentTarget.style.background = '#46a302'; }}
                onMouseLeave={(e: any) => { e.currentTarget.style.background = '#58cc02'; }}>
                Продолжить →
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes typingBounce { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-7px);opacity:1} }
        @keyframes bubbleIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lessonIn { from{opacity:0;transform:scale(0.92) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes avatarPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
      `}</style>
    </Modal>
  );
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
