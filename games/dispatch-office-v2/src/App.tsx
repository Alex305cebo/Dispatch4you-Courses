import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { generateLoads } from '@/game/loadGenerator';
import { loadBestSave } from '@/utils/saveSystem';
import { useBreakpoint } from '@/utils/useBreakpoint';
import { Header } from '@/components/Header/Header';
import { GameMap } from '@/components/Map/GameMap';
import { NavOverlay } from '@/components/Map/NavOverlay';
import { TruckStrip } from '@/components/TruckStrip/TruckStrip';
import { TruckCard } from '@/components/TruckCard/TruckCard';
import { RightPanel } from '@/components/RightPanel/RightPanel';
import { TabBar } from '@/components/TabBar/TabBar';
import { BottomSheet } from '@/components/BottomSheet/BottomSheet';
import { MobileTruckList } from '@/components/MobileTruckList/MobileTruckList';
import { NegotiationPanel } from '@/components/NegotiationPanel/NegotiationPanel';
import { DeliveryPopup } from '@/components/DeliveryPopup/DeliveryPopup';
import { NotificationPanel } from '@/components/NotificationPanel/NotificationPanel';
import { ShiftEnd } from '@/components/ShiftEnd/ShiftEnd';
import { EventToast } from '@/components/EventToast/EventToast';
import { GameMenu } from '@/components/GameMenu/GameMenu';
import { TruckShop } from '@/components/TruckShop/TruckShop';
import { TruckPopup } from '@/components/TruckPopup/TruckPopup';
import { RateConfirmation } from '@/components/RateConfirmation/RateConfirmation';
import { MainMenu } from '@/components/MainMenu/MainMenu';
import { TickEngine } from '@/game/TickEngine';
import { generateFleet } from '@/data/fleetGenerator';
import type { Truck, Load, GameSession } from '@/types';
import './App.css';

