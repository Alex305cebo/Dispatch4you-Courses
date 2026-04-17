import { useEffect, useRef, useState, Component } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  useWindowDimensions, Platform,
} from 'react-native';

class ErrorBoundary extends Component<{children: any; name: string}, {error: string | null}> {
  constructor(props: any) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e: any) { return { error: e?.message || String(e) }; }
  render() {
    if (this.state.error) {
      return <View style={{padding:20,backgroundColor:'#1a0000'}}><Text style={{color:'#f87171',fontSize:12}}>Error: {this.state.error}</Text></View>;
    }
    return this.props.children;
  }
}

import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { useGameStore, formatGameTime, formatTimeDual, formatTimeShort, ActiveLoad } from '../store/gameStore';
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
import DeliveryResultPopup from '../components/DeliveryResultPopup';
import ShiftEndPopup from '../components/ShiftEndPopup';
import StatsPopup from '../components/StatsPopup';
import SettingsPopup from '../components/SettingsPopup';
import HelpPopup from '../components/HelpPopup';

type Tab = 'map' | 'loadboard' | 'email' | 'trucks';

const STATUS_COLOR: Record<string, string> = {
  idle: '#64748b', driving: '#38bdf8', loaded: '#34d399',
  at_pickup: '#fbbf24', at_delivery: '#a78bfa',
  breakdown: '#f87171', waiting: '#fb923c',
};
const STATUS_LABEL: Record<string, string> = {
  idle: 'Свободен', driving: 'К погрузке', loaded: 'В пути',
  at_pickup: 'Погрузка', at_delivery: 'Разгрузка',
  breakdown: 'Поломка', waiting: 'Detention',
};

function getTruckColor(truck: any): string {
  const outOfOrder = (truck as any).outOfOrderUntil;
  if (outOfOrder && typeof outOfOrder === 'number' && outOfOrder > 0) return '#ff0000';
  const w = (truck as any).idleWarningLevel ?? 0;
  if (w === 3) return '#ef4444';
  if (w === 2) return '#f97316';
  if (w === 1) return '#fbbf24';
  return STATUS_COLOR[truck.status] || '#64748b';
}

