// DISPATCH OFFICE — Main Menu 2026
// Trends: Glassmorphism + Cinematic + Neon + Particles
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { getCurrentUser } from '../utils/firebaseSaveSystem';
import SavesManagerPopup from '../components/SavesManagerPopup';
import SettingsPopup from '../components/SettingsPopup';
import TruckShopModal from '../components/TruckShopModal';
import RepairGarageModal from '../components/RepairGarageModal';

export default function MainMenu() {
  const router = useRouter();
  const { startShift, loadGame } = useGameStore();
  const [hasSave, setHasSave] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSaves, setShowSaves] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGarage, setShowGarage] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  useEffect(() => {
    checkSaveAndUser();
  }, []);

  async function checkSaveAndUser() {
    try {
      const raw = localStorage.getItem('dispatcher-game-save');
      if (raw) { const s = JSON.parse(raw); if (s?.version >= 5) setHasSave(true); }
    } catch {}
    try { const u = await getCurrentUser(); setUserEmail(u?.email || null); } catch {}
  }

  async function handleContinue() {
    setLoading(true);
    try { const ok = await loadGame(); if (ok) router.replace('/game'); else alert('Не удалось загрузить'); }
    finally { setLoading(false); }
  }

  async function handleNewGame() {
    if (hasSave && !window.confirm('⚠️ Начать новую игру? Прогресс будет потерян.')) return;
    setLoading(true);
    try { await startShift(1, 'Новая смена'); router.replace('/game'); }
    finally { setLoading(false); }
  }

  const items = [
    ...(hasSave ? [{ id:'continue', icon:'▶', label:'Продолжить', sub:'Последнее сохранение', color:'#22c55e', glow:'#22c55e', action: handleContinue, hot: true }] : []),
    { id:'new', icon:'⚡', label: hasSave ? 'Новая игра' : 'Начать игру', sub:'1 трак · Knoxville, TN', color:'#3b82f6', glow:'#60a5fa', action: handleNewGame, hot: !hasSave },
    { id:'saves', icon:'☁', label:'Сохранения', sub: userEmail ? 'Облачная история' : 'Войдите для облака', color:'#a78bfa', glow:'#c4b5fd', action: () => setShowSaves(true) },
    { id:'garage', icon:'🔧', label:'Гараж', sub:'Ремонт и улучшения', color:'#f59e0b', glow:'#fcd34d', action: () => { useGameStore.getState().setRepairGarageOpen(true); } },
    { id:'settings', icon:'⚙', label:'Настройки', sub:'Графика · Звук', color:'#06b6d4', glow:'#67e8f9', action: () => setShowSettings(true) },
    { id:'profile', icon:'◉', label:'Профиль', sub:'Статистика · Достижения', color:'#ec4899', glow:'#f9a8d4', action: () => setShowProfile(true), soon: true },
  ];

  // Генерируем частицы один раз
  const particles = Array.from({length: 60}, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    speed: Math.random() * 0.015 + 0.005,
    opacity: Math.random() * 0.6 + 0.2,
    color: ['#06b6d4','#3b82f6','#8b5cf6','#ec4899','#22c55e'][Math.floor(Math.random()*5)],
    phase: Math.random() * Math.PI * 2,
  }));

  return (
    <View style={s.root}>
      {/* ═══ CSS АНИМАЦИИ ═══ */}
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes glitch { 0%,90%,100%{transform:translate(0)} 92%{transform:translate(-2px,1px)} 94%{transform:translate(2px,-1px)} 96%{transform:translate(-1px,2px)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes borderGlow { 0%,100%{box-shadow:0 0 8px rgba(6,182,212,0.3)} 50%{box-shadow:0 0 24px rgba(6,182,212,0.8),0 0 48px rgba(6,182,212,0.3)} }
        @keyframes truckDrive { 0%{transform:translateX(0) scaleX(1)} 49%{transform:translateX(8px) scaleX(1)} 50%{transform:translateX(8px) scaleX(-1)} 99%{transform:translateX(0) scaleX(-1)} 100%{transform:translateX(0) scaleX(1)} }
        @keyframes roadMove { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes cityPulse { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
        @keyframes neonFlicker { 0%,19%,21%,23%,25%,54%,56%,100%{opacity:1} 20%,24%,55%{opacity:0.4} }
        @keyframes particleDrift { 0%{transform:translateY(0) translateX(0);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateY(-80px) translateX(20px);opacity:0} }
        .menu-item-hover { transition: all 0.2s cubic-bezier(0.4,0,0.2,1) !important; }
        .menu-item-hover:hover { transform: translateX(6px) !important; }
        .btn-primary-hover:hover { filter: brightness(1.15) !important; transform: scale(1.02) !important; }
      `}</style>

      {/* ═══ CINEMATIC BACKGROUND — Veo 3 Video ═══ */}
      <View style={s.bg}>
        {/* Видео фон */}
        {/* Видео фон — вперёд + реверс склеены в один loop */}
        <video
          autoPlay
          muted
          loop
          playsInline
          ref={(el) => { if (el && !(el as any)._init) { (el as any)._init = true; el.playbackRate = 0.5; } }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.7,
          } as any}
          src="/assets/Truck_loop.mp4"
        />

        {/* Сканлайн — кинематографический эффект */}
        <View style={s.scanline} />
      </View>

      {/* ═══ ЦЕНТРИРОВАННОЕ МЕНЮ ═══ */}
      <View style={s.centerWrap}>
        <View style={s.menuCard}>
          {/* Стеклянный фон карточки */}
          <View style={s.glassPanel} />

          {/* Логотип */}
          <View style={s.logoSection}>
            <View style={s.logoIconBox}>
              <LinearGradient colors={['#1d4ed8','#0ea5e9','#06b6d4']} style={s.logoGrad} start={{x:0,y:0}} end={{x:1,y:1}}>
                <Text style={s.logoEmoji}>🚛</Text>
              </LinearGradient>
              <View style={s.logoGlow} />
            </View>
            <View>
              <Text style={s.logoLine1}>DISPATCH</Text>
              <Text style={s.logoLine2}>OFFICE</Text>
              <View style={s.betaTag}>
                <Text style={s.betaTagText}>● BETA 2.2</Text>
              </View>
            </View>
          </View>

          {/* Разделитель */}
          <View style={s.neonDivider} />

          {/* Аккаунт */}
          {userEmail ? (
            <View style={s.accountCard}>
              <View style={s.accountAva}>
                <Text style={s.accountAvaText}>{userEmail[0].toUpperCase()}</Text>
              </View>
              <View style={{flex:1}}>
                <Text style={s.accountName} numberOfLines={1}>{userEmail}</Text>
                <Text style={s.accountStatus}>● Синхронизация активна</Text>
              </View>
              <View style={s.onlineDot} />
            </View>
          ) : (
            <View style={s.guestCard}>
              <Text style={s.guestText}>👤  Гость  ·  Войдите для облака</Text>
            </View>
          )}

          {/* Пункты меню */}
          <View style={{gap:6}}>
            {items.map((item) => {
              const isActive = activeItem === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={loading ? undefined : item.action}
                  activeOpacity={0.8}
                  // @ts-ignore
                  onMouseEnter={() => setActiveItem(item.id)}
                  onMouseLeave={() => setActiveItem(null)}
                  style={[
                    s.menuItem,
                    item.hot && s.menuItemHot,
                    isActive && { borderColor: item.color, backgroundColor: `${item.color}15` },
                  ]}
                >
                  <View style={[s.accentBar, { backgroundColor: isActive || item.hot ? item.color : 'transparent' }]} />
                  <View style={[s.menuIconBox, { backgroundColor: `${item.color}20`, borderColor: `${item.color}30` }]}>
                    <Text style={[s.menuIconText, { color: item.color }]}>{item.icon}</Text>
                  </View>
                  <View style={{flex:1}}>
                    <Text style={[s.menuLabel, item.hot && {color:'#fff', fontWeight:'900'}, isActive && {color: item.color}]}>
                      {item.id === 'continue' && loading ? '⏳ Загрузка...' : item.label}
                    </Text>
                    <Text style={s.menuSub}>{item.sub}</Text>
                  </View>
                  {item.soon ? (
                    <View style={[s.soonTag, {borderColor:`${item.color}40`, backgroundColor:`${item.color}10`}]}>
                      <Text style={[s.soonTagText, {color: item.color}]}>СКОРО</Text>
                    </View>
                  ) : (
                    <Text style={[s.menuChevron, {color: isActive ? item.color : '#1e293b'}]}>›</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Нижняя панель */}
          <View style={s.bottomBar}>
            <View style={s.bottomStats}>
              <View style={s.bottomStat}>
                <Text style={s.bottomStatVal}>v2.2</Text>
                <Text style={s.bottomStatLbl}>версия</Text>
              </View>
              <View style={s.bottomStatDivider} />
              <View style={s.bottomStat}>
                <Text style={s.bottomStatVal}>48</Text>
                <Text style={s.bottomStatLbl}>штатов</Text>
              </View>
              <View style={s.bottomStatDivider} />
              <View style={s.bottomStat}>
                <Text style={s.bottomStatVal}>5</Text>
                <Text style={s.bottomStatLbl}>траков</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => { if(window.confirm('Выйти?')) window.location.href='/'; }}>
              <Text style={s.exitLink}>⏻  Выход</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ═══ HUD — левый нижний угол с реальными данными ═══ */}
      <View style={s.hud}>
        {hasSave ? (
          <HudStats />
        ) : (
          <View style={s.hudNoSave}>
            <Text style={s.hudNoSaveText}>🚛 Начни игру чтобы увидеть статистику</Text>
          </View>
        )}
      </View>

      {/* Модалки */}
      {showSaves    && <SavesManagerPopup onClose={() => setShowSaves(false)} />}
      {showSettings && <SettingsPopup onClose={() => setShowSettings(false)} />}
      <RepairGarageModal />
      {showProfile  && (
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>👤 Профиль</Text>
            <Text style={s.modalSub}>Раздел в разработке</Text>
            <TouchableOpacity style={s.modalBtn} onPress={() => setShowProfile(false)}>
              <Text style={s.modalBtnText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ═══ HUD КОМПОНЕНТ — реальные данные игрока ═══
function HudStats() {
  const { balance, totalEarned, totalLost, reputation, trucks, day, sessionName } = useGameStore();

  const activeTrucks = trucks.filter(t => t.status !== 'idle').length;
  const profit = totalEarned - totalLost;
  const grade = totalEarned >= 12500 * trucks.length ? 'S'
    : totalEarned >= 9000 * trucks.length ? 'A'
    : totalEarned >= 6000 * trucks.length ? 'B'
    : totalEarned >= 3000 * trucks.length ? 'C' : 'D';

  const stats = [
    { icon: '💰', val: `$${balance.toLocaleString()}`, lbl: 'Баланс', color: balance >= 0 ? '#22c55e' : '#ef4444' },
    { icon: '📈', val: `$${totalEarned.toLocaleString()}`, lbl: 'Заработано', color: '#06b6d4' },
    { icon: '🚛', val: `${activeTrucks}/${trucks.length}`, lbl: 'Траков в работе', color: '#a78bfa' },
    { icon: '⭐', val: `${reputation}%`, lbl: 'Репутация', color: reputation >= 80 ? '#fbbf24' : reputation >= 50 ? '#f97316' : '#ef4444' },
    { icon: '📅', val: `День ${day}`, lbl: sessionName || 'Смена', color: '#e2e8f0' },
    { icon: '💸', val: profit >= 0 ? `+$${profit.toLocaleString()}` : `-$${Math.abs(profit).toLocaleString()}`, lbl: 'Прибыль', color: profit >= 0 ? '#22c55e' : '#ef4444' },
  ];

  return (
    <View style={hs.wrap}>
      <View style={hs.header}>
        <View style={hs.gradeDot} />
        <Text style={hs.headerText}>📊 Статистика игрока</Text>
        <View style={[hs.gradeBadge, { backgroundColor: grade === 'S' ? 'rgba(251,191,36,0.2)' : grade === 'A' ? 'rgba(34,197,94,0.2)' : 'rgba(59,130,246,0.2)' }]}>
          <Text style={[hs.gradeText, { color: grade === 'S' ? '#fbbf24' : grade === 'A' ? '#22c55e' : '#60a5fa' }]}>{grade}</Text>
        </View>
      </View>
      <View style={hs.grid}>
        {stats.map((st, i) => (
          <View key={i} style={hs.card}>
            <Text style={hs.cardIcon}>{st.icon}</Text>
            <Text style={[hs.cardVal, { color: st.color }]}>{st.val}</Text>
            <Text style={hs.cardLbl}>{st.lbl}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const hs = StyleSheet.create({
  wrap: { gap: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(2,5,16,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    // @ts-ignore
    backdropFilter: 'blur(12px)',
  },
  gradeDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#22c55e',
    // @ts-ignore
    boxShadow: '0 0 6px #22c55e',
  },
  headerText: { flex: 1, fontSize: 12, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.5 },
  gradeBadge: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 8,
  },
  gradeText: { fontSize: 14, fontWeight: '900' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  card: {
    // @ts-ignore
    width: 'calc(33.33% - 4px)',
    minWidth: 90,
    flex: 1,
    backgroundColor: 'rgba(2,5,16,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 3,
    // @ts-ignore
    backdropFilter: 'blur(16px)',
  },
  cardIcon: { fontSize: 18 },
  cardVal: { fontSize: 13, fontWeight: '900' },
  cardLbl: { fontSize: 9, color: '#475569', fontWeight: '600', textAlign: 'center' },
});

// ═══ ДАННЫЕ ═══
const STARS = Array.from({length:120}, () => ({
  x: Math.random()*100, y: Math.random()*70,
  s: Math.random()*2.5+0.5, o: Math.random()*0.7+0.1,
  c: Math.random()>0.9 ? '#06b6d4' : Math.random()>0.95 ? '#a78bfa' : '#e2e8f0',
}));

function makeWindows(cols: number, rows: number) {
  const ws = [];
  const colors = ['#fbbf24','#f97316','#06b6d4','#e2e8f0','#a78bfa'];
  for (let r=0; r<rows; r++) for (let c=0; c<cols; c++) {
    ws.push({ x: 4+c*10, y: 4+r*10, on: Math.random()>0.4, c: colors[Math.floor(Math.random()*colors.length)] });
  }
  return ws;
}

const BUILDINGS = Array.from({length:18}, (_, i) => {
  const h = 60 + Math.random()*180;
  const w = 20 + Math.random()*40;
  const cols = Math.floor(w/12);
  const rows = Math.floor(h/12);
  return { x: i*5.5+2, h, w, windows: makeWindows(cols, rows) };
});

// ═══ СТИЛИ ═══
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020510',
    minHeight: '100vh' as any,
    overflow: 'hidden',
  },

  // Фон
  bg: {
    position: 'absolute' as any,
    inset: 0,
    overflow: 'hidden',
  },
  nebula: {
    position: 'absolute' as any,
    borderRadius: 999,
    opacity: 0.08,
    // @ts-ignore
    filter: 'blur(80px)',
  },
  star: {
    position: 'absolute' as any,
    borderRadius: 99,
  },
  scanline: {
    position: 'absolute' as any,
    left: 0, right: 0,
    height: 2,
    backgroundColor: 'rgba(6,182,212,0.03)',
    // @ts-ignore
    animation: 'scanline 8s linear infinite',
  },
  horizonLine: {
    position: 'absolute' as any,
    bottom: '28%',
    left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(6,182,212,0.12)',
    // @ts-ignore
    boxShadow: '0 0 20px rgba(6,182,212,0.3)',
  },
  cityRow: {
    position: 'absolute' as any,
    bottom: '28%',
    left: '30%', right: 0,
    height: 220,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  building: {
    position: 'absolute' as any,
    bottom: 0,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    overflow: 'hidden',
  },
  window: {
    position: 'absolute' as any,
    width: 5, height: 5,
    borderRadius: 1,
    // @ts-ignore
    animation: 'cityPulse 3s ease-in-out infinite',
  },
  roadContainer: {
    position: 'absolute' as any,
    bottom: 0,
    left: '28%', right: 0,
    height: '30%',
    overflow: 'hidden',
    borderTopLeftRadius: 120,
  },
  roadSurface: {
    ...StyleSheet.absoluteFillObject,
  },
  roadMarkings: {
    position: 'absolute' as any,
    top: '45%', left: 0, right: 0,
    height: 4,
    flexDirection: 'row',
  },
  roadDash: {
    position: 'absolute' as any,
    width: '8%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    top: 0,
  },
  roadReflect: {
    position: 'absolute' as any,
    bottom: 0, left: 0, right: 0,
    height: '40%',
  },
  truckWrap: {
    position: 'absolute' as any,
    bottom: '27%',
    left: '52%',
    alignItems: 'center',
  },
  truckText: {
    fontSize: 72,
    // @ts-ignore
    animation: 'float 4s ease-in-out infinite',
    filter: 'drop-shadow(0 0 20px rgba(251,191,36,0.4))',
  },
  truckShadow: {
    width: 90, height: 16,
    borderRadius: 45,
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginTop: -8,
    // @ts-ignore
    filter: 'blur(8px)',
  },
  headlight1: {
    position: 'absolute' as any,
    right: -30, top: 20,
    width: 60, height: 8,
    backgroundColor: '#fbbf24',
    borderRadius: 4,
    opacity: 0.6,
    // @ts-ignore
    filter: 'blur(6px)',
  },
  headlight2: {
    position: 'absolute' as any,
    right: -50, top: 28,
    width: 80, height: 4,
    backgroundColor: '#fbbf24',
    borderRadius: 2,
    opacity: 0.3,
    // @ts-ignore
    filter: 'blur(10px)',
  },
  particle: {
    position: 'absolute' as any,
    borderRadius: 99,
    // @ts-ignore
    filter: 'blur(1px)',
    animation: 'particleDrift 6s ease-in-out infinite',
  },
  vigBottom: {
    position: 'absolute' as any,
    left: 0, right: 0, bottom: 0,
    height: '32%',
  },
  vigTop: {
    position: 'absolute' as any,
    left: 0, right: 0, top: 0,
    height: '15%',
  },

  // Центрированная обёртка
  centerWrap: {
    position: 'absolute' as any,
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 20,
  },

  // Карточка меню
  menuCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    position: 'relative' as any,
    // @ts-ignore
    boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(6,182,212,0.15)',
  },
  glassPanel: {
    position: 'absolute' as any,
    inset: 0,
    borderRadius: 24,
    backgroundColor: 'rgba(2,5,16,0.55)',
    // @ts-ignore
    backdropFilter: 'blur(32px) saturate(180%)',
    WebkitBackdropFilter: 'blur(32px) saturate(180%)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.15)',
  },

  // Логотип
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  logoIconBox: {
    position: 'relative' as any,
  },
  logoGrad: {
    width: 60, height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    // @ts-ignore
    boxShadow: '0 0 30px rgba(6,182,212,0.5)',
  },
  logoEmoji: { fontSize: 30 },
  logoGlow: {
    position: 'absolute' as any,
    inset: -4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.4)',
    // @ts-ignore
    animation: 'borderGlow 3s ease-in-out infinite',
  },
  logoLine1: {
    fontSize: 24, fontWeight: '900', color: '#ffffff',
    letterSpacing: 4, lineHeight: 26,
    // @ts-ignore
    textShadow: '0 0 20px rgba(255,255,255,0.3)',
  },
  logoLine2: {
    fontSize: 24, fontWeight: '900', color: '#06b6d4',
    letterSpacing: 4, lineHeight: 26,
    // @ts-ignore
    textShadow: '0 0 20px rgba(6,182,212,0.8)',
    animation: 'neonFlicker 8s ease-in-out infinite',
  },
  betaTag: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
  },
  betaTagText: { fontSize: 9, fontWeight: '800', color: '#ef4444', letterSpacing: 1 },

  // Неоновый разделитель
  neonDivider: {
    height: 1,
    backgroundColor: 'rgba(6,182,212,0.25)',
    marginBottom: 14,
    // @ts-ignore
    boxShadow: '0 0 8px rgba(6,182,212,0.4)',
  },

  // Аккаунт
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(6,182,212,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    // @ts-ignore
    backdropFilter: 'blur(10px)',
  },
  accountAva: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#0ea5e9',
    alignItems: 'center', justifyContent: 'center',
    // @ts-ignore
    boxShadow: '0 0 12px rgba(14,165,233,0.6)',
  },
  accountAvaText: { fontSize: 16, fontWeight: '900', color: '#fff' },
  accountName: { fontSize: 12, fontWeight: '700', color: '#e2e8f0' },
  accountStatus: { fontSize: 10, color: '#22c55e', marginTop: 1 },
  onlineDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#22c55e',
    // @ts-ignore
    boxShadow: '0 0 6px #22c55e',
  },
  guestCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10, padding: 10, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  guestText: { fontSize: 11, color: '#475569' },

  // Пункты меню
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 5,
    paddingVertical: 9,
    paddingRight: 12,
    paddingLeft: 0,
    overflow: 'hidden',
    // @ts-ignore
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
    backdropFilter: 'blur(8px)',
  },
  menuItemHot: {
    borderColor: 'rgba(34,197,94,0.5)',
    backgroundColor: 'rgba(34,197,94,0.15)',
    // @ts-ignore
    boxShadow: '0 0 20px rgba(34,197,94,0.15)',
  },
  accentBar: {
    width: 3, minHeight: 44,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    // @ts-ignore
    transition: 'all 0.2s',
  },
  menuIconBox: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  menuIconText: { fontSize: 17, fontWeight: '700' },
  menuLabel: {
    fontSize: 16, fontWeight: '800', color: '#ffffff', marginBottom: 2,
    // @ts-ignore
    transition: 'color 0.2s',
  },
  menuSub: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  menuChevron: {
    fontSize: 24, fontWeight: '300',
    // @ts-ignore
    transition: 'color 0.2s',
  },
  soonTag: {
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 5, borderWidth: 1,
  },
  soonTagText: { fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },

  // Нижняя панель
  bottomBar: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    gap: 10,
  },
  bottomStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 8,
  },
  bottomStat: { flex: 1, alignItems: 'center' },
  bottomStatVal: { fontSize: 16, fontWeight: '900', color: '#ffffff' },
  bottomStatLbl: { fontSize: 11, color: '#94a3b8', marginTop: 2, fontWeight: '600' },
  bottomStatDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.07)' },
  exitLink: {
    fontSize: 14, color: '#ef4444', textAlign: 'center', fontWeight: '700',
    // @ts-ignore
    cursor: 'pointer',
    transition: 'color 0.2s',
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    borderRadius: 10,
    paddingVertical: 10,
    overflow: 'hidden',
  },

  // HUD — левый нижний угол
  hud: {
    position: 'absolute' as any,
    bottom: 24,
    left: 24,
    zIndex: 10,
    // @ts-ignore
    width: 'min(360px, calc(100vw - 48px))',
  },
  hudNoSave: {
    backgroundColor: 'rgba(2,5,16,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    // @ts-ignore
    backdropFilter: 'blur(12px)',
  },
  hudNoSaveText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },

  // Модалка
  modalOverlay: {
    position: 'absolute' as any,
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 100,
    // @ts-ignore
    backdropFilter: 'blur(8px)',
  },
  modalBox: {
    width: 360,
    backgroundColor: '#0a0f1e',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.25)',
    padding: 28,
    alignItems: 'center',
    gap: 12,
    // @ts-ignore
    boxShadow: '0 0 60px rgba(6,182,212,0.15)',
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#e2e8f0' },
  modalSub: { fontSize: 13, color: '#475569', textAlign: 'center' },
  modalBtn: {
    marginTop: 8, paddingHorizontal: 28, paddingVertical: 10,
    backgroundColor: '#0ea5e9', borderRadius: 10,
  },
  modalBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
