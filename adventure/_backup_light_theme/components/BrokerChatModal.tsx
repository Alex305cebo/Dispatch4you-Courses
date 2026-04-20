import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

interface Props {
  brokerName: string;
  truckId?: string;
  loadInfo?: { fromCity: string; toCity: string; agreedRate: number; commodity?: string };
  onClose: () => void;
}

interface Message {
  from: 'broker' | 'dispatcher';
  text: string;
  time: string;
}

const QUICK_MESSAGES = [
  'Load status update?',
  'ETA to delivery?',
  'Driver is running late',
  'Detention starting — 2h wait',
  'POD sent, please confirm',
  'Rate Con received ✓',
  'Any issues at shipper?',
  'Need lumper receipt',
];

const BROKER_AUTO_REPLIES: Record<string, string[]> = {
  'Load status': ['Driver is on schedule, ETA looks good.', 'Tracking shows on time. Any issues?', 'Shipper confirmed load is ready.'],
  'ETA': ['Thanks for the update. Receiver is expecting on time.', 'Got it. Let me know if anything changes.', 'Receiver confirmed — they\'ll be ready.'],
  'late': ['How late are we talking? I\'ll notify the receiver.', 'Copy. I\'ll update the receiver now. Keep me posted.', 'Understood. Receiver has a 2hr window, should be fine.'],
  'Detention': ['Copy. After 2 hours I\'ll start the detention clock. Send timestamps.', 'Got it. Send me BOL with arrival time for detention claim.', 'Noted. $50/hr after free time. Document everything.'],
  'POD': ['POD received, thank you! Invoice processing in 30 days.', 'Got the POD. Payment will be processed this week.', 'POD looks good. I\'ll send remittance advice shortly.'],
  'Rate Con': ['Great, everything is confirmed on our end.', 'Perfect. Driver is all set to proceed.', 'Confirmed. Let me know when loaded.'],
  'issues': ['Nothing on our end. Shipper should be ready.', 'Let me check with the shipper and call you back.', 'No issues reported. Should be smooth.'],
  'lumper': ['Lumper receipt approved up to $150. Send invoice.', 'I\'ll need the receipt for reimbursement. Scan and email.', 'Lumper is covered. Keep the receipt for billing.'],
};

function getBrokerReply(msg: string): string {
  for (const [key, replies] of Object.entries(BROKER_AUTO_REPLIES)) {
    if (msg.toLowerCase().includes(key.toLowerCase())) {
      return replies[Math.floor(Math.random() * replies.length)];
    }
  }
  const fallback = [
    'Copy that, I\'ll look into it.',
    'Got it. I\'ll follow up shortly.',
    'Thanks for the update.',
    'Understood. Keep me posted.',
    'On it. Will get back to you.',
  ];
  return fallback[Math.floor(Math.random() * fallback.length)];
}

function getTime() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
}

