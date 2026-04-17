import { useState } from 'react';
import { useGameStore, ActiveLoad } from '../store/gameStore';
import { Colors } from '../constants/colors';

interface Props {
  load: ActiveLoad;
  onClose: () => void;
}

export default function CancelLoadModal({ load, onClose }: Props) {
  const { cancelLoad } = useGameStore();
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const tonuFee = Math.round(load.agreedRate * 0.25); // 25% TONU
  const reputationHit = load.phase === 'to_pickup' ? 5 : load.phase === 'loading' ? 10 : 15;

  const reasons = [
    'Truck breakdown — cannot continue',
    'Driver HOS violation — must stop',
    'Weather emergency — unsafe conditions',
    'Shipper not ready — excessive wait',
    'Rate dispute — broker changed terms',
    'Equipment mismatch — wrong trailer type',
  ];

  const handleCancel = () => {
    cancelLoad(load.id, { reason: reason || 'Cancelled by dispatcher', tonuFee, reputationHit });
    onClose();
  };

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
        position: 'relative', width: '90%', maxWidth: 420,
        background: 'linear-gradient(170deg, #1a1f2e, #0d1117)',
        border: '1px solid rgba(255,69,58,0.25)', borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)', padding: '24px 20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>⚠️ Отмена груза</span>
          <span onClick={onClose} style={{ cursor: 'pointer', fontSize: 18, color: '#64748b' }}>✕</span>
        </div>

        {/* Load info */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: '10px 12px', marginBottom: 14,
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>
            {load.fromCity} → {load.toCity}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
            {load.miles} mi · ${load.agreedRate.toLocaleString()} · {load.brokerCompany}
          </div>
        </div>

        {/* Consequences */}
        <div style={{
          background: 'rgba(255,69,58,0.06)', border: '1px solid rgba(255,69,58,0.15)',
          borderRadius: 12, padding: '12px', marginBottom: 14,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: Colors.danger, marginBottom: 8 }}>
            ⚠️ Последствия отмены:
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: '#e2e8f0' }}>TONU штраф (25%)</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: Colors.danger }}>-${tonuFee.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#e2e8f0' }}>Репутация</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: Colors.danger }}>-{reputationHit}%</span>
          </div>
        </div>

        {/* Reason selection */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>Причина:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 } as any}>
            {reasons.map((r, i) => (
              <div key={i} onClick={() => setReason(r)} style={{
                padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                background: reason === r ? 'rgba(255,69,58,0.1)' : 'rgba(255,255,255,0.03)',
                border: reason === r ? '1px solid rgba(255,69,58,0.3)' : '1px solid rgba(255,255,255,0.06)',
                fontSize: 12, color: reason === r ? '#fff' : '#94a3b8', fontWeight: reason === r ? 700 : 500,
                transition: 'all 0.15s',
              }}>
                {r}
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        {!confirmed ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '12px 0', borderRadius: 12, cursor: 'pointer',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', fontSize: 14, fontWeight: 700,
            }}>Назад</button>
            <button onClick={() => reason ? setConfirmed(true) : null} style={{
              flex: 1, padding: '12px 0', borderRadius: 12, cursor: reason ? 'pointer' : 'not-allowed',
              background: reason ? 'rgba(255,69,58,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${reason ? 'rgba(255,69,58,0.3)' : 'rgba(255,255,255,0.06)'}`,
              color: reason ? Colors.danger : '#475569', fontSize: 14, fontWeight: 800,
              opacity: reason ? 1 : 0.5,
            }}>Отменить груз</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setConfirmed(false)} style={{
              flex: 1, padding: '12px 0', borderRadius: 12, cursor: 'pointer',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', fontSize: 14, fontWeight: 700,
            }}>Нет, оставить</button>
            <button onClick={handleCancel} style={{
              flex: 1, padding: '12px 0', borderRadius: 12, cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(255,69,58,0.3), rgba(217,48,37,0.2))',
              border: '1px solid rgba(255,69,58,0.5)',
              color: '#fff', fontSize: 14, fontWeight: 900,
            }}>Да, отменить!</button>
          </div>
        )}
      </div>
    </div>
  );
}
