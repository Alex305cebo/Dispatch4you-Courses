import { useEffect, useRef, useState, useMemo, Component, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  useWindowDimensions, Platform,
} from 'react-native';
import { getCurrentPerformanceSettings } from '../utils/performanceSettings';

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
import { useThemeStore } from '../store/themeStore';
import { useGameStore, formatGameTime, formatTimeDual, formatTimeShort, ActiveLoad } from '../store/gameStore';
import { SHIFT_DURATION, CITY_STATE } from '../constants/config';
import GoogleMapView from '../components/GoogleMapView';
import TruckPanel from '../components/TruckPanel';
import TruckStripComponent from '../components/TruckStripComponent';
import TruckCardOverlay from '../components/TruckCardOverlay';
import LoadBoardPanel from '../components/LoadBoardPanel';
import EventsPanel from '../components/EventsPanel';
import NegotiationChat from '../components/NegotiationChat';
import MyLoadsPanel from '../components/MyLoadsPanel';
import NotificationBell from '../components/NotificationBell';
import ComplianceDashboard from '../components/ComplianceDashboard';
import FleetOverview from '../components/FleetOverview';
import GameMenu from '../components/GameMenu';
import TruckDetailModal from '../components/TruckDetailModal';
import DeliveryResultPopup from '../components/DeliveryResultPopup';
import StatsPopup from '../components/StatsPopup';
import SettingsPopup from '../components/SettingsPopup';
import HelpPopup from '../components/HelpPopup';
import ShiftEndPopup from '../components/ShiftEndPopup';
import DayEndPopup from '../components/DayEndPopup';
import { useAccountStore } from '../store/accountStore';
import GuideSpotlight from '../components/GuideSpotlight';
import { useGuideStore } from '../store/guideStore';
import GuideBubble from '../components/GuideBubble';
import CharacterDialog from '../components/CharacterDialog';
import { CHARACTERS, DIALOG_DRIVER_START, DIALOG_BROKER_FIRST_CALL, isDialogShown, markDialogShown } from '../data/dialogs';
import { getDriverAvatar } from '../utils/driverAvatars';
import { UnifiedChatUI } from '../components/UnifiedChatUI';
import { createDemoMessages } from '../utils/demoMessages';
import TruckShopModal from '../components/TruckShopModal';
import RepairGarageModal from '../components/RepairGarageModal';
import { useOnboardingStore } from '../store/onboardingStore';
import { ONBOARDING_STEPS } from '../data/onboardingConfig';
import OnboardingOverlay from '../components/OnboardingOverlay';

type Tab = 'map' | 'loadboard' | 'trucks' | 'chat';

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

// Уникальный аватар водителя по ID трака — используем utils/driverAvatars

// Microsoft Fluent Animated Emojis — CDN URLs
const FLUENT = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis';
const E = {
  pilot:     `${FLUENT}/People/Pilot.png`,
  sleeping:  `${FLUENT}/Smilies/Zzz.png`,
  explode:   `${FLUENT}/Smilies/Exploding%20Head.png`,
  tired:     `${FLUENT}/Smilies/Tired%20Face.png`,
  biceps:    `${FLUENT}/Smilies/Smiling%20Face%20with%20Sunglasses.png`,
  strstruck: `${FLUENT}/Smilies/Star-Struck.png`,
  happy:     `${FLUENT}/Smilies/Beaming%20Face%20with%20Smiling%20Eyes.png`,
  smile:     `${FLUENT}/Smilies/Slightly%20Smiling%20Face.png`,
  neutral:   `${FLUENT}/Smilies/Neutral%20Face.png`,
  worried:   `${FLUENT}/Smilies/Worried%20Face.png`,
  angry:     `${FLUENT}/Smilies/Angry%20Face.png`,
  rage:      `${FLUENT}/Smilies/Enraged%20Face.png`,
};
function getMoodEmoji(mood: number, status: string, truck?: any): string {
  if (truck && ((truck as any).onNightStop || (truck as any).hosRestUntilMinute > 0)) return E.sleeping;
  if (status === 'breakdown')   return E.explode;
  if (status === 'waiting')     return E.tired;
  if (status === 'at_pickup')   return E.biceps;
  if (status === 'at_delivery') return E.strstruck;
  if (mood >= 90) return E.strstruck;
  if (mood >= 75) return E.happy;
  if (mood >= 60) return E.smile;
  if (mood >= 45) return E.neutral;
  if (mood >= 30) return E.worried;
  if (mood >= 15) return E.angry;
  return E.rage;
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

// ── STATIC STYLES (defined before GameScreen to avoid TDZ) ──────────────────
const BG = '#f2f2f7';
const BG2 = '#ffffff';
const BORDER = 'rgba(0,0,0,0.08)';
const PRIMARY = '#007aff';

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  topBar: { flexDirection: 'row', alignItems: 'center', height: 44, paddingHorizontal: 10, gap: 8, backgroundColor: BG2, borderBottomWidth: 1, borderBottomColor: BORDER },
  timeBlock: { minWidth: 60 },
  timeText: { fontSize: 14, fontWeight: '800', color: '#111827', letterSpacing: 0.3 },
  sessionText: { fontSize: 8, color: PRIMARY, fontWeight: '700', marginTop: 1 },
  progressWrap: { flex: 1, gap: 3 },
  progressTrack: { height: 2, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: PRIMARY, borderRadius: 2 },
  speedRow: { flexDirection: 'row', gap: 2 },
  speedBtn: { paddingHorizontal: 5, paddingVertical: 1, backgroundColor: '#f3f4f6', borderRadius: 4, borderWidth: 1, borderColor: BORDER },
  speedBtnOn: { backgroundColor: 'rgba(0,122,255,0.12)', borderColor: PRIMARY },
  speedTxt: { fontSize: 9, color: '#6b7280', fontWeight: '700' },
  speedTxtOn: { color: PRIMARY },
  statsRow: { flexDirection: 'row', gap: 5 },
  statChip: { paddingHorizontal: 6, paddingVertical: 3, backgroundColor: '#f3f4f6', borderRadius: 6, borderWidth: 1, borderColor: BORDER },
  statVal: { fontSize: 11, fontWeight: '800', color: '#111827' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  truckStrip: { maxHeight: 120, backgroundColor: 'transparent', borderBottomWidth: 0 },
  truckStripContent: { paddingHorizontal: 8, paddingVertical: 6, gap: 6, flexDirection: 'row' },
  truckCard: { width: 100, borderRadius: 8, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: BORDER, overflow: 'hidden' },
  truckCardOn: { backgroundColor: 'rgba(0,122,255,0.06)' },
  truckCardBar: { height: 3, width: '100%' },
  truckCardBody: { padding: 6, gap: 2 },
  truckCardName: { fontSize: 11, fontWeight: '900', color: '#111827' },
  truckCardStatus: { fontSize: 9, fontWeight: '700' },
  truckCardRoute: { fontSize: 8, color: '#6b7280' },
  truckCardHos: { fontSize: 8, fontWeight: '700', marginTop: 2 },
  truckCardProgress: { height: 2, backgroundColor: '#e5e7eb', borderRadius: 1, overflow: 'hidden', marginTop: 4 },
  truckCardProgressFill: { height: '100%', borderRadius: 1 },
  desktop: { flex: 1, flexDirection: 'row' },
  leftCol: { flex: 1, flexDirection: 'column', backgroundColor: 'transparent' },
  mapArea: { flex: 1, backgroundColor: 'transparent', position: 'relative' },
  rightCol: { width: 400, flexDirection: 'column', backgroundColor: BG2, borderLeftWidth: 1, borderLeftColor: BORDER },
  sideTabs: { flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: BORDER },
  sideTab: { flex: 1, paddingVertical: 13, alignItems: 'center', borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.22)', flexDirection: 'row', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.08)' },
  sideTabOn: { flex: 2, backgroundColor: 'rgba(6,182,212,0.1)', borderColor: '#38bdf8', shadowColor: '#38bdf8', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 6 },
  sideTabTxt: { fontSize: 15, fontWeight: '900', color: '#ffffff' },
  sideTabTxtOn: { color: '#ffffff', fontWeight: '900' },
  panelContent: { flex: 1 },
  emptyPanel: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTxt: { fontSize: 14, color: '#9ca3af' },
  mobile: { flex: 1, flexDirection: 'column', backgroundColor: 'transparent' },
  mobileContent: { flex: 1, backgroundColor: 'transparent', position: 'relative' },
  mobileLandscape: { flex: 1, flexDirection: 'column', backgroundColor: 'transparent' },
  landscapeBody: { flex: 1, flexDirection: 'row', backgroundColor: 'transparent' },
  landscapeMap: { flex: 1, position: 'relative', backgroundColor: 'transparent' },
  landscapePanel: { width: 320, flexDirection: 'column', backgroundColor: BG2, borderLeftWidth: 1, borderLeftColor: BORDER },
  mobilePanelOverlay: { position: 'absolute', top: 48, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(13,17,23,0.98)', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden', zIndex: 10 },
  mobileTopBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  truckStripBar: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'transparent', zIndex: 20, pointerEvents: 'box-none' as any },
  bottomTabs: { flexDirection: 'row', paddingHorizontal: 4, paddingVertical: 5, backgroundColor: BG2, borderTopWidth: 1, borderTopColor: BORDER },
  bottomTab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10, borderWidth: 0, flexDirection: 'row', justifyContent: 'center', gap: 4, backgroundColor: 'transparent' },
  bottomTabOn: { backgroundColor: '#fff', borderRadius: 10 },
  bottomTabTxt: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  bottomTabTxtOn: { color: '#111827', fontWeight: '800' },
  badge: { backgroundColor: '#ef4444', borderRadius: 9, paddingHorizontal: 5, paddingVertical: 1, minWidth: 17, alignItems: 'center' },
  badgeTxt: { fontSize: 10, fontWeight: '800', color: '#fff' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: BORDER, width: '100%', maxWidth: 600, maxHeight: '85%', overflow: 'hidden' },
  modalCloseBtn: { position: 'absolute', top: 12, right: 12, zIndex: 10, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center' },
  modalCloseTxt: { fontSize: 12, color: '#6b7280', fontWeight: '700' },
});

