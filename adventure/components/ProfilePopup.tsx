/**
 * ProfilePopup — Профиль игрока с 3 слотами сохранений
 * Интегрирует: Сохранения, Гараж, Статистику
 */

import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { getCurrentUser, signInWithGoogle, signOutUser } from '../utils/firebaseSaveSystem';
import RepairGarageModal from './RepairGarageModal';

interface ProfilePopupProps {
  onClose: () => void;
  onStartGame: (slotId: number) => void;
}

type Tab = 'saves' | 'stats' | 'garage';

interface SaveSlot {
  id: number;
  name: string;
  isEmpty: boolean;
  data?: {
    sessionName: string;
    day: number;
    balance: number;
    trucks: number;
    reputation: number;
    totalEarned: number;
    lastPlayed: number;
  };
}

export default function ProfilePopup({ onClose, onStartGame }: ProfilePopupProps) {
  const [activeTab, setActiveTab] = useState<Tab>('saves');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [slots, setSlots] = useState<SaveSlot[]>([
    { id: 1, name: 'Слот 1', isEmpty: true },
    { id: 2, name: 'Слот 2', isEmpty: true },
    { id: 3, name: 'Слот 3', isEmpty: true },
  ]);

  const { balance, totalEarned, totalLost, reputation, trucks, day } = useGameStore();

  useEffect(() => {
    checkUser();
    loadSlots();
  }, []);

  async function checkUser() {
    try {
      const u = await getCurrentUser();
      if (u) {
        setUserEmail(u.email || null);
        setUserName(u.displayName || u.email?.split('@')[0] || null);
        setUserPhoto(u.photoURL || null);
      }
    } catch {}
  }

  async function handleSignIn() {
    setSigningIn(true);
    try {
      const u = await signInWithGoogle();
      if (u) {
        setUserEmail(u.email || null);
        setUserName(u.displayName || u.email?.split('@')[0] || null);
        setUserPhoto(u.photoURL || null);
      }
    } finally {
      setSigningIn(false);
    }
  }

  async function handleSignOut() {
    await signOutUser();
    setUserEmail(null);
    setUserName(null);
    setUserPhoto(null);
  }

  function loadSlots() {
    // Загружаем сохранения из localStorage
    const newSlots: SaveSlot[] = [];
    for (let i = 1; i <= 3; i++) {
      const key = `dispatcher-save-slot-${i}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const data = JSON.parse(raw);
          newSlots.push({
            id: i,
            name: `Слот ${i}`,
            isEmpty: false,
            data: {
              sessionName: data.sessionName || 'Без названия',
              day: data.day || 1,
              balance: data.balance || 0,
              trucks: data.trucks?.length || 0,
              reputation: data.reputation || 100,
              totalEarned: data.totalEarned || 0,
              lastPlayed: data.lastPlayed || Date.now(),
            },
          });
        } catch {
          newSlots.push({ id: i, name: `Слот ${i}`, isEmpty: true });
        }
      } else {
        newSlots.push({ id: i, name: `Слот ${i}`, isEmpty: true });
      }
    }
    setSlots(newSlots);
  }

  function handleSlotClick(slot: SaveSlot) {
    if (slot.isEmpty) {
      // Новая игра в этом слоте
      if (window.confirm(`Начать новую игру в ${slot.name}?`)) {
        onStartGame(slot.id);
      }
    } else {
      // Загрузить сохранение
      if (window.confirm(`Загрузить игру из ${slot.name}?`)) {
        const key = `dispatcher-save-slot-${slot.id}`;
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const data = JSON.parse(raw);
            // Загружаем состояние из слота
            useGameStore.getState().loadGame(slot.id).then((success) => {
              if (success) {
                onClose();
                // Перезагружаем страницу чтобы применить загруженное состояние
                window.location.href = '/game';
              } else {
                alert('Ошибка загрузки сохранения');
              }
            });
          } catch {
            alert('Ошибка загрузки сохранения');
          }
        }
      }
    }
  }

  function handleDeleteSlot(slotId: number, e: any) {
    e.stopPropagation();
    if (window.confirm(`Удалить сохранение из Слота ${slotId}?`)) {
      const key = `dispatcher-save-slot-${slotId}`;
      localStorage.removeItem(key);
      loadSlots();
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
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  }

  const BG = '#0d1117';
  const SURFACE = '#161b22';
  const SURFACE2 = '#1c2333';
  const BORDER = 'rgba(255,255,255,0.08)';
  const BORDER2 = 'rgba(6,182,212,0.3)';
  const TEXT1 = '#e2e8f0';
  const TEXT2 = '#94a3b8';
  const ACCENT = '#06b6d4';

  const tabs = [
    { id: 'saves' as Tab, icon: '💾', label: 'Сохранения' },
    { id: 'stats' as Tab, icon: '📊', label: 'Статистика' },
    { id: 'garage' as Tab, icon: '🔧', label: 'Гараж' },
  ];

  return (
    <View style={s.overlay}>
      <TouchableOpacity style={s.backdrop} onPress={onClose} activeOpacity={1} />

      <View style={s.modal}>
        {/* HEADER */}
        <View style={s.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {userPhoto ? (
              <img src={userPhoto} style={{ width: 40, height: 40, borderRadius: 20, border: `2px solid ${ACCENT}` } as any} />
            ) : (
              <View style={[s.avatar, { backgroundColor: ACCENT }]}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>
                  {(userName || userEmail || 'G')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={s.headerTitle}>👤 Профиль</Text>
              {userEmail && (
                <Text style={s.headerSub}>{userName || userEmail}</Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={{ fontSize: 18, color: TEXT2 }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={s.tabs}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[s.tab, activeTab === tab.id && s.tabActive]}
              >
                <Text style={{ fontSize: 18 }}>{tab.icon}</Text>
                <Text style={[s.tabText, activeTab === tab.id && s.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CONTENT */}
        <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
          {/* TAB: СОХРАНЕНИЯ */}
          {activeTab === 'saves' && (
            <View style={{ gap: 12 }}>
              <Text style={s.sectionTitle}>💾 Слоты сохранений</Text>
              <Text style={s.sectionDesc}>
                Выберите слот для новой игры или загрузите существующее сохранение
              </Text>

              {slots.map(slot => (
                <TouchableOpacity
                  key={slot.id}
                  onPress={() => handleSlotClick(slot)}
                  style={[s.slotCard, slot.isEmpty && s.slotEmpty]}
                >
                  {slot.isEmpty ? (
                    <>
                      <View style={s.slotIcon}>
                        <Text style={{ fontSize: 32 }}>➕</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.slotTitle}>{slot.name}</Text>
                        <Text style={s.slotSub}>Пустой слот — начать новую игру</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={s.slotIcon}>
                        <Text style={{ fontSize: 32 }}>🎮</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.slotTitle}>{slot.data!.sessionName}</Text>
                        <Text style={s.slotSub}>
                          День {slot.data!.day} · {formatDate(slot.data!.lastPlayed)}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                          <View style={s.badge}>
                            <Text style={s.badgeText}>💰 ${slot.data!.balance.toLocaleString()}</Text>
                          </View>
                          <View style={s.badge}>
                            <Text style={s.badgeText}>🚛 {slot.data!.trucks}</Text>
                          </View>
                          <View style={s.badge}>
                            <Text style={s.badgeText}>⭐ {slot.data!.reputation}%</Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={(e) => handleDeleteSlot(slot.id, e)}
                        style={s.deleteBtn}
                      >
                        <Text style={{ fontSize: 16 }}>🗑️</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </TouchableOpacity>
              ))}

              {/* Google Sign In */}
              {!userEmail && (
                <View style={s.signInCard}>
                  <Text style={{ fontSize: 32, marginBottom: 8 }}>☁️</Text>
                  <Text style={s.signInTitle}>Облачные сохранения</Text>
                  <Text style={s.signInDesc}>
                    Войдите через Google чтобы синхронизировать сохранения между устройствами
                  </Text>
                  <TouchableOpacity
                    onPress={signingIn ? undefined : handleSignIn}
                    style={s.googleBtn}
                  >
                    {signingIn ? (
                      <Text style={s.googleBtnText}>⏳ Входим...</Text>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        <Text style={s.googleBtnText}>Войти через Google</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {userEmail && (
                <TouchableOpacity onPress={handleSignOut} style={s.signOutBtn}>
                  <Text style={s.signOutText}>Выйти из аккаунта</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* TAB: СТАТИСТИКА */}
          {activeTab === 'stats' && (
            <View style={{ gap: 12 }}>
              <Text style={s.sectionTitle}>📊 Статистика</Text>
              <View style={s.statsGrid}>
                {[
                  { icon: '💰', label: 'Баланс', value: `$${balance.toLocaleString()}`, color: balance >= 0 ? '#22c55e' : '#ef4444' },
                  { icon: '📈', label: 'Заработано', value: `$${totalEarned.toLocaleString()}`, color: '#06b6d4' },
                  { icon: '📉', label: 'Потрачено', value: `$${totalLost.toLocaleString()}`, color: '#f97316' },
                  { icon: '⭐', label: 'Репутация', value: `${reputation}%`, color: '#fbbf24' },
                  { icon: '🚛', label: 'Траков', value: trucks.length.toString(), color: '#a78bfa' },
                  { icon: '📅', label: 'День', value: day.toString(), color: '#ec4899' },
                ].map((stat, i) => (
                  <View key={i} style={s.statCard}>
                    <Text style={{ fontSize: 28 }}>{stat.icon}</Text>
                    <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
                    <Text style={s.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB: ГАРАЖ */}
          {activeTab === 'garage' && (
            <View style={{ gap: 12 }}>
              <Text style={s.sectionTitle}>🔧 Гараж</Text>
              <Text style={s.sectionDesc}>
                Управление траками, ремонт и улучшения
              </Text>
              <TouchableOpacity
                onPress={() => {
                  useGameStore.getState().setRepairGarageOpen(true);
                  onClose();
                }}
                style={s.actionBtn}
              >
                <Text style={{ fontSize: 24 }}>🔧</Text>
                <Text style={s.actionBtnText}>Открыть гараж</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </View>

      {/* Modals */}
      <RepairGarageModal />
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    position: 'absolute' as any,
    inset: 0,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    position: 'absolute' as any,
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    // @ts-ignore
    backdropFilter: 'blur(12px)',
  },
  modal: {
    width: '90%',
    maxWidth: 600,
    maxHeight: '85vh',
    backgroundColor: '#161b22',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    // @ts-ignore
    boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    gap: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#e2e8f0',
  },
  headerSub: {
    fontSize: 11,
    color: '#06b6d4',
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    gap: 6,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  tabActive: {
    backgroundColor: 'rgba(6,182,212,0.15)',
    borderColor: 'rgba(6,182,212,0.3)',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#06b6d4',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#e2e8f0',
  },
  sectionDesc: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 20,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#1c2333',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  slotEmpty: {
    borderStyle: 'dashed' as any,
    borderColor: 'rgba(6,182,212,0.3)',
  },
  slotIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(6,182,212,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#e2e8f0',
  },
  slotSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(6,182,212,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
    marginTop: 12,
  },
  signInTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#e2e8f0',
    marginBottom: 6,
  },
  signInDesc: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderRadius: 10,
    // @ts-ignore
    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  signOutBtn: {
    paddingVertical: 12,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f87171',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    // @ts-ignore
    width: 'calc(33.33% - 7px)',
    minWidth: 90,
    padding: 12,
    backgroundColor: '#1c2333',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    backgroundColor: 'rgba(6,182,212,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#06b6d4',
  },
});
