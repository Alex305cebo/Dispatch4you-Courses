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
import GuidePanel, { shouldShowGuide, shouldShowWelcome } from '../components/WelcomePopup';
import { useAccountStore } from '../store/accountStore';
import GuideSpotlight from '../components/GuideSpotlight';
import { useGuideStore } from '../store/guideStore';
import GuideBubble from '../components/GuideBubble';

type Tab = 'map' | 'loadboard' | 'email' | 'trucks';

const STATUS_COLOR: Record<string, string> = {
  idle:        '#38bdf8', // голубой — свободен, ждёт груза (позитивно)
  driving:     '#818cf8', // индиго — едет к погрузке
  loaded:      '#34d399', // зелёный — везёт груз (деньги идут)
  at_pickup:   '#fbbf24', // жёлтый — на погрузке
  at_delivery: '#a78bfa', // фиолетовый — на разгрузке
  breakdown:   '#f87171', // красный — поломка
  waiting:     '#fb923c', // оранжевый — detention
};
const STATUS_LABEL: Record<string, string> = {
  idle: 'Свободен', driving: 'К погрузке', loaded: 'В пути',
  at_pickup: 'Погрузка', at_delivery: 'Разгрузка',
  breakdown: 'Поломка', waiting: 'Detention',
};

// Уникальный аватар водителя по ID трака
const DRIVER_AVATARS: Record<string, string> = {
  'T1': '👨🏻', 'T2': '👨🏾', 'T3': '👨🏼', 'T4': '👩🏽', 'T5': '👨🏿',
  'T1047': '👨🏻', 'T2023': '👨🏾', 'T3012': '👨🏼',
};
function getDriverAvatar(truckId: string): string {
  if (DRIVER_AVATARS[truckId]) return DRIVER_AVATARS[truckId];
  // Фоллбэк по последней цифре ID
  const avatars = ['👨🏻','👨🏾','👨🏼','👩🏽','👨🏿','👩🏻','👨🏽','👩🏾'];
  const n = parseInt(truckId.replace(/\D/g,'')) || 0;
  return avatars[n % avatars.length];
}

// Google Noto Animated Emoji — CDN (Apache 2.0, бесплатно)
const NOTO = 'https://fonts.gstatic.com/s/e/notoemoji/latest';
function getMoodEmoji(mood: number, status: string, truck?: any): string {
  if (truck && ((truck as any).onNightStop || (truck as any).hosRestUntilMinute > 0)) return `${NOTO}/1f634/512.webp`; // 😴 sleeping
  if (status === 'breakdown') return `${NOTO}/1f92f/512.webp`; // 🤯 exploding
  if (status === 'waiting')   return `${NOTO}/1f62b/512.webp`; // 😫 tired
  if (status === 'at_pickup') return `${NOTO}/1f4aa/512.webp`; // 💪 loading
  if (mood >= 90) return `${NOTO}/1f929/512.webp`; // 🤩 star-struck
  if (mood >= 75) return `${NOTO}/1f604/512.webp`; // 😄 grinning
  if (mood >= 60) return `${NOTO}/1f60a/512.webp`; // 😊 smiling
  if (mood >= 45) return `${NOTO}/1f610/512.webp`; // 😐 neutral
  if (mood >= 30) return `${NOTO}/1f615/512.webp`; // 😕 confused
  if (mood >= 15) return `${NOTO}/1f620/512.webp`; // 😠 angry
  return `${NOTO}/1f621/512.webp`;                  // 😡 rage (red)
}

