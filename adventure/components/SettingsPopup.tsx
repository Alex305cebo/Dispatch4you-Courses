import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Colors } from '../constants/colors';
import { 
  GraphicsQuality, 
  saveQualitySetting, 
  loadQualitySetting, 
  getQualityLabel,
  getQualityDescription,
  getCurrentPerformanceSettings
} from '../utils/performanceSettings';

export default function SettingsPopup({ onClose }: { onClose: () => void }) {
  const { timeSpeed, setTimeSpeed, saveGame, clearSave } = useGameStore();
  const [confirmClear, setConfirmClear] = useState(false);
  const [quality, setQuality] = useState<GraphicsQuality>(loadQualitySetting());

  const handleQualityChange = (newQuality: GraphicsQuality) => {
    setQuality(newQuality);
    saveQualitySetting(newQuality);
    // Показываем уведомление что нужен перезапуск
    alert('⚙️ Настройки производительности сохранены!\n\nПерезагрузите страницу чтобы изменения вступили в силу.');
  };

  const currentSettings = getCurrentPerformanceSettings();

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
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.08)', borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)', padding: '24px 20px',
        maxHeight: '85vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#111827' }}>⚙️ Настройки</span>
          <span onClick={onClose} style={{ cursor: 'pointer', fontSize: 18, color: '#6b7280' }}>✕</span>
        </div>

        {/* Graphics Quality */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 8 }}>🎮 Качество графики</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(['auto', 'low', 'medium', 'high'] as GraphicsQuality[]).map(q => (
              <button key={q} onClick={() => handleQualityChange(q)} style={{
                padding: '12px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                background: quality === q ? 'rgba(10,132,255,0.15)' : '#f9fafb',
                border: quality === q ? '2px solid rgba(10,132,255,0.4)' : '1px solid rgba(0,0,0,0.08)',
                color: quality === q ? Colors.primary : '#374151',
                fontSize: 13, fontWeight: quality === q ? 800 : 600,
                transition: 'all 0.15s',
              }}>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>{getQualityLabel(q)}</div>
                {q !== 'auto' && (
                  <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                    {getQualityDescription(q as Exclude<GraphicsQuality, 'auto'>)}
                  </div>
                )}
                {q === 'auto' && (
                  <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>
                    Автоматически определяет возможности устройства
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Current settings info */}
          <div style={{
            marginTop: 12, padding: '10px 12px', borderRadius: 8,
            background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0891b2', marginBottom: 4 }}>
              💡 Текущие настройки:
            </div>
            <div style={{ fontSize: 10, color: '#374151', lineHeight: 1.5 }}>
              • Обновление: {1000 / currentSettings.tickInterval} раз/сек<br/>
              • Анимации: {currentSettings.animationsEnabled ? 'Вкл' : 'Выкл'}<br/>
              • Тени: {currentSettings.shadowsEnabled ? 'Вкл' : 'Выкл'}<br/>
              • Макс. траков: {currentSettings.maxVisibleTrucks}
            </div>
          </div>
        </div>

        {/* Speed */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 8 }}>⏱ Скорость игры</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {([1, 2, 5] as const).map(sp => (
              <button key={sp} onClick={() => setTimeSpeed(sp)} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                background: timeSpeed === sp ? 'rgba(10,132,255,0.15)' : '#f9fafb',
                border: timeSpeed === sp ? '1px solid rgba(10,132,255,0.4)' : '1px solid rgba(0,0,0,0.08)',
                color: timeSpeed === sp ? Colors.primary : '#6b7280',
                fontSize: 14, fontWeight: 800,
              }}>×{sp}</button>
            ))}
          </div>
        </div>

        {/* Save */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 8 }}>💾 Сохранение</div>
          <button onClick={() => { saveGame(); onClose(); }} style={{
            width: '100%', padding: '10px 0', borderRadius: 10, cursor: 'pointer',
            background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.3)',
            color: Colors.success, fontSize: 13, fontWeight: 700,
          }}>💾 Сохранить сейчас</button>
        </div>

        {/* Clear save */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 8 }}>🗑 Сброс</div>
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
                color: '#111827', fontSize: 13, fontWeight: 800,
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
