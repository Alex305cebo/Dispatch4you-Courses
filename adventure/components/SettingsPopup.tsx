import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  GraphicsQuality,
  saveQualitySetting,
  loadQualitySetting,
  getQualityLabel,
  getQualityDescription,
  getCurrentPerformanceSettings
} from '../utils/performanceSettings';
import SavesManagerPopup from './SavesManagerPopup';

// ── тёмная тема ──
const BG      = '#0d1117';
const SURFACE = '#161b22';
const SURF2   = '#1c2333';
const BORDER  = 'rgba(255,255,255,0.08)';
const ACCENT  = '#06b6d4';
const TEXT1   = '#e2e8f0';
const TEXT2   = '#94a3b8';
const SUCCESS = '#4ade80';
const DANGER  = '#f87171';
const PRIMARY = '#38bdf8';

export default function SettingsPopup({ onClose }: { onClose: () => void }) {
  const { timeSpeed, setTimeSpeed, saveGame, clearSave } = useGameStore();
  const [confirmClear, setConfirmClear] = useState(false);
  const [quality, setQuality] = useState<GraphicsQuality>(loadQualitySetting());
  const [showSavesManager, setShowSavesManager] = useState(false);

  const handleQualityChange = (newQuality: GraphicsQuality) => {
    setQuality(newQuality);
    saveQualitySetting(newQuality);
    alert('⚙️ Настройки производительности сохранены!\n\nПерезагрузите страницу чтобы изменения вступили в силу.');
  };

  const currentSettings = getCurrentPerformanceSettings();

  if (showSavesManager) {
    return <SavesManagerPopup onClose={() => setShowSavesManager(false)} />;
  }

  const sectionLabel = (icon: string, text: string) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: TEXT2, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase' as any, letterSpacing: 0.5 }}>
      <span>{icon}</span>{text}
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      } as any} />

      {/* Modal */}
      <div style={{
        position: 'relative', width: '90%', maxWidth: 420,
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: 20,
        boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
        maxHeight: '85vh', overflowY: 'auto',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: `1px solid ${BORDER}`,
          background: 'linear-gradient(180deg, rgba(6,182,212,0.06) 0%, transparent 100%)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 2,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        } as any}>
          <span style={{ fontSize: 17, fontWeight: 900, color: TEXT1 }}>⚙️ Настройки</span>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${BORDER}`,
            cursor: 'pointer', fontSize: 16, color: TEXT2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── Облачные сохранения ── */}
          <div>
            {sectionLabel('☁️', 'Облачные сохранения')}
            <button onClick={() => setShowSavesManager(true)} style={{
              width: '100%', padding: '12px 14px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
              background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(14,165,233,0.07))',
              border: `1.5px solid rgba(6,182,212,0.3)`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'all 0.15s',
            } as any}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = ACCENT; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(6,182,212,0.3)'; }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>💾 Мои сохранения</span>
              <span style={{ fontSize: 18, color: ACCENT }}>→</span>
            </button>
            <p style={{ fontSize: 11, color: TEXT2, margin: '7px 0 0', lineHeight: 1.5 }}>
              Просмотр истории сохранений и загрузка предыдущих версий
            </p>
          </div>

          {/* ── Качество графики ── */}
          <div>
            {sectionLabel('🎮', 'Качество графики')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(['auto', 'low', 'medium', 'high'] as GraphicsQuality[]).map(q => {
                const isActive = quality === q;
                return (
                  <button key={q} onClick={() => handleQualityChange(q)} style={{
                    padding: '12px 14px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(6,182,212,0.08))'
                      : SURF2,
                    border: isActive
                      ? `1.5px solid rgba(56,189,248,0.5)`
                      : `1px solid ${BORDER}`,
                    transition: 'all 0.15s',
                  } as any}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 800, color: isActive ? PRIMARY : TEXT1, marginBottom: q !== 'auto' ? 4 : 0 }}>
                      {getQualityLabel(q)}
                    </div>
                    <div style={{ fontSize: 11, color: TEXT2, lineHeight: 1.5, whiteSpace: 'pre-line' as any }}>
                      {q === 'auto'
                        ? 'Автоматически определяет возможности устройства'
                        : getQualityDescription(q as Exclude<GraphicsQuality, 'auto'>)}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Текущие настройки */}
            <div style={{
              marginTop: 10, padding: '10px 12px', borderRadius: 10,
              background: 'rgba(6,182,212,0.07)',
              border: `1px solid rgba(6,182,212,0.2)`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, marginBottom: 5 }}>
                💡 Текущие настройки:
              </div>
              <div style={{ fontSize: 11, color: TEXT2, lineHeight: 1.6 }}>
                • Обновление: {1000 / currentSettings.tickInterval} раз/сек<br/>
                • Анимации: {currentSettings.animationsEnabled ? 'Вкл' : 'Выкл'}<br/>
                • Тени: {currentSettings.shadowsEnabled ? 'Вкл' : 'Выкл'}<br/>
                • Макс. траков: {currentSettings.maxVisibleTrucks}
              </div>
            </div>
          </div>

          {/* ── Скорость игры ── */}
          <div>
            {sectionLabel('⏱', 'Скорость игры')}
            <div style={{ display: 'flex', gap: 8 }}>
              {([1, 2, 5] as const).map(sp => {
                const isActive = timeSpeed === sp;
                return (
                  <button key={sp} onClick={() => setTimeSpeed(sp)} style={{
                    flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(6,182,212,0.1))'
                      : SURF2,
                    border: isActive
                      ? `1.5px solid rgba(56,189,248,0.5)`
                      : `1px solid ${BORDER}`,
                    color: isActive ? PRIMARY : TEXT2,
                    fontSize: 15, fontWeight: 900,
                    transition: 'all 0.15s',
                  } as any}>×{sp}</button>
                );
              })}
            </div>
          </div>

          {/* ── Сохранение ── */}
          <div>
            {sectionLabel('💾', 'Сохранение')}
            <button onClick={() => { saveGame(); onClose(); }} style={{
              width: '100%', padding: '11px 0', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(74,222,128,0.1)',
              border: `1px solid rgba(74,222,128,0.3)`,
              color: SUCCESS, fontSize: 13, fontWeight: 700,
              transition: 'all 0.15s',
            } as any}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(74,222,128,0.18)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(74,222,128,0.1)'; }}
            >💾 Сохранить сейчас</button>
          </div>

          {/* ── Сброс ── */}
          <div>
            {sectionLabel('🗑', 'Сброс')}
            {!confirmClear ? (
              <button onClick={() => setConfirmClear(true)} style={{
                width: '100%', padding: '11px 0', borderRadius: 10, cursor: 'pointer',
                background: 'rgba(248,113,113,0.08)',
                border: `1px solid rgba(248,113,113,0.25)`,
                color: DANGER, fontSize: 13, fontWeight: 700,
                transition: 'all 0.15s',
              } as any}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.16)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.08)'; }}
              >🗑 Удалить сохранение</button>
            ) : (
              <div>
                <p style={{ fontSize: 12, color: DANGER, margin: '0 0 8px', fontWeight: 600, textAlign: 'center' as any }}>
                  ⚠️ Удалить сохранение? Это нельзя отменить.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { clearSave(); window.location.href = '/game/'; }} style={{
                    flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                    background: 'rgba(248,113,113,0.18)',
                    border: `1.5px solid rgba(248,113,113,0.5)`,
                    color: DANGER, fontSize: 13, fontWeight: 800,
                  }}>Да, удалить</button>
                  <button onClick={() => setConfirmClear(false)} style={{
                    flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${BORDER}`,
                    color: TEXT2, fontSize: 13, fontWeight: 700,
                  }}>Отмена</button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