function getTruckColor(truck: any, gameMinute = 0): string {
  if ((truck as any).onNightStop || (truck as any).onMandatoryBreak) return '#64748b';
  if (truck.status === 'waiting') return '#64748b';
  if (truck.status === 'breakdown') return '#f87171';
  const outOfOrder = (truck as any).outOfOrderUntil;
  if (gameMinute > 0 && outOfOrder && typeof outOfOrder === 'number' && outOfOrder > gameMinute) return '#ef4444';
  if (truck.status === 'idle') {
    const w = (truck as any).idleWarningLevel ?? 0;
    if (w === 3) return '#ef4444';
    if (w === 2) return '#fb923c';
    if (w === 1) return '#fbbf24';
  }
  return STATUS_COLOR[truck.status] || '#38bdf8';
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
    deliveryResults, totalEarned,
  } = useGameStore();

  const [guideVisible, setGuideVisible] = useState(() => {
    try {
      const saved = localStorage.getItem('dispatch-guide-show');
      if (saved !== null) return saved === '1';
    } catch {}
    return shouldShowGuide();
  });
  const [showGuidePopup, setShowGuidePopup] = useState(() => shouldShowGuide());
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(() => {
    try { return (localStorage.getItem('dispatch-time-format') as '12h' | '24h') || '12h'; } catch { return '12h'; }
  });
  const [guideForceStep, setGuideForceStep] = useState<number | null>(null);
  const guideCurrentStepRef = useRef<number>(0); // текущий раскрытый шаг в гайде

  const [activeTab, setActiveTab] = useState<Tab>(() => {
    try {
      const saved = localStorage.getItem('dispatch-active-tab') as Tab;
      if (saved) return saved;
    } catch {}
    return (typeof window !== 'undefined' && window.innerWidth >= 900) ? 'trucks' : 'map';
  });

  // Сохраняем активную вкладку при каждом переключении
  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('dispatch-active-tab', tab);
      // Отмечаем посещение для гайда
      if (tab === 'email') localStorage.setItem('guide-email-visited', '1');
      if (tab === 'map')   localStorage.setItem('guide-map-visited', '1');
    } catch {}
  };
  const [pendingLoad, setPendingLoad] = useState<ActiveLoad | null>(null);
  const [showFleet, setShowFleet] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showMyLoads, setShowMyLoads] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showBell, setShowBell] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [detailTruck, setDetailTruck] = useState<any>(null);
  const [showStats, setShowStats] = useState(false);
  const { currentNickname } = useAccountStore();
  const activeGuideStep = useGuideStore(s => s.activeStep);

  // Таймер для кнопки "Карта" — становится цветной через 10 сек
  const [mapBtnAge, setMapBtnAge] = useState(0); // 0-10
  const mapBtnTimerRef = useRef<any>(null);

  function startMapBtnTimer() {
    setMapBtnAge(0);
    if (mapBtnTimerRef.current) clearInterval(mapBtnTimerRef.current);
    mapBtnTimerRef.current = setInterval(() => {
      setMapBtnAge(prev => {
        if (prev >= 10) { clearInterval(mapBtnTimerRef.current); return 10; }
        return prev + 1;
      });
    }, 1000);
  }

  useEffect(() => {
    startMapBtnTimer();
    return () => { if (mapBtnTimerRef.current) clearInterval(mapBtnTimerRef.current); };
  }, []);

  function getTrucksCenter() {
    if (trucks.length === 0) return { lng: -83.9207, lat: 35.9606 }; // Knoxville fallback
    const avgLng = trucks.reduce((s, t) => s + t.position[0], 0) / trucks.length;
    const avgLat = trucks.reduce((s, t) => s + t.position[1], 0) / trucks.length;
    return { lng: avgLng, lat: avgLat };
  }

  function handleMapTabPress() {
    switchTab('map');
    startMapBtnTimer();
    const center = getTrucksCenter();
    const isMobileDevice = width < 900;
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('zoomToTruck', {
        detail: { ...center, slow: !isMobileDevice, mobile: isMobileDevice }
      }));
    }, 150);
  }
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pausedSeconds, setPausedSeconds] = useState(0);
  const pauseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  // Таймер паузы — считает секунды пока игра на паузе
  useEffect(() => {
    if (paused) {
      setPausedSeconds(0);
      pauseTimerRef.current = setInterval(() => {
        setPausedSeconds(s => s + 1);
      }, 1000);
    } else {
      setPausedSeconds(0);
      if (pauseTimerRef.current) { clearInterval(pauseTimerRef.current); pauseTimerRef.current = null; }
    }
    return () => { if (pauseTimerRef.current) clearInterval(pauseTimerRef.current); };
  }, [paused]);

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
    if (clockRef.current) clearInterval(clockRef.current);
    clockRef.current = setInterval(() => { if (!pausedRef.current) tickClock(); }, 1000);
    return () => { if (clockRef.current) clearInterval(clockRef.current); };
  }, []);

  // Плавный zoom на траки при первом запуске
  useEffect(() => {
    if (!shouldShowGuide()) return;
    const zoomTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('zoomToTruck', {
        detail: { slow: true }
      }));
    }, 1500);
    return () => clearTimeout(zoomTimer);
  }, []);
  useEffect(() => {
    // Очищаем старый интервал если был
    if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    saveIntervalRef.current = setInterval(() => {
      if (useGameStore.getState().phase === 'playing') {
        useGameStore.getState().saveGame();
      }
    }, 30000);
    return () => { if (saveIntervalRef.current) clearInterval(saveIntervalRef.current); };
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
    { id: 'email',     label: 'Почта',  badge: unreadEmails || undefined },
    { id: 'trucks',    label: 'Траки',  badge: idleTrucks > 0 ? idleTrucks : undefined },
  ];

  // ── TOP BAR ──────────────────────────────────────────────────────────────
  const TopBar = () => {
    const hosWarnings = trucks.filter(t => (t as any).idleWarningLevel > 0 || t.hoursLeft < 3).length;
    const progressPct = Math.min(progress * 100, 100);
    const timeColor = progressPct > 80 ? '#f87171' : progressPct > 60 ? '#fbbf24' : '#38bdf8';

    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: isWide ? 12 : 6,
        height: isWide ? 56 : 48, paddingLeft: isWide ? 16 : 10, paddingRight: isWide ? 12 : 8,
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

        {/* Время — клик переключает 12h/24h */}
        <div
          style={{ minWidth: isWide ? 86 : 64, flexShrink: 0, cursor: 'pointer', userSelect: 'none' } as any}
          onClick={() => {
            const next = timeFormat === '12h' ? '24h' : '12h';
            setTimeFormat(next);
            try { localStorage.setItem('dispatch-time-format', next); } catch {}
          }}
          title="Нажми чтобы переключить формат"
        >
          <div style={{
            fontSize: isWide ? 20 : 16, fontWeight: 900, color: '#fff',
            letterSpacing: 0.5, lineHeight: 1,
            textShadow: `0 0 20px ${timeColor}88`,
            transition: 'opacity 0.15s',
          } as any}>
            {(() => {
              const roundedMinute = Math.round(gameMinute);
              const totalMinutes = 8 * 60 + 0 + roundedMinute; // SHIFT_START_HOUR=8
              const hours = Math.floor(totalMinutes / 60) % 24;
              const mins = totalMinutes % 60;
              const m = mins.toString().padStart(2, '0');
              if (timeFormat === '24h') {
                return `${hours.toString().padStart(2, '0')}:${m}`;
              }
              const ampm = hours >= 12 ? 'PM' : 'AM';
              const h12 = hours % 12 || 12;
              return `${h12}:${m} ${ampm}`;
            })()}
          </div>
          <div style={{ fontSize: 9, color: '#38bdf8', fontWeight: 700, marginTop: 2, opacity: 0.6 } as any}>
            {timeFormat === '24h' ? '24h ↺' : '12h ↺'}
          </div>
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
          <div style={{ display: 'flex', gap: 3 } as any}>
            {isWide ? (
              // Десктоп — все 3 кнопки
              ([1, 2, 5] as const).map(sp => (
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
                    transition: 'all 0.15s',
                  } as any}>
                  {sp === 1 ? '×1' : sp === 2 ? '×2' : '×5'}
                </button>
              ))
            ) : (
              // Мобильный — кнопка скорости + кнопка пауза/старт
              <>
                <button
                  onClick={() => setTimeSpeed(timeSpeed === 1 ? 2 : timeSpeed === 2 ? 5 : 1)}
                  style={{
                    padding: '3px 10px', borderRadius: 8, cursor: 'pointer',
                    background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(14,165,233,0.1))',
                    border: '1px solid rgba(56,189,248,0.4)',
                    fontSize: 11, fontWeight: 900, color: '#38bdf8',
                  } as any}>
                  ×{timeSpeed}
                </button>
                <button
                  onClick={() => setPaused(p => !p)}
                  style={{
                    width: 30, height: 26, borderRadius: 8, cursor: 'pointer',
                    background: paused && pausedSeconds >= 10
                      ? 'linear-gradient(135deg, rgba(239,68,68,0.35), rgba(220,38,38,0.2))'
                      : paused
                      ? 'linear-gradient(135deg, rgba(74,222,128,0.2), rgba(34,197,94,0.1))'
                      : 'rgba(255,255,255,0.06)',
                    border: paused && pausedSeconds >= 10
                      ? '1px solid rgba(239,68,68,0.8)'
                      : paused ? '1px solid rgba(74,222,128,0.5)' : '1px solid rgba(255,255,255,0.15)',
                    fontSize: 13,
                    color: paused && pausedSeconds >= 10 ? '#f87171' : paused ? '#4ade80' : '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: paused && pausedSeconds >= 10 ? 'pauseUrgent 0.8s ease-in-out infinite' : 'none',
                    boxShadow: paused && pausedSeconds >= 10 ? '0 0 12px rgba(239,68,68,0.7), 0 0 24px rgba(239,68,68,0.4)' : 'none',
                  } as any}>
                  {paused ? '▶' : '⏸'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Статы */}
        <div style={{ display: 'flex', gap: isWide ? 6 : 4, flexShrink: 0 } as any}>
          {/* Баланс */}
          <button onClick={() => setShowStats(true)} style={{
            padding: isWide ? '5px 10px' : '4px 8px',
            background: balance >= 0
              ? 'linear-gradient(135deg, rgba(52,211,153,0.12), rgba(16,185,129,0.06))'
              : 'linear-gradient(135deg, rgba(248,113,113,0.12), rgba(239,68,68,0.06))',
            border: `1px solid ${balance >= 0 ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
            borderRadius: 10, cursor: 'pointer', textAlign: 'left',
          } as any}>
            {isWide && <div style={{ fontSize: 9, color: '#64748b', fontWeight: 600, marginBottom: 1 } as any}>БАЛАНС</div>}
            <div style={{ fontSize: isWide ? 13 : 12, fontWeight: 900, color: balance >= 0 ? '#34d399' : '#f87171' } as any}>
              ${balance >= 1000 ? `${(balance/1000).toFixed(1)}k` : balance.toLocaleString()}
            </div>
          </button>

          {/* Заработано за смену */}
          {totalEarned > 0 && (
            <button onClick={() => setShowStats(true)} style={{
              padding: isWide ? '5px 10px' : '4px 8px',
              background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.06))',
              border: '1px solid rgba(251,191,36,0.25)',
              borderRadius: 10, cursor: 'pointer', textAlign: 'left',
            } as any}>
              {isWide && <div style={{ fontSize: 9, color: '#64748b', fontWeight: 600, marginBottom: 1 } as any}>ЗАРАБОТАНО</div>}
              <div style={{ fontSize: isWide ? 13 : 12, fontWeight: 900, color: '#fbbf24' } as any}>
                💰 ${totalEarned >= 1000 ? `${(totalEarned/1000).toFixed(1)}k` : totalEarned.toLocaleString()}
              </div>
            </button>
          )}

          {/* HOS */}
          {hosWarnings > 0 && (
            <button onClick={() => switchTab('trucks')} style={{
              padding: isWide ? '5px 10px' : '4px 8px',
              background: 'linear-gradient(135deg, rgba(248,113,113,0.15), rgba(239,68,68,0.08))',
              border: '1px solid rgba(248,113,113,0.35)',
              borderRadius: 10, animation: 'pulse 1.5s infinite',
              cursor: 'pointer', textAlign: 'left',
            } as any}>
              {isWide && <div style={{ fontSize: 9, color: '#f87171', fontWeight: 600, marginBottom: 1 } as any}>⚠️ HOS</div>}
              <div style={{ fontSize: isWide ? 13 : 12, fontWeight: 900, color: '#f87171' } as any}>
                {!isWide && '⚠️'}{hosWarnings}
              </div>
            </button>
          )}
        </div>

        {/* Действия */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isWide ? 6 : 4, flexShrink: 0 } as any}>
          {/* Колокольчик */}
          <button onClick={() => setShowBell(true)} style={{
            position: 'relative', width: isWide ? 42 : 36, height: isWide ? 42 : 36,
            borderRadius: isWide ? 21 : 18,
            background: activeGuideStep === 'resolve_event'
              ? 'rgba(6,182,212,0.25)'
              : 'rgba(6,182,212,0.15)',
            border: activeGuideStep === 'resolve_event'
              ? '2px solid rgba(6,182,212,0.9)'
              : '1px solid rgba(6,182,212,0.3)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isWide ? 20 : 17,
            boxShadow: activeGuideStep === 'resolve_event'
              ? '0 0 16px rgba(6,182,212,0.6)'
              : 'none',
            animation: activeGuideStep === 'resolve_event' ? 'spotlightPulse 1.4s ease-in-out infinite' : 'none',
          } as any}>
            🔔
            {activeGuideStep === 'resolve_event' && (
              <span style={{
                position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
                fontSize: 10, fontWeight: 800, color: '#06b6d4',
                background: 'rgba(6,182,212,0.15)',
                padding: '2px 6px', borderRadius: 6, whiteSpace: 'nowrap',
                pointerEvents: 'none',
              } as any}>👆 Нажми</span>
            )}
            {unreadEmails > 0 && (
              <span style={{
                position: 'absolute', top: -3, right: -3,
                background: '#ef4444', borderRadius: 10, minWidth: 17, height: 17,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, color: '#fff', padding: '0 3px',
                border: '2px solid #0a0f1e',
              } as any}>{unreadEmails > 9 ? '9+' : unreadEmails}</span>
            )}
          </button>
          {/* Гамбургер */}
          <button onClick={() => setShowMenu(true)} style={{
            width: isWide ? 42 : 36, height: isWide ? 42 : 36,
            borderRadius: isWide ? 12 : 10,
            background: 'rgba(56,189,248,0.1)', border: '1.5px solid rgba(56,189,248,0.3)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: isWide ? 5 : 4, padding: 8,
          } as any}>
            {[0,1,2].map(i => (
              <span key={i} style={{ width: isWide ? 20 : 16, height: 2, background: '#38bdf8', borderRadius: 2, display: 'block' } as any} />
            ))}
          </button>
        </div>

        <style>{`
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
          @keyframes guideBtnPulse {
            0%,100% { box-shadow: 0 0 10px rgba(129,140,248,0.3); }
            50%      { box-shadow: 0 0 18px rgba(129,140,248,0.6), 0 0 0 3px rgba(129,140,248,0.15); }
          }
          @keyframes spotlightPulse {
            0%,100% { box-shadow: 0 0 8px rgba(6,182,212,0.4), 0 0 0 2px rgba(6,182,212,0.2); }
            50%      { box-shadow: 0 0 20px rgba(6,182,212,0.8), 0 0 0 4px rgba(6,182,212,0.15); }
          }
          @keyframes pauseUrgent {
            0%   { box-shadow: 0 0 8px rgba(239,68,68,0.6), 0 0 16px rgba(239,68,68,0.3); background: linear-gradient(135deg, rgba(239,68,68,0.35), rgba(220,38,38,0.2)); border-color: rgba(239,68,68,0.8); }
            50%  { box-shadow: 0 0 18px rgba(239,68,68,1), 0 0 36px rgba(239,68,68,0.6); background: linear-gradient(135deg, rgba(239,68,68,0.6), rgba(220,38,38,0.4)); border-color: rgba(239,68,68,1); }
            100% { box-shadow: 0 0 8px rgba(239,68,68,0.6), 0 0 16px rgba(239,68,68,0.3); background: linear-gradient(135deg, rgba(239,68,68,0.35), rgba(220,38,38,0.2)); border-color: rgba(239,68,68,0.8); }
          }
          @keyframes emoji-bounce {
            0%,100% { transform: translateY(0) scale(1); }
            40% { transform: translateY(-5px) scale(1.15); }
            60% { transform: translateY(-3px) scale(1.1); }
          }
          @keyframes emoji-shake {
            0%,100% { transform: rotate(0deg) scale(1); }
            20% { transform: rotate(-8deg) scale(1.1); }
            40% { transform: rotate(8deg) scale(1.1); }
            60% { transform: rotate(-5deg) scale(1.05); }
            80% { transform: rotate(5deg) scale(1.05); }
          }
          @keyframes emoji-pulse {
            0%,100% { transform: scale(1); opacity:1; }
            50% { transform: scale(1.2); opacity:0.9; }
          }
          @keyframes emoji-swing {
            0%,100% { transform: rotate(0deg); transform-origin: top center; }
            25% { transform: rotate(10deg); }
            75% { transform: rotate(-10deg); }
          }
          .emoji-anim-0 { animation: emoji-bounce 1.8s ease-in-out 0s infinite; }
          .emoji-anim-1 { animation: emoji-shake 2.2s ease-in-out 0.3s infinite; }
          .emoji-anim-2 { animation: emoji-pulse 1.5s ease-in-out 0.7s infinite; }
          .emoji-anim-3 { animation: emoji-swing 2.5s ease-in-out 0.1s infinite; }
        `}</style>
      </div>
    );
  };

  // ── TRUCK STRIP ───────────────────────────────────────────────────────────
  const TruckStrip = () => (
    <div style={{
      display: 'flex', overflowX: 'auto', gap: 10,
      padding: '10px 12px',
      background: 'linear-gradient(180deg, rgba(10,18,38,0.98) 0%, rgba(8,14,30,0.98) 100%)',
      borderBottom: '1px solid rgba(56,189,248,0.12)',
      scrollbarWidth: 'none',
    } as any}>
      {trucks.map(truck => {
        const color = getTruckColor(truck, gameMinute);
        const hos = Math.max(0, truck.hoursLeft);
        const hosColor = hos < 2 ? '#f87171' : hos < 4 ? '#fbbf24' : '#34d399';
        const isSelected = selectedTruckId === truck.id;
        const isMoving = truck.status === 'driving' || truck.status === 'loaded';
        const isAlert = (truck as any).idleWarningLevel > 0 || truck.status === 'breakdown';
        const progressPct = Math.round(truck.progress * 100);
        const mood = truck.mood ?? 80;
        const moodEmoji = getMoodEmoji(mood, truck.status, truck);
        const truckIdx = trucks.indexOf(truck);
        const animClass = `emoji-anim-${truckIdx % 4}`;
        const truckNum = truck.id.replace(/\D/g, '').padStart(3, '0').slice(-3);
        const trailerNum = String((parseInt(truckNum) * 7 + 100) % 900 + 100);
        const nameParts = (truck.driver || truck.name).split(' ');
        const driverName = nameParts.length >= 2
          ? `${nameParts[0]} ${nameParts[1][0]}.`
          : nameParts[0];

        return (
          <div key={truck.id}
            onClick={() => handleTruckClick(truck)}
            style={{
              minWidth: 160, flexShrink: 0,
              borderRadius: 16, overflow: 'hidden',
              background: isSelected
                ? `linear-gradient(135deg, rgba(${parseInt(color.slice(1,3),16)},${parseInt(color.slice(3,5),16)},${parseInt(color.slice(5,7),16)},0.22), rgba(10,18,38,0.97))`
                : 'rgba(255,255,255,0.05)',
              border: `2px solid ${isSelected ? color + 'cc' : isAlert ? color + '77' : 'rgba(255,255,255,0.12)'}`,
              boxShadow: isSelected ? `0 0 24px ${color}55` : isAlert ? `0 0 14px ${color}44` : 'none',
              cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: 'sans-serif',
            } as any}>

            {/* Цветная полоска сверху */}
            <div style={{ height: 5, width: '100%', background: `linear-gradient(90deg, ${color}, ${color}66)`, boxShadow: `0 0 10px ${color}` } as any} />

            <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 } as any}>

              {/* Emoji настроения — отдельно сверху, не накладывается */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } as any}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 } as any}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: 0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as any}>
                    {driverName}
                  </span>
                  <div style={{ display: 'flex', gap: 4 } as any}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8', background: 'rgba(56,189,248,0.15)', padding: '2px 6px', borderRadius: 4 } as any}>TRK {truckNum}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#cbd5e1', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4 } as any}>TRL {trailerNum}</span>
                  </div>
                </div>
                {/* Emoji — с отступом, не накладывается */}
                <div style={{ marginLeft: 8, flexShrink: 0 } as any}>
                  <img src={moodEmoji} width={30} height={30} className={animClass} style={{ imageRendering: 'auto', display: 'block' } as any} />
                </div>
              </div>

              {/* Статус */}
              <span style={{ fontSize: 13, fontWeight: 800, color, lineHeight: 1.2 } as any}>
                {(truck as any).onNightStop ? '🌙 Ночёвка' : (truck as any).hosRestUntilMinute > 0 ? '😴 HOS отдых' : STATUS_LABEL[truck.status]}
              </span>

              {/* Маршрут */}
              {truck.destinationCity && !(truck as any).onNightStop && !((truck as any).hosRestUntilMinute > 0) && (
                <span style={{ fontSize: 12, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as any}>
                  → {truck.destinationCity}
                </span>
              )}

              {/* HOS + alert */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 } as any}>
                <span style={{ fontSize: 13, fontWeight: 800, color: hosColor } as any}>⏱ {Math.round(hos * 10) / 10}h</span>
                {isAlert && <span style={{ fontSize: 13, color, fontWeight: 900 } as any}>⚠️</span>}
              </div>

              {/* Прогресс */}
              {isMoving && !(truck as any).onNightStop && !((truck as any).hosRestUntilMinute > 0) && (
                <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' } as any}>
                  <div style={{ height: '100%', width: `${progressPct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 3, boxShadow: `0 0 6px ${color}`, transition: 'width 0.5s' } as any} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── SIDE TABS (desktop) ───────────────────────────────────────────────────
  const GUIDE_TAB_STEPS: Record<string, string[]> = {
    loadboard: ['find_load', 'negotiate'],
    email:     ['check_email'],
    trucks:    ['assign_truck', 'resolve_event', 'end_shift'],
    map:       ['watch_map', 'get_paid'],
  };

  const SideTabs = () => (
    <View style={s.sideTabs}>
      {tabs.map(tab => {
        const isGuideActive = GUIDE_TAB_STEPS[tab.id]?.includes(activeGuideStep as string);
        return (
          <TouchableOpacity key={tab.id}
            style={[s.sideTab, activeTab === tab.id && s.sideTabOn,
              isGuideActive && { borderColor: 'rgba(6,182,212,0.7)', backgroundColor: 'rgba(6,182,212,0.08)' } as any
            ]}
            onPress={() => tab.onPress ? tab.onPress() : switchTab(tab.id)}>
            <Text style={[s.sideTabTxt, activeTab === tab.id && s.sideTabTxtOn,
              isGuideActive && { color: '#06b6d4' } as any
            ]}>{tab.label}</Text>
            {isGuideActive && activeTab !== tab.id && (
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#06b6d4', marginLeft: 4 } as any} />
            )}
            {tab.badge !== undefined && (
              <View style={s.badge}><Text style={s.badgeTxt}>{tab.badge}</Text></View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ── BOTTOM TABS (mobile) ──────────────────────────────────────────────────
  const BottomTabs = () => {
    // Цвет кнопки Карта: от серого к яркому cyan за 10 сек
    const mapGlow = mapBtnAge / 10; // 0..1
    const mapColor = mapBtnAge >= 10
      ? '#06b6d4'
      : mapBtnAge >= 5
      ? `rgba(6,182,212,${0.3 + mapGlow * 0.7})`
      : 'transparent';
    const mapBorderColor = mapBtnAge >= 3
      ? `rgba(6,182,212,${mapGlow * 0.8})`
      : 'rgba(255,255,255,0.08)';
    const mapTextColor = mapBtnAge >= 5 ? '#fff' : '#94a3b8';

    return (
      <View style={s.bottomTabs}>
        {/* Кнопка Карта — особая с таймером */}
        <TouchableOpacity
          style={[s.bottomTab, activeTab === 'map' && s.bottomTabOn, {
            backgroundColor: activeTab === 'map' ? 'rgba(56,189,248,0.18)' : mapBtnAge >= 5 ? `rgba(6,182,212,${mapGlow * 0.15})` : 'rgba(255,255,255,0.04)',
            borderColor: activeTab === 'map' ? '#38bdf8' : mapBorderColor,
            shadowColor: mapBtnAge >= 7 ? '#06b6d4' : 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: mapBtnAge >= 7 ? 0.8 : 0,
            shadowRadius: mapBtnAge >= 7 ? 10 : 0,
          } as any]}
          onPress={handleMapTabPress}
        >
          <Text style={[s.bottomTabTxt, activeTab === 'map' && s.bottomTabTxtOn, {
            color: activeTab === 'map' ? '#fff' : mapTextColor,
          }]}>🗺 Карта</Text>
          {mapBtnAge >= 10 && activeTab !== 'map' && (
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#06b6d4', marginLeft: 4, shadowColor: '#06b6d4', shadowOpacity: 1, shadowRadius: 4 } as any} />
          )}
        </TouchableOpacity>

        {/* Остальные табы */}
        {tabs.map(tab => {
          const isGuideActive = GUIDE_TAB_STEPS[tab.id]?.includes(activeGuideStep as string);
          return (
            <TouchableOpacity key={tab.id}
              style={[s.bottomTab, activeTab === tab.id && s.bottomTabOn,
                isGuideActive && { borderColor: 'rgba(6,182,212,0.7)', backgroundColor: 'rgba(6,182,212,0.1)' } as any
              ]}
              onPress={() => (tab as any).onPress ? (tab as any).onPress() : switchTab(tab.id)}>
              <Text style={[s.bottomTabTxt, activeTab === tab.id && s.bottomTabTxtOn,
                isGuideActive && { color: '#06b6d4' } as any
              ]}>{tab.label}</Text>
              {isGuideActive && activeTab !== tab.id && (
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#06b6d4', marginLeft: 4,
                  shadowColor: '#06b6d4', shadowOpacity: 1, shadowRadius: 4 } as any} />
              )}
              {(tab as any).badge !== undefined && (
                <View style={s.badge}><Text style={s.badgeTxt}>{(tab as any).badge}</Text></View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const mapProps = {
    onTruckInfo: (id: string) => { const t = trucks.find(x => x.id === id); if (t) setDetailTruck(t); selectTruck(id); },
    onTruckSelect: (id: string) => { selectTruck(id); },
    onFindLoad: (city: string) => { setLoadBoardSearch(city); switchTab('loadboard'); },
    onGuideOpen: () => { setGuideVisible(true); setShowGuidePopup(true); },
    guideActive: guideVisible,
  };

  function handleAssigned(truckId: string) {
    const truck = trucks.find(t => t.id === truckId);
    if (truck) {
      selectTruck(truckId);
      // Сохраняем truckId заранее — MapView подхватит при монтировании
      try { sessionStorage.setItem('followTruckId', truckId); } catch (_) {}
      switchTab('map');
      // Даём MapView время смонтироваться (особенно на мобильном где он рендерится по вкладке)
      const dispatch = () => {
        window.dispatchEvent(new CustomEvent('zoomToTruck', {
          detail: { lng: truck.position[0], lat: truck.position[1] }
        }));
        window.dispatchEvent(new CustomEvent('followAssignedTruck', {
          detail: { truckId }
        }));
      };
      setTimeout(dispatch, 400);
      // Повторяем через 1.2s на случай если MapView ещё монтировался
      setTimeout(dispatch, 1200);
    }
  }

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
              {(activeTab === 'loadboard' || activeTab === 'map') && <ErrorBoundary name="Loads"><LoadBoardPanel onNegotiate={setPendingLoad} onAssigned={handleAssigned} /></ErrorBoundary>}
              {activeTab === 'trucks'    && <ErrorBoundary name="Trucks"><TruckPanel onSwitchToLoadBoard={() => switchTab('loadboard')} /></ErrorBoundary>}
              {activeTab === 'email'     && <ErrorBoundary name="Email"><EmailPanel inline /></ErrorBoundary>}
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
            {activeTab === 'loadboard' && <ErrorBoundary name="Loads"><LoadBoardPanel onNegotiate={setPendingLoad} onAssigned={handleAssigned} /></ErrorBoundary>}
            {activeTab === 'trucks'    && <ErrorBoundary name="Trucks"><TruckPanel onSwitchToLoadBoard={() => switchTab('loadboard')} /></ErrorBoundary>}
            {activeTab === 'email'     && <ErrorBoundary name="Email"><EmailPanel inline /></ErrorBoundary>}
          </View>
          <BottomTabs />
        </View>
      )}

      {/* ── MODALS ── */}
      {/* Guide Popup */}
      {showGuidePopup && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        } as any}>
          <div style={{
            width: '92%', maxWidth: 440,
            maxHeight: '88vh',
            background: 'linear-gradient(160deg, #1a2540 0%, #141d35 100%)',
            border: '1px solid rgba(99,120,200,0.4)',
            borderRadius: 22,
            boxShadow: '0 8px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          } as any}>

            {/* Header bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px 10px', flexShrink: 0,
              background: 'rgba(255,255,255,0.04)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              {/* Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>📖</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#c7d2fe', letterSpacing: 0.3 }}>
                  Гайд диспетчера
                </span>
              </div>

              {/* Кнопки + тоггл */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

                {/* Тоггл "показывать при старте" */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' } as any}>
                  <div
                    onClick={() => {
                      const next = !guideVisible;
                      setGuideVisible(next);
                      try { localStorage.setItem('dispatch-guide-show', next ? '1' : '0'); } catch {}
                    }}
                    style={{
                      width: 32, height: 18, borderRadius: 9,
                      background: guideVisible ? 'rgba(99,102,241,0.7)' : 'rgba(255,255,255,0.12)',
                      border: `1px solid ${guideVisible ? 'rgba(99,102,241,0.9)' : 'rgba(255,255,255,0.2)'}`,
                      position: 'relative', cursor: 'pointer',
                      transition: 'all 0.2s',
                    } as any}
                  >
                    <div style={{
                      position: 'absolute', top: 2,
                      left: guideVisible ? 15 : 2,
                      width: 12, height: 12, borderRadius: 6,
                      background: '#fff',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    } as any} />
                  </div>
                  <span style={{ fontSize: 11, color: '#94a3b8', userSelect: 'none' } as any}>
                    авто
                  </span>
                </label>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 6 }}>
                {/* Refresh — шаг назад */}
                <button
                  title="Вернуться на шаг назад"
                  onClick={() => {
                    const next = Math.max(0, guideCurrentStepRef.current - 1);
                    guideCurrentStepRef.current = next;
                    setGuideForceStep(next);
                  }}
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'rgba(99,102,241,0.15)',
                    border: '1px solid rgba(99,102,241,0.4)',
                    cursor: 'pointer', fontSize: 15, color: '#a5b4fc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  } as any}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.3)';
                    (e.currentTarget as HTMLElement).style.transform = 'rotate(-180deg)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.15)';
                    (e.currentTarget as HTMLElement).style.transform = 'rotate(0deg)';
                  }}
                >↺</button>

                {/* Close */}
                <button
                  onClick={() => setShowGuidePopup(false)}
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    cursor: 'pointer', fontSize: 14, color: '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, transition: 'all 0.15s',
                  } as any}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.4)';
                    (e.currentTarget as HTMLElement).style.color = '#f87171';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
                    (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                  }}
                >✕</button>
              </div>
              </div> {/* конец внешнего flex кнопок + тоггл */}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <GuidePanel
                nickname={currentNickname || 'Dispatcher'}
                truckCount={trucks.length || 3}
                onSwitchTab={(tab) => { setShowGuidePopup(false); switchTab(tab as any); }}
                onAllDone={() => { setGuideVisible(false); setShowGuidePopup(false); }}
                forceStep={guideForceStep}
                onStepChange={(step) => { guideCurrentStepRef.current = step; }}
              />
            </div>
          </div>
        </div>
      )}
      {negotiation.open && <ErrorBoundary name="Neg"><NegotiationModal onAssign={setPendingLoad} /></ErrorBoundary>}
      {pendingLoad && !negotiation.open && (
        <ErrorBoundary name="Assign"><AssignModal
          load={pendingLoad}
          onClose={() => setPendingLoad(null)}
          onAssigned={(truckId) => {
            setPendingLoad(null);
            handleAssigned(truckId);
          }}
        /></ErrorBoundary>
      )}
      {detailTruck && (
        <TruckDetailModal truck={detailTruck} onClose={() => setDetailTruck(null)}
          onFindLoad={(city) => { setLoadBoardSearch(city); setDetailTruck(null); switchTab('loadboard'); }} />
      )}
      {showFleet && <Modal onClose={() => setShowFleet(false)}><FleetOverview /></Modal>}
      {showCompliance && <Modal onClose={() => setShowCompliance(false)}><ComplianceDashboard /></Modal>}
      {showEvents && <Modal onClose={() => setShowEvents(false)}><EventsPanel /></Modal>}
      {showMyLoads && <Modal onClose={() => setShowMyLoads(false)}><MyLoadsPanel /></Modal>}
      <DeliveryResultPopup key={deliveryResults[0]?.loadId ?? 'empty'} />
      <ShiftEndPopup />
      {showStats && <StatsPopup onClose={() => setShowStats(false)} />}
      {showSettings && <SettingsPopup onClose={() => setShowSettings(false)} />}
      {showHelp && <HelpPopup onClose={() => setShowHelp(false)} />}
      {/* Колокольчик и меню — вне TopBar div чтобы Modal работал корректно */}
      <NotificationBell
        onNavigateToTrucks={() => switchTab('trucks')}
        onNavigateToLoads={() => switchTab('email')}
        onNavigateToEvents={() => setShowEvents(true)}
        forceOpen={showBell}
        onClose={() => setShowBell(false)}
      />
      <GameMenu
        forceOpen={showMenu}
        onClose={() => setShowMenu(false)}
        onOpenFleet={() => setShowFleet(true)}
        onOpenCompliance={() => setShowCompliance(true)}
        onOpenEvents={() => setShowEvents(true)}
        onOpenMyLoads={() => setShowMyLoads(true)}
        onOpenStats={() => setShowStats(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenHelp={() => setShowHelp(true)}
        onOpenGuide={() => { setGuideVisible(true); setShowGuidePopup(true); }}
        onExit={() => { if (clockRef.current) clearInterval(clockRef.current); }}
      />
      {/* Guide Bubble — контекстные подсказки */}
      {guideVisible && <GuideBubble />}
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