export default function App() {
  const session = useGameStore((s) => s.session);
  const phase = useGameStore((s) => s.phase);
  const activePanel = useGameStore((s) => s.activePanel);
  const initSession = useGameStore((s) => s.initSession);
  const setTrucks = useGameStore((s) => s.setTrucks);
  const addLoads = useGameStore((s) => s.addLoads);

  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [mobileTab, setMobileTab] = useState<'trucks' | 'loadboard' | 'chat' | 'finance' | null>(null);

  // Состояние загрузки сохранений при старте
  const [isBooting, setIsBooting] = useState(true);
  const [hasSave, setHasSave] = useState(false);
  const [savedSession, setSavedSession] = useState<GameSession | null>(null);

  // Инициализация Firebase Auth
  useEffect(() => {
    useAuthStore.getState().init();
  }, []);

  // Listen for open-loadboard event
  useEffect(() => {
    function handleOpen() {
      if (isMobile) {
        setMobileTab('loadboard');
      } else {
        useGameStore.getState().setActivePanel('loadboard');
      }
    }
    function handleClose() {
      if (isMobile) {
        setMobileTab(null);
      } else {
        useGameStore.getState().setActivePanel('none');
      }
    }
    window.addEventListener('open-loadboard', handleOpen);
    window.addEventListener('close-loadboard', handleClose);
    return () => {
      window.removeEventListener('open-loadboard', handleOpen);
      window.removeEventListener('close-loadboard', handleClose);
    };
  }, [isMobile]);

  // Загрузка сохранений при старте приложения
  useEffect(() => {
    async function boot() {
      try {
        const saved = await loadBestSave();
        if (saved && saved.trucks.length > 0) {
          setHasSave(true);
          setSavedSession(saved);
        }
      } catch (e) {
        console.warn('[Boot] Failed to load best save:', e);
      } finally {
        setIsBooting(false);
      }
    }
    boot();
  }, []);

  // После создания сессии — инициализация флота и стартовых грузов на основе выбранного количества траков
  useEffect(() => {
    if (!session || session.trucks.length > 0) return;

    // Генерируем стартовый флот согласно выбранному количеству траков
    const initialTrucks = generateFleet(session.truckCount);
    setTrucks(initialTrucks);

    // Генерируем грузы для Load Board рядом со всеми стартовыми городами траков
    const initialLoads: Load[] = [];
    const addedCities = new Set<string>();

    initialTrucks.forEach((truck) => {
      if (truck.currentCity && !addedCities.has(truck.currentCity)) {
        addedCities.add(truck.currentCity);
        const loadsForCity = generateLoads(0, 10, truck.currentCity, truck.location);
        initialLoads.push(...loadsForCity);
      }
    });

    addLoads(initialLoads);
  }, [session, setTrucks, addLoads]);

  // Booting loader
  if (isBooting || phase === 'loading') {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Загрузка Dispatch Office...</p>
      </div>
    );
  }

  // Если сессия не начата — показываем Главное Меню
  if (!session) {
    return (
      <MainMenu
        hasSave={hasSave}
        onContinue={() => {
          if (savedSession) {
            useGameStore.getState().loadSession(savedSession);
          }
        }}
        onNewGame={(truckCount) => {
          initSession(truckCount, 'Dispatch Office');
        }}
      />
    );
  }

  return (
    <div className="app">
      <Header onShowNotifications={() => setShowNotifications(true)} onShowMenu={() => setShowMenu(true)} />
      <main className="app-main">
        <GameMap sheetOpen={isMobile && mobileTab !== null}>
          <NavOverlay />
        </GameMap>

        {/* Truck strip — all screen sizes (left side) */}
        <TruckStrip />

        {/* Floating action buttons — all screen sizes (right side) */}
        <div style={{
          position: 'absolute',
          right: !isMobile && activePanel !== 'none' ? '382px' : '4px',
          top: '50%', transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 6, zIndex: 10,
          transition: 'right 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        }}>
          {[
            { icon: '📦', panel: 'loadboard' as const },
            { icon: '💬', panel: 'chat' as const },
            { icon: '📊', panel: 'finance' as const },
          ].map(({ icon, panel }) => (
            <button key={panel} onClick={() => {
              if (isMobile) { setMobileTab(mobileTab === panel ? null : panel as any); }
              else { useGameStore.getState().setActivePanel(panel); }
            }} style={{
              width: 42, height: 42,
              background: (isMobile ? mobileTab === panel : activePanel === panel) ? 'rgba(6,182,212,0.15)' : 'rgba(15,20,35,0.85)',
              border: `1px solid ${(isMobile ? mobileTab === panel : activePanel === panel) ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 10, color: (isMobile ? mobileTab === panel : activePanel === panel) ? 'var(--accent-cyan)' : 'rgba(148,163,184,0.8)',
              fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(10px)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}>
              {icon}
            </button>
          ))}
        </div>

        {/* Desktop: right panel */}
        {!isMobile && (
          <RightPanel />
        )}

        {/* Mobile: bottom sheet */}
        {isMobile && (
          <BottomSheet open={mobileTab !== null} onClose={() => setMobileTab(null)}>
            <MobileContent tab={mobileTab} />
          </BottomSheet>
        )}
        <EventToast />
      </main>
      <TickEngine />
      {/* Modals & Toasts */}
      <NegotiationPanel />
      <DeliveryPopup />
      <NotificationPanel visible={showNotifications} onClose={() => setShowNotifications(false)} />
      <GameMenu visible={showMenu} onClose={() => setShowMenu(false)} onOpenShop={() => setShowShop(true)} />
      <TruckShop visible={showShop} onClose={() => setShowShop(false)} />
      <TruckPopup />
      <RateConfirmation />
      <ShiftEnd />
    </div>
  );
}

// Mobile content inside BottomSheet
function MobileContent({ tab }: { tab: string | null }) {
  if (tab === 'trucks') return <MobileTruckList />;
  if (tab === 'loadboard') return <MobileLoadBoard />;
  if (tab === 'chat') return <MobileChatContent />;
  if (tab === 'finance') return <MobileFinanceContent />;
  return null;
}

function MobileLoadBoard() {
  const session = useGameStore((s) => s.session);
  const openNegotiation = useGameStore((s) => s.openNegotiation);
  const selectedTruckId = useGameStore((s) => s.selectedTruckId);
  const selectTruck = useGameStore((s) => s.selectTruck);
  const addLoads = useGameStore((s) => s.addLoads);
  if (!session) return null;

  // Определяем город для поиска грузов:
  // Если трак idle — его текущий город
  // Если трак driving to_delivery — город назначения (куда приедет)
  // Если трак at_delivery — город где разгружается
  const activeTruck = session.trucks.find((t) => t.id === selectedTruckId)
    || session.trucks.find((t) => t.status === 'idle')
    || session.trucks[0];
  
  let truckCity = activeTruck?.currentCity || 'Unknown';
  if (activeTruck?.status === 'driving' && activeTruck.deliveryPhase === 'to_delivery') {
    const activeLoad = session.loads.find((l) => l.id === activeTruck.currentLoadId);
    if (activeLoad) truckCity = activeLoad.destination.city;
  }

  // Filter loads: только из города трака (или рядом)
  let localLoads = session.loads.filter((l) =>
    l.status === 'available' && l.origin.city === truckCity
  );
  const availableCount = localLoads.length;

  function handleBook(loadId: string, rate: number, brokerName: string) {
    openNegotiation(loadId, rate, brokerName);
  }

  function handleRefresh() {
    // Remove old available loads, add fresh ones from truck's city
    const store = useGameStore.getState();
    if (!store.session) return;
    const oldAvailable = store.session.loads.filter((l) => l.status === 'available');
    oldAvailable.forEach((l) => store.removeLoad(l.id));
    const fresh = generateLoads(store.session.gameTime, 10, truckCity, activeTruck?.location);
    store.addLoads(fresh);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Truck selector */}
      {session.trucks.length > 1 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '0 2px 6px', borderBottom: '1px solid var(--border)' }}>
          {session.trucks.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTruck(t.id)}
              style={{
                flexShrink: 0,
                padding: '6px 10px',
                background: t.id === activeTruck?.id ? 'var(--accent-cyan-dim)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${t.id === activeTruck?.id ? 'var(--accent-cyan)' : 'var(--border)'}`,
                borderRadius: 8,
                color: t.id === activeTruck?.id ? 'var(--accent-cyan)' : 'var(--text-muted)',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {t.number} · {t.currentCity || '—'}
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Load Board</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {truckCity} · {availableCount} available</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={handleRefresh} style={{
            fontSize: 11, fontWeight: 700, color: '#fff',
            background: 'linear-gradient(135deg, var(--accent-cyan), #0ea5e9)',
            border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(6,182,212,0.3)',
          }}>
            🔄 Refresh
          </button>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-cyan)', background: 'var(--accent-cyan-dim)', padding: '3px 8px', borderRadius: 6 }}>
            LIVE
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px 65px 60px', gap: 4, padding: '5px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: 6, fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const }}>
        <span>Route</span>
        <span>Miles</span>
        <span>Rate</span>
        <span>Action</span>
      </div>

      {/* Loads */}
      {localLoads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 16 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 }}>No loads from {truckCity}</p>
          <button onClick={handleRefresh} style={{ padding: '8px 16px', background: 'var(--accent-cyan)', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Search Loads
          </button>
        </div>
      ) : (
        localLoads.map((load) => {
          const isCovered = load.status === 'booked';
          return (
            <div key={load.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 50px 65px 60px', gap: 4, alignItems: 'center',
              padding: '8px 8px', background: isCovered ? 'rgba(239,68,68,0.03)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isCovered ? 'rgba(239,68,68,0.12)' : 'var(--border)'}`,
              borderRadius: 8, opacity: isCovered ? 0.5 : 1,
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: isCovered ? 'var(--text-muted)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  → {load.destination.city}, {load.destination.state}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{load.origin.city}</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>{load.miles}</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: isCovered ? 'var(--text-muted)' : 'var(--success)' }}>${load.rate.toLocaleString()}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>${load.ratePerMile}/mi</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                {isCovered ? (
                  <span style={{ fontSize: 8, fontWeight: 800, color: 'var(--danger)', background: 'rgba(239,68,68,0.1)', padding: '2px 4px', borderRadius: 3 }}>COVERED</span>
                ) : (
                  <button onClick={() => handleBook(load.id, load.rate, load.brokerName)} style={{ padding: '4px 8px', background: 'var(--accent-cyan)', borderRadius: 5, color: '#fff', fontSize: 10, fontWeight: 800, border: 'none', cursor: 'pointer' }}>Book</button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function MobileChatContent() {
  const notifs = useNotificationStore((s) => s.notifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const unread = notifs.filter((n) => !n.read);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 4px' }}>
        💬 Сообщения · {unread.length} новых
      </h4>
      {notifs.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24, fontSize: 13 }}>
          Нет сообщений
        </p>
      ) : (
        notifs.slice(0, 20).map((n) => (
          <div key={n.id} onClick={() => markRead(n.id)} style={{
            background: n.read ? 'rgba(255,255,255,0.02)' : 'rgba(6,182,212,0.04)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 10,
            cursor: 'pointer',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{n.subject}</span>
              {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-cyan)', flexShrink: 0 }} />}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.4 }}>
              {n.message.slice(0, 80)}{n.message.length > 80 ? '...' : ''}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, opacity: 0.6 }}>
              {n.from}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function MobileFinanceContent() {
  const session = useGameStore((s) => s.session);
  if (!session) return null;
  const profit = session.totalEarned - session.totalSpent;
  const delivered = session.loads.filter((l) => l.status === 'delivered').length;
  const target = session.truckCount * 2500;
  const pct = target > 0 ? Math.min(100, Math.round((profit / target) * 100)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 4px' }}>
        📊 Финансы · День {session.day}
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>БАЛАНС</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent-cyan)', marginTop: 4 }}>${session.balance.toLocaleString()}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>ПРИБЫЛЬ</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: profit >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: 4 }}>${profit.toLocaleString()}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[
          ['📦 Доставлено', delivered],
          ['🚛 Флот', `${session.trucks.length} траков`],
          ['🎯 Цель', `$${target.toLocaleString()} (${pct}%)`],
          ['💰 Доход', `+$${session.totalEarned.toLocaleString()}`],
          ['💸 Расходы', `-$${session.totalSpent.toLocaleString()}`],
        ].map(([label, val]) => (
          <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
            <span>{label}</span>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{val}</span>
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Прогресс к цели: {pct}%</div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent-cyan), var(--success))', borderRadius: 3 }} />
        </div>
      </div>
    </div>
  );
}
