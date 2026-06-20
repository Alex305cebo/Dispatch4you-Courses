// ═══════════════════════════════════════════════════════
//  NegotiationPanel.tsx — торг с брокером (простой и рабочий)
// ═══════════════════════════════════════════════════════
import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { processOffer, getBrokerResponse, type BrokerMood } from '@/game/negotiation';
import { dispatchTruckToLoad } from '@/game/dispatch';
import { showRateConfirmation } from '@/components/RateConfirmation/RateConfirmation';
import styles from './NegotiationPanel.module.css';

interface ChatMsg {
  from: 'broker' | 'player';
  text: string;
}

const MOOD_EMOJI: Record<BrokerMood, string> = {
  happy: '😊', neutral: '😐', annoyed: '😤', angry: '😠',
};

export function NegotiationPanel() {
  const negotiation = useGameStore((s) => s.negotiation);
  const closeNegotiation = useGameStore((s) => s.closeNegotiation);
  const updateNegotiation = useGameStore((s) => s.updateNegotiation);
  const session = useGameStore((s) => s.session);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [status, setStatus] = useState<'negotiating' | 'accepted' | 'rejected' | 'dispatched'>('negotiating');
  const [finalRate, setFinalRate] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset when opened
  useEffect(() => {
    if (negotiation.open && negotiation.loadId && session) {
      const load = session.loads.find((l) => l.id === negotiation.loadId);
      if (load) {
        setMessages([{
          from: 'broker',
          text: `Hey! Got a load: ${load.origin.city} → ${load.destination.city}, ${load.miles} mi. Posting at $${negotiation.postedRate.toLocaleString()}. Interested?`,
        }]);
      }
      setStatus('negotiating');
      setFinalRate(0);
    }
  }, [negotiation.open, negotiation.loadId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' });
  }, [messages]);

  // Not visible
  if (!negotiation.open || !session) return null;
  const load = session.loads.find((l) => l.id === negotiation.loadId);
  if (!load) return null;

  const postedRate = negotiation.postedRate;

  // Accept posted rate immediately
  function acceptPosted() {
    setMessages((prev) => [
      ...prev,
      { from: 'player', text: `$${postedRate.toLocaleString()} works. Let's book it.` },
      { from: 'broker', text: "Deal! Rate Con coming your way. Pickup confirmed." },
    ]);
    setFinalRate(postedRate);
    setStatus('accepted');
  }

  // Make a counter offer
  function makeOffer(amount: number) {
    if (status !== 'negotiating') return;

    setMessages((prev) => [
      ...prev,
      { from: 'player', text: `I can do $${amount.toLocaleString()} ($${(amount / load!.miles).toFixed(2)}/mi).` },
    ]);

    const result = processOffer(negotiation, amount);
    const brokerText = getBrokerResponse(result.newState.brokerMood, result.result, result.newState.currentOffer);

    setMessages((prev) => [...prev, { from: 'broker', text: brokerText }]);
    updateNegotiation(result.newState);

    if (result.result === 'accepted') {
      setFinalRate(result.agreedRate || amount);
      setStatus('accepted');
    } else if (result.result === 'rejected') {
      setStatus('rejected');
    }
  }

  // Accept broker's counter offer
  function acceptCounter() {
    const counter = negotiation.currentOffer;
    setMessages((prev) => [
      ...prev,
      { from: 'player', text: `OK, $${counter.toLocaleString()} — deal.` },
      { from: 'broker', text: "Great! Sending Rate Con now." },
    ]);
    setFinalRate(counter);
    setStatus('accepted');
  }

  // Dispatch truck
  function doDispatch() {
    if (!finalRate || !negotiation.loadId) return;
    // Use selected truck, or first idle
    const selId = useGameStore.getState().selectedTruckId;
    const truck = session!.trucks.find((t) => t.id === selId && t.status === 'idle')
      || session!.trucks.find((t) => t.status === 'idle');
    if (!truck) return;

    setStatus('dispatched');
    dispatchTruckToLoad(truck.id, negotiation.loadId, finalRate);

    // Close everything: negotiation → loadboard → deselect truck
    setTimeout(() => {
      closeNegotiation();
      // Close loadboard immediately after negotiation
      window.dispatchEvent(new CustomEvent('close-loadboard'));
    }, 1200);

    // Deselect truck after a few seconds
    setTimeout(() => {
      useGameStore.getState().selectTruck(null);
    }, 3000);
  }

  // Show which truck will be assigned
  const selId = useGameStore.getState().selectedTruckId;
  const idleTruck = session.trucks.find((t) => t.id === selId && t.status === 'idle')
    || session.trucks.find((t) => t.status === 'idle');

  return (
    <div className={styles.overlay} onClick={() => closeNegotiation()}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.headerTitle}>💼 {negotiation.brokerName}</div>
            <div className={styles.headerSub}>{load.origin.city} → {load.destination.city} · {load.miles} mi</div>
          </div>
          <span style={{ fontSize: 20 }}>{MOOD_EMOJI[negotiation.brokerMood]}</span>
          <button className={styles.closeBtn} onClick={() => closeNegotiation()}>✕</button>
        </div>

        {/* Chat */}
        <div className={styles.chat} ref={scrollRef}>
          {messages.map((msg, i) => (
            <div key={i} className={msg.from === 'player' ? styles.bubblePlayer : styles.bubbleBroker}>
              {msg.text}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {status === 'negotiating' && (
            <>
              <button className={styles.acceptBtn} onClick={acceptPosted}>
                ✓ Принять ${postedRate.toLocaleString()}
              </button>
              <div className={styles.offerGrid}>
                {[1.05, 1.10, 1.15, 1.20].map((mult) => {
                  const val = Math.round(postedRate * mult);
                  const tag = `+${Math.round((mult - 1) * 100)}%`;
                  return (
                    <button key={tag} className={styles.offerBtn} onClick={() => makeOffer(val)}>
                      <span>${val.toLocaleString()}</span>
                      <small>{tag}</small>
                    </button>
                  );
                })}
              </div>
              {negotiation.round > 0 && negotiation.currentOffer > 0 && (
                <button className={styles.acceptBtn} onClick={acceptCounter}>
                  ✓ Принять контр-оффер ${negotiation.currentOffer.toLocaleString()}
                </button>
              )}
            </>
          )}

          {status === 'accepted' && (
            <button className={styles.dispatchBtn} onClick={doDispatch} disabled={!idleTruck}>
              {idleTruck
                ? `🚛 Назначить ${idleTruck.number} — $${finalRate.toLocaleString()}`
                : 'Нет свободных траков'}
            </button>
          )}

          {status === 'dispatched' && (
            <div className={styles.dispatched}>✅ Трак назначен! Едет на погрузку...</div>
          )}

          {status === 'rejected' && (
            <div className={styles.rejected}>❌ Брокер отказал</div>
          )}
        </div>
      </div>
    </div>
  );
}