export default function GameScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const {
    phase, gameMinute, balance, reputation,
    trucks, availableLoads, negotiation, bookedLoads, activeLoads,
    tickClock, selectedTruckId, selectTruck, notifications, sessionName,
    refreshLoadBoard, setLoadBoardSearch, timeSpeed, setTimeSpeed, loadGame,
    deliveryResults,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<Tab>(() => {
    try {
      const saved = localStorage.getItem('dispatch-active-tab') as Tab;
      if (saved) return saved;
    } catch {}
    // Десктоп (≥900px) → trucks, мобильный → map
    return (typeof window !== 'undefined' && window.innerWidth >= 900) ? 'trucks' : 'map';
  });

  // Сохраняем активную вкладку при каждом переключении
  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    try { localStorage.setItem('dispatch-active-tab', tab); } catch {}
  };
  const [pendingLoad, setPendingLoad] = useState<ActiveLoad | null>(null);
  const [showFleet, setShowFleet] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showMyLoads, setShowMyLoads] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [detailTruck, setDetailTruck] = useState<any>(null);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // При рефреше — восстанавливаем сохранение только если phase === 'menu' (store в дефолтном состоянии)
    if (phase === 'menu') {
      const loaded = loadGame();
      if (!loaded) {
        setTimeout(() => router.replace('/'), 100);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (availableLoads.length < 5) refreshLoadBoard(); }, []);
  useEffect(() => {
    clockRef.current = setInterval(() => tickClock(), 1000);
    return () => { if (clockRef.current) clearInterval(clockRef.current); };
  }, []);
  useEffect(() => {
    // Автосохранение каждые 30 секунд
    const saveInterval = setInterval(() => {
      if (useGameStore.getState().phase === 'playing') {
        useGameStore.getState().saveGame();
      }
    }, 30000);
    return () => clearInterval(saveInterval);
  }, []);
  useEffect(() => {
    const fn = () => useGameStore.getState().saveGame();
    window.addEventListener('beforeunload', fn);
    return () => window.removeEventListener('beforeunload', fn);
  }, []);
  // shift_end теперь показывается как попап поверх карты (ShiftEndPopup)

  const progress = gameMinute / SHIFT_DURATION;
  const idleTrucks = trucks.filter(t => t.status === 'idle').length;
  const totalLoads = bookedLoads.length + activeLoads.length;
  const unreadEmails = notifications.filter(n =>
    ['email','pod_ready','rate_con','detention'].includes(n.type) && !n.read
  ).length;

  function handleTruckClick(truck: any) {
    selectTruck(truck.id);
    setDetailTruck(truck);
    if (!isWide) switchTab('map');
    window.dispatchEvent(new CustomEvent('zoomToTruck', {
      detail: { lng: truck.position[0], lat: truck.position[1] }
    }));
  }

  const tabs: { id: Tab; label: string; badge?: number; onPress?: () => void }[] = [
    { id: 'loadboard', label: 'Грузы',  badge: availableLoads.length },
    { id: 'email',     label: 'Почта',  badge: unreadEmails || undefined, onPress: () => setShowEmail(true) },
    { id: 'trucks',    label: 'Траки',  badge: idleTrucks > 0 ? idleTrucks : undefined },
  ];

  // ── TOP BAR ──────────────────────────────────────────────────────────────
  const TopBar = () => {
    const hosWarnings = trucks.filter(t => (t as any).idleWarningLevel > 0 || t.hoursLeft < 3).length;
    const progressPct = Math.min(progress * 100, 100);
    const timeColor = progressPct > 80 ? '#f87171' : progressPct > 60 ? '#fbbf24' : '#38bdf8';

    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        height: 56, paddingLeft: 16, paddingRight: 12,
        background: 'linear-gradient(180deg, rgba(15,25,50,0.98) 0%, rgba(10,18,38,0.98) 100%)',
        borderBottom: '1px solid rgba(56,189,248,0.12)',
        boxShadow: '0 1px 20px rgba(0,0,0,0.4)',
        position: 'relative', overflow: 'hidden',
        fontFamily: 'sans-serif',
      } as any}>

        {/* Фоновое свечение */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(56,189,248,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        } as any} />

        {/* Время */}
        <div style={{ minWidth: 80, flexShrink: 0 } as any}>
          <div style={{
            fontSize: 20, fontWeight: 900, color: '#fff',
            letterSpacing: 0.5, lineHeight: 1,
            textShadow: `0 0 20px ${timeColor}88`,
          } as any}>{formatTimeShort(gameMinute)}</div>
          {sessionName ? (
            <div style={{ fontSize: 9, color: '#38bdf8', fontWeight: 700, marginTop: 2, opacity: 0.8 } as any}>
              {sessionName}
            </div>
          ) : null}
        </div>

        {/* Прогресс смены */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 } as any}>
          {/* Трек */}
          <div style={{
            height: 6, background: 'rgba(255,255,255,0.06)',
            borderRadius: 3, overflow: 'hidden', position: 'relative',
          } as any}>
            <div style={{
              height: '100%', width: `${progressPct}%`,
              background: `linear-gradient(90deg, #0ea5e9, ${timeColor})`,
              borderRadius: 3,
              boxShadow: `0 0 8px ${timeColor}88`,
              transition: 'width 0.5s ease',
            } as any} />
            {/* Маркеры часов */}
            {[25, 50, 75].map(p => (
              <div key={p} style={{
                position: 'absolute', top: 0, bottom: 0,
                left: `${p}%`, width: 1,
                background: 'rgba(255,255,255,0.15)',
              } as any} />
            ))}
          </div>
          {/* Кнопки скорости */}
          <div style={{ display: 'flex', gap: 4 } as any}>
            {([1, 2, 5] as const).map(sp => (
              <button key={sp}
                onClick={() => setTimeSpeed(sp)}
                style={{
                  padding: '2px 9px',
                  background: timeSpeed === sp
                    ? 'linear-gradient(135deg, rgba(56,189,248,0.25), rgba(14,165,233,0.15))'
                    : 'rgba(255,255,255,0.04)',
                  border: timeSpeed === sp ? '1px solid rgba(56,189,248,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 6, cursor: 'pointer',
                  fontSize: 10, fontWeight: 800,
                  color: timeSpeed === sp ? '#38bdf8' : '#475569',
                  boxShadow: timeSpeed === sp ? '0 0 8px rgba(56,189,248,0.2)' : 'none',
                  transition: 'all 0.15s',
                } as any}>
                {sp === 1 ? '×1' : sp === 2 ? '×2' : '×5'}
              </button>
            ))}
          </div>
        </div>

        {/* Статы */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 } as any}>
          {/* Баланс */}
          <div style={{
            padding: '5px 10px',
            background: balance >= 0
              ? 'linear-gradient(135deg, rgba(52,211,153,0.12), rgba(16,185,129,0.06))'
              : 'linear-gradient(135deg, rgba(248,113,113,0.12), rgba(239,68,68,0.06))',
            border: `1px solid ${balance >= 0 ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
            borderRadius: 10,
            boxShadow: balance >= 0 ? '0 0 12px rgba(52,211,153,0.08)' : 'none',
          } as any}>
            <div style={{ fontSize: 9, color: '#64748b', fontWeight: 600, marginBottom: 1 } as any}>БАЛАНС</div>
            <div style={{
              fontSize: 13, fontWeight: 900,
              color: balance >= 0 ? '#34d399' : '#f87171',
            } as any}>
              ${balance >= 1000 ? `${(balance/1000).toFixed(1)}k` : balance.toLocaleString()}
            </div>
          </div>

          {/* Грузы */}
          <div style={{
            padding: '5px 10px',
            background: 'linear-gradient(135deg, rgba(56,189,248,0.1), rgba(14,165,233,0.05))',
            border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: 10,
          } as any}>
            <div style={{ fontSize: 9, color: '#64748b', fontWeight: 600, marginBottom: 1 } as any}>ГРУЗЫ</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#38bdf8' } as any}>{totalLoads}</div>
          </div>

          {/* Репутация */}
          <div style={{
            padding: '5px 10px',
            background: reputation > 70
              ? 'linear-gradient(135deg, rgba(52,211,153,0.1), rgba(16,185,129,0.05))'
              : reputation > 40
              ? 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(245,158,11,0.05))'
              : 'linear-gradient(135deg, rgba(248,113,113,0.1), rgba(239,68,68,0.05))',
            border: `1px solid ${reputation > 70 ? 'rgba(52,211,153,0.2)' : reputation > 40 ? 'rgba(251,191,36,0.2)' : 'rgba(248,113,113,0.2)'}`,
            borderRadius: 10,
          } as any}>
            <div style={{ fontSize: 9, color: '#64748b', fontWeight: 600, marginBottom: 1 } as any}>РЕПУТ.</div>
            <div style={{
              fontSize: 13, fontWeight: 900,
              color: reputation > 70 ? '#34d399' : reputation > 40 ? '#fbbf24' : '#f87171',
            } as any}>{reputation}%</div>
          </div>

          {/* Предупреждения HOS */}
          {hosWarnings > 0 && (
            <div style={{
              padding: '5px 10px',
              background: 'linear-gradient(135deg, rgba(248,113,113,0.15), rgba(239,68,68,0.08))',
              border: '1px solid rgba(248,113,113,0.35)',
              borderRadius: 10,
              boxShadow: '0 0 12px rgba(248,113,113,0.15)',
              animation: 'pulse 1.5s infinite',
            } as any}>
              <div style={{ fontSize: 9, color: '#f87171', fontWeight: 600, marginBottom: 1 } as any}>⚠️ HOS</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#f87171' } as any}>{hosWarnings}</div>
            </div>
          )}
        </div>

        {/* Действия */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 } as any}>
          <button
            onClick={() => useGameStore.getState().testDeliveryPopup()}
            style={{
              padding: '4px 8px', fontSize: 9, fontWeight: 700,
              background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)',
              borderRadius: 6, color: '#fbbf24', cursor: 'pointer',
            } as any}
          >TEST P&L</button>
          <NotificationBell
            onNavigateToTrucks={() => switchTab('trucks')}
            onNavigateToLoads={() => switchTab('email')}
            onNavigateToEvents={() => setShowEvents(true)}
          />
          <GameMenu
            onOpenFleet={() => setShowFleet(true)}
            onOpenCompliance={() => setShowCompliance(true)}
            onOpenEvents={() => setShowEvents(true)}
            onOpenMyLoads={() => setShowMyLoads(true)}
            onOpenStats={() => setShowStats(true)}
            onOpenSettings={() => setShowSettings(true)}
            onOpenHelp={() => setShowHelp(true)}
            onExit={() => { if (clockRef.current) clearInterval(clockRef.current); }}
          />
        </div>

        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }`}</style>
      </div>
    );
  };

  // ── TRUCK STRIP ───────────────────────────────────────────────────────────
  const TruckStrip = () => (
    <div style={{
      display: 'flex', overflowX: 'auto', gap: 8,
      padding: '8px 12px',
      background: 'linear-gradient(180deg, rgba(10,18,38,0.98) 0%, rgba(8,14,30,0.98) 100%)',
      borderBottom: '1px solid rgba(56,189,248,0.08)',
      scrollbarWidth: 'none',
    } as any}>
      {trucks.map(truck => {
        const color = getTruckColor(truck);
        const hos = Math.max(0, truck.hoursLeft);
        const hosColor = hos < 2 ? '#f87171' : hos < 4 ? '#fbbf24' : '#34d399';
        const isSelected = selectedTruckId === truck.id;
        const isMoving = truck.status === 'driving' || truck.status === 'loaded';
        const isAlert = (truck as any).idleWarningLevel > 0 || truck.status === 'breakdown';
        const name = truck.name.replace('Truck ', 'T');
        const progressPct = Math.round(truck.progress * 100);

        return (
          <div key={truck.id}
            onClick={() => handleTruckClick(truck)}
            style={{
              minWidth: 120, flexShrink: 0,
              borderRadius: 12, overflow: 'hidden',
              background: isSelected
                ? `linear-gradient(135deg, rgba(${parseInt(color.slice(1,3),16)},${parseInt(color.slice(3,5),16)},${parseInt(color.slice(5,7),16)},0.15), rgba(10,18,38,0.9))`
                : 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
              border: `1px solid ${isSelected ? color + '66' : isAlert ? color + '44' : 'rgba(255,255,255,0.07)'}`,
              boxShadow: isSelected ? `0 0 16px ${color}33, inset 0 0 20px ${color}08` : isAlert ? `0 0 10px ${color}22` : 'none',
              cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: 'sans-serif',
            } as any}>

            {/* Цветная полоска сверху с градиентом */}
            <div style={{
              height: 3, width: '100%',
              background: `linear-gradient(90deg, ${color}, ${color}88)`,
              boxShadow: `0 0 6px ${color}`,
            } as any} />

            <div style={{ padding: '7px 9px', display: 'flex', flexDirection: 'column', gap: 3 } as any}>
              {/* Имя + статус */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' } as any}>
                <span style={{ fontSize: 13, fontWeight: 900, color: '#fff', letterSpacing: 0.3 } as any}>{name}</span>
                <span style={{
                  fontSize: 8, fontWeight: 700, color: color,
                  background: `${color}18`, padding: '1px 5px', borderRadius: 4,
                } as any}>●</span>
              </div>

              {/* Статус */}
              <span style={{ fontSize: 10, fontWeight: 700, color } as any}>
                {STATUS_LABEL[truck.status]}
              </span>

              {/* Маршрут */}
              {truck.destinationCity ? (
                <span style={{ fontSize: 9, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as any}>
                  → {truck.destinationCity}
                </span>
              ) : null}

              {/* HOS */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 } as any}>
                <span style={{ fontSize: 9, fontWeight: 700, color: hosColor } as any}>
                  ⏱ {Math.round(hos * 10) / 10}h
                </span>
                {isAlert && (
                  <span style={{ fontSize: 9, color: color, fontWeight: 800 } as any}>⚠️</span>
                )}
              </div>

              {/* Прогресс маршрута */}
              {isMoving && (
                <div style={{
                  height: 3, background: 'rgba(255,255,255,0.07)',
                  borderRadius: 2, overflow: 'hidden', marginTop: 2,
                } as any}>
                  <div style={{
                    height: '100%', width: `${progressPct}%`,
                    background: `linear-gradient(90deg, ${color}88, ${color})`,
                    borderRadius: 2,
                    boxShadow: `0 0 4px ${color}`,
                    transition: 'width 0.5s',
                  } as any} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── SIDE TABS (desktop) ───────────────────────────────────────────────────
  const SideTabs = () => (
    <View style={s.sideTabs}>
      {tabs.map(tab => (
        <TouchableOpacity key={tab.id}
          style={[s.sideTab, activeTab === tab.id && s.sideTabOn]}
          onPress={() => tab.onPress ? tab.onPress() : switchTab(tab.id)}>
          <Text style={[s.sideTabTxt, activeTab === tab.id && s.sideTabTxtOn]}>{tab.label}</Text>
          {tab.badge !== undefined && (
            <View style={s.badge}><Text style={s.badgeTxt}>{tab.badge}</Text></View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  // ── BOTTOM TABS (mobile) ──────────────────────────────────────────────────
  const BottomTabs = () => (
    <View style={s.bottomTabs}>
      {[{ id: 'map' as Tab, label: 'Карта' }, ...tabs].map(tab => (
        <TouchableOpacity key={tab.id}
          style={[s.bottomTab, activeTab === tab.id && s.bottomTabOn]}
          onPress={() => (tab as any).onPress ? (tab as any).onPress() : switchTab(tab.id)}>
          <Text style={[s.bottomTabTxt, activeTab === tab.id && s.bottomTabTxtOn]}>{tab.label}</Text>
          {(tab as any).badge !== undefined && (
            <View style={s.badge}><Text style={s.badgeTxt}>{(tab as any).badge}</Text></View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const mapProps = {
    onTruckInfo: (id: string) => { const t = trucks.find(x => x.id === id); if (t) setDetailTruck(t); },
    onFindLoad: (city: string) => { setLoadBoardSearch(city); switchTab('loadboard'); },
  };

  return (
    <View style={s.root}>

      {isWide ? (
        /* ══ DESKTOP ══ */
        <View style={s.desktop}>
          {/* Левая колонка: топбар + траки + карта */}
          <View style={s.leftCol}>
            <TopBar />
            <TruckStrip />
            <View style={s.mapArea}>
              <ErrorBoundary name="Map"><MapView {...mapProps} /></ErrorBoundary>
            </View>
          </View>

          {/* Правая колонка: табы + контент */}
          <View style={s.rightCol}>
            <SideTabs />
            <View style={s.panelContent}>
              {activeTab === 'loadboard' && <ErrorBoundary name="Loads"><LoadBoardPanel onNegotiate={setPendingLoad} /></ErrorBoundary>}
              {activeTab === 'trucks'    && <ErrorBoundary name="Trucks"><TruckPanel onSwitchToLoadBoard={() => switchTab('loadboard')} /></ErrorBoundary>}
              {activeTab === 'map'       && (
                <View style={s.emptyPanel}>
                  <Text style={s.emptyTxt}>Выбери раздел</Text>
                </View>
              )}
            </View>
          </View>
        </View>

      ) : (
        /* ══ MOBILE ══ */
        <View style={s.mobile}>
          <TopBar />
          <TruckStrip />
          <View style={s.mobileContent}>
            {activeTab === 'map'       && <ErrorBoundary name="Map"><MapView {...mapProps} /></ErrorBoundary>}
            {activeTab === 'loadboard' && <ErrorBoundary name="Loads"><LoadBoardPanel onNegotiate={setPendingLoad} /></ErrorBoundary>}
            {activeTab === 'trucks'    && <ErrorBoundary name="Trucks"><TruckPanel onSwitchToLoadBoard={() => switchTab('loadboard')} /></ErrorBoundary>}
          </View>
          <BottomTabs />
        </View>
      )}

      {/* ── MODALS ── */}
      {negotiation.open && <ErrorBoundary name="Neg"><NegotiationModal onAssign={setPendingLoad} /></ErrorBoundary>}
      {pendingLoad && !negotiation.open && (
        <ErrorBoundary name="Assign"><AssignModal load={pendingLoad} onClose={() => setPendingLoad(null)} /></ErrorBoundary>
      )}
      {detailTruck && (
        <TruckDetailModal truck={detailTruck} onClose={() => setDetailTruck(null)}
          onFindLoad={(city) => { setLoadBoardSearch(city); setDetailTruck(null); switchTab('loadboard'); }} />
      )}
      {showFleet && <Modal onClose={() => setShowFleet(false)}><FleetOverview /></Modal>}
      {showCompliance && <Modal onClose={() => setShowCompliance(false)}><ComplianceDashboard /></Modal>}
      {showEvents && <Modal onClose={() => setShowEvents(false)}><EventsPanel /></Modal>}
      {showMyLoads && <Modal onClose={() => setShowMyLoads(false)}><MyLoadsPanel /></Modal>}
      <EmailPanel visible={showEmail} onClose={() => setShowEmail(false)} />
      <DeliveryResultPopup key={deliveryResults[0]?.loadId ?? 'empty'} />
      <ShiftEndPopup />
      {showStats && <StatsPopup onClose={() => setShowStats(false)} />}
      {showSettings && <SettingsPopup onClose={() => setShowSettings(false)} />}
      {showHelp && <HelpPopup onClose={() => setShowHelp(false)} />}
    </View>
  );
}

function Modal({ children, onClose }: { children: any; onClose: () => void }) {
  return (
    <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
      <TouchableOpacity style={s.modalBox} activeOpacity={1} onPress={e => e.stopPropagation()}>
        <TouchableOpacity style={s.modalCloseBtn} onPress={onClose}>
          <Text style={s.modalCloseTxt}>✕</Text>
        </TouchableOpacity>
        {children}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const BG = '#0a0a0f';
const BG2 = '#111118';
const BORDER = 'rgba(255,255,255,0.07)';
const PRIMARY = '#38bdf8';

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  // ── TOP BAR ──
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    height: 52, paddingHorizontal: 14, gap: 10,
    backgroundColor: BG2,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  timeBlock: { minWidth: 70 },
  timeText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  sessionText: { fontSize: 9, color: PRIMARY, fontWeight: '700', marginTop: 1 },

  progressWrap: { flex: 1, gap: 4 },
  progressTrack: {
    height: 3, backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: PRIMARY, borderRadius: 2 },
  speedRow: { flexDirection: 'row', gap: 3 },
  speedBtn: {
    paddingHorizontal: 7, paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 5, borderWidth: 1, borderColor: BORDER,
  },
  speedBtnOn: { backgroundColor: 'rgba(56,189,248,0.15)', borderColor: PRIMARY },
  speedTxt: { fontSize: 10, color: '#64748b', fontWeight: '700' },
  speedTxtOn: { color: PRIMARY },

  statsRow: { flexDirection: 'row', gap: 6 },
  statChip: {
    paddingHorizontal: 8, paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8, borderWidth: 1, borderColor: BORDER,
  },
  statVal: { fontSize: 12, fontWeight: '800', color: '#e2e8f0' },

  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  // ── TRUCK STRIP ──
  truckStrip: { maxHeight: 90, backgroundColor: BG2, borderBottomWidth: 1, borderBottomColor: BORDER },
  truckStripContent: { paddingHorizontal: 10, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  truckCard: {
    width: 110, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: BORDER,
    overflow: 'hidden',
  },
  truckCardOn: { backgroundColor: 'rgba(56,189,248,0.06)' },
  truckCardBar: { height: 3, width: '100%' },
  truckCardBody: { padding: 8, gap: 2 },
  truckCardName: { fontSize: 12, fontWeight: '900', color: '#fff' },
  truckCardStatus: { fontSize: 10, fontWeight: '700' },
  truckCardRoute: { fontSize: 9, color: '#64748b' },
  truckCardHos: { fontSize: 9, fontWeight: '700', marginTop: 2 },
  truckCardProgress: {
    height: 2, backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 1, overflow: 'hidden', marginTop: 4,
  },
  truckCardProgressFill: { height: '100%', borderRadius: 1 },

  // ── DESKTOP ──
  desktop: { flex: 1, flexDirection: 'row' },
  leftCol: { flex: 1, flexDirection: 'column' },
  mapArea: { flex: 1 },
  rightCol: {
    width: 400, flexDirection: 'column',
    backgroundColor: BG2,
    borderLeftWidth: 1, borderLeftColor: BORDER,
  },

  sideTabs: {
    flexDirection: 'row', gap: 6,
    paddingHorizontal: 10, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  sideTab: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row', justifyContent: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  sideTabOn: {
    backgroundColor: 'rgba(56,189,248,0.18)',
    borderColor: '#38bdf8',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  sideTabTxt: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  sideTabTxtOn: { color: '#fff', fontWeight: '900' },
  panelContent: { flex: 1 },
  emptyPanel: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTxt: { fontSize: 14, color: '#334155' },

  // ── MOBILE ──
  mobile: { flex: 1, flexDirection: 'column' },
  mobileContent: { flex: 1 },
  bottomTabs: {
    flexDirection: 'row', gap: 6,
    paddingHorizontal: 8, paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    backgroundColor: BG2,
    borderTopWidth: 1, borderTopColor: BORDER,
  },
  bottomTab: {
    flex: 1, paddingVertical: 11, alignItems: 'center',
    borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row', justifyContent: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  bottomTabOn: {
    backgroundColor: 'rgba(56,189,248,0.18)',
    borderColor: '#38bdf8',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomTabTxt: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  bottomTabTxtOn: { color: '#fff', fontWeight: '900' },

  // ── BADGE ──
  badge: {
    backgroundColor: PRIMARY, borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 2, minWidth: 18, alignItems: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4,
  },
  badgeTxt: { fontSize: 10, fontWeight: '900', color: '#000' },

  // ── MODAL ──
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  modalBox: {
    backgroundColor: '#13131a', borderRadius: 16,
    borderWidth: 1, borderColor: BORDER,
    width: '100%', maxWidth: 600, maxHeight: '85%', overflow: 'hidden',
  },
  modalCloseBtn: {
    position: 'absolute', top: 12, right: 12, zIndex: 10,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalCloseTxt: { fontSize: 12, color: '#94a3b8', fontWeight: '700' },
});
