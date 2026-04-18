import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { useGameStore, formatGameTime } from '../store/gameStore';
import { useAccountStore } from '../store/accountStore';
import { shouldShowGuide } from './WelcomePopup';

interface GameMenuProps {
  onOpenFleet?: () => void;
  onOpenCompliance?: () => void;
  onOpenEvents?: () => void;
  onOpenMyLoads?: () => void;
  onOpenStats?: () => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  onOpenGuide?: () => void;
  onExit?: () => void;
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function GameMenu({ onOpenFleet, onOpenCompliance, onOpenEvents, onOpenMyLoads, onOpenStats, onOpenSettings, onOpenHelp, onOpenGuide, onExit, forceOpen, onClose }: GameMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const router = useRouter();
  const { gameMinute, balance, reputation, trucks, activeLoads, bookedLoads, activeEvents } = useGameStore();
  const { logout } = useAccountStore();

  const open = isOpen || !!forceOpen;
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => { setIsOpen(false); onClose?.(); };

  const activeTrucks = trucks.filter(t => t.status === 'driving' || t.status === 'loaded').length;
  const totalLoads = bookedLoads.length + activeLoads.length;
  const guideActive = shouldShowGuide(); // гайд ещё не пройден

  const menuItems = [
    {
      icon: '📖',
      label: 'Гайд диспетчера',
      action: () => { handleClose(); onOpenGuide?.(); },
      color: '#818cf8',
      badge: undefined,
      isGuide: true,
    },
    { 
      icon: '🚛', 
      label: 'Fleet Overview', 
      action: () => { handleClose(); onOpenFleet?.(); },
      color: Colors.primary,
      badge: activeTrucks,
      isGuide: false,
    },
    { 
      icon: '📦', 
      label: 'Мои грузы', 
      action: () => { handleClose(); onOpenMyLoads?.(); },
      color: Colors.success,
      badge: bookedLoads.filter(l => !l.truckId).length || undefined,
      isGuide: false,
    },
    { 
      icon: '📊', 
      label: 'HOS & Compliance', 
      action: () => { handleClose(); onOpenCompliance?.(); },
      color: Colors.warning,
      badge: trucks.filter(t => t.hoursLeft < 4 || t.hosViolations > 0).length || undefined,
      isGuide: false,
    },
    { 
      icon: '⚡', 
      label: 'События', 
      action: () => { handleClose(); onOpenEvents?.(); },
      color: Colors.danger,
      badge: activeEvents.filter(e => e.urgency === 'critical' || e.urgency === 'high').length || undefined,
      isGuide: false,
    },
    { 
      icon: '📈', 
      label: 'Статистика', 
      action: () => { handleClose(); onOpenStats?.(); },
      color: Colors.success,
      isGuide: false,
    },
    { 
      icon: '⚙️', 
      label: 'Настройки', 
      action: () => { handleClose(); onOpenSettings?.(); },
      color: Colors.textMuted,
      isGuide: false,
    },
    { 
      icon: '❓', 
      label: 'Помощь', 
      action: () => { handleClose(); onOpenHelp?.(); },
      color: Colors.warning,
      isGuide: false,
    },
    { 
      icon: '🚪', 
      label: 'Выйти из игры', 
      action: () => { setShowExitConfirm(true); },
      color: Colors.danger,
      isGuide: false,
    },
  ];

  function handleExitToMenu() {
    setShowExitConfirm(false);
    handleClose();
    onExit?.();
    // Очищаем сохранение игры чтобы не было автоперехода обратно
    try { localStorage.removeItem('dispatcher-game-save'); } catch {}
    router.replace('/');
  }

  function handleExitAndLogout() {
    setShowExitConfirm(false);
    handleClose();
    onExit?.();
    try { localStorage.removeItem('dispatcher-game-save'); } catch {}
    logout();
    router.replace('/');
  }

  return (
    <>
      {/* Hamburger Button — скрыта, управляется из TopBar */}

      {/* Menu Modal */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        {/* Overlay */}
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={handleClose}
        />

        {/* Menu Panel */}
        <View style={styles.menuPanel}>
          {/* Header */}
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Меню</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Game Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>⏰ Время:</Text>
              <Text style={styles.statValue}>{formatGameTime(gameMinute)}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>💰 Баланс:</Text>
              <Text style={[styles.statValue, { color: Colors.success }]}>
                ${balance.toLocaleString()}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>⭐ Репутация:</Text>
              <Text style={[styles.statValue, { 
                color: reputation > 70 ? Colors.success : reputation > 40 ? Colors.warning : Colors.danger 
              }]}>
                {reputation}%
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>🚛 Траки:</Text>
              <Text style={styles.statValue}>{activeTrucks}/{trucks.length}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>📦 Грузы:</Text>
              <Text style={styles.statValue}>{totalLoads}</Text>
            </View>
          </View>

          {/* Menu Items */}
          <ScrollView style={styles.menuItems} showsVerticalScrollIndicator={false}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  item.isGuide && {
                    backgroundColor: 'rgba(129,140,248,0.1)',
                    borderColor: guideActive ? 'rgba(129,140,248,0.5)' : 'rgba(129,140,248,0.25)',
                    marginBottom: 14,
                  },
                ]}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemIcon}>{item.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      styles.menuItemLabel,
                      item.isGuide && { color: '#c7d2fe', fontWeight: '800' },
                    ]}>
                      {item.label}
                    </Text>
                    {item.isGuide && (
                      <Text style={{ fontSize: 11, color: guideActive ? '#818cf8' : '#4ade80', fontWeight: '600', marginTop: 1 }}>
                        {guideActive ? '● В процессе — продолжи обучение' : '✓ Пройден — можно повторить'}
                      </Text>
                    )}
                  </View>
                  {item.badge !== undefined && item.badge > 0 && (
                    <View style={[styles.menuBadge, { backgroundColor: item.color }]}>
                      <Text style={styles.menuBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                  {item.isGuide && guideActive && (
                    <View style={{
                      width: 8, height: 8, borderRadius: 4,
                      backgroundColor: '#818cf8',
                      marginLeft: 6,
                      shadowColor: '#818cf8', shadowOpacity: 1, shadowRadius: 4,
                    } as any} />
                  )}
                </View>
                <Text style={[styles.menuItemArrow, { color: item.color }]}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.menuFooter}>
            <Text style={styles.footerText}>Dispatcher Training Game v1.0</Text>
          </View>
        </View>

        {/* Exit Confirmation — поверх панели, внутри того же Modal */}
        {showExitConfirm && (
          <>
            <TouchableOpacity
              style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 100 }]}
              activeOpacity={1}
              onPress={() => setShowExitConfirm(false)}
            />
            <View style={[styles.exitConfirmWrap, { zIndex: 101 }]}>
              <TouchableOpacity activeOpacity={1} style={styles.exitConfirmPanel}>
                <Text style={styles.exitConfirmTitle}>🚪 Выйти из игры?</Text>
                <Text style={styles.exitConfirmSub}>Прогресс текущей смены будет потерян.</Text>

                <TouchableOpacity style={styles.exitBtnMenu} onPress={handleExitToMenu} activeOpacity={0.8}>
                  <Text style={styles.exitBtnMenuText}>🏠 Выйти в главное меню</Text>
                  <Text style={styles.exitBtnMenuSub}>аккаунт сохранится</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.exitBtnLogout} onPress={handleExitAndLogout} activeOpacity={0.8}>
                  <Text style={styles.exitBtnLogoutText}>🔄 Сменить учётную запись</Text>
                  <Text style={styles.exitBtnLogoutSub}>выйти и войти под другим никнеймом</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.exitBtnCancel} onPress={() => setShowExitConfirm(false)} activeOpacity={0.7}>
                  <Text style={styles.exitBtnCancelText}>Отмена</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Modal>

    </>
  );
}