export default function BrokerChatModal({ brokerName, truckId, loadInfo, onClose }: Props) {
  const { addNotification } = useGameStore();
  const [messages, setMessages] = useState<Message[]>([
    { from: 'broker', text: `Hey! ${brokerName} here. What's up?`, time: getTime() },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const qRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  // Скролл мышкой по горизонтали для строк подсказок
  useEffect(() => {
    const el = qRef.current;
    if (!el) return;
    // Mouse drag
    let isDown = false, startX = 0, scrollStart = 0;
    const onMouseDown = (e: MouseEvent) => { isDown = true; startX = e.pageX; scrollStart = el.scrollLeft; el.style.cursor = 'grabbing'; };
    const onMouseMove = (e: MouseEvent) => { if (!isDown) return; e.preventDefault(); el.scrollLeft = scrollStart - (e.pageX - startX); };
    const onMouseUp = () => { isDown = false; el.style.cursor = 'grab'; };
    // Wheel
    const onWheel = (e: WheelEvent) => { e.preventDefault(); el.scrollLeft += (e.deltaY || e.deltaX) * 1.5; };
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mouseleave', onMouseUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mouseleave', onMouseUp);
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const msg: Message = { from: 'dispatcher', text: text.trim(), time: getTime() };
    setMessages(prev => [...prev, msg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = getBrokerReply(text);
      setMessages(prev => [...prev, { from: 'broker', text: reply, time: getTime() }]);
      addNotification({
        type: 'text', priority: 'low', from: brokerName,
        subject: `💬 SMS от ${brokerName}`,
        message: reply,
        actionRequired: false,
        relatedTruckId: truckId,
      });
    }, 900 + Math.random() * 1000);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
      } as any} />

      <div style={{
        position: 'relative', width: '92%', maxWidth: 400,
        background: '#ffffff',
        border: '1px solid rgba(251,146,60,0.3)',
        borderRadius: 22, overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column', maxHeight: '88vh', minHeight: 480,
      }}>

        {/* Header */}
        <div style={{
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
          background: 'linear-gradient(180deg, rgba(251,146,60,0.1), transparent)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 21, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(251,146,60,0.3), rgba(251,146,60,0.1))',
            border: '2px solid rgba(251,146,60,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>💼</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#111827' }}>{brokerName}</div>
            <div style={{ fontSize: 11, color: '#fb923c', fontWeight: 600 }}>Broker · Online</div>
            {loadInfo && (
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                📦 {loadInfo.fromCity} → {loadInfo.toCity} · ${loadInfo.agreedRate.toLocaleString()}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 10, width: 32, height: 32, cursor: 'pointer',
            color: '#6b7280', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{
          flex: 1, overflowY: 'auto', padding: '12px 14px',
          display: 'flex', flexDirection: 'column', gap: 8,
          scrollbarWidth: 'none',
        } as any}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: m.from === 'dispatcher' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '78%', padding: '8px 12px', borderRadius: 14,
                borderBottomRightRadius: m.from === 'dispatcher' ? 4 : 14,
                borderBottomLeftRadius: m.from === 'broker' ? 4 : 14,
                background: m.from === 'dispatcher'
                  ? 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(6,182,212,0.15))'
                  : '#f3f4f6',
                border: `1px solid ${m.from === 'dispatcher' ? 'rgba(6,182,212,0.35)' : 'rgba(0,0,0,0.06)'}`,
              }}>
                <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.45 }}>{m.text}</div>
                <div style={{ fontSize: 9, color: '#6b7280', marginTop: 3, textAlign: m.from === 'dispatcher' ? 'right' : 'left' }}>{m.time}</div>
              </div>
            </div>
          ))}
          {typing && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '8px 14px', borderRadius: 14, borderBottomLeftRadius: 4,
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                fontSize: 16, letterSpacing: 2, color: '#94a3b8',
              }}>···</div>
            </div>
          )}
        </div>

        {/* Quick messages — единая строка со скроллом */}
        <style>{`
          .qstrip { display:flex; overflow-x:auto; gap:6px; scrollbar-width:none; padding:0 4px; cursor:grab; user-select:none; }
          .qstrip:active { cursor:grabbing; }
          .qstrip::-webkit-scrollbar { display:none; }
        `}</style>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '6px 0 8px' } as any}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 8, paddingRight: 8 } as any}>
            {/* Стрелка влево */}
            <button onClick={() => qRef.current?.scrollBy({ left: -140, behavior: 'smooth' })} style={{
              flexShrink: 0, width: 26, height: 26, borderRadius: 8,
              background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.25)',
              color: '#fb923c', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            } as any}>‹</button>
            {/* Скролл-полоса */}
            <div ref={qRef} className="qstrip" style={{ flex: 1 } as any}>
              {QUICK_MESSAGES.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} style={{
                  flexShrink: 0, padding: '6px 12px', borderRadius: 20, cursor: 'pointer',
                  background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.25)',
                  color: '#fb923c', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                }}>{q}</button>
              ))}
            </div>
            {/* Стрелка вправо */}
            <button onClick={() => qRef.current?.scrollBy({ left: 140, behavior: 'smooth' })} style={{
              flexShrink: 0, width: 26, height: 26, borderRadius: 8,
              background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.25)',
              color: '#fb923c', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            } as any}>›</button>
          </div>
        </div>

        {/* Input */}
        <div style={{
          padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          background: 'rgba(0,0,0,0.05)',
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Type a message..."
            style={{
              flex: 1, background: '#f9fafb',
              border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12,
              padding: '9px 14px', color: '#111827', fontSize: 13, outline: 'none',
            } as any}
          />
          <button onClick={() => sendMessage(input)} style={{
            width: 40, height: 40, borderRadius: 12, cursor: 'pointer', flexShrink: 0,
            background: input.trim()
              ? 'linear-gradient(135deg, #fb923c, #f97316)'
              : 'rgba(255,255,255,0.06)',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            transition: 'all 0.15s',
          }}>➤</button>
        </div>
      </div>
    </div>
  );
}
