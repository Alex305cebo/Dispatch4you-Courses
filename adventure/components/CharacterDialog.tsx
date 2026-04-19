import { useState, useEffect, useRef } from 'react';
import { Modal } from 'react-native';

export interface DialogStep {
  from: 'character' | 'player';
  text: string;
  // Если from === 'player' — это варианты ответов для выбора
  options?: { text: string; next?: number }[];
}

interface CharacterDialogProps {
  visible: boolean;
  character: { name: string; role: string; avatar: string };
  steps: DialogStep[];
  onClose: () => void;
  onComplete?: () => void;
}

const PLAYER_AVATAR = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Man%20Technologist%20Medium%20Skin%20Tone.png';

export default function CharacterDialog({ visible, character, steps, onClose, onComplete }: CharacterDialogProps) {
  // history — список уже показанных сообщений {from, text}
  const [history, setHistory] = useState<{ from: 'character' | 'player'; text: string }[]>([]);
  // currentStep — индекс текущего шага
  const [currentStep, setCurrentStep] = useState(0);
  // typing — показываем ли анимацию печатания
  const [typing, setTyping] = useState(false);
  // waitingChoice — ждём выбора игрока
  const [waitingChoice, setWaitingChoice] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) {
      setHistory([]);
      setCurrentStep(0);
      setTyping(false);
      setWaitingChoice(false);
      return;
    }
    processStep(0, []);
  }, [visible]);

  function processStep(stepIdx: number, hist: typeof history) {
    if (stepIdx >= steps.length) {
      // Диалог завершён
      setTimeout(() => { onComplete?.(); onClose(); }, 800);
      return;
    }
    const step = steps[stepIdx];

    if (step.from === 'character') {
      // Показываем анимацию печатания, потом добавляем сообщение
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        const newHist = [...hist, { from: 'character' as const, text: step.text }];
        setHistory(newHist);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

        // Следующий шаг — если это выбор игрока, ждём; иначе продолжаем
        const next = stepIdx + 1;
        if (next < steps.length && steps[next].from === 'player') {
          setCurrentStep(next);
          setWaitingChoice(true);
        } else {
          setCurrentStep(next);
          setTimeout(() => processStep(next, newHist), 600);
        }
      }, 1200);
    }
  }

  function handleChoice(optionText: string) {
    if (!waitingChoice) return;
    setWaitingChoice(false);

    const newHist = [...history, { from: 'player' as const, text: optionText }];
    setHistory(newHist);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    // Следующий шаг после выбора
    const next = currentStep + 1;
    setCurrentStep(next);
    setTimeout(() => processStep(next, newHist), 400);
  }

  if (!visible) return null;

  const currentOptions = waitingChoice && steps[currentStep]?.options
    ? steps[currentStep].options!
    : null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end',
        zIndex: 9999,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      } as any}>

        {/* Верхняя часть — полупрозрачная, карта видна */}
        <div style={{
          flex: 1,
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(1px)',
        } as any} onClick={onClose} />

        {/* Нижний drawer — 70% высоты */}
        <div style={{
          height: '70vh',
          background: '#fff',
          borderRadius: '24px 24px 0 0',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
        } as any}>

          {/* HEADER */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '2px solid #f0f0f0',
          } as any}>
            {/* Drag handle */}
            <div style={{
              position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
              width: 40, height: 4, borderRadius: 2, background: '#d1d5db',
            } as any} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 } as any}>
              <img src={character.avatar} width={42} height={42}
                style={{ borderRadius: '50%', border: '2px solid #e5e7eb', objectFit: 'contain', background: '#f9fafb' } as any}
                onError={(e: any) => { e.target.style.display = 'none'; }}
              />
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' } as any}>{character.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' } as any}>{character.role}</div>
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
            flex: 1, overflowY: 'auto',
            padding: '20px 16px',
            display: 'flex', flexDirection: 'column', gap: 16,
          } as any}>
            {history.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: msg.from === 'player' ? 'row-reverse' : 'row',
                alignItems: 'flex-end', gap: 10,
              } as any}>
                <img
                  src={msg.from === 'character' ? character.avatar : PLAYER_AVATAR}
                  width={56} height={56}
                  style={{ flexShrink: 0, objectFit: 'contain' } as any}
                  onError={(e: any) => { e.target.style.opacity = '0'; }}
                />
                <div style={{
                  maxWidth: '68%',
                  background: msg.from === 'player' ? '#dbeafe' : '#f3f4f6',
                  border: msg.from === 'player' ? '2px solid #bfdbfe' : '2px solid #e5e7eb',
                  borderRadius: msg.from === 'player' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '12px 16px',
                } as any}>
                  <div style={{
                    fontSize: 15, fontWeight: 600, lineHeight: 1.5,
                    color: msg.from === 'player' ? '#1e40af' : '#111827',
                  } as any}>{msg.text}</div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 } as any}>
                <img src={character.avatar} width={56} height={56}
                  style={{ flexShrink: 0, objectFit: 'contain' } as any}
                  onError={(e: any) => { e.target.style.opacity = '0'; }}
                />
                <div style={{
                  background: '#f3f4f6', border: '2px solid #e5e7eb',
                  borderRadius: '18px 18px 18px 4px',
                  padding: '16px 20px',
                  display: 'flex', gap: 5, alignItems: 'center',
                } as any}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: 9, height: 9, borderRadius: '50%', background: '#9ca3af',
                      animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    } as any} />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* CHOICES */}
          {currentOptions && (
            <div style={{
              padding: '14px 16px 18px',
              borderTop: '2px solid #f0f0f0',
              display: 'flex', flexDirection: 'column', gap: 10,
            } as any}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 } as any}>
                Выбери ответ:
              </div>
              {currentOptions.map((opt, i) => (
                <button key={i} onClick={() => handleChoice(opt.text)} style={{
                  padding: '14px 18px',
                  background: '#fff',
                  border: '2px solid #e5e7eb',
                  borderRadius: 14,
                  fontSize: 15, fontWeight: 700, color: '#111827',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s',
                  boxShadow: '0 2px 0 #e5e7eb',
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
                  <span style={{ marginRight: 10, fontSize: 16 } as any}>{['🅐','🅑','🅒','🅓'][i]}</span>
                  {opt.text}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-7px); opacity: 1; }
        }
      `}</style>
    </Modal>
  );
}