const styles = StyleSheet.create({
  hamburger: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(56,189,248,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(56,189,248,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    padding: 10,
  },
  hamburgerLine: {
    width: 20,
    height: 2.5,
    backgroundColor: '#38bdf8',
    borderRadius: 2,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  menuPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '85%',
    maxWidth: 400,
    height: '100%',
    backgroundColor: 'rgba(15,23,42,0.98)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: Colors.textMuted,
  },

  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '800',
  },

  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 20,
  },
  menuItemLabel: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
    flex: 1,
  },
  menuBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  menuBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
  menuItemArrow: {
    fontSize: 24,
    fontWeight: '300',
  },

  menuFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: Colors.textDim,
    fontWeight: '600',
  },

  // Exit Confirm
  exitConfirmWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 101,
  },
  exitConfirmPanel: {
    width: 320,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
  },
  exitConfirmTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 2,
  },
  exitConfirmSub: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 8,
  },
  exitBtnMenu: {
    backgroundColor: 'rgba(56,189,248,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.3)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 3,
  },
  exitBtnMenuText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#38bdf8',
  },
  exitBtnMenuSub: {
    fontSize: 11,
    color: '#94a3b8',
  },
  exitBtnLogout: {
    backgroundColor: 'rgba(251,191,36,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.25)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 3,
  },
  exitBtnLogoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fbbf24',
  },
  exitBtnLogoutSub: {
    fontSize: 11,
    color: '#94a3b8',
  },
  exitBtnCancel: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  exitBtnCancelText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
});