export default function GameScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isWide = width >= 900;
  const isLandscape = !isWide && width > height;

  // ── ТЕМА ──────────────────────────────────────────────────────────────────
  const { mode: themeMode, colors: T, toggle: toggleTheme } = useThemeStore();

  const {
    phase, gameMinute, balance, reputation,
    trucks, availableLoads, negotiation, bookedLoads, activeLoads,
    tickClock, selectedTruckId, selectTruck, notifications, sessionName,
    refreshLoadBoard, setLoadBoardSearch, timeSpeed, setTimeSpeed, loadGame,
    deliveryResults, totalEarned, closeNegotiation,
  } = useGameStore();

  const [guideVisible, setGuideVisible] = useState(false);
  const [showDriverDialog, setShowDriverDialog] = useState(false);
  const [chatCharacter, setChatCharacter] = useState<'driver' | 'owner' | 'accountant'>('driver');
  const dialogCheckDone = useRef(false);

  // Автоматически создаём демо-сообщения для опытных игроков
  useEffect(() => {
    if (dialogCheckDone.current) return;
    dialogCheckDone.current = true;

    // Проверяем завершён ли онбординг (новая система — onboardingStore)
    const nickname = sessionName || 'player';
    const completed = onbCheckCompleted(nickname);
    
    if (!completed) {
      // Новый игрок — НЕ открываем чат автоматически, пусть сам переключится
      // Просто ждём когда он откроет чат
    } else {
      // Опытный игрок — создаём демо-сообщения если нужно
      const demoTimer = setTimeout(() => {
        createDemoMessages();
      }, 2000);
      return () => clearTimeout(demoTimer);
    }
  }, [sessionName]);
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(() => {
    try { return (localStorage.getItem('dispatch-time-format') as '12h' | '24h') || '12h'; } catch { return '12h'; }
  });
  const truckStripScrollPos = useRef<number>(0); // Сохраняем позицию скролла truck strip

  const [activeTab, setActiveTab] = useState<Tab>('map'); // Всегда начинаем с карты
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  // Функция для автоматического открытия правой панели
  const autoExpandRightPanel = useCallback(() => {
    setRightPanelCollapsed(false);
  }, []);

  // Сохраняем активную вкладку при каждом переключении
  const switchTab = useCallback((tab: Tab) => {
    setActiveTab(tab);
    
    // Автоматически открываем правую панель для loadboard и chat
    if (tab === 'loadboard' || tab === 'chat') {
      autoExpandRightPanel();
    }
    
    try {
      localStorage.setItem('dispatch-active-tab', tab);
      if (tab === 'map') localStorage.setItem('guide-map-visited', '1');
    } catch {}
  }, [autoExpandRightPanel]);
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
  
  // ── ONBOARDING (попапы) ──
  const onbStep = useOnboardingStore(s => s.step);
  const onbIsActive = useOnboardingStore(s => s.isActive);
  const onbInit = useOnboardingStore(s => s.init);
  const onbCheckCompleted = useOnboardingStore(s => s.checkCompleted);
  
  // Отслеживание индикаторов траков для уведомлений
  const [truckIndicators, setTruckIndicators] = useState<Record<string, string>>({});
  const [indicatorNotifications, setIndicatorNotifications] = useState<Record<string, {text: string, timestamp: number}>>({});

  // Состояние слежения за траком (синхронизируется с GoogleMapView через window event)
  const [isFollowingTruck, setIsFollowingTruck] = useState(false);
  useEffect(() => {
    const handler = (e: Event) => {
      setIsFollowingTruck((e as CustomEvent).detail?.active ?? false);
    };
    window.addEventListener('followTruckChanged', handler);
    return () => window.removeEventListener('followTruckChanged', handler);
  }, []);

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
  
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Автоматически открываем панель при появлении новых непрочитанных сообщений
  const unreadChat = notifications.filter(n =>
    ['email','pod_ready','rate_con','detention','missed_call','voicemail','text','urgent'].includes(n.type) && !n.read
  ).length;
  
  const prevUnreadRef = useRef(unreadChat);
  
  useEffect(() => {
    // Если появились новые непрочитанные сообщения - открываем панель
    if (unreadChat > prevUnreadRef.current && activeTab === 'chat') {
      autoExpandRightPanel();
    }
    prevUnreadRef.current = unreadChat;
  }, [unreadChat, activeTab]);
  
  // Автоматически открываем панель при обновлении списка грузов
  const prevLoadsCountRef = useRef(availableLoads.length);
  
  useEffect(() => {
    // Если обновился список грузов и мы на loadboard - открываем панель
    if (availableLoads.length !== prevLoadsCountRef.current && activeTab === 'loadboard') {
      autoExpandRightPanel();
    }
    prevLoadsCountRef.current = availableLoads.length;
  }, [availableLoads.length, activeTab]);

  useEffect(() => {
    // При прямом открытии /game (без прохождения через меню) — всегда на меню
    // Используем setTimeout чтобы дать Root Layout время смонтироваться
    const enteredViaMenu = sessionStorage.getItem('enteredViaMenu');
    if (!enteredViaMenu) {
      setTimeout(() => router.replace('/'), 50);
      return;
    }
    // При рефреше — восстанавливаем сохранение только если phase === 'menu' (store в дефолтном состоянии)
    if (phase === 'menu') {
      loadGame().then(loaded => {
        if (!loaded) {
          setTimeout(() => router.replace('/'), 100);
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── ONBOARDING: инициализация при первом входе ──
  useEffect(() => {
    if (phase !== 'playing') return;
    const nickname = currentNickname || sessionName || 'player';
    const completed = onbCheckCompleted(nickname);
    if (!completed) {
      onbInit();
    }
  }, [phase]);

  // ── ONBOARDING: пауза игрового времени ──
  // Убрана пауза — онбординг не должен останавливать время
  // (это вызывало баг когда timeSpeed застревал на 0)

  // ── ONBOARDING: auto-switch при смене шага ──
  useEffect(() => {
    if (!onbIsActive) return;
    const config = ONBOARDING_STEPS.find(s => s.id === onbStep);
    if (!config?.autoSwitch) return;

    if (config.autoSwitch.tab) {
      switchTab(config.autoSwitch.tab);
    }
    if (config.autoSwitch.openModal === 'truckShop') {
      useGameStore.getState().setTruckShopOpen(true);
    }
    if (config.autoSwitch.closeTruckShop) {
      useGameStore.getState().setTruckShopOpen(false);
    }
  }, [onbStep, onbIsActive]);

  // ── ONBOARDING: восстановление скорости после завершения ──
  useEffect(() => {
    if (!onbIsActive && phase === 'playing') {
      const currentSpeed = useGameStore.getState().timeSpeed;
      if (currentSpeed === 0) setTimeSpeed(1);
    }
  }, [onbIsActive]);

  // ── ONBOARDING: восстановление скорости при монтировании (если онбординг уже завершён) ──
  useEffect(() => {
    if (phase !== 'playing') return;
    // Если онбординг не активен — убеждаемся что время идёт
    if (!onbIsActive) {
      const currentSpeed = useGameStore.getState().timeSpeed;
      if (currentSpeed === 0) {
        setTimeSpeed(1);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => { if (availableLoads.length < 5) refreshLoadBoard(); }, []);
  useEffect(() => {
    if (clockRef.current) clearInterval(clockRef.current);
    // Динамический тик на основе производительности устройства
    const perfSettings = getCurrentPerformanceSettings();
    console.log(`⚙️ Game tick interval: ${perfSettings.tickInterval}ms (${1000/perfSettings.tickInterval} ticks/sec)`);
    clockRef.current = setInterval(() => { tickClock(); }, perfSettings.tickInterval);
    return () => { if (clockRef.current) clearInterval(clockRef.current); };
  }, []);

  // Функция для получения текущего индикатора трака
  function getTruckIndicator(truck: any, hos: number, progressPct: number, mood: number): {icon: string, text: string} | null {
    if (truck.status === 'breakdown') return {icon: '🔧', text: 'Поломка!'};
    if (hos <= 0) return {icon: '🛑', text: 'HOS закончился'};
    if (truck.fuelLevel && truck.fuelLevel < 10) return {icon: '🆘', text: 'Топливо на нуле'};
    if (mood < 20) return {icon: '😡', text: 'Водитель зол'};
    if (truck.status === 'waiting' && truck.detentionMinutes > 120) return {icon: '⏰', text: 'Долгий detention'};
    if (truck.status === 'waiting') return {icon: '⏱️', text: 'Detention'};
    if (hos > 0 && hos < 1) return {icon: '🚨', text: 'HOS критичен'};
    if (hos >= 1 && hos < 2) return {icon: '😴', text: 'Мало HOS'};
    if (hos >= 2 && hos < 3) return {icon: '⚠️', text: 'HOS заканчивается'};
    if (truck.idleWarningLevel > 2 && truck.status === 'idle') return {icon: '😴', text: 'Долгий простой'};
    if (truck.onNightStop) return {icon: '🌙', text: 'Ночёвка'};
    if (truck.status === 'at_pickup') return {icon: '📦', text: 'Погрузка'};
    if (truck.status === 'at_delivery') return {icon: '🏁', text: 'Разгрузка'};
    if (truck.status === 'loaded' && progressPct > 90) return {icon: '🔥', text: 'Почти доехал'};
    if (truck.status === 'loaded') return {icon: '🚚', text: 'Везёт груз'};
    if (truck.status === 'driving') return {icon: '🚛', text: 'К погрузке'};
    if (truck.status === 'idle' && hos > 8) return {icon: '✅', text: 'Готов'};
    if (mood >= 80) return {icon: '😊', text: 'Отличное настроение'};
    return null;
  }

  // Отслеживание изменений индикаторов
  useEffect(() => {
    trucks.forEach(truck => {
      const hos = Math.max(0, truck.hoursLeft);
      const progressPct = Math.round(truck.progress * 100);
      const mood = truck.mood ?? 80;
      const indicator = getTruckIndicator(truck, hos, progressPct, mood);
      const currentKey = indicator ? `${indicator.icon}` : 'none';
      const prevKey = truckIndicators[truck.id] || 'none';
      
      if (currentKey !== prevKey && currentKey !== 'none') {
        setIndicatorNotifications(prev => ({
          ...prev,
          [truck.id]: { text: indicator!.text, timestamp: Date.now() }
        }));
        setTimeout(() => {
          setIndicatorNotifications(prev => {
            const newState = {...prev};
            if (newState[truck.id]?.timestamp === indicator!.text as any) delete newState[truck.id];
            return newState;
          });
        }, 3000);
      }
      setTruckIndicators(prev => ({...prev, [truck.id]: currentKey}));
    });
  }, [trucks.map(t => `${t.id}-${t.status}-${t.hoursLeft}-${t.progress}`).join(',')]);

  // Плавный zoom на траки при первом запуске
  useEffect(() => {
    if (isDialogShown('driver-start')) return;
    const zoomTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('zoomToTruck', {
        detail: { slow: true }
      }));
    }, 1500);
    return () => clearTimeout(zoomTimer);
  }, []);
  useEffect(() => {
    if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    // Сохраняем каждые 60 сек всегда, независимо от фазы
    saveIntervalRef.current = setInterval(() => {
      useGameStore.getState().saveGame();
    }, 60000);
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

  function handleTruckClick(truck: any) {
    // Если тот же трак — снимаем выделение
    if (selectedTruckId === truck.id) {
      selectTruck(null);
      window.dispatchEvent(new CustomEvent('followTruckFromCard', { detail: { truckId: null } }));
      return;
    }
    selectTruck(truck.id);
    if (!isWide) switchTab('map');
    // Включаем follow mode на карте
    window.dispatchEvent(new CustomEvent('followTruckFromCard', {
      detail: { truckId: truck.id, lng: truck.position[0], lat: truck.position[1] }
    }));
    // Скроллим карточку в центр полосы
    if (isWide) {
      setTimeout(() => {
        const strip = document.querySelector('.truck-strip-scroll-game') as HTMLElement;
        if (!strip) return;
        const idx = trucks.findIndex(t => t.id === truck.id);
        const cardW = 360 + 8;
        const target = idx * cardW - (strip.clientWidth / 2) + cardW / 2;
        strip.scrollTo({ left: target, behavior: 'smooth' });
      }, 50);
    }
  }

  const tabs: { id: Tab; label: string; icon: string; badge?: number; onPress?: () => void }[] = [
    { id: 'loadboard', label: 'Грузы',  icon: '📦', badge: availableLoads.length },
    { id: 'chat',      label: 'Связь',  icon: '💬', badge: unreadChat || undefined },
    { id: 'trucks',    label: 'Траки',  icon: '🚛', badge: idleTrucks > 0 ? idleTrucks : undefined },
  ];

  // ── TOP BAR ──────────────────────────────────────────────────────────────
  const TopBar = () => {
    const hosWarnings = trucks.filter(t => (t as any).idleWarningLevel > 0 || t.hoursLeft < 3).length;
    const progressPct = Math.min(progress * 100, 100);
    const timeColor = progressPct > 80 ? '#dc2626' : progressPct > 60 ? '#d97706' : '#007aff';
    
    // Определяем очень маленький экран (iPhone XS и меньше)
    const isVerySmall = width < 380;

    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: isWide ? 12 : isVerySmall ? 3 : 6,
        height: isWide ? 56 : isLandscape ? 38 : 48, paddingLeft: isWide ? 16 : isVerySmall ? 6 : 10, paddingRight: isWide ? 12 : isVerySmall ? 6 : 8,
        paddingTop: 'env(safe-area-inset-top)',
        background: T.topBarBg,
        borderBottom: `1px solid ${T.topBarBorder}`,
        boxShadow: themeMode === 'dark' ? '0 1px 20px rgba(0,0,0,0.4)' : '0 1px 8px rgba(0,0,0,0.06)',
        position: 'relative', overflow: 'hidden', zIndex: 50,
        fontFamily: 'sans-serif',
      } as any}>

        {/* Фоновое свечение */}
        <div style={{ display: 'none' } as any} />

        {/* Время — клик переключает 12h/24h */}
        <div
          style={{ minWidth: isWide ? 86 : isVerySmall ? 56 : 64, flexShrink: 0, cursor: 'pointer', userSelect: 'none' } as any}
          onClick={() => {
            const next = timeFormat === '12h' ? '24h' : '12h';
            setTimeFormat(next);
            try { localStorage.setItem('dispatch-time-format', next); } catch {}
          }}
          title="Нажми чтобы переключить формат"
        >
          <div style={{
            fontSize: isWide ? 20 : isVerySmall ? 14 : 16, fontWeight: 900, color: T.text,
            letterSpacing: 0.5, lineHeight: 1,
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
          <div style={{ fontSize: isVerySmall ? 8 : 9, color: '#007aff', fontWeight: 700, marginTop: 2, opacity: 0.7 } as any}>
            {timeFormat === '24h' ? '24h ↺' : '12h ↺'}
          </div>
        </div>

        {/* Прогресс смены */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 } as any}>
          {/* Трек */}
          <div style={{
            height: 6, background: 'rgba(0,0,0,0.06)',
            borderRadius: 3, overflow: 'hidden', position: 'relative',
          } as any}>
            <div style={{
              height: '100%', width: `${progressPct}%`,
              background: `linear-gradient(90deg, #007aff, ${timeColor})`,
              borderRadius: 3,
              transition: 'width 0.5s ease',
            } as any} />
            {/* Маркеры часов */}
            {[25, 50, 75].map(p => (
              <div key={p} style={{
                position: 'absolute', top: 0, bottom: 0,
                left: `${p}%`, width: 1,
                background: 'rgba(0,0,0,0.1)',
              } as any} />
            ))}
          </div>

          {/* Кнопки скорости */}
          <div data-onboarding="time-controls" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 } as any}>
            <div style={{ fontSize: 8, fontWeight: 700, color: themeMode === 'dark' ? '#64748b' : '#9ca3af', letterSpacing: '0.5px', textTransform: 'uppercase' } as any}>
              {'Speed \u00b7 ' + (timeSpeed === 1 ? '60' : timeSpeed === 2 ? '120' : timeSpeed === 5 ? '300' : '600') + ' mph'}
            </div>
            <div style={{ display: 'flex', gap: 3 } as any}>
            {isWide ? (
              // Десктоп — кнопки скорости
              <>
                {([1, 2, 5] as const).map(sp => (
                  <button key={sp}
                    onClick={() => setTimeSpeed(sp)}
                    style={{
                      padding: '2px 9px', height: 26,
                      background: timeSpeed === sp
                        ? (themeMode === 'dark' ? 'rgba(56,189,248,0.2)' : 'rgba(0,122,255,0.12)')
                        : (themeMode === 'dark' ? 'rgba(255,255,255,0.07)' : '#f3f4f6'),
                      border: timeSpeed === sp
                        ? (themeMode === 'dark' ? '1px solid rgba(56,189,248,0.5)' : '1px solid rgba(0,122,255,0.4)')
                        : (themeMode === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)'),
                      borderRadius: 6, cursor: 'pointer',
                      fontSize: 10, fontWeight: 800,
                      touchAction: 'manipulation',
                      color: timeSpeed === sp
                        ? (themeMode === 'dark' ? '#38bdf8' : '#007aff')
                        : (themeMode === 'dark' ? '#94a3b8' : '#6b7280'),
                      transition: 'all 0.15s',
                    } as any}>
                    {sp === 1 ? '×1' : sp === 2 ? '×2' : '×5'}
                  </button>
                ))}
              </>
            ) : (
              // Мобильный — кнопка скорости
              <>
                <button
                  onClick={() => setTimeSpeed(timeSpeed === 1 ? 2 : timeSpeed === 2 ? 5 : timeSpeed === 5 ? 10 : 1)}
                  style={{
                    padding: isVerySmall ? '2px 8px' : '3px 10px', borderRadius: 8, cursor: 'pointer',
                    background: themeMode === 'dark' ? 'rgba(56,189,248,0.15)' : 'rgba(0,122,255,0.1)',
                    border: themeMode === 'dark' ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(0,122,255,0.3)',
                    fontSize: isVerySmall ? 10 : 11, fontWeight: 900,
                    color: themeMode === 'dark' ? '#38bdf8' : '#007aff',
                  } as any}>
                  ×{timeSpeed}
                </button>
              </>
            )}
            </div>
          </div>
        </div>

        {/* Статы */}
        <div style={{ display: 'flex', gap: isWide ? 5 : isVerySmall ? 2 : 3, flexShrink: 0 } as any}>
          {/* Баланс */}
          <button data-onboarding="balance" onClick={() => setShowStats(true)} style={{
            padding: isWide ? '4px 8px' : isVerySmall ? '3px 5px' : '3px 6px',
            background: balance >= 0
              ? (themeMode === 'dark' ? 'rgba(52,199,89,0.15)' : 'rgba(52,211,153,0.12)')
              : (themeMode === 'dark' ? 'rgba(255,59,48,0.15)' : 'rgba(248,113,113,0.12)'),
            border: `1px solid ${balance >= 0
              ? (themeMode === 'dark' ? 'rgba(52,199,89,0.35)' : 'rgba(52,211,153,0.25)')
              : (themeMode === 'dark' ? 'rgba(255,59,48,0.35)' : 'rgba(248,113,113,0.25)')}`,
            borderRadius: 8, cursor: 'pointer', textAlign: 'left',
          } as any}>
            {isWide && <div style={{ fontSize: 8, color: themeMode === 'dark' ? '#64748b' : '#6b7280', fontWeight: 600, marginBottom: 1 } as any}>БАЛАНС</div>}
            <div style={{ fontSize: isWide ? 16 : isVerySmall ? 11 : 13, fontWeight: 900, color: balance >= 0 ? (themeMode === 'dark' ? '#34c759' : '#16a34a') : (themeMode === 'dark' ? '#ff453a' : '#dc2626') } as any}>
              ${balance >= 1000 ? `${(balance/1000).toFixed(1)}k` : balance.toLocaleString()}
            </div>
          </button>

          {/* Заработано за смену */}
          {totalEarned > 0 && (
            <button onClick={() => setShowStats(true)} style={{
              padding: isWide ? '4px 8px' : isVerySmall ? '3px 5px' : '3px 6px',
              background: themeMode === 'dark' ? 'rgba(251,191,36,0.15)' : 'rgba(251,191,36,0.12)',
              border: `1px solid ${themeMode === 'dark' ? 'rgba(251,191,36,0.35)' : 'rgba(251,191,36,0.25)'}`,
              borderRadius: 8, cursor: 'pointer', textAlign: 'left',
            } as any}>
              {isWide && !isVerySmall && <div style={{ fontSize: 8, color: themeMode === 'dark' ? '#64748b' : '#6b7280', fontWeight: 600, marginBottom: 1 } as any}>ЗАРАБОТАНО</div>}
              <div style={{ fontSize: isWide ? 16 : isVerySmall ? 11 : 13, fontWeight: 900, color: themeMode === 'dark' ? '#fbbf24' : '#b45309' } as any}>
                💰 ${totalEarned >= 1000 ? `${(totalEarned/1000).toFixed(1)}k` : totalEarned.toLocaleString()}
              </div>
            </button>
          )}
        </div>

        {/* Действия */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isWide ? 5 : isVerySmall ? 2 : 3, flexShrink: 0 } as any}>
          {/* Гамбургер */}
          <button onClick={() => setShowMenu(true)} style={{
            width: isWide ? 38 : isVerySmall ? 28 : 32, height: isWide ? 38 : isVerySmall ? 28 : 32,
            borderRadius: isWide ? 10 : 8,
            background: T.mode === 'dark' ? 'rgba(56,189,248,0.1)' : 'rgba(0,122,255,0.08)',
            border: T.mode === 'dark' ? '1.5px solid rgba(56,189,248,0.3)' : '1.5px solid rgba(0,122,255,0.25)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: isWide ? 4 : isVerySmall ? 2 : 3, padding: isVerySmall ? 4 : 6,
          } as any}>
            {[0,1,2].map(i => (
              <span key={i} style={{ width: isWide ? 18 : isVerySmall ? 12 : 14, height: 2, background: T.primary, borderRadius: 2, display: 'block' } as any} />
            ))}
          </button>

          {/* Кнопка переключения темы */}
          <button
            onClick={toggleTheme}
            title={themeMode === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            style={{
              width: isWide ? 38 : isVerySmall ? 28 : 32, height: isWide ? 38 : isVerySmall ? 28 : 32,
              borderRadius: isWide ? 10 : 8,
              background: themeMode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
              border: themeMode === 'dark' ? '1.5px solid rgba(255,255,255,0.15)' : '1.5px solid rgba(0,0,0,0.1)',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: 0,
              fontSize: isWide ? 18 : isVerySmall ? 14 : 16,
              transition: 'all 0.2s',
            } as any}
          >
            {themeMode === 'light' ? '🌙' : '☀️'}
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
          @keyframes indicatorPulse {
            0% { opacity: 0; transform: translateY(-5px) scale(0.8); }
            50% { opacity: 1; transform: translateY(0) scale(1.05); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
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
  // Стабильный ключ — меняется только при смене статуса/позиции, не при каждом тике
  const truckStripKey = trucks.map(t =>
    `${t.id}:${t.status}:${t.mood}:${Math.round(t.progress * 20)}:${t.hoursLeft.toFixed(0)}:${t.currentCity}:${t.destinationCity || ''}:${t.currentLoad?.agreedRate || 0}`
  ).join('|');

  const TruckStrip = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);
    const dragDistance = useRef(0);
    // Используем внешний ref для сохранения позиции между ре-рендерами

    // Mouse drag
    const handleMouseDown = (e: React.MouseEvent) => {
      if (!scrollRef.current) return;
      isDragging.current = true;
      dragDistance.current = 0;
      startX.current = e.pageX - scrollRef.current.offsetLeft;
      scrollLeft.current = scrollRef.current.scrollLeft;
      scrollRef.current.style.cursor = 'grabbing';
      (scrollRef.current.style as any).userSelect = 'none';
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging.current || !scrollRef.current) return;
      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = x - startX.current; // без множителя — 1:1 движение
      dragDistance.current = Math.abs(walk);
      scrollRef.current.scrollLeft = scrollLeft.current - walk;
      truckStripScrollPos.current = scrollRef.current.scrollLeft;
    };

    const handleMouseUp = () => {
      if (!scrollRef.current) return;
      isDragging.current = false;
      scrollRef.current.style.cursor = 'grab';
      (scrollRef.current.style as any).userSelect = 'auto';
    };

    const handleMouseLeave = () => {
      if (!scrollRef.current) return;
      isDragging.current = false;
      scrollRef.current.style.cursor = 'grab';
      (scrollRef.current.style as any).userSelect = 'auto';
    };

    // Touch drag — используем useEffect для passive: false
    const touchStartX = useRef(0);
    const touchScrollLeft = useRef(0);
    const isTouchDragging = useRef(false);
    const touchDragDistance = useRef(0);

    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;

      let startX = 0;
      let scrollLeftStart = 0;
      let dragDistance = 0;

      const onTouchStart = (e: TouchEvent) => {
        isTouchDragging.current = false;
        dragDistance = 0;
        startX = e.touches[0].clientX;
        scrollLeftStart = el.scrollLeft;
      };

      const onTouchMove = (e: TouchEvent) => {
        const dx = startX - e.touches[0].clientX;
        dragDistance = Math.abs(dx);
        if (dragDistance > 5) {
          isTouchDragging.current = true;
          e.preventDefault();
          el.scrollLeft = scrollLeftStart + dx;
          truckStripScrollPos.current = el.scrollLeft; // Сохраняем позицию
        }
      };

      const onTouchEnd = () => {
        setTimeout(() => { isTouchDragging.current = false; }, 50);
      };

      el.addEventListener('touchstart', onTouchStart, { passive: true });
      el.addEventListener('touchmove', onTouchMove, { passive: false });
      el.addEventListener('touchend', onTouchEnd, { passive: true });

      return () => {
        el.removeEventListener('touchstart', onTouchStart);
        el.removeEventListener('touchmove', onTouchMove);
        el.removeEventListener('touchend', onTouchEnd);
      };
    }, []);

    // Восстанавливаем позицию скролла после рендера
    useEffect(() => {
      if (scrollRef.current && truckStripScrollPos.current > 0) {
        scrollRef.current.scrollLeft = truckStripScrollPos.current;
      }
    });

    const handleTouchStart = (e: React.TouchEvent) => {
      if (!scrollRef.current) return;
      isTouchDragging.current = false;
      touchDragDistance.current = 0;
      touchStartX.current = e.touches[0].clientX;
      touchScrollLeft.current = scrollRef.current.scrollLeft;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!scrollRef.current) return;
      const dx = touchStartX.current - e.touches[0].clientX;
      touchDragDistance.current = Math.abs(dx);
      if (touchDragDistance.current > 5) {
        isTouchDragging.current = true;
        scrollRef.current.scrollLeft = touchScrollLeft.current + dx;
      }
    };

    const handleTouchEnd = () => {
      setTimeout(() => { isTouchDragging.current = false; }, 50);
    };

    return (
      <div
        ref={scrollRef}
        className="truck-strip-scroll-game"
        data-onboarding="truck-strip"
        style={{
          display: 'flex', overflowX: 'auto', gap: 8,
          padding: isWide ? '8px 10px' : '7px 10px',
          // На мобильных боковые отступы чтобы крайние карточки центровались
          paddingLeft: isWide ? 10 : 'calc(50% - 145px)',
          paddingRight: isWide ? 10 : 'calc(50% - 145px)',
          background: 'transparent',
          borderBottom: 'none',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
          msOverflowStyle: 'none',
          cursor: 'grab',
          overscrollBehavior: 'contain',
          // Snap scrolling на мобильных
          scrollSnapType: isWide ? 'none' : 'x mandatory',
          scrollBehavior: 'smooth',
          // Не блокировать карту справа от карточек
          width: 'fit-content',
          maxWidth: '100%',
          pointerEvents: 'auto',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        } as any}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
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
        // Рандомные номера трака и трейлера на основе ID (стабильные)
        const idNum = parseInt(truck.id.replace(/\D/g, '')) || 1;
        const truckNum = String(((idNum * 317 + 100) % 900) + 100);
        const trailerNum = String(((idNum * 491 + 200) % 900) + 100);
        // Полное имя водителя
        const driverFullName = truck.driver || truck.name;
        const fromSt = CITY_STATE[truck.currentCity] || '';
        const toSt = truck.destinationCity ? (CITY_STATE[truck.destinationCity] || '') : '';
        const fromLabel = fromSt ? `${truck.currentCity}, ${fromSt}` : truck.currentCity;
        const toLabel = toSt ? `${truck.destinationCity}, ${toSt}` : (truck.destinationCity || '');
        const statusLabel = (truck as any).onNightStop ? '🌙 Ночёвка' : (truck as any).hosRestUntilMinute > 0 ? '😴 HOS отдых' : STATUS_LABEL[truck.status];
        const CARD_H = isWide ? 120 : 100;
        const AVATAR_W = isWide ? 90 : 76;

        return (
          <div key={truck.id} {...(truckIdx === 0 ? { 'data-onboarding': 'truck-card' } : {})} style={{ position: 'relative', flexShrink: 0, scrollSnapAlign: isWide ? 'none' : 'center', display: 'flex', flexDirection: 'column' } as any}>

          {/* ═══ КАРТОЧКА — UBER/LYFT СТИЛЬ (ПРОЗРАЧНАЯ) ═══ */}
          <div
            onClick={() => { if (dragDistance.current < 5 && !isTouchDragging.current) handleTruckClick(truck); }}
            style={{
              width: isWide ? 360 : 290,
              height: CARD_H,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: `2px solid ${isSelected ? color : isAlert ? color + '99' : 'rgba(0,0,0,0.1)'}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              fontFamily: 'sans-serif',
              display: 'flex', flexDirection: 'row',
              overflow: 'hidden',
              transition: 'all 0.2s',
            } as any}
          >
            {/* ── ЛЕВЫЙ БЛОК: водитель ── */}
            <div style={{
              width: AVATAR_W, flexShrink: 0,
              background: 'transparent',
              borderRight: `1px solid ${color}33`,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 4, position: 'relative',
            } as any}>
              {/* Эмодзи настроения — маленький в правом верхнем углу */}
              <div style={{ position: 'absolute', top: 5, right: 5 } as any}>
                <img src={moodEmoji} width={22} height={22} style={{ display: 'block' } as any} />
              </div>
              {/* Пилот — главное изображение водителя */}
              <img
                src={E.pilot}
                width={isWide ? 62 : 52}
                height={isWide ? 62 : 52}
                className={animClass}
                style={{ imageRendering: 'auto', display: 'block', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' } as any}
              />
              {/* Статус под пилотом */}
              <div style={{
                fontSize: isWide ? 10 : 9, fontWeight: 700,
                color: color,
                background: 'transparent',
                border: `1px solid ${color}44`,
                borderRadius: 5, padding: '1px 6px',
                whiteSpace: 'nowrap',
              } as any}>{statusLabel}</div>
            </div>

            {/* ── ПРАВЫЙ БЛОК: вся информация ── */}
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              padding: isWide ? '8px 12px' : '6px 10px', gap: 0, minWidth: 0,
            } as any}>

              {/* ── СТРОКА 1: Имя + номера ── */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 } as any}>
                <span style={{ fontSize: isWide ? 15 : 13, fontWeight: 900, color: '#111827', letterSpacing: -0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as any}>
                  {driverFullName}
                </span>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 6 } as any}>
                  <span style={{
                    fontSize: isWide ? 10 : 9, fontWeight: 700, color: '#007aff',
                    background: 'transparent',
                    border: '1px solid rgba(0,122,255,0.3)',
                    borderRadius: 4, padding: '1px 5px',
                  } as any}>TRK {truckNum}</span>
                  <span style={{
                    fontSize: isWide ? 10 : 9, fontWeight: 700, color: '#6b7280',
                    background: 'transparent',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: 4, padding: '1px 5px',
                  } as any}>TRL {trailerNum}</span>
                </div>
              </div>

              {/* ── СТРОКА 2: Маршрут ── */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'transparent',
                borderRadius: 6, padding: '3px 7px', marginBottom: 4,
              } as any}>
                <span style={{ fontSize: 10, color: '#64748b', flexShrink: 0 } as any}>📍</span>
                {truck.destinationCity ? (
                  <span style={{ fontSize: isWide ? 11 : 10, fontWeight: 700, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as any}>
                    {fromLabel}
                    <span style={{ color: '#9ca3af', margin: '0 4px' } as any}>→</span>
                    <span style={{ color: '#007aff' } as any}>{toLabel}</span>
                  </span>
                ) : (
                  <span style={{ fontSize: isWide ? 11 : 10, fontWeight: 700, color: '#6b7280' } as any}>{fromLabel}</span>
                )}
              </div>

              {/* ── СТРОКА 3: Прогресс-бар ── */}
              <div style={{ marginBottom: 4 } as any}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 } as any}>
                  <span style={{ fontSize: 9, color: '#6b7280', fontWeight: 600 } as any}>
                    {isMoving ? 'Прогресс рейса' : truck.status === 'at_pickup' ? 'Погрузка' : truck.status === 'at_delivery' ? 'Разгрузка' : 'Ожидание'}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 800, color: isMoving ? color : '#9ca3af' } as any}>
                    {isMoving ? `${progressPct}%` : '—'}
                  </span>
                </div>
                <div style={{ height: 5, background: 'transparent', borderRadius: 3, overflow: 'hidden' } as any}>
                  <div style={{
                    height: '100%',
                    width: isMoving ? `${progressPct}%` : '0%',
                    background: `linear-gradient(90deg, ${color}66, ${color})`,
                    borderRadius: 3,
                    boxShadow: isMoving ? `0 0 6px ${color}88` : 'none',
                    transition: 'width 0.8s ease',
                  } as any} />
                </div>
              </div>

              {/* ── СТРОКА 4: Drive HOS + Настроение + Ставка ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 } as any}>
                <div style={{
                  display: 'flex', alignItems: 'baseline', gap: 2,
                  background: 'transparent',
                  border: `1px solid ${hosColor}44`,
                  borderRadius: 6, padding: '2px 6px',
                } as any}>
                  <span style={{ fontSize: isWide ? 13 : 12, fontWeight: 900, color: hosColor, lineHeight: 1 } as any}>{hos.toFixed(1)}</span>
                  <span style={{ fontSize: 9, fontWeight: 600, color: hosColor, opacity: 0.8 } as any}>h drive</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 } as any}>
                  <span style={{ fontSize: 11 } as any}>😊</span>
                  <span style={{ fontSize: isWide ? 12 : 11, fontWeight: 800, color: mood >= 60 ? '#34d399' : mood >= 35 ? '#fbbf24' : '#f87171' } as any}>{mood}%</span>
                </div>
                {truck.currentLoad ? (
                  <div style={{
                    marginLeft: 'auto', flexShrink: 0,
                    display: 'flex', alignItems: 'baseline', gap: 1,
                    background: 'transparent',
                    border: '1px solid rgba(74,222,128,0.3)',
                    borderRadius: 6, padding: '2px 7px',
                  } as any}>
                    <span style={{ fontSize: isWide ? 14 : 13, fontWeight: 900, color: '#4ade80', lineHeight: 1 } as any}>
                      ${truck.currentLoad.agreedRate.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div style={{
                    marginLeft: 'auto', flexShrink: 0,
                    background: 'transparent',
                    border: '1px solid rgba(148,163,184,0.15)',
                    borderRadius: 6, padding: '2px 7px',
                  } as any}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#475569' } as any}>Нет груза</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ── Уведомление под карточкой ── */}
          {indicatorNotifications[truck.id] && (() => {
            const notif = indicatorNotifications[truck.id];
            const isUrgent = notif.text.includes('сломал') || notif.text.includes('топлив') || notif.text.includes('HOS') || notif.text.includes('Detention');
            const bgColor = isUrgent ? 'rgba(239,68,68,0.92)' : 'rgba(251,146,60,0.92)';
            const borderColor = isUrgent ? 'rgba(239,68,68,0.6)' : 'rgba(251,146,60,0.5)';
            return (
              <div
                onClick={() => handleTruckClick(truck)}
                style={{
                  marginTop: 4,
                  background: bgColor,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: `1px solid ${borderColor}`,
                  borderRadius: 10,
                  padding: '7px 10px',
                  cursor: 'pointer',
                  animation: 'indicatorPulse 0.4s ease-out',
                  display: 'flex', alignItems: 'center', gap: 7,
                  width: isWide ? 360 : 290,
                } as any}
              >
                <span style={{ fontSize: 14, flexShrink: 0 } as any}>🚨</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: '#fff',
                  flex: 1, lineHeight: 1.3,
                } as any}>{notif.text}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', flexShrink: 0 } as any}>→</span>
              </div>
            );
          })()}

          </div>
        );
      })}

      {/* ── КАРТОЧКА "КУПИТЬ ТРАК" ── */}
      <div
        onClick={() => useGameStore.getState().setGarageOpen(true)}
        style={{
          minWidth: isWide ? 90 : 78, flexShrink: 0,
          borderRadius: 10, overflow: 'hidden',
          background: 'rgba(255,255,255,0.03)',
          border: '2px dashed rgba(56,189,248,0.25)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontFamily: 'sans-serif',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        } as any}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(6,182,212,0.08)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.6)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.25)';
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 6px' } as any}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'rgba(56,189,248,0.12)',
            border: '1.5px solid rgba(56,189,248,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: '#38bdf8', lineHeight: 1,
          } as any}>+</div>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#38bdf8', textAlign: 'center', lineHeight: 1.3 } as any}>
            Купить{'\n'}трак
          </span>
        </div>
      </div>

    </div>
    );
  };

  // ── SIDE TABS (desktop) ───────────────────────────────────────────────────
  const GUIDE_TAB_STEPS: Record<string, string[]> = {
    loadboard: ['find_load', 'negotiate'],
    trucks:    ['assign_truck', 'resolve_event', 'end_shift'],
    map:       ['watch_map', 'get_paid'],
  };

  const SideTabs = () => {
    const tabDefs = [
      { id: 'loadboard', icon: '📦', label: 'Грузы',   badge: tabs.find(t => t.id === 'loadboard')?.badge },
      { id: 'chat',      icon: '💬', label: 'Связь',   badge: tabs.find(t => t.id === 'chat')?.badge },
      { id: 'trucks',    icon: '🚛', label: 'Траки',   badge: tabs.find(t => t.id === 'trucks')?.badge },
    ];
    return (
      <View style={{
        flexDirection: 'row', gap: 6,
        paddingHorizontal: 8, paddingVertical: 8,
        backgroundColor: themeMode === 'dark' ? '#0d1117' : T.navBg,
        borderBottomWidth: 1,
        borderBottomColor: themeMode === 'dark' ? 'rgba(56,189,248,0.15)' : T.navBorder,
      } as any}>
        {tabDefs.map(tab => {
          const isOn = activeTab === tab.id;
          const isGuideActive = GUIDE_TAB_STEPS[tab.id]?.includes(activeGuideStep as string);
          return (
            <TouchableOpacity
              key={tab.id}
              {...(tab.id === 'loadboard' ? { 'data-onboarding': 'loadboard-tab' } : {})}
              onPress={() => {
                if (tab.onPress) {
                  tab.onPress();
                } else {
                  // Если нажали на уже активную вкладку — закрываем её (переходим на карту)
                  if (isOn) {
                    handleMapTabPress();
                  } else {
                    switchTab(tab.id as Tab);
                  }
                }
              }}
              style={{
                flex: isOn ? 2 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isOn ? 6 : 0,
                paddingVertical: 13,
                borderRadius: 16,
                backgroundColor: isOn
                  ? (themeMode === 'dark' ? 'rgba(6,182,212,0.1)' : T.navActiveBtn)
                  : (themeMode === 'dark' ? 'rgba(255,255,255,0.08)' : T.navInactiveBtn),
                borderWidth: 1.5,
                borderColor: isOn
                  ? (themeMode === 'dark' ? '#38bdf8' : 'transparent')
                  : isGuideActive
                    ? 'rgba(56,189,248,0.5)'
                    : (themeMode === 'dark' ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.1)'),
                position: 'relative',
                ...(isOn && themeMode === 'dark' ? {
                  shadowColor: '#38bdf8',
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 0 },
                } : {}),
              } as any}
            >
              <div style={{
                filter: isOn
                  ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.18)) drop-shadow(0 1px 3px rgba(0,0,0,0.12))'
                  : 'drop-shadow(0 3px 6px rgba(0,0,0,0.13)) drop-shadow(0 1px 2px rgba(0,0,0,0.08))',
                transform: isOn ? 'translateY(-4px)' : 'translateY(-2px)',
                transition: 'transform 0.2s ease, filter 0.2s ease',
                lineHeight: 0, display: 'inline-block',
              } as any}>
                <Text style={{ fontSize: 24, lineHeight: 28 } as any}>{tab.icon}</Text>
              </div>
              {isOn && (
                <Text style={{
                  fontSize: 15, fontWeight: '900',
                  color: themeMode === 'dark' ? '#ffffff' : '#1e293b',
                  fontFamily: "'Nunito', -apple-system, sans-serif",
                  letterSpacing: 0.2,
                } as any}>{tab.label}</Text>
              )}
              {isGuideActive && !isOn && (
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#38bdf8', marginLeft: 4 } as any} />
              )}
              {tab.badge !== undefined && tab.badge > 0 && (
                <View style={{
                  position: 'absolute', top: 5, right: 5,
                  backgroundColor: themeMode === 'dark' ? '#38bdf8' : (isOn ? T.primary : '#ef4444'),
                  borderRadius: 9, paddingHorizontal: 5, paddingVertical: 1,
                  minWidth: 18, alignItems: 'center',
                } as any}>
                  <Text style={{
                    fontSize: 10, fontWeight: '800',
                    color: themeMode === 'dark' ? '#0f172a' : '#fff',
                  } as any}>{tab.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // ── BOTTOM TABS (mobile) ──────────────────────────────────────────────────
  const BottomTabs = () => {
    const tabDefs = [
      { id: 'map',       icon: '🌎',  label: 'Карта',  onPress: handleMapTabPress },
      { id: 'loadboard', icon: '📦',  label: 'Грузы',  badge: tabs.find(t=>t.id==='loadboard')?.badge },
      { id: 'chat',      icon: '💬',  label: 'Связь',  badge: tabs.find(t=>t.id==='chat')?.badge },
      { id: 'trucks',    icon: '🚛',  label: 'Траки',  badge: tabs.find(t=>t.id==='trucks')?.badge },
    ];

    return (
      <View style={{
        flexDirection: 'row', gap: 6,
        paddingHorizontal: 8, paddingVertical: 8,
        backgroundColor: activeTab === 'map'
          ? (themeMode === 'dark' ? 'rgba(13,17,23,0.55)' : 'rgba(255,255,255,0.55)')
          : (themeMode === 'dark' ? '#0d1117' : T.navBg),
        borderTopWidth: 1,
        borderTopColor: activeTab === 'map'
          ? 'rgba(56,189,248,0.08)'
          : (themeMode === 'dark' ? 'rgba(56,189,248,0.15)' : T.navBorder),
        // @ts-ignore
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        backdropFilter: activeTab === 'map' ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: activeTab === 'map' ? 'blur(12px)' : 'none',
      } as any}>
        {tabDefs.map(tab => {
          const isOn = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              {...(tab.id === 'loadboard' ? { 'data-onboarding': 'loadboard-tab' } : {})}
              onPress={() => {
                if (tab.onPress) {
                  tab.onPress();
                } else {
                  // Если нажали на уже активную вкладку (кроме карты) — закрываем её (переходим на карту)
                  if (isOn && tab.id !== 'map') {
                    handleMapTabPress();
                  } else {
                    switchTab(tab.id as Tab);
                  }
                }
              }}
              style={{
                flex: isOn ? 2 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isOn ? 6 : 0,
                paddingVertical: 13,
                borderRadius: 16,
                backgroundColor: isOn
                  ? (themeMode === 'dark' ? 'rgba(6,182,212,0.1)' : T.navActiveBtn)
                  : (themeMode === 'dark'
                      ? (activeTab === 'map' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)')
                      : T.navInactiveBtn),
                borderWidth: 1.5,
                borderColor: isOn
                  ? (themeMode === 'dark' ? '#38bdf8' : 'transparent')
                  : (themeMode === 'dark'
                      ? (activeTab === 'map' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.22)')
                      : 'rgba(0,0,0,0.1)'),
                position: 'relative',
                ...(isOn && themeMode === 'dark' ? {
                  shadowColor: '#38bdf8',
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 0 },
                } : {}),
              } as any}
            >
              <div style={{
                filter: isOn
                  ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.18)) drop-shadow(0 1px 3px rgba(0,0,0,0.12))'
                  : 'drop-shadow(0 3px 6px rgba(0,0,0,0.13)) drop-shadow(0 1px 2px rgba(0,0,0,0.08))',
                transform: isOn ? 'translateY(-4px)' : 'translateY(-2px)',
                transition: 'transform 0.2s ease, filter 0.2s ease',
                lineHeight: 0,
                display: 'inline-block',
              } as any}>
                <Text style={{ fontSize: 24, lineHeight: 28 } as any}>{tab.icon}</Text>
              </div>
              {isOn && (
                <Text style={{
                  fontSize: 15, fontWeight: '900',
                  color: themeMode === 'dark' ? '#ffffff' : '#1e293b',
                  fontFamily: "'Nunito', -apple-system, sans-serif",
                  letterSpacing: 0.2,
                } as any}>{tab.label}</Text>
              )}
              {tab.badge !== undefined && tab.badge > 0 && (
                <View style={{
                  position: 'absolute', top: 5, right: 5,
                  backgroundColor: themeMode === 'dark' ? '#38bdf8' : (isOn ? T.primary : '#ef4444'),
                  borderRadius: 9, paddingHorizontal: 5, paddingVertical: 1,
                  minWidth: 18, alignItems: 'center',
                } as any}>
                  <Text style={{
                    fontSize: 10, fontWeight: '800',
                    color: themeMode === 'dark' ? '#0f172a' : '#fff',
                  } as any}>
                    {tab.badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // ── TOAST СИСТЕМА ────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Array<{id: number; message: string; color: string; truckId?: string}>>([]);
  const toastIdRef = useRef(0);

  useEffect(() => {
    function handleMapToast(e: Event) {
      const { message, color = '#ef4444', duration = 4000, truckId } = (e as CustomEvent).detail;
      const id = ++toastIdRef.current;
      setToasts(prev => [...prev, { id, message, color, truckId }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }
    window.addEventListener('mapToast', handleMapToast);
    return () => window.removeEventListener('mapToast', handleMapToast);
  }, []);

  // Переключение вкладки из внешних компонентов
  useEffect(() => {
    function handleSwitchTab(e: Event) {
      const { tab } = (e as CustomEvent).detail || {};
      if (tab && ['map', 'loadboard', 'trucks', 'chat'].includes(tab)) {
        switchTab(tab as Tab);
      }
    }
    window.addEventListener('switchTab', handleSwitchTab);
    return () => window.removeEventListener('switchTab', handleSwitchTab);
  }, [switchTab]);

  // Авто-переключение на чат при поломке
  useEffect(() => {
    const broken = trucks.filter(t => t.status === 'breakdown');
    if (broken.length > 0 && activeTab !== 'chat') {
      // Мигаем иконкой чата — badge уже обновится через unreadChat
    }
  }, [trucks.map(t => t.status).join(',')]);

  const mapProps = {
    onTruckInfo: (id: string) => {
      selectTruck(id);
      // Включаем follow mode через event
      const t = trucks.find(x => x.id === id);
      if (t) {
        window.dispatchEvent(new CustomEvent('followTruckFromCard', {
          detail: { truckId: id, lng: t.position[0], lat: t.position[1] }
        }));
      }
    },
    onTruckSelect: (id: string) => { 
      // Пустая строка = снять выделение (toggle с карты)
      if (!id) { selectTruck(null); return; }
      selectTruck(id); 
    },
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
          detail: { truckId, zoomOut: 0.2 } // медленный zoom out на 20%
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
          {/* Левая колонка: топбар + карта + траки */}
          <View style={[s.leftCol, { position: 'relative' }]}>
            <TopBar />
            <View style={s.mapArea} data-onboarding="map">
              <ErrorBoundary name="Map"><GoogleMapView {...mapProps} /></ErrorBoundary>
              {/* Карточки траков — поверх карты, сверху */}
              <View style={s.truckStripBar} pointerEvents="box-none">
                <TruckCardOverlay
                  onTruckClick={handleTruckClick}
                  selectedTruckId={selectedTruckId}
                />
              </View>
            </View>
            {/* Кнопка свернуть/развернуть правую панель */}
            <div
              onClick={() => setRightPanelCollapsed(v => !v)}
              style={{
                position: 'absolute', right: 0, top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 50,
                width: 20, height: 56,
                background: themeMode === 'dark' ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)',
                border: themeMode === 'dark' ? '1px solid rgba(56,189,248,0.3)' : '1px solid rgba(0,0,0,0.12)',
                borderRight: 'none',
                borderRadius: '8px 0 0 8px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s',
                boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
              } as any}
              title={rightPanelCollapsed ? 'Развернуть панель' : 'Свернуть панель'}
            >
              <span style={{
                fontSize: 12, color: themeMode === 'dark' ? '#38bdf8' : '#007aff',
                fontWeight: 900, lineHeight: 1,
                transform: rightPanelCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 0.3s ease',
                display: 'block',
              } as any}>‹</span>
            </div>
          </View>

          {/* Правая колонка: табы + контент */}
          <div style={{
            width: rightPanelCollapsed ? 0 : 400,
            minWidth: rightPanelCollapsed ? 0 : 400,
            overflow: 'hidden',
            transition: 'width 0.3s ease, min-width 0.3s ease',
            display: 'flex', flexDirection: 'column',
            background: themeMode === 'dark' ? '#0d1117' : '#ffffff',
            borderLeft: themeMode === 'dark' ? '1px solid rgba(56,189,248,0.15)' : '1px solid rgba(0,0,0,0.08)',
          } as any}>
            <SideTabs />
            <View style={s.panelContent}>
              {(activeTab === 'loadboard' || activeTab === 'map') && <ErrorBoundary name="Loads"><LoadBoardPanel onAssigned={handleAssigned} /></ErrorBoundary>}
              {activeTab === 'trucks'    && <ErrorBoundary name="Trucks"><TruckPanel onSwitchToLoadBoard={() => switchTab('loadboard')} /></ErrorBoundary>}
              {activeTab === 'chat'      && <ErrorBoundary name="Chat"><UnifiedChatUI nickname={sessionName || 'player'} /></ErrorBoundary>}
            </View>
          </div>
        </View>

      ) : isLandscape ? (
        /* ══ LANDSCAPE MOBILE ══ */
        <View style={s.mobileLandscape}>
          {/* Топбар на всю ширину сверху */}
          <TopBar />
          {/* Основной контент: карта слева + панель справа */}
          <View style={s.landscapeBody}>
            {/* Левая часть: карта */}
            <View style={[s.landscapeMap, { position: 'relative' } as any]}>
              <ErrorBoundary name="Map"><GoogleMapView {...mapProps} /></ErrorBoundary>
              {/* Карточки траков поверх карты */}
              <View style={s.truckStripBar} pointerEvents="box-none">
                <TruckCardOverlay
                  onTruckClick={handleTruckClick}
                  selectedTruckId={selectedTruckId}
                />
              </View>
              {/* Кнопка свернуть/развернуть правую панель */}
              <div
                onClick={() => setRightPanelCollapsed(v => !v)}
                style={{
                  position: 'absolute', right: 0, top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 50,
                  width: 20, height: 56,
                  background: themeMode === 'dark' ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)',
                  border: themeMode === 'dark' ? '1px solid rgba(56,189,248,0.3)' : '1px solid rgba(0,0,0,0.12)',
                  borderRight: 'none',
                  borderRadius: '8px 0 0 8px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s',
                  boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
                } as any}
                title={rightPanelCollapsed ? 'Развернуть панель' : 'Свернуть панель'}
              >
                <span style={{
                  fontSize: 12, color: themeMode === 'dark' ? '#38bdf8' : '#007aff',
                  fontWeight: 900, lineHeight: 1,
                  transform: rightPanelCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                  transition: 'transform 0.3s ease',
                  display: 'block',
                } as any}>‹</span>
              </div>
            </View>
            {/* Правая часть: табы + панель */}
            <div style={{
              width: rightPanelCollapsed ? 0 : 320,
              minWidth: rightPanelCollapsed ? 0 : 320,
              overflow: 'hidden' as any,
              transition: 'width 0.3s ease, min-width 0.3s ease',
              display: 'flex', flexDirection: 'column' as any,
              background: themeMode === 'dark' ? '#0d1117' : '#ffffff',
              borderLeft: themeMode === 'dark' ? '1px solid rgba(56,189,248,0.15)' : '1px solid rgba(0,0,0,0.08)',
            } as any}>
              <SideTabs />
              <View style={s.panelContent}>
                {(activeTab === 'loadboard' || activeTab === 'map') && <ErrorBoundary name="Loads"><LoadBoardPanel onAssigned={handleAssigned} /></ErrorBoundary>}
                {activeTab === 'trucks'    && <ErrorBoundary name="Trucks"><TruckPanel onSwitchToLoadBoard={() => switchTab('loadboard')} /></ErrorBoundary>}
                {activeTab === 'chat'      && <ErrorBoundary name="Chat"><UnifiedChatUI nickname={sessionName || 'player'} /></ErrorBoundary>}
              </View>
            </div>
          </View>
        </View>

      ) : (
        /* ══ MOBILE PORTRAIT ══ */
        <View style={s.mobile}>
          <TopBar />
          <View style={s.mobileContent}>
            {/* Карта — всегда на весь экран */}
            <ErrorBoundary name="Map"><GoogleMapView {...mapProps} /></ErrorBoundary>
            {/* Карточки траков — поверх карты, только на вкладке карты */}
            {activeTab === 'map' && (
              <View style={s.truckStripBar} pointerEvents="box-none">
                <TruckCardOverlay
                  onTruckClick={handleTruckClick}
                  selectedTruckId={selectedTruckId}
                />
              </View>
            )}
            {/* Панели — поверх карты, с отступом 13% сверху */}
            {activeTab !== 'map' && (
              <View style={s.mobilePanelOverlay}>
                {activeTab === 'loadboard' && <ErrorBoundary name="Loads"><LoadBoardPanel onAssigned={handleAssigned} /></ErrorBoundary>}
                {activeTab === 'trucks'    && <ErrorBoundary name="Trucks"><TruckPanel onSwitchToLoadBoard={() => switchTab('loadboard')} /></ErrorBoundary>}
                {activeTab === 'chat'      && <ErrorBoundary name="Chat"><UnifiedChatUI nickname={sessionName || 'player'} /></ErrorBoundary>}
              </View>
            )}
          </View>
          <BottomTabs />
        </View>
      )}

      {/* ── TOAST УВЕДОМЛЕНИЯ — только без truckId (системные) ── */}
      {toasts.filter(t => !t.truckId).length > 0 && (
        <View style={{
          position: 'absolute', bottom: 80, left: 0, right: 0,
          alignItems: 'center', gap: 6,
          zIndex: 9999,
        } as any} pointerEvents="box-none">
          {toasts.filter(t => !t.truckId).map(toast => (
            <TouchableOpacity
              key={toast.id}
              activeOpacity={0.8}
              onPress={() => setToasts(prev => prev.filter(x => x.id !== toast.id))}
              style={{
                backgroundColor: toast.color,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 8,
                maxWidth: 300,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                shadowColor: '#000',
                shadowOpacity: 0.25,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
                elevation: 8,
              } as any}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700', lineHeight: 16, flex: 1 } as any}>
                {toast.message}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── MODALS ── */}
      {/* Driver Start Dialog — аватар совпадает с карточкой трака */}
      <CharacterDialog
        visible={showDriverDialog}
        character={{
          ...CHARACTERS[chatCharacter],
          avatar: chatCharacter === 'driver' && trucks.length > 0
            ? getDriverAvatar(trucks[0].driver || trucks[0].id)
            : CHARACTERS[chatCharacter].avatar,
        }}
        steps={chatCharacter === 'driver' ? DIALOG_DRIVER_START : DIALOG_DRIVER_START}
        onBack={() => {
          setShowDriverDialog(false);
          switchTab('chat');
        }}
        onClose={() => {
          setShowDriverDialog(false);
          const sessionKey = `dialog-shown-${sessionName || 'default'}`;
          localStorage.setItem(sessionKey, '1');
        }}
        onComplete={() => {
          setShowDriverDialog(false);
          const sessionKey = `dialog-shown-${sessionName || 'default'}`;
          localStorage.setItem(sessionKey, '1');
        }}
      />

      {negotiation.open && negotiation.load && (
        <ErrorBoundary name="Neg">
          <NegotiationChat
            visible={negotiation.open}
            load={negotiation.load}
            onClose={closeNegotiation}
            onAccepted={(agreedRate) => {
              // Груз уже назначен внутри NegotiationChat
              closeNegotiation();
            }}
          />
        </ErrorBoundary>
      )}
      {detailTruck && (
        <TruckDetailModal truck={detailTruck} onClose={() => setDetailTruck(null)}
          onFindLoad={(city) => { setLoadBoardSearch(city); setDetailTruck(null); switchTab('loadboard'); }} />
      )}
      {showFleet && <Modal onClose={() => setShowFleet(false)}><FleetOverview /></Modal>}
      {showCompliance && <Modal onClose={() => setShowCompliance(false)}><ComplianceDashboard /></Modal>}
      {showEvents && <Modal onClose={() => setShowEvents(false)}><EventsPanel /></Modal>}
      {showMyLoads && <Modal onClose={() => setShowMyLoads(false)}><MyLoadsPanel /></Modal>}
      
      {/* Попапы — только глобальные (не связанные с траком) */}
      
      {showStats && <StatsPopup onClose={() => setShowStats(false)} />}
      {showSettings && <SettingsPopup onClose={() => setShowSettings(false)} />}
      {showHelp && <HelpPopup onClose={() => setShowHelp(false)} />}
      <TruckShopModal />
      <RepairGarageModal />
      {/* Колокольчик и меню — вне TopBar div чтобы Modal работал корректно */}
      <div data-onboarding="notification-bell" style={{ display: 'contents' }}>
      <NotificationBell
        onNavigateToTrucks={() => switchTab('trucks')}
        onNavigateToLoads={() => switchTab('chat')}
        onNavigateToEvents={() => setShowEvents(true)}
        forceOpen={showBell}
        onClose={() => setShowBell(false)}
      />
      </div>
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
        onOpenGuide={() => setShowDriverDialog(true)}
        onExit={() => { if (clockRef.current) clearInterval(clockRef.current); }}
      />
      {/* Guide Bubble — контекстные подсказки */}
      {guideVisible && <GuideBubble />}
      {/* Onboarding Overlay — попапы онбординга */}
      {onbIsActive && <OnboardingOverlay />}
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

