import { useState, useEffect, useRef } from 'react';
import { useGameStore, Truck } from '../store/gameStore';
import { Colors } from '../constants/colors';

interface Props {
  truck: Truck;
  onClose: () => void;
  onCall?: () => void;
}

interface Message {
  from: 'driver' | 'dispatcher';
  text: string;
  time: string;
}

const QUICK_MESSAGES = [
  'Copy that, thanks for the update.',
  'Keep me posted on your ETA.',
  'Take a 30-min break when you can.',
  'Send me a photo of the BOL.',
  'Call me when you arrive.',
  'Check your tire pressure at next stop.',
  'How many hours do you have left?',
  'Is the load secure?',
  // Breakdown specific
  'Call roadside assistance now!',
  'Document everything with photos.',
  'I\'ll notify the broker about the delay.',
  'How long until you\'re back on the road?',
];

const DRIVER_AUTO_REPLIES: Record<string, string[]> = {
  'Copy that': ['10-4 boss!', 'Roger that.', 'Got it, will do.'],
  'ETA': ['About 2 hours out.', 'GPS says 3 hours, but traffic is light.', 'Should be there by 4 PM.'],
  'break': ['Will do, pulling over at next rest area.', 'Good idea, I need fuel anyway.', 'Copy, there\'s a truck stop 10 miles ahead.'],
  'BOL': ['Sending it now... 📸', 'Give me 5 minutes, I\'ll take a photo.', 'Already sent it to the email.'],
  'call': ['Calling you now...', 'Give me 2 minutes, I\'m at a red light.', 'Sure, calling in a sec.'],
  'tire': ['Will check at next stop. Thanks for the heads up.', 'Checked 30 minutes ago, all good.', 'Rear left looks a bit low, I\'ll add air.'],
  'hours': ['I have 6.5 hours left on my clock.', 'About 4 hours driving left. Might need to stop soon.', 'Plenty of hours — 8.5 left.'],
  'secure': ['Load is tight, all straps good.', 'Checked at last stop — everything secure.', 'Yes sir, no shifting.'],
  // Breakdown responses
  'roadside': ['Calling roadside now. They said 30-60 min ETA.', 'Already on hold with roadside. $450 estimate. Approving?', 'Roadside is dispatched, 45 min away.'],
  'Document': ['Taking photos now — truck, location, timestamp. 📸', 'All documented. GPS coords saved, photos taken.', 'Done. Sending you photos for insurance claim.'],
  'broker': ['Texting broker now about the delay.', 'Broker notified. They said to keep them updated.', 'Already messaged them. Waiting for response.'],
  'long': ['Roadside says 1-2 hours for engine repair.', 'Mechanic says 90 min. Tire change is 45 min.', 'Assessing now, will know in 15 min.'],
  'road': ['Back on the road in about 2 hours.', 'Mechanic says 90 min, then I\'m good to go.', 'Should be moving again by 3 PM.'],
};

function getDriverReply(msg: string): string {
  const lower = msg.toLowerCase();
  for (const [key, replies] of Object.entries(DRIVER_AUTO_REPLIES)) {
    if (lower.includes(key.toLowerCase())) {
      return replies[Math.floor(Math.random() * replies.length)];
    }
  }
  const generic = ['Copy that.', '10-4.', 'Got it, boss.', 'Will do.', 'Understood.', 'Roger.'];
  return generic[Math.floor(Math.random() * generic.length)];
}

