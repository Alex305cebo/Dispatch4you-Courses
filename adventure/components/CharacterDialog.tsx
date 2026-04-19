import { useState, useEffect, useRef } from 'react';
import { Modal } from 'react-native';
import { useChatStore } from '../store/chatStore';
import { useAccountStore } from '../store/accountStore';

export interface DialogStep {
  from: 'character' | 'player';
  text: string;
  options?: { text: string; next?: number }[];
}

interface CharacterDialogProps {
  visible: boolean;
  character: { name: string; role: string; avatar: string; key?: string };
  steps: DialogStep[];
  onClose: () => void;
  onComplete?: () => void;
  onBack?: () => void; // возврат к пикеру персонажей
}

const PLAYER_AVATAR = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Man%20Technologist%20Medium%20Skin%20Tone.png';

export default function CharacterDialog({ visible, character, steps, onClose, onComplete, onBack }: CharacterDialogProps) {
  const { addMessage, getThread, loadFromProfile, saveToProfile } = useChatStore();
  const { currentNickname } = useAccountStore();

  // live — сообщения текущей сессии диалога
  const [live, setLive] = useState<{ from: 'character' | 'player'; text: string }[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [waitingChoice, setWaitingChoice] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const charKey = character.key || character.name;

  // Загружаем историю при открытии
  useEffect(() => {
    if (!visible) {
      setLive([]);
      setCurrentStep(0);
      setTyping(false);
      setWaitingChoice(false);
      return;
    }
    if (currentNickname) loadFromProfile(currentNickname);
    processStep(0, []);
  }, [visible]);

  // Сохраняем при каждом новом сообщении
  function saveMsg(from: 'character' | 'player', text: string) {
    addMessage(charKey, character.name, character.avatar, { from, text, timestamp: Date.now() });
    if (currentNickname) {
      setTimeout(() => saveToProfile(currentNickname), 100);
    }
  }

  function processStep(stepIdx: number, hist: typeof live) {
    if (stepIdx >= steps.length) {
      setTimeout(() => { onComplete?.(); onClose(); }, 800);
      return;
    }
    const step = steps[stepIdx];
    if (step.from === 'character') {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        const newLive = [...hist, { from: 'character' as const, text: step.text }];
        setLive(newLive);
        saveMsg('character', step.text);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        const next = stepIdx + 1;
        if (next < steps.length && steps[next].from === 'player') {
          setCurrentStep(next);
          setWaitingChoice(true);
        } else {
          setCurrentStep(next);
          setTimeout(() => processStep(next, newLive), 600);
        }
      }, 1200);
    }
  }

  function handleChoice(optionText: string) {
    if (!waitingChoice) return;
    setWaitingChoice(false);
    const newLive = [...live, { from: 'player' as const, text: optionText }];
    setLive(newLive);
    saveMsg('player', optionText);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    const next = currentStep + 1;
    setCurrentStep(next);
    setTimeout(() => processStep(next, newLive), 400);
  }

  if (!visible) return null;

  const currentOptions = waitingChoice && steps[currentStep]?.options ? steps[currentStep].options! : null;
  const history = getThread(charKey);
  // Показываем историю + текущие live сообщения (без дублей)
  const historyMsgs = showHistory ? (history?.messages || []) : [];
  const liveIds = new Set(live.map(m => m.text));
  const filteredHistory = historyMsgs.filter(m => !liveIds.has(m.text));

  return (
    <Modal visible={visible} transparent animationType="slide">
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end',
        zIndex: 9999,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      } as any}>

        {/* Верхняя часть — карта видна */}
        <div style={{ flex: 1, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(1px)' } as any} onClick={onClose} />

        {/* Drawer 70% */}
        <div style={{
          height: '70vh', background: '#fff',
          borderRadius: '24px 24px 0 0', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
        } as any}>

          {/* HEADER */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', borderBottom: '2px solid #f0f0f0',
            position: 'relative',
          } as any}>
            <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 40, height: 4, borderRadius: 2, background: '#d1d5db' } as any} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 } as any}>
              {/* Кнопка назад */}
              {onBack && (
                <button onClick={onBack} style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: '#f3f4f6', border: 'none', cursor: 'pointer',
                  fontSize: 18, color: '#374151', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700,
                } as any}>←</button>
              )}
              <img src={character.avatar} width={42} height={42}
                style={{ borderRadius: '50%', border: '2px solid #e5e7eb', objectFit: 'contain', background: '#f9fafb' } as any}
                onError={(e: any) => { e.target.style.display = 'none'; }}
              />
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' } as any}>{character.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' } as any}>{character.role}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' } as any}>
              {/* Кнопка истории */}
              {history && history.messages.length > 0 && (
                <button onClick={() => setShowHistory(h => !h)} style={{
                  padding: '5px 10px', borderRadius: 10,
                  background: showHistory ? '#dbeafe' : '#f3f4f6',
                  border: showHistory ? '1.5px solid #93c5fd' : '1.5px solid #e5e7eb',
                  fontSize: 12, fontWeight: 700,
                  color: showHistory ? '#1e40af' : '#6b7280',
                  cursor: 'pointer',
                } as any}>
                  {showHistory ? '📖 История' : `📖 ${history.messages.length}`}
                </button>
              )}
              <button onClick={onClose} style={{
                width: 34, height: 34, borderRadius: '50%',
                background: '#f3f4f6', border: 'none', cursor: 'pointer',
                fontSize: 16, color: '#6b7280',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              } as any}>✕</button>
            </div>
          </div>

          {/* MESSAGES */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '16px 16px',
            display: 'flex', flexDirection: 'column', gap: 14,
          } as any}>

            {/* История (если включена) */}
            {showHistory && filteredHistory.length > 0 && (
              <>
                <div style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', fontWeight: 600 } as any}>
                  — История переписки —
                </div>
                {filteredHistory.map((msg, i) => (
                  <MessageBubble key={`h-${i}`} msg={msg} characterAvatar={character.avatar} opacity={0.6} />
                ))}
                <div style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', fontWeight: 600 } as any}>
                  — Сейчас —
                </div>
              </>
            )}

            {/* Текущий диалог */}
            {live.map((msg, i) => (
              <MessageBubble key={`l-${i}`} msg={msg} characterAvatar={character.avatar} />
            ))}

            {/* Typing */}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 } as any}>
                <img src={character.avatar} width={52} height={52}
                  style={{ flexShrink: 0, objectFit: 'contain' } as any}
                  onError={(e: any) => { e.target.style.opacity = '0'; }}
                />
                <div style={{
                  background: '#f3f4f6', border: '2px solid #e5e7eb',
                  borderRadius: '18px 18px 18px 4px', padding: '14px 18px',
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
              padding: '12px 16px 20px',
              borderTop: '2px solid #f0f0f0',
              display: 'flex', flexDirection: 'column', gap: 8,
            } as any}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 } as any}>
                Выбери ответ:
              </div>
              {currentOptions.map((opt, i) => (
                <button key={i} onClick={() => handleChoice(opt.text)} style={{
                  padding: '12px 16px',
                  background: '#fff', border: '2px solid #e5e7eb',
                  borderRadius: 14, fontSize: 14, fontWeight: 700, color: '#111827',
                  cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 0 #e5e7eb', transition: 'all 0.15s',
                } as any}
                  onMouseEnter={(e: any) => { e.currentTarget.style.borderColor = '#58cc02'; e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#166534'; e.currentTarget.style.boxShadow = '0 2px 0 #58cc02'; }}
                  onMouseLeave={(e: any) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#111827'; e.currentTarget.style.boxShadow = '0 2px 0 #e5e7eb'; }}
                >
                  <span style={{ marginRight: 8, fontSize: 15 } as any}>{['🅐','🅑','🅒','🅓'][i]}</span>
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

function MessageBubble({ msg, characterAvatar, opacity = 1 }: {
  msg: { from: 'character' | 'player'; text: string };
  characterAvatar: string;
  opacity?: number;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: msg.from === 'player' ? 'row-reverse' : 'row',
      alignItems: 'flex-end', gap: 10,
      opacity,
    } as any}>
      <img
        src={msg.from === 'character' ? characterAvatar : 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Man%20Technologist%20Medium%20Skin%20Tone.png'}
        width={52} height={52}
        style={{ flexShrink: 0, objectFit: 'contain' } as any}
        onError={(e: any) => { e.target.style.opacity = '0'; }}
      />
      <div style={{
        maxWidth: '68%',
        background: msg.from === 'player' ? '#dbeafe' : '#f3f4f6',
        border: msg.from === 'player' ? '2px solid #bfdbfe' : '2px solid #e5e7eb',
        borderRadius: msg.from === 'player' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '12px 14px',
      } as any}>
        <div style={{
          fontSize: 14, fontWeight: 600, lineHeight: 1.5,
          color: msg.from === 'player' ? '#1e40af' : '#111827',
        } as any}>{msg.text}</div>
      </div>
    </div>
  );
}
