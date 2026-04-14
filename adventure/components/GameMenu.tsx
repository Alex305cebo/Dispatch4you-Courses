import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { useGameStore, formatGameTime } from '../store/gameStore';

interface GameMenuProps {
  onOpenFleet?: () => void;
  onOpenCompliance?: () => void;
  onOpenEvents?: () => void;
  onOpenMyLoads?: () => void;
}

export default function GameMenu({ onOpenFleet, onOpenCompliance, onOpenEvents, onOpenMyLoads }: GameMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { gameMinute, balance, reputation, trucks, activeLoads, bookedLoads, activeEvents } = useGameStore();

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
  };

  const activeTrucks = trucks.filter(t => t.status === 'driving' || t.status === 'loaded').length;
  const totalLoads = bookedLoads.length + activeLoads.length;

  const menuItems = [
    { 
      icon: '🚛', 
      label: 'Fleet Overview', 
      action: () => { handleClose(); onOpenFleet?.(); },
      color: Colors.primary,
      badge: activeTrucks
    },
    { 
      icon: '📦', 
      label: 'Мои грузы', 
      action: () => { handleClose(); onOpenMyLoads?.(); },
      color: Colors.success,
      badge: bookedLoads.filter(l => !l.truckId).length || undefined
    },
    { 
      icon: '📊', 
      label: 'HOS & Compliance', 
      action: () => { handleClose(); onOpenCompliance?.(); },
      color: Colors.warning,
      badge: trucks.filter(t => t.hoursLeft < 4 || t.hosViolations > 0).length || undefined
    },
    { 
      icon: '⚡', 
      label: 'События', 
      action: () => { handleClose(); onOpenEvents?.(); },
      color: Colors.danger,
      badge: activeEvents.filter(e => e.urgency === 'critical' || e.urgency === 'high').length || undefined
    },
    { 
      icon: '📈', 
      label: 'Статистика', 
      action: () => { handleClose(); /* TODO: открыть статистику */ },
      color: Colors.success 
    },
    { 
      icon: '⚙️', 
      label: 'Настройки', 
      action: () => { handleClose(); /* TODO: открыть настройки */ },
      color: Colors.textMuted 
    },
    { 
      icon: '❓', 
      label: 'Помощь', 
      action: () => { handleClose(); /* TODO: открыть помощь */ },
      color: Colors.warning 
    },
    { 
      icon: '🚪', 
      label: 'Выйти из игры', 
      action: () => { handleClose(); router.replace('/'); },
      color: Colors.danger 
    },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <TouchableOpacity 
        style={styles.hamburger} 
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        visible={isOpen}
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
                style={styles.menuItem}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemIcon}>{item.icon}</Text>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  {item.badge !== undefined && item.badge > 0 && (
                    <View style={[styles.menuBadge, { backgroundColor: item.color }]}>
                      <Text style={styles.menuBadgeText}>{item.badge}</Text>
                    </View>
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
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  hamburger: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
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
});
