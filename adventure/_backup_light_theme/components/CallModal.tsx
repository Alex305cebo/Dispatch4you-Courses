import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { Colors } from '../constants/colors';

interface Props {
  contactName: string;
  contactRole: 'driver' | 'broker';
  truckId?: string;
  onClose: () => void;
}

type CallState = 'ringing' | 'connected' | 'ended';

const DRIVER_RESPONSES: Record<string, string[]> = {
  'Where are you?': ['I\'m about 30 miles from the delivery point. Should be there in 40 minutes.', 'Just passed the weigh station. All clear, moving good.', 'Stuck in traffic on I-40. Might be 20 minutes late.'],
  'How\'s the load?': ['Load is secure, no issues. Temperature is holding steady.', 'All good. Had to re-strap at the last stop but everything\'s tight now.', 'Slight concern — load shifted a bit. I\'ll check at next stop.'],
  'ETA update?': ['Looking at about 2 hours to delivery. Traffic is light.', 'GPS says 3.5 hours but I think I can make it in 3.', 'Might be late — construction zone ahead, 1 lane only.'],
  'Take a break': ['Copy that, I\'ll pull over at the next rest area. Need fuel anyway.', 'Roger. There\'s a Pilot about 15 miles ahead, I\'ll stop there.', 'Understood. HOS is getting tight anyway, good call.'],
  'Any problems?': ['Nope, smooth sailing today. Truck\'s running great.', 'Check engine light came on briefly but went off. Keeping an eye on it.', 'Tire pressure warning on rear axle. I\'ll check it at next stop.'],
  'Call roadside': ['Already called them, ETA 45 minutes. Staying safe on the shoulder.', 'On hold with roadside now. They said 30-60 min. I\'ll keep you posted.', 'Roadside is on the way. Estimated $450 for the repair. Approving?'],
  'Notify broker': ['I\'ll text the broker right now about the delay.', 'Already sent them a message. Waiting for response.', 'Broker notified. They said to keep them updated on ETA.'],
  'How long repair?': ['Roadside says 1-2 hours for the engine. Could be longer.', 'Mechanic is here, says about 90 minutes. Tire change is faster — 45 min.', 'They\'re assessing now. Will know in 15 minutes.'],
  'Document everything': ['Taking photos of the truck and location now. Timestamped.', 'Got photos, GPS location saved, and I noted the exact time.', 'All documented. Sending you the photos now for insurance.'],
};

const BROKER_RESPONSES: Record<string, string[]> = {
  'Load status?': ['Driver is on schedule, should deliver on time.', 'We\'re tracking the load — everything looks good.', 'There was a slight delay at pickup but we\'re making up time.'],
  'Rate negotiation': ['I can bump it up $100 but that\'s my max.', 'Let me check with the shipper... I might have some room.', 'Rate is firm on this one, sorry. But I have a backhaul that pays well.'],
  'Detention claim': ['Send me the BOL with timestamps and I\'ll process it.', 'We cover detention after 2 hours at $50/hr. Send documentation.', 'I\'ll need to verify with the shipper first. Give me 30 minutes.'],
  'New loads?': ['I have a load from Dallas to Atlanta, 780 miles, $2,400. Interested?', 'Nothing right now but I\'ll have something tomorrow morning.', 'Got a hot load — needs to move today. Chicago to Memphis, $1,800.'],
  'POD status': ['POD received, invoice is being processed. Payment in 30 days.', 'Haven\'t received the POD yet. Can your driver send it?', 'POD looks good. I\'ll send the check this week.'],
};

