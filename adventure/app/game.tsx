import { useEffect, useRef, useState, Component } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  useWindowDimensions, Platform,
} from 'react-native';

// Error boundary
class ErrorBoundary extends Component<{children: any; name: string}, {error: string | null}> {
  constructor(props: any) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e: any) { return { error: e?.message || String(e) }; }
  render() {
    if (this.state.error) {
      return <View style={{padding:20,backgroundColor:'#1a0000'}}><Text style={{color:'#f87171',fontSize:12}}>❌ {this.props.name}: {this.state.error}</Text></View>;
    }
    return this.props.children;
  }
}
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
import TruckDetailModal from '../components/TruckDetailModal';

type Tab = 'map' | 'loadboard' | 'email' | 'trucks';

const STATUS_COLOR: Record<string, string> = {
  idle: '#94a3b8', driving: '#38bdf8', loaded: '#4ade80',
  at_pickup: '#fbbf24', at_delivery: '#c084fc',
  breakdown: '#f87171', waiting: '#fb923c',
};
const STATUS_ICON: Record<string, string> = {
  idle: '⚪', driving: '🔵', loaded: '🟢',
  at_pickup: '🟡', at_delivery: '🟣',
  breakdown: '🔴', waiting: '🟠',
};
const STATUS_SHORT: Record<string, string> = {
  idle: 'Свободен', driving: 'К погрузке', loaded: 'В пути',
  at_pickup: 'Погрузка', at_delivery: 'Разгрузка',
  breakdown: 'Поломка', waiting: 'Detention',
};

