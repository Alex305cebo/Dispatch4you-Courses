/**
 * Saves Manager Popup — управление сохранениями
 * Показывает историю сохранений из Firebase
 * Позволяет загрузить любое сохранение
 */

import { useState, useEffect } from 'react';
import { getSaveHistory, loadSaveFromHistory, getCurrentUser, SaveMetadata } from '../utils/firebaseSaveSystem';
import { useGameStore } from '../store/gameStore';

interface SavesManagerPopupProps {
  onClose: () => void;
}

export default function SavesManagerPopup({ onClose }: SavesManagerPopupProps) {
  const [saves, setSaves] = useState<SaveMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingSaveId, setLoadingSaveId] = useState<string | null>(null);

  useEffect(() => {
    loadSaves();
  }, []);

  async function loadSaves() {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (user) {
        setUserEmail(user.email);
        const history = await getSaveHistory();
        setSaves(history);
      }
    } catch (error) {
      console.error('Failed to load saves:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadSave(saveId: string) {
    setLoadingSaveId(saveId);
    try {
      const saveData = await loadSaveFromHistory(saveId);
      if (saveData) {
        // Применяем сохранение к store
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
        // Перезагружаем страницу чтобы применить изменения
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to load save:', error);
      alert('❌ Не удалось загрузить сохранение');
    } finally {
      setLoadingSaveId(null);
    }
  }

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatGameTime(gameMinute: number): string {
    const totalMinutes = 8 * 60 + gameMinute; // SHIFT_START_HOUR=8
    const hours = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    const h12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${h12}:${mins.toString().padStart(2, '0')} ${ampm}`;
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      } as any} />
      
      <div style={{
        position: 'relative', width: '90%', maxWidth: 600,
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.08)', borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 20px 16px',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#111827', margin: 0 }}>
                💾 Мои сохранения
              </h2>
              {userEmail && (
                <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0', fontWeight: 600 }}>
                  {userEmail}
                </p>
              )}
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(0,0,0,0.05)', border: 'none',
              cursor: 'pointer', fontSize: 18, color: '#6b7280',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px 20px',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Загрузка сохранений...</p>
            </div>
          ) : !userEmail ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
                Войдите чтобы использовать облачные сохранения
              </h3>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
                Авторизуйтесь через Google чтобы сохранять прогресс в облаке<br/>
                и продолжать игру на любом устройстве
              </p>
            </div>
          ) : saves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
                Нет сохранений
              </h3>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                Ваши сохранения появятся здесь автоматически
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {saves.map((save, index) => (
                <div key={save.id} style={{
                  background: index === 0 
                    ? 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(14,165,233,0.05))'
                    : '#f9fafb',
                  border: index === 0
                    ? '2px solid rgba(6,182,212,0.3)'
                    : '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 12, padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                }} onClick={() => handleLoadSave(save.id)}>
                  {index === 0 && (
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'rgba(6,182,212,0.15)',
                      border: '1px solid rgba(6,182,212,0.3)',
                      borderRadius: 6, padding: '2px 8px',
                      fontSize: 10, fontWeight: 700, color: '#0891b2',
                    }}>
                      ПОСЛЕДНЕЕ
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ flex: 1, paddingRight: 60 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
                        {save.sessionName || 'Без названия'}
                      </h4>
                      <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
                        {formatDate(save.savedAt)}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{
                      background: 'rgba(0,0,0,0.03)',
                      borderRadius: 6, padding: '4px 10px',
                      fontSize: 11, fontWeight: 700,
                    }}>
                      <span style={{ color: '#6b7280' }}>⏰</span>{' '}
                      <span style={{ color: '#374151' }}>{formatGameTime(save.gameMinute)}</span>
                    </div>
                    
                    <div style={{
                      background: 'rgba(0,0,0,0.03)',
                      borderRadius: 6, padding: '4px 10px',
                      fontSize: 11, fontWeight: 700,
                    }}>
                      <span style={{ color: '#6b7280' }}>💰</span>{' '}
                      <span style={{ color: save.balance >= 0 ? '#16a34a' : '#dc2626' }}>
                        ${save.balance.toLocaleString()}
                      </span>
                    </div>
                    
                    <div style={{
                      background: 'rgba(0,0,0,0.03)',
                      borderRadius: 6, padding: '4px 10px',
                      fontSize: 11, fontWeight: 700,
                    }}>
                      <span style={{ color: '#6b7280' }}>🚛</span>{' '}
                      <span style={{ color: '#374151' }}>{save.trucksCount} траков</span>
                    </div>
                  </div>

                  {loadingSaveId === save.id && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(255,255,255,0.9)',
                      borderRadius: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{ fontSize: 24 }}>⏳</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          background: 'rgba(0,0,0,0.02)',
        }}>
          <p style={{ fontSize: 11, color: '#6b7280', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
            💡 Игра автоматически сохраняется каждую минуту<br/>
            Последние 5 сохранений хранятся в облаке
          </p>
        </div>
      </div>
    </div>
  );
}