function formatNow(): string {
  const d = new Date();
  return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function DriverCommunicationModal({ truck, onClose, onCall }: Props) {
  const { notifications, addNotification } = useGameStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dqRef = useRef<HTMLDivElement>(null);

  // Load existing messages from notifications
  useEffect(() => {
    const driverMsgs = notifications
      .filter(n => n.relatedTruckId === truck.id || n.from === truck.driver)
      .slice(-10)
      .map(n => ({
        from: 'driver' as const,
        text: n.message,
        time: `${Math.floor(n.minute / 60) + 8}:${(n.minute % 60).toString().padStart(2, '0')}`,
      }));
    if (driverMsgs.length > 0) {
      setMessages(driverMsgs);
    } else {
      const greeting = truck.status === 'breakdown'
        ? `Boss, I'm broken down on the side of the road near ${truck.currentCity}. Waiting for roadside. What do you need me to do?`
        : truck.status === 'idle'
        ? `Hey boss, ${truck.name} here. I'm empty in ${truck.currentCity}. What's next?`
        : `Hey boss, ${truck.name} here. What do you need?`;
      setMessages([{ from: 'driver', text: greeting, time: formatNow() }]);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  // Скролл мышкой по горизонтали
  useEffect(() => {
    const el = dqRef.current;
    if (!el) return;
    let isDown = false, startX = 0, scrollStart = 0;
    const onMouseDown = (e: MouseEvent) => { isDown = true; startX = e.pageX; scrollStart = el.scrollLeft; el.style.cursor = 'grabbing'; };
    const onMouseMove = (e: MouseEvent) => { if (!isDown) return; e.preventDefault(); el.scrollLeft = scrollStart - (e.pageX - startX); };
    const onMouseUp = () => { isDown = false; el.style.cursor = 'grab'; };
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
    setMessages(prev => [...prev, { from: 'dispatcher', text, time: formatNow() }]);

    // Driver typing...
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = getDriverReply(text);
      setMessages(prev => [...prev, { from: 'driver', text: reply, time: formatNow() }]);

      // Log to notifications
      addNotification({
        type: 'text', priority: 'low', from: truck.driver,
        subject: `💬 SMS от ${truck.driver}`,
        message: reply,
        actionRequired: false, relatedTruckId: truck.id,
      });
    }, 1000 + Math.random() * 2000);
  };

  const statusColor = truck.status === 'loaded' || truck.status === 'driving' ? Colors.success
    : truck.status === 'breakdown' ? Colors.danger
    : truck.status === 'idle' ? '#64748b' : Colors.warning;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      } as any} />

      <div style={{
        position: 'relative', width: '90%', maxWidth: 400, height: '80vh', maxHeight: 600,
        background: 'linear-gradient(170deg, #1a1f2e, #0d1117)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      } as any}>

        {/* Header */}
        <div style={{
          padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 20,
            background: `${statusColor}15`, border: `2px solid ${statusColor}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🚛</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{truck.driver}</div>
            <div style={{ fontSize: 11, color: statusColor, fontWeight: 600 }}>
              {truck.name} · {truck.currentCity}
              {truck.status === 'breakdown' && <span style={{ marginLeft: 6, color: '#ef4444', fontWeight: 800 }}>🚨 ПОЛОМКА</span>}
            </div>
          </div>
          {onCall && (
            <button onClick={() => { onClose(); onCall(); }} style={{
              width: 36, height: 36, borderRadius: 18, cursor: 'pointer',
              background: 'rgba(48,209,88,0.15)', border: '1px solid rgba(48,209,88,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: Colors.success,
            }}>📞</button>
          )}
          <span onClick={onClose} style={{
            cursor: 'pointer', fontSize: 16, color: '#64748b',
            width: 32, height: 32, borderRadius: 16, background: 'rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{
          flex: 1, overflowY: 'auto', padding: '12px 14px',
          display: 'flex', flexDirection: 'column', gap: 6,
          scrollbarWidth: 'none',
        } as any}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: m.from === 'dispatcher' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '80%', padding: '8px 12px', borderRadius: 16,
                background: m.from === 'dispatcher'
                  ? 'linear-gradient(135deg, rgba(10,132,255,0.25), rgba(10,132,255,0.15))'
                  : 'rgba(255,255,255,0.06)',
                border: `1px solid ${m.from === 'dispatcher' ? 'rgba(10,132,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderBottomRightRadius: m.from === 'dispatcher' ? 4 : 16,
                borderBottomLeftRadius: m.from === 'driver' ? 4 : 16,
              }}>
                <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.4 }}>{m.text}</div>
                <div style={{ fontSize: 9, color: '#64748b', marginTop: 3, textAlign: 'right' } as any}>{m.time}</div>
              </div>
            </div>
          ))}
          {typing && (
            <div style={{
              padding: '8px 14px', borderRadius: 16, borderBottomLeftRadius: 4,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              alignSelf: 'flex-start', maxWidth: '60%',
            } as any}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>typing...</span>
            </div>
          )}
        </div>

        {/* Quick replies — единая строка со скроллом */}
        <style>{`
          .dqstrip { display:flex; overflow-x:auto; gap:6px; scrollbar-width:none; padding:0 4px; cursor:grab; user-select:none; }
          .dqstrip:active { cursor:grabbing; }
          .dqstrip::-webkit-scrollbar { display:none; }
        `}</style>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '6px 0 8px' } as any}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 8, paddingRight: 8 } as any}>
            <button onClick={() => dqRef.current?.scrollBy({ left: -140, behavior: 'smooth' })} style={{
              flexShrink: 0, width: 26, height: 26, borderRadius: 8,
              background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.2)',
              color: Colors.primary, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            } as any}>‹</button>
            <div ref={dqRef} className="dqstrip" style={{ flex: 1 } as any}>
              {QUICK_MESSAGES.map((msg, i) => (
                <button key={i} onClick={() => sendMessage(msg)} disabled={typing} style={{
                  flexShrink: 0, padding: '6px 12px', borderRadius: 20,
                  cursor: typing ? 'not-allowed' : 'pointer',
                  background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.2)',
                  color: typing ? '#475569' : Colors.primary,
                  fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                  opacity: typing ? 0.5 : 1, transition: 'all 0.15s',
                }}>{msg}</button>
              ))}
            </div>
            <button onClick={() => dqRef.current?.scrollBy({ left: 140, behavior: 'smooth' })} style={{
              flexShrink: 0, width: 26, height: 26, borderRadius: 8,
              background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.2)',
              color: Colors.primary, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            } as any}>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
