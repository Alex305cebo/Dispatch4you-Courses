import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Colors } from '../constants/colors';

export default function SettingsPopup({ onClose }: { onClose: () => void }) {
  const { timeSpeed, setTimeSpeed, saveGame, clearSave } = useGameStore();
  const [confirmClear, setConfirmClear] = useState(false);

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
        position: 'relative', width: '90%', maxWidth: 380,
        background: 'linear-gradient(170deg, #1a1f2e, #0d1117)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)', padding: '24px 20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>⚙️ Настройки</span>
          <span onClick={onClose} style={{ cursor: 'pointer', fontSize: 18, color: '#64748b' }}>✕</span>
        </div>

        {/* Speed */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>⏱ Скорость игры</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {([1, 2, 5] as const).map(sp => (
              <button key={sp} onClick={() => setTimeSpeed(sp)} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                background: timeSpeed === sp ? 'rgba(10,132,255,0.15)' : 'rgba(255,255,255,0.04)',
                border: timeSpeed === sp ? '1px solid rgba(10,132,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                color: timeSpeed === sp ? Colors.primary : '#94a3b8',
                fontSize: 14, fontWeight: 800,
              }}>×{sp}</button>
            ))}
          </div>
        </div>

        {/* Save */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>💾 Сохранение</div>
          <button onClick={() => { saveGame(); onClose(); }} style={{
            width: '100%', padding: '10px 0', borderRadius: 10, cursor: 'pointer',
            background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.3)',
            color: Colors.success, fontSize: 13, fontWeight: 700,
          }}>💾 Сохранить сейчас</button>
        </div>

        {/* Clear save */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>🗑 Сброс</div>
          {!confirmClear ? (
            <button onClick={() => setConfirmClear(true)} style={{
              width: '100%', padding: '10px 0', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)',
              color: Colors.danger, fontSize: 13, fontWeight: 700,
            }}>🗑 Удалить сохранение</button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { clearSave(); window.location.href = '/game/'; }} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                background: 'rgba(255,69,58,0.15)', border: '1px solid rgba(255,69,58,0.4)',
                color: '#fff', fontSize: 13, fontWeight: 800,
              }}>Да, удалить</button>
              <button onClick={() => setConfirmClear(false)} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8', fontSize: 13, fontWeight: 700,
              }}>Отмена</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