export default function GameScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const {
    phase, gameMinute, balance, reputation,
    trucks, activeEvents, availableLoads, negotiation, bookedLoads, activeLoads,
    tickClock, selectedTruckId, selectTruck, notifications, sessionName, score, refreshLoadBoard,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [pendingLoad, setPendingLoad] = useState<ActiveLoad | null>(null);
  const [showFleet, setShowFleet] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showMyLoads, setShowMyLoads] = useState(false);
  const [detailTruck, setDetailTruck] = useState<any>(null);
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (availableLoads.length < 5) refreshLoadBoard();
  }, []);

  useEffect(() => {
    clockRef.current = setInterval(() => { tickClock(); }, 1000);
    return () => { if (clockRef.current) clearInterval(clockRef.current); };
  }, []);

  useEffect(() => {
    if (phase === 'shift_end') router.replace('/shift-end');
  }, [phase]);

  const progress = gameMinute / SHIFT_DURATION;
  const idleTrucks = trucks.filter(t => t.status === 'idle').length;
  const activeTrucks = trucks.filter(t => t.status === 'driving' || t.status === 'loaded').length;
  const totalLoads = bookedLoads.length + activeLoads.length;
  const emailNotifications = notifications.filter(n =>
    (n.type === 'email' || n.type === 'pod_ready' || n.type === 'rate_con' || n.type === 'detention') && !n.read
  );

  const tabs: { id: Tab; icon: string; label: string; badge?: number }[] = [
    { id: 'map',       icon: '🗺️',  label: 'Карта' },
    { id: 'loadboard', icon: '📋',  label: 'Грузы',  badge: availableLoads.length },
    { id: 'email',     icon: '📧',  label: 'Почта',  badge: emailNotifications.length || undefined },
    { id: 'trucks',    icon: '🚛',  label: 'Траки',  badge: idleTrucks > 0 ? idleTrucks : undefined },
  ];

  const isMobile = width < 600;

  // Обработчик клика на трак в HUD
  function handleTruckTabClick(truck: any) {
    selectTruck(truck.id);
    setDetailTruck(truck);
    if (!isWide) setActiveTab('map');
  }

  return (
    <View style={styles.container}>

      {/* ══════════════════════════════════════════════
          TOP HUD — полностью переработан
      ══════════════════════════════════════════════ */}
      <View style={[styles.hud, { paddingTop: Platform.OS === 'ios' ? 48 : 10 }]}>

        {/* ROW 1: время + баланс + кнопки */}
        <View style={styles.hudRow1}>

          {/* Кнопка назад */}
          <TouchableOpacity onPress={() => {
            if (clockRef.current) clearInterval(clockRef.current);
            router.replace('/');
          }} style={styles.hudBack}>
            <Text style={styles.hudBackText}>✕</Text>
          </TouchableOpacity>

          {/* Время + прогресс смены */}
          <View style={styles.hudTimeWrap}>
            <Text style={styles.hudTime}>{formatTimeDual(gameMinute)}</Text>
            {sessionName ? <Text style={styles.hudSession}>{sessionName}</Text> : null}
            {/* Прогресс смены — тонкая полоска */}
            <View style={styles.shiftBar}>
              <View style={[styles.shiftBarFill, { width: `${Math.min(progress * 100, 100)}%` as any }]} />
            </View>
          </View>

          {/* Статы */}
          <View style={styles.hudStats}>
            <View style={styles.hudStatChip}>
              <Text style={styles.hudStatEmoji}>💰</Text>
              <Text style={[styles.hudStatNum, { color: balance < 0 ? Colors.danger : '#4ade80' }]}>
                ${balance >= 1000 ? `${(balance/1000).toFixed(1)}k` : balance}
              </Text>
            </View>
            <View style={styles.hudStatChip}>
              <Text style={styles.hudStatEmoji}>📦</Text>
              <Text style={styles.hudStatNum}>{totalLoads}</Text>
            </View>
            <View style={styles.hudStatChip}>
              <Text style={styles.hudStatEmoji}>⭐</Text>
              <Text style={[styles.hudStatNum, {
                color: reputation > 70 ? '#4ade80' : reputation > 40 ? '#fbbf24' : '#f87171'
              }]}>{reputation}%</Text>
            </View>
          </View>

          {/* Уведомления + меню */}
          <View style={styles.hudActions}>
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

        {/* ROW 2: табы траков */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.truckTabsScroll}
          contentContainerStyle={styles.truckTabsContent}
        >
          {trucks.map(truck => {
            const color = STATUS_COLOR[truck.status] || '#94a3b8';
            const hos = Math.max(0, truck.hoursLeft);
            const hosRounded = Math.round(hos * 10) / 10;
            const hosColor = hos < 2 ? '#f87171' : hos < 4 ? '#fbbf24' : '#4ade80';
            const isSelected = selectedTruckId === truck.id;
            return (
              <TouchableOpacity
                key={truck.id}
                style={[styles.truckTab, isSelected && styles.truckTabSelected, { borderColor: isSelected ? color : 'rgba(255,255,255,0.08)' }]}
                onPress={() => handleTruckTabClick(truck)}
                activeOpacity={0.75}
              >
                {/* Статус dot */}
                <View style={[styles.truckDot, { backgroundColor: color }]} />
                {/* Имя */}
                <Text style={styles.truckTabName}>{truck.name.replace('Truck ', 'T')}</Text>
                {/* Статус */}
                <Text style={[styles.truckTabStatus, { color }]}>{STATUS_SHORT[truck.status]}</Text>
                {/* Маршрут если едет */}
                {truck.destinationCity ? (
                  <Text style={styles.truckTabRoute} numberOfLines={1}>→ {truck.destinationCity}</Text>
                ) : null}
                {/* HOS */}
                <View style={styles.truckTabHos}>
                  <Text style={[styles.truckTabHosText, { color: hosColor }]}>⏰ {hosRounded}h</Text>
                </View>
                {/* Прогресс если едет */}
                {(truck.status === 'driving' || truck.status === 'loaded') && (
                  <View style={styles.truckProgress}>
                    <View style={[styles.truckProgressFill, { width: `${Math.round(truck.progress * 100)}%` as any, backgroundColor: color }]} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

      </View>
      {/* ══════════════════════════════════════════════ */}

      {/* ── MAIN CONTENT ── */}
      {isWide ? (
        <View style={styles.desktopLayout}>
          <View style={styles.mapArea}>
            <ErrorBoundary name="MapView"><MapView /></ErrorBoundary>
          </View>
          <View style={styles.sidePanel}>
            <View style={styles.sideTabs}>
              {tabs.slice(1).map(tab => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.sideTab, activeTab === tab.id && styles.sideTabActive]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Text style={styles.sideTabIcon}>{tab.icon}</Text>
                  <Text style={[styles.sideTabText, activeTab === tab.id && styles.sideTabTextActive]}>{tab.label}</Text>
                  {tab.badge !== undefined && (
                    <View style={styles.badge}><Text style={styles.badgeText}>{tab.badge}</Text></View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.sidePanelContent}>
              {activeTab === 'loadboard' && <ErrorBoundary name="LoadBoardPanel"><LoadBoardPanel onNegotiate={setPendingLoad} /></ErrorBoundary>}
              {activeTab === 'email' && <ErrorBoundary name="EmailPanel"><EmailPanel /></ErrorBoundary>}
              {activeTab === 'trucks' && <ErrorBoundary name="TruckPanel"><TruckPanel onSwitchToLoadBoard={() => setActiveTab('loadboard')} /></ErrorBoundary>}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.mobileLayout}>
          {activeTab === 'map' && <ErrorBoundary name="MapView"><MapView /></ErrorBoundary>}
          {activeTab === 'loadboard' && <ErrorBoundary name="LoadBoardPanel"><LoadBoardPanel onNegotiate={setPendingLoad} /></ErrorBoundary>}
          {activeTab === 'email' && <ErrorBoundary name="EmailPanel"><EmailPanel /></ErrorBoundary>}
          {activeTab === 'trucks' && <ErrorBoundary name="TruckPanel"><TruckPanel onSwitchToLoadBoard={() => setActiveTab('loadboard')} /></ErrorBoundary>}

          <View style={styles.bottomTabs}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.bottomTab, activeTab === tab.id && styles.bottomTabActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={styles.bottomTabIcon}>{tab.icon}</Text>
                <Text style={[styles.bottomTabText, activeTab === tab.id && styles.bottomTabTextActive]}>{tab.label}</Text>
                {tab.badge !== undefined && (
                  <View style={styles.badge}><Text style={styles.badgeText}>{tab.badge}</Text></View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ── MODALS ── */}
      {negotiation.open && <ErrorBoundary name="NegotiationModal"><NegotiationModal onAssign={(load) => setPendingLoad(load)} /></ErrorBoundary>}
      {pendingLoad && !negotiation.open && (
        <ErrorBoundary name="AssignModal"><AssignModal load={pendingLoad} onClose={() => setPendingLoad(null)} /></ErrorBoundary>
      )}

      {/* Карточка трака при клике в HUD */}
      {detailTruck && (
        <TruckDetailModal
          truck={detailTruck}
          onClose={() => setDetailTruck(null)}
          onFindLoad={() => { setDetailTruck(null); setActiveTab('loadboard'); }}
        />
      )}

      {showFleet && (
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFleet(false)}>
          <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowFleet(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <FleetOverview />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
      {showCompliance && (
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCompliance(false)}>
          <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowCompliance(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <ComplianceDashboard />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
      {showEvents && (
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowEvents(false)}>
          <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowEvents(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <EventsPanel />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
      {showMyLoads && (
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowMyLoads(false)}>
          <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
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

  // ══ HUD ══
  hud: {
    backgroundColor: 'rgba(5,10,20,0.98)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(6,182,212,0.15)',
    paddingBottom: 0,
  },

  // Row 1
  hudRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 8,
    gap: 8,
  },
  hudBack: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  hudBackText: { fontSize: 12, color: Colors.textMuted },

  hudTimeWrap: { flex: 1, minWidth: 0 },
  hudTime: { fontSize: 14, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
  hudSession: { fontSize: 9, color: Colors.primary, fontWeight: '700', marginTop: 1 },
  shiftBar: {
    height: 3, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2, overflow: 'hidden', marginTop: 4,
  },
  shiftBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },

  hudStats: { flexDirection: 'row', gap: 6, flexShrink: 0 },
  hudStatChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  hudStatEmoji: { fontSize: 11 },
  hudStatNum: { fontSize: 12, fontWeight: '800', color: '#fff' },

  hudActions: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 },

  // Row 2 — truck tabs
  truckTabsScroll: { maxHeight: 80 },
  truckTabsContent: {
    paddingHorizontal: 8, paddingBottom: 8, gap: 6, flexDirection: 'row',
  },
  truckTab: {
    minWidth: 110, paddingHorizontal: 10, paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    gap: 2,
  },
  truckTabSelected: {
    backgroundColor: 'rgba(6,182,212,0.08)',
  },
  truckDot: { width: 7, height: 7, borderRadius: 4, position: 'absolute', top: 8, right: 8 },
  truckTabName: { fontSize: 12, fontWeight: '800', color: '#fff' },
  truckTabStatus: { fontSize: 10, fontWeight: '700' },
  truckTabRoute: { fontSize: 9, color: '#94a3b8', marginTop: 1 },
  truckTabHos: { marginTop: 2 },
  truckTabHosText: { fontSize: 9, fontWeight: '700' },
  truckProgress: {
    height: 3, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2, overflow: 'hidden', marginTop: 4,
  },
  truckProgressFill: { height: '100%', borderRadius: 2 },

  // Desktop
  desktopLayout: { flex: 1, flexDirection: 'row' },
  mapArea: { flex: 1 },
  sidePanel: {
    width: 420, borderLeftWidth: 1, borderLeftColor: Colors.border, flexDirection: 'column',
  },
  sideTabs: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: 'rgba(5,10,20,0.95)', paddingHorizontal: 6, paddingTop: 6, gap: 4,
  },
  sideTab: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    flexDirection: 'column', justifyContent: 'center', gap: 2,
    borderRadius: 10, marginBottom: 4,
  },
  sideTabActive: {
    backgroundColor: 'rgba(6,182,212,0.12)',
    borderWidth: 1, borderColor: 'rgba(6,182,212,0.35)',
  },
  sideTabIcon: { fontSize: 16 },
  sideTabText: { fontSize: 11, color: Colors.textDim, fontWeight: '700' },
  sideTabTextActive: { color: Colors.primary },
  sidePanelContent: { flex: 1 },

  // Mobile
  mobileLayout: { flex: 1 },
  bottomTabs: {
    flexDirection: 'row',
    borderTopWidth: 1, borderTopColor: 'rgba(6,182,212,0.2)',
    backgroundColor: 'rgba(5,10,20,0.98)',
    paddingBottom: Platform.OS === 'ios' ? 24 : 6,
    paddingTop: 6, paddingHorizontal: 8, gap: 6,
  },
  bottomTab: {
    flex: 1, paddingVertical: 8, alignItems: 'center',
    flexDirection: 'column', justifyContent: 'center', gap: 3,
    borderRadius: 14, borderWidth: 1, borderColor: 'transparent',
  },
  bottomTabActive: {
    backgroundColor: 'rgba(6,182,212,0.12)', borderColor: 'rgba(6,182,212,0.35)',
  },
  bottomTabIcon: { fontSize: 18 },
  bottomTabText: { fontSize: 11, color: Colors.textDim, fontWeight: '700' },
  bottomTabTextActive: { color: Colors.primary },

  badge: {
    backgroundColor: Colors.primary, borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 1, minWidth: 16, alignItems: 'center',
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },

  modalOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.bgCard, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border,
    width: '100%', maxWidth: 600, maxHeight: '80%', position: 'relative',
  },
  modalClose: {
    position: 'absolute', top: 12, right: 12,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modalCloseText: { fontSize: 18, color: Colors.textMuted },
});

