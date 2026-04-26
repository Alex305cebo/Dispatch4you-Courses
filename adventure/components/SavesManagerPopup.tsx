/**
 * Saves Manager Popup — управление сохранениями
 * Тёмная тема
 */

import { useState, useEffect } from 'react';
import { getSaveHistory, loadSaveFromHistory, getCurrentUser, signInWithGoogle, signOutUser, SaveMetadata } from '../utils/firebaseSaveSystem';
import { useGameStore } from '../store/gameStore';

interface SavesManagerPopupProps {
  onClose: () => void;
}

export default function SavesManagerPopup({ onClose }: SavesManagerPopupProps) {
  const [saves, setSaves] = useState<SaveMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingSaveId, setLoadingSaveId] = useState<string | null>(null);

  useEffect(() => { loadSaves(); }, []);

  async function loadSaves() {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (user) {
        setUserEmail(user.email);
        const history = await getSaveHistory();
        setSaves(history);
      }
    } catch (e) {
      console.error('Failed to load saves:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn() {
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        setUserEmail(user.email);
        const history = await getSaveHistory();
        setSaves(history);
      }
    } catch (e) {
      console.error('Sign in failed:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await signOutUser();
    setUserEmail(null);
    setSaves([]);
  }

  async function handleLoadSave(saveId: string) {
    setLoadingSaveId(saveId);
    try {
      const saveData = await loadSaveFromHistory(saveId);
      if (saveData) {
        useGameStore.setState({
          phase: saveData.phase as any,
          day: saveData.day,
          gameMinute: saveData.gameMinute,
          sessionName: saveData.sessionName,
          balance: saveData.balance,
          totalEarned: saveData.totalEarned,
          totalLost: saveData.totalLost,
          financeLog: saveData.financeLog,
          reputation: saveData.reputation,
          trucks: saveData.trucks,
          availableLoads: saveData.availableLoads,
          activeLoads: saveData.activeLoads,
          bookedLoads: saveData.bookedLoads,
          brokers: saveData.brokers,
          activeEvents: saveData.activeEvents,
          resolvedEvents: saveData.resolvedEvents,
          notifications: saveData.notifications,
          unreadCount: saveData.unreadCount,
          pendingEmailResponses: saveData.pendingEmailResponses,
          deliveryResults: [],
        });
        alert('✅ Сохранение загружено!');
        onClose();
        window.location.reload();
      }
    } catch (e) {
      console.error('Failed to load save:', e);
      alert('❌ Не удалось загрузить сохранение');
    } finally {
      setLoadingSaveId(null);
    }
  }

  function formatDate(ts: number): string {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  function formatGameTime(gameMinute: number): string {
    const totalMinutes = 8 * 60 + gameMinute;
    const hours = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    const h12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${h12}:${mins.toString().padStart(2, '0')} ${ampm}`;
  }

  // ── цвета тёмной темы ──
  const BG       = '#0d1117';
  const SURFACE  = '#161b22';
  const SURFACE2 = '#1c2333';
  const BORDER   = 'rgba(255,255,255,0.08)';
  const BORDER2  = 'rgba(6,182,212,0.3)';
  const TEXT1    = '#e2e8f0';
  const TEXT2    = '#94a3b8';
  const ACCENT   = '#06b6d4';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
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
        position: 'relative', width: '90%', maxWidth: 520,
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: 20,
        boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* ── HEADER ── */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: `1px solid ${BORDER}`,
          background: `linear-gradient(180deg, rgba(6,182,212,0.06) 0%, transparent 100%)`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: TEXT1, margin: 0, letterSpacing: -0.3 }}>
                💾 Мои сохранения
              </h2>
              {userEmail && (
                <p style={{ fontSize: 11, color: ACCENT, margin: '3px 0 0', fontWeight: 600 }}>
                  {userEmail}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {userEmail && (
                <button onClick={handleSignOut} style={{
                  padding: '5px 12px', borderRadius: 8,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#f87171',
                }}>Выйти</button>
              )}
              <button onClick={onClose} style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${BORDER}`,
                cursor: 'pointer', fontSize: 16, color: TEXT2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

          {/* Загрузка */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
              <p style={{ fontSize: 14, color: TEXT2, margin: 0 }}>Загрузка сохранений...</p>
            </div>

          /* Не залогинен */
          ) : !userEmail ? (
            <div style={{ textAlign: 'center', padding: '36px 16px' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🔒</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: TEXT1, margin: '0 0 8px' }}>
                Войдите чтобы использовать<br/>облачные сохранения
              </h3>
              <p style={{ fontSize: 13, color: TEXT2, margin: '0 0 24px', lineHeight: 1.6 }}>
                Авторизуйтесь через Google чтобы сохранять<br/>
                прогресс в облаке и продолжать игру<br/>
                на любом устройстве
              </p>

              {/* Кнопка Google */}
              <button
                onClick={handleSignIn}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 10, margin: '0 auto',
                  padding: '13px 28px',
                  background: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontSize: 14, fontWeight: 700, color: '#1f2937',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                  transition: 'all 0.15s ease',
                  width: '100%', maxWidth: 260,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.5)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.4)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Войти через Google
              </button>
            </div>

          /* Нет сохранений */
          ) : saves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT1, margin: '0 0 8px' }}>
                Нет сохранений
              </h3>
              <p style={{ fontSize: 13, color: TEXT2, margin: 0 }}>
                Ваши сохранения появятся здесь автоматически
              </p>
            </div>

          /* Список сохранений */
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {saves.map((save, index) => (
                <div
                  key={save.id}
                  onClick={() => handleLoadSave(save.id)}
                  style={{
                    background: index === 0
                      ? `linear-gradient(135deg, rgba(6,182,212,0.1), rgba(14,165,233,0.06))`
                      : SURFACE2,
                    border: index === 0
                      ? `1.5px solid ${BORDER2}`
                      : `1px solid ${BORDER}`,
                    borderRadius: 14, padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = ACCENT;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = index === 0 ? BORDER2 : BORDER;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  {/* Бейдж "последнее" */}
                  {index === 0 && (
                    <div style={{
                      position: 'absolute', top: 10, right: 10,
                      background: 'rgba(6,182,212,0.15)',
                      border: `1px solid rgba(6,182,212,0.35)`,
                      borderRadius: 6, padding: '2px 8px',
                      fontSize: 9, fontWeight: 800, color: ACCENT, letterSpacing: 0.5,
                    }}>
                      ПОСЛЕДНЕЕ
                    </div>
                  )}

                  <div style={{ marginBottom: 10, paddingRight: index === 0 ? 80 : 0 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: TEXT1, margin: '0 0 3px' }}>
                      {save.sessionName || 'Без названия'}
                    </h4>
                    <p style={{ fontSize: 11, color: TEXT2, margin: 0 }}>
                      {formatDate(save.savedAt)}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as any }}>
                    {[
                      { icon: '⏰', val: formatGameTime(save.gameMinute), color: TEXT1 },
                      { icon: '💰', val: `$${save.balance.toLocaleString()}`, color: save.balance >= 0 ? '#4ade80' : '#f87171' },
                      { icon: '🚛', val: `${save.trucksCount} траков`, color: TEXT1 },
                    ].map(({ icon, val, color }) => (
                      <div key={icon} style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${BORDER}`,
                        borderRadius: 7, padding: '4px 10px',
                        fontSize: 11, fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: 5,
                      }}>
                        <span>{icon}</span>
                        <span style={{ color }}>{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Оверлей загрузки */}
                  {loadingSaveId === save.id && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(13,17,23,0.85)',
                      borderRadius: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 28 }}>⏳</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          padding: '12px 20px',
          borderTop: `1px solid ${BORDER}`,
          background: 'rgba(255,255,255,0.02)',
        }}>
          <p style={{ fontSize: 11, color: TEXT2, margin: 0, textAlign: 'center', lineHeight: 1.6 }}>
            💡 Игра автоматически сохраняется каждую минуту<br/>
            Последние 5 сохранений хранятся в облаке
          </p>
        </div>
      </div>
    </div>
  );
}
