import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  useWindowDimensions, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { useGameStore, formatGameTime, formatTimeDual, ActiveLoad } from '../store/gameStore';
import { SHIFT_DURATION } from '../constants/config';
import MapView from '../components/MapView';
import TruckPanel from '../components/TruckPanel';
import LoadBoardPanel from '../components/LoadBoardPanel';
import EventsPanel from '../components/EventsPanel';
import NegotiationModal from '../components/NegotiationModal';
import AssignModal from '../components/AssignModal';
import MyLoadsPanel from '../components/MyLoadsPanel';
import EmailPanel from '../components/EmailPanel';
import NotificationBell from '../components/NotificationBell';
import ComplianceDashboard from '../components/ComplianceDashboard';
import FleetOverview from '../components/FleetOverview';
import GameMenu from '../components/GameMenu';

type Tab = 'map' | 'loadboard' | 'email' | 'trucks';

export default function GameScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const {
    phase, gameMinute, balance, reputation,
    trucks, activeEvents, availableLoads, negotiation, bookedLoads, activeLoads,
    tickClock, selectedTruckId, notifications,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [pendingLoad, setPendingLoad] = useState<ActiveLoad | null>(null);
  const [showFleet, setShowFleet] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showMyLoads, setShowMyLoads] = useState(false);
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Игровые часы — всегда идут
  useEffect(() => {
    clockRef.current = setInterval(() => {
      tickClock();
    }, 1000); // каждую реальную секунду
    
    return () => { if (clockRef.current) clearInterval(clockRef.current); };
  }, []);

  // Редирект на финиш
  useEffect(() => {
    if (phase === 'shift_end') {
      router.replace('/shift-end');
    }
  }, [phase]);

  const progress = gameMinute / SHIFT_DURATION;
  const idleTrucks = trucks.filter(t => t.status === 'idle').length;
  const activeTrucks = trucks.filter(t => t.status === 'driving' || t.status === 'loaded').length;
  const totalLoads = bookedLoads.length + activeLoads.length;
  
  // Получаем выбранный трак или первый трак для HOS
  const selectedTruck = trucks.find(t => t.id === selectedTruckId) || trucks[0];
  const hosHoursUsed = selectedTruck ? (11 - selectedTruck.hoursLeft) : 0;
  const hosProgress = (hosHoursUsed / 11) * 100;
  const hosColor = selectedTruck?.hoursLeft < 2 ? Colors.danger : selectedTruck?.hoursLeft < 4 ? Colors.warning : Colors.success;

  // Считаем непрочитанные email-уведомления
  const emailNotifications = notifications.filter(n => 
    (n.type === 'email' || n.type === 'pod_ready' || n.type === 'rate_con' || n.type === 'detention') && !n.read
  );

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'map', label: '🗺️ Карта' },
    { id: 'loadboard', label: '📋 Грузы', badge: availableLoads.length },
    { id: 'email', label: '📧 Почта', badge: emailNotifications.length || undefined },
    { id: 'trucks', label: '🚛 Траки', badge: idleTrucks > 0 ? idleTrucks : undefined },
  ];

  const isMobile = width < 500;
  const isMid = width >= 500 && width < 800;

  return (
    <View style={styles.container}>

      {/* ── TOP HUD ── */}
      <View style={[styles.hud, { paddingTop: Platform.OS === 'ios' ? 50 : 28 }]}>

        {/* ЛЕВАЯ ЧАСТЬ: кнопка назад + время + прогресс */}
        <View style={styles.hudLeft}>
          <TouchableOpacity onPress={() => {
            if (clockRef.current) clearInterval(clockRef.current);
            router.replace('/');
          }} style={styles.hudBack}>
            <Text style={styles.hudBackText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.hudTimeBlock}>
            <Text style={[styles.hudTimeText, isMobile && { fontSize: 13 }]}>
              {formatTimeDual(gameMinute)}
            </Text>
            <View style={styles.hudBars}>
              {/* Shift progress */}
              <View style={styles.hudBarTrack}>
                <View style={[styles.hudBarFill, { width: `${progress * 100}%`, backgroundColor: Colors.primary }]} />
              </View>
              {/* HOS */}
              <View style={styles.hudBarTrack}>
                <View style={[styles.hudBarFill, { width: `${hosProgress}%`, backgroundColor: hosColor }]} />
              </View>
              {!isMobile && (
                <Text style={styles.hudHosLabel}>
                  HOS {selectedTruck?.driver.split(' ')[0] || 'Driver'}: {selectedTruck?.hoursLeft || 11}h
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* ЦЕНТР: статы */}
        <View style={styles.hudCenter}>
          <View style={styles.hudStat}>
            <Text style={[styles.hudStatVal, { color: balance < 0 ? Colors.danger : '#fff' }]}>
              ${Math.floor(balance / 1000)}k
            </Text>
            <Text style={styles.hudStatIcon}>💰</Text>
          </View>

          <View style={styles.hudDivider} />

          <View style={styles.hudStat}>
            <Text style={[styles.hudStatVal, { color: activeTrucks > 0 ? Colors.success : Colors.textMuted }]}>
              {activeTrucks}/{trucks.length}
            </Text>
            <Text style={styles.hudStatIcon}>🚛</Text>
          </View>

          {!isMobile && (
            <>
              <View style={styles.hudDivider} />
              <View style={styles.hudStat}>
                <Text style={[styles.hudStatVal, { color: totalLoads > 0 ? Colors.primary : Colors.textMuted }]}>
                  {totalLoads}
                </Text>
                <Text style={styles.hudStatIcon}>📦</Text>
              </View>
            </>
          )}

          {!isMobile && !isMid && (
            <>
              <View style={styles.hudDivider} />
              <View style={styles.hudStat}>
                <Text style={[styles.hudStatVal, {
                  color: reputation > 70 ? Colors.success : reputation > 40 ? Colors.warning : Colors.danger
                }]}>
                  {reputation}%
                </Text>
                <Text style={styles.hudStatIcon}>⭐</Text>
              </View>
            </>
          )}
        </View>

        {/* ПРАВАЯ ЧАСТЬ: уведомления + меню */}
        <View style={styles.hudRight}>
          <NotificationBell
            onNavigateToTrucks={() => setActiveTab('trucks')}
            onNavigateToLoads={() => setActiveTab('email')}
            onNavigateToEvents={() => setShowEvents(true)}
          />
          <GameMenu
            onOpenFleet={() => setShowFleet(true)}
            onOpenCompliance={() => setShowCompliance(true)}
            onOpenEvents={() => setShowEvents(true)}
            onOpenMyLoads={() => setShowMyLoads(true)}
          />
        </View>
      </View>

      {/* ── MAIN CONTENT ── */}
      {isWide ? (
        // DESKTOP: карта слева, панели справа
        <View style={styles.desktopLayout}>
          <View style={styles.mapArea}>
            <MapView />
          </View>
          <View style={styles.sidePanel}>
            {/* Табы */}
            <View style={styles.sideTabs}>
              {tabs.slice(1).map(tab => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.sideTab, activeTab === tab.id && styles.sideTabActive]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Text style={[styles.sideTabText, activeTab === tab.id && styles.sideTabTextActive]}>
                    {tab.label}
                  </Text>
                  {tab.badge !== undefined && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{tab.badge}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.sidePanelContent}>
              {activeTab === 'loadboard' && <LoadBoardPanel onNegotiate={setPendingLoad} />}
              {activeTab === 'email' && <EmailPanel />}
              {activeTab === 'trucks' && <TruckPanel />}
            </View>
          </View>
        </View>
      ) : (
        // MOBILE: табы снизу
        <View style={styles.mobileLayout}>
          {activeTab === 'map' && <MapView />}
          {activeTab === 'loadboard' && <LoadBoardPanel onNegotiate={setPendingLoad} />}
          {activeTab === 'email' && <EmailPanel />}
          {activeTab === 'trucks' && <TruckPanel />}

          {/* Bottom tabs */}
          <View style={styles.bottomTabs}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.bottomTab, activeTab === tab.id && styles.bottomTabActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={styles.bottomTabText}>{tab.label}</Text>
                {tab.badge !== undefined && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tab.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ── MODALS ── */}
      {negotiation.open && <NegotiationModal onAssign={(load) => setPendingLoad(load)} />}
      {pendingLoad && !negotiation.open && (
        <AssignModal load={pendingLoad} onClose={() => setPendingLoad(null)} />
      )}
      
      {/* Модалки из меню */}
      {showFleet && (
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowFleet(false)}
        >
          <TouchableOpacity 
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowFleet(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <FleetOverview />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
      
      {showCompliance && (
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCompliance(false)}
        >
          <TouchableOpacity 
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowCompliance(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <ComplianceDashboard />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
      
      {showEvents && (
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEvents(false)}
        >
          <TouchableOpacity 
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowEvents(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <EventsPanel />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
      
      {showMyLoads && (
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMyLoads(false)}
        >
          <TouchableOpacity 
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowMyLoads(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <MyLoadsPanel />
          </TouchableOpacity>
        </TouchableOpacity>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  // ── HUD ──
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 8,
    backgroundColor: 'rgba(5,10,20,0.97)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  hudLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  hudBack: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  hudBackText: { fontSize: 12, color: Colors.textMuted },
  hudTimeBlock: {
    flex: 1,
    minWidth: 0,
  },
  hudTimeText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  hudBars: {
    gap: 3,
    flexDirection: 'column',
  },
  hudBarTrack: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  hudBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  hudHosLabel: {
    fontSize: 8,
    color: Colors.textDim,
    fontWeight: '700',
    marginTop: 1,
  },

  // Центр — статы
  hudCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    flexShrink: 0,
  },
  hudStat: {
    alignItems: 'center',
    gap: 1,
  },
  hudStatVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 15,
  },
  hudStatIcon: {
    fontSize: 9,
    lineHeight: 11,
  },
  hudDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 2,
  },

  // Правая часть
  hudRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },

  // Desktop
  desktopLayout: { flex: 1, flexDirection: 'row' },
  mapArea: { flex: 1 },
  sidePanel: { 
    width: 380,
    borderLeftWidth: 1, 
    borderLeftColor: Colors.border, 
    flexDirection: 'column' 
  },
  sideTabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border },
  sideTab: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 4,
  },
  sideTabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  sideTabText: { fontSize: 11, color: Colors.textDim, fontWeight: '600' },
  sideTabTextActive: { color: Colors.primary },
  sidePanelContent: { flex: 1 },

  // Mobile
  mobileLayout: { flex: 1 },
  bottomTabs: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: 'rgba(5,10,20,0.98)',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  bottomTab: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 4,
  },
  bottomTabActive: { borderTopWidth: 2, borderTopColor: Colors.primary },
  bottomTabText: { fontSize: 11, color: Colors.textDim, fontWeight: '600' },

  badge: {
    backgroundColor: Colors.primary, borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 1, minWidth: 16, alignItems: 'center',
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },

  // Модалки из меню
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
    maxWidth: 600,
    maxHeight: '80%',
    position: 'relative',
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalCloseText: {
    fontSize: 18,
    color: Colors.textMuted,
  },
});