export default function CallModal({ contactName, contactRole, truckId, onClose }: Props) {
  const { addNotification } = useGameStore();
  const [callState, setCallState] = useState<CallState>('ringing');
  const [messages, setMessages] = useState<Array<{ from: string; text: string }>>([]);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const responses = contactRole === 'driver' ? DRIVER_RESPONSES : BROKER_RESPONSES;
  const quickActions = Object.keys(responses);

  useEffect(() => {
    // Ring for 2 seconds then connect
    const ringTimer = setTimeout(() => {
      setCallState('connected');
      setMessages([{ from: contactName, text: contactRole === 'driver' ? 'Hey boss, what\'s up?' : `Hi, ${contactName} speaking. How can I help?` }]);
    }, 2000);
    return () => clearTimeout(ringTimer);
  }, []);

  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callState]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleQuickAction = (action: string) => {
    const opts = responses[action];
    const response = opts[Math.floor(Math.random() * opts.length)];

    setMessages(prev => [
      ...prev,
      { from: 'You', text: action },
    ]);

    // Simulate typing delay
    setTimeout(() => {
      setMessages(prev => [...prev, { from: contactName, text: response }]);
    }, 800 + Math.random() * 1200);
  };

  const handleEndCall = () => {
    setCallState('ended');
    if (timerRef.current) clearInterval(timerRef.current);

    // Log call as notification
    const summary = messages.filter(m => m.from === contactName).map(m => m.text).join(' | ');
    addNotification({
      type: 'text', priority: 'low', from: contactName,
      subject: `📞 Звонок (${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')})`,
      message: summary || 'Quick call, no details.',
      actionRequired: false,
      relatedTruckId: truckId,
    });

    setTimeout(onClose, 1500);
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      } as any} />

      <div style={{
        position: 'relative', width: '90%', maxWidth: 380,
        background: '#ffffff',
        border: `1px solid ${callState === 'ringing' ? 'rgba(48,209,88,0.3)' : callState === 'connected' ? 'rgba(10,132,255,0.3)' : 'rgba(255,69,58,0.3)'}`,
        borderRadius: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
        overflow: 'hidden',
      }}>
        {/* Call header */}
        <div style={{
          padding: '20px 20px 14px', textAlign: 'center',
          background: callState === 'ringing'
            ? 'linear-gradient(180deg, rgba(48,209,88,0.08), transparent)'
            : callState === 'connected'
            ? 'linear-gradient(180deg, rgba(10,132,255,0.08), transparent)'
            : 'linear-gradient(180deg, rgba(255,69,58,0.08), transparent)',
        } as any}>
          <div style={{
            width: 56, height: 56, borderRadius: 28, margin: '0 auto 10px',
            background: `linear-gradient(135deg, ${Colors.primary}33, ${Colors.primary}11)`,
            border: `2px solid ${Colors.primary}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26,
          }}>{contactRole === 'driver' ? '🚛' : '💼'}</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>{contactName}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            {contactRole === 'driver' ? 'Driver' : 'Broker'}
          </div>
          <div style={{
            fontSize: 13, fontWeight: 700, marginTop: 6,
            color: callState === 'ringing' ? Colors.success : callState === 'connected' ? Colors.primary : Colors.danger,
          }}>
            {callState === 'ringing' ? '📞 Calling...' : callState === 'connected' ? `🔊 ${formatDuration(callDuration)}` : '📵 Call Ended'}
          </div>
        </div>

        {/* Chat area */}
        {callState === 'connected' && (
          <div ref={scrollRef} style={{
            maxHeight: 200, overflowY: 'auto', padding: '0 16px 10px',
            scrollbarWidth: 'none',
          } as any}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: m.from === 'You' ? 'flex-end' : 'flex-start',
                marginBottom: 6,
              }}>
                <div style={{
                  maxWidth: '80%', padding: '8px 12px', borderRadius: 14,
                  background: m.from === 'You' ? 'rgba(10,132,255,0.2)' : '#f3f4f6',
                  border: `1px solid ${m.from === 'You' ? 'rgba(10,132,255,0.3)' : 'rgba(0,0,0,0.06)'}`,
                }}>
                  <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.4 }}>{m.text}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions — 2 строки со скроллом */}
        {callState === 'connected' && (
          <>
          <style>{`
            .cqrow { display:flex; overflow-x:auto; gap:6px; scrollbar-width:none; padding:0 16px; }
            .cqrow::-webkit-scrollbar { display:none; }
            .cqrow-wrap { position:relative; }
            .cqrow-arrow { position:absolute; right:0; top:0; bottom:0; width:28px;
              background:linear-gradient(to left, rgba(26,31,46,0.95) 60%, transparent);
              display:flex; align-items:center; justify-content:flex-end; padding-right:4px;
              pointer-events:none; font-size:13px; color:rgba(10,132,255,0.7); }
          `}</style>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '6px 0 10px', display: 'flex', flexDirection: 'column', gap: 5 } as any}>
            {[quickActions.slice(0, Math.ceil(quickActions.length / 2)), quickActions.slice(Math.ceil(quickActions.length / 2))].map((row, ri) => (
              <div key={ri} className="cqrow-wrap">
                <div className="cqrow">
                  {row.map((action, i) => (
                    <button key={i} onClick={() => handleQuickAction(action)} style={{
                      flexShrink: 0, padding: '6px 12px', borderRadius: 16, cursor: 'pointer',
                      background: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.25)',
                      color: Colors.primary, fontSize: 11, fontWeight: 700,
                      whiteSpace: 'nowrap', transition: 'all 0.15s',
                    }}>{action}</button>
                  ))}
                </div>
                <div className="cqrow-arrow">›</div>
              </div>
            ))}
          </div>
          </>
        )}

        {/* End call button */}
        <div style={{ padding: '12px 20px 20px', display: 'flex', justifyContent: 'center' }}>
          {callState !== 'ended' ? (
            <button onClick={handleEndCall} style={{
              width: 56, height: 56, borderRadius: 28, cursor: 'pointer',
              background: 'linear-gradient(135deg, #ff453a, #d93025)',
              border: 'none', boxShadow: '0 4px 16px rgba(255,69,58,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: '#fff',
            }}>📵</button>
          ) : (
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
              Call ended · {formatDuration(callDuration)}
            </div>
          )}
        </div>
      </div>

      {/* Ringing animation */}
      {callState === 'ringing' && (
        <style>{`
          @keyframes ringPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(48,209,88,0.4); }
            50% { box-shadow: 0 0 0 20px rgba(48,209,88,0); }
          }
        `}</style>
      )}
    </div>
  );
}
