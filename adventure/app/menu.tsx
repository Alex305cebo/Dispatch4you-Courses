// DISPATCH OFFICE — Main Menu 2026
// Compact + Adaptive + Video Background
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { getCurrentUser, signInWithGoogle } from '../utils/firebaseSaveSystem';
import SavesManagerPopup from '../components/SavesManagerPopup';
import SettingsPopup from '../components/SettingsPopup';
import TruckShopModal from '../components/TruckShopModal';
import RepairGarageModal from '../components/RepairGarageModal';
import ProfilePopup from '../components/ProfilePopup';

export default function MainMenu() {
  const router = useRouter();
  const { width: W, height: H } = useWindowDimensions();
  const isMobile = W < 600;
  const isSmall = W < 400;
  const isLandscape = W > H && H < 500;
  const { startShift, loadGame } = useGameStore();
  const [hasSave, setHasSave] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [showSaves, setShowSaves] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  useEffect(() => { checkSaveAndUser(); }, []);

  async function checkSaveAndUser() {
    try {
      // Проверяем старое сохранение
      const raw = localStorage.getItem('dispatcher-game-save');
      if (raw) { 
        const s = JSON.parse(raw); 
        // Более мягкая проверка
        if (s?.version >= 6 && (s?.phase === 'playing' || s?.trucks?.length > 0)) {
          setHasSave(true);
        }
      }
      
      // Проверяем слоты (1, 2, 3)
      if (!hasSave) {
        for (let i = 1; i <= 3; i++) {
          const slotRaw = localStorage.getItem(`dispatcher-save-slot-${i}`);
          if (slotRaw) {
            const slotData = JSON.parse(slotRaw);
            // Более мягкая проверка
            if (slotData?.version >= 6 && (slotData?.phase === 'playing' || slotData?.trucks?.length > 0)) {
              setHasSave(true);
              break;
            }
          }
        }
      }
    } catch {}
    
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

  async function handleContinue() {
    setLoading(true);
    try {
      // Ищем последнее сохранение (самое свежее по timestamp)
      let latestSave = null;
      let latestSlot = null;
      let latestTimestamp = 0;
      
      // Проверяем старое сохранение
      try {
        const raw = localStorage.getItem('dispatcher-game-save');
        if (raw) {
          const s = JSON.parse(raw);
          // Более мягкая проверка — достаточно version и наличия данных
          if (s?.version >= 6 && (s?.phase === 'playing' || s?.trucks?.length > 0)) {
            const ts = s?.lastSaved || s?.lastPlayed || Date.now();
            if (ts > latestTimestamp) {
              latestSave = s;
              latestTimestamp = ts;
            }
          }
        }
      } catch {}
      
      // Проверяем слоты
      for (let i = 1; i <= 3; i++) {
        try {
          const slotRaw = localStorage.getItem(`dispatcher-save-slot-${i}`);
          if (slotRaw) {
            const slotData = JSON.parse(slotRaw);
            // Более мягкая проверка — достаточно version и наличия данных
            if (slotData?.version >= 6 && (slotData?.phase === 'playing' || slotData?.trucks?.length > 0)) {
              const ts = slotData?.lastSaved || slotData?.lastPlayed || Date.now();
              if (ts > latestTimestamp) {
                latestSave = slotData;
                latestSlot = i;
                latestTimestamp = ts;
              }
            }
          }
        } catch {}
      }
      
      // Загружаем найденное сохранение
      if (latestSave) {
        const ok = await loadGame(latestSlot);
        if (ok) {
          sessionStorage.setItem('enteredViaMenu', '1');
          setTimeout(() => router.replace('/game'), 50);
        } else {
          alert('❌ Не удалось загрузить сохранение\n\nПопробуйте выбрать слот вручную через Профиль');
        }
      } else {
        alert('❌ Сохранение не найдено\n\nНачните новую игру или проверьте слоты в Профиле');
      }
    }
    finally { setLoading(false); }
  }

  async function handleNewGame(slotId?: number) {
    if (hasSave && !window.confirm('⚠️ Начать новую игру? Прогресс будет потерян.')) return;
    setLoading(true);
    try {
      await startShift(1, 'Новая смена', slotId);
      sessionStorage.setItem('enteredViaMenu', '1');
      // Небольшая задержка для гарантии монтирования Root Layout
      setTimeout(() => router.replace('/game'), 50);
    }
    finally { setLoading(false); }
  }

  const items = [
    ...(hasSave ? [{ id:'continue', icon:'▶', label:'Продолжить', sub:'Последнее сохранение', color:'#22c55e', action: handleContinue, hot: true }] : []),
    { id:'new', icon:'⚡', label: hasSave ? 'Новая игра' : 'Начать игру', sub:'Выбрать слот сохранения', color:'#3b82f6', action: () => setShowProfile(true), hot: !hasSave },
    { id:'profile', icon:'◉', label:'Профиль', sub:'Сохранения · Гараж', color:'#ec4899', action: () => setShowProfile(true) },
    { id:'settings', icon:'⚙', label:'Настройки', sub:'Графика · Звук', color:'#06b6d4', action: () => setShowSettings(true) },
  ];

  // Адаптивные размеры
  const cardMaxW = isLandscape ? 560 : isMobile ? Math.min(W - 60, 340) : 420;
  const cardPad = isSmall ? 10 : isMobile ? 12 : 16;
  const logoSize = isSmall ? 40 : isMobile ? 46 : 52;
  const titleSize = isSmall ? 18 : isMobile ? 20 : 22;
  const menuIconSize = isSmall ? 30 : 34;
  const menuFontSize = isSmall ? 13 : 14;
  const menuSubSize = isSmall ? 10 : 11;
  const itemPadV = isSmall ? 6 : 8;
  const itemGap = isSmall ? 4 : 5;

  return (
    <View style={s.root}>
      {/* CSS анимации */}
      <style>{`
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes borderGlow { 0%,100%{box-shadow:0 0 6px rgba(6,182,212,0.3)} 50%{box-shadow:0 0 20px rgba(6,182,212,0.7)} }
        @keyframes neonFlicker { 0%,19%,21%,23%,25%,54%,56%,100%{opacity:1} 20%,24%,55%{opacity:0.4} }
        .mi:hover { transform: translateX(4px) !important; border-color: rgba(6,182,212,0.4) !important; }
        .mi { transition: all 0.15s ease !important; }
        html, body, #root { overflow: hidden !important; height: 100% !important; }
      `}</style>

      {/* ═══ VIDEO BACKGROUND ═══ */}
      <View style={s.bg}>
        <video
          autoPlay muted loop playsInline
          ref={(el) => { 
            if (el && !(el as any)._init) { 
              (el as any)._init = true; 
              el.playbackRate = 0.5;
              
              // Список путей для fallback (в порядке приоритета)
              const videoPaths = [
                '/game/Truck_loop.mp4',           // Production: dispatch4you.com/game/
                '/Truck_loop.mp4',                // Root
                './Truck_loop.mp4',               // Relative root
                '/assets/Truck_loop.mp4',         // Assets folder
                './assets/Truck_loop.mp4',        // Relative assets
                '/game/assets/Truck_loop.mp4',    // Game assets
                'Truck_loop.mp4',                 // Same directory
              ];
              
              let currentPathIndex = 0;
              
              const tryNextPath = () => {
                if (currentPathIndex >= videoPaths.length) {
                  console.error('❌ All video paths failed. Tried:', videoPaths);
                  return;
                }
                
                const nextPath = videoPaths[currentPathIndex];
                console.log(`🔄 Trying video path [${currentPathIndex + 1}/${videoPaths.length}]:`, nextPath);
                el.src = nextPath;
                currentPathIndex++;
              };
              
              // Обработчик ошибки загрузки
              el.addEventListener('error', (e) => {
                console.error('❌ Video failed to load:', el.src, e);
                tryNextPath();
              });
              
              // Обработчик успешной загрузки
              el.addEventListener('loadeddata', () => {
                console.log('✅ Video loaded successfully:', el.src);
              }, { once: true });
              
              // Дополнительная проверка через 2 секунды
              setTimeout(() => {
                if (el.readyState === 0 || el.networkState === 3) {
                  console.warn('⚠️ Video not loading after 2s, trying next path');
                  tryNextPath();
                }
              }, 2000);
            }
          }}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.6,
          } as any}
          src="/game/Truck_loop.mp4"
        />
        {/* Затемнение для читаемости */}
        <LinearGradient
          colors={['rgba(2,5,16,0.4)', 'rgba(2,5,16,0.2)', 'rgba(2,5,16,0.5)']}
          style={StyleSheet.absoluteFill}
        />
        {/* Сканлайн */}
        <View style={s.scanline} />
      </View>

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <ScrollView
        contentContainerStyle={[s.scrollContent, isLandscape && { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 16 }]}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, zIndex: 20 }}
      >
        {/* ═══ MENU CARD ═══ */}
        <View style={[s.menuCard, { maxWidth: isLandscape ? 340 : cardMaxW, padding: cardPad }]}>
          <View style={s.glassPanel} />

          {/* Логотип — компактный */}
          <View style={[s.logoRow, { marginBottom: isSmall ? 8 : 12 }]}>
            <LinearGradient colors={['#1d4ed8','#0ea5e9','#06b6d4']} style={[s.logoGrad, { width: logoSize, height: logoSize, borderRadius: logoSize * 0.27 }]} start={{x:0,y:0}} end={{x:1,y:1}}>
              <Text style={{ fontSize: logoSize * 0.45 }}>🚛</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text style={[s.logoTitle, { fontSize: titleSize }]}>DISPATCH</Text>
                <Text style={[s.logoTitle2, { fontSize: titleSize }]}>OFFICE</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <View style={s.betaTag}><Text style={s.betaText}>BETA 3.3</Text></View>
                {userEmail && <Text style={s.emailText} numberOfLines={1}>{userEmail}</Text>}
              </View>
            </View>
          </View>

          {/* Разделитель */}
          <View style={s.divider} />

          {/* ── БЛОК ПОЛЬЗОВАТЕЛЯ / ВХОД ── */}
          {userEmail ? (
            /* Залогинен — показываем аватар + имя */
            <View style={s.userRow}>
              {userPhoto ? (
                <img src={userPhoto} style={{ width: 32, height: 32, borderRadius: 16, border: '2px solid rgba(99,102,241,0.5)' } as any} />
              ) : (
                <View style={s.userAvatar}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>
                    {(userName || userEmail)[0].toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={s.userName} numberOfLines={1}>{userName || userEmail}</Text>
                <Text style={s.userEmail} numberOfLines={1}>{userEmail}</Text>
              </View>
            </View>
          ) : (
            /* Не залогинен — кнопка Google */
            <TouchableOpacity
              onPress={signingIn ? undefined : handleSignIn}
              activeOpacity={0.8}
              style={s.googleBtn}
            >
              {signingIn ? (
                <Text style={s.googleBtnText}>⏳ Входим...</Text>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 48 48" style={{ flexShrink: 0 } as any}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <Text style={s.googleBtnText}>Войти через Google</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Пункты меню */}
          <View style={{ gap: itemGap }}>
            {items.map((item) => {
              const isActive = activeItem === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={loading ? undefined : item.action}
                  activeOpacity={0.75}
                  // @ts-ignore
                  className="mi"
                  onMouseEnter={() => setActiveItem(item.id)}
                  onMouseLeave={() => setActiveItem(null)}
                  style={[
                    s.menuItem,
                    { paddingVertical: itemPadV },
                    item.hot && { borderColor: `${item.color}60`, backgroundColor: `${item.color}18` },
                    isActive && { borderColor: item.color, backgroundColor: `${item.color}15` },
                  ]}
                >
                  <View style={[s.accentBar, { backgroundColor: isActive || item.hot ? item.color : 'transparent' }]} />
                  <View style={[s.menuIcon, { width: menuIconSize, height: menuIconSize, backgroundColor: `${item.color}18`, borderColor: `${item.color}30` }]}>
                    <Text style={{ fontSize: menuIconSize * 0.42, color: item.color, fontWeight: '700' as any }}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.menuLabel, { fontSize: menuFontSize }, item.hot && { color: '#fff', fontWeight: '900' as any }, isActive && { color: item.color }]}>
                      {item.id === 'continue' && loading ? '⏳ ...' : item.label}
                    </Text>
                    <Text style={[s.menuSub, { fontSize: menuSubSize }]}>{item.sub}</Text>
                  </View>
                  {(item as any).soon ? (
                    <View style={[s.soonTag, { borderColor: `${item.color}40`, backgroundColor: `${item.color}10` }]}>
                      <Text style={{ fontSize: 8, fontWeight: '900' as any, color: item.color, letterSpacing: 0.5 }}>СКОРО</Text>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 20, color: isActive ? item.color : '#1e293b', fontWeight: '300' as any }}>›</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Нижняя панель — версия + выход */}
          <View style={s.bottomBar}>
            <View style={s.bottomStats}>
              {[['v3.3','версия'],['48','штатов'],['5','траков']].map(([v,l], i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {i > 0 && <View style={s.bottomDiv} />}
                  <View style={{ alignItems: 'center', paddingHorizontal: 10 }}>
                    <Text style={s.bottomVal}>{v}</Text>
                    <Text style={s.bottomLbl}>{l}</Text>
                  </View>
                </View>
              ))}
            </View>
            <TouchableOpacity style={s.exitBtn} onPress={() => { if(window.confirm('Выйти?')) window.location.href='/'; }}>
              <Text style={s.exitText}>⏻ Выход</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══ HUD STATS — рядом в landscape, снизу в portrait ═══ */}
        {hasSave && (
          <View style={[s.hudWrap, isLandscape && { maxWidth: 200 }]}>
            <HudStats compact={isMobile} />
          </View>
        )}
      </ScrollView>

      {/* Модалки */}
      {showSaves    && <SavesManagerPopup onClose={() => setShowSaves(false)} />}
      {showSettings && <SettingsPopup onClose={() => setShowSettings(false)} />}
      <RepairGarageModal />
      {showProfile  && (
        <ProfilePopup 
          onClose={() => setShowProfile(false)} 
          onStartGame={(slotId) => {
            setShowProfile(false);
            handleNewGame(slotId);
          }}
        />
      )}
    </View>
  );
}

// ═══ HUD STATS ═══
function HudStats({ compact }: { compact?: boolean }) {
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
    { icon: '🚛', val: `${activeTrucks}/${trucks.length}`, lbl: 'Траки', color: '#a78bfa' },
    { icon: '⭐', val: `${reputation}%`, lbl: 'Репутация', color: reputation >= 80 ? '#fbbf24' : '#f97316' },
    { icon: '📅', val: `День ${day}`, lbl: sessionName || 'Смена', color: '#e2e8f0' },
    { icon: '💸', val: profit >= 0 ? `+$${profit.toLocaleString()}` : `-$${Math.abs(profit).toLocaleString()}`, lbl: 'Прибыль', color: profit >= 0 ? '#22c55e' : '#ef4444' },
  ];

  return (
    <View style={hs.wrap}>
      <View style={hs.header}>
        <View style={hs.dot} />
        <Text style={hs.headerText}>📊 Статистика</Text>
        <View style={[hs.badge, { backgroundColor: grade === 'S' ? 'rgba(251,191,36,0.2)' : grade === 'A' ? 'rgba(34,197,94,0.2)' : 'rgba(59,130,246,0.2)' }]}>
          <Text style={[hs.badgeText, { color: grade === 'S' ? '#fbbf24' : grade === 'A' ? '#22c55e' : '#60a5fa' }]}>{grade}</Text>
        </View>
      </View>
      <View style={hs.grid}>
        {stats.map((st, i) => (
          <View key={i} style={hs.card}>
            <Text style={{ fontSize: compact ? 14 : 16 }}>{st.icon}</Text>
            <Text style={[hs.val, { color: st.color, fontSize: compact ? 11 : 12 }]}>{st.val}</Text>
            <Text style={hs.lbl}>{st.lbl}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const hs = StyleSheet.create({
  wrap: { gap: 6 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(2,5,16,0.65)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
    // @ts-ignore
    backdropFilter: 'blur(12px)',
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
  headerText: { flex: 1, fontSize: 11, fontWeight: '700', color: '#94a3b8' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  card: {
    // @ts-ignore
    width: 'calc(33.33% - 3px)',
    minWidth: 70,
    backgroundColor: 'rgba(2,5,16,0.65)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8, padding: 6, alignItems: 'center', gap: 1,
    // @ts-ignore
    backdropFilter: 'blur(12px)',
  },
  val: { fontSize: 12, fontWeight: '900' },
  lbl: { fontSize: 8, color: '#64748b', fontWeight: '600', textAlign: 'center' },
});

// ═══ STYLES ═══
const s = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: '#020510',
    // @ts-ignore
    minHeight: '100vh', overflow: 'hidden',
  },

  // Video background
  bg: {
    position: 'absolute' as any, inset: 0, overflow: 'hidden',
  },
  scanline: {
    position: 'absolute' as any, left: 0, right: 0, height: 2,
    backgroundColor: 'rgba(6,182,212,0.03)',
    // @ts-ignore
    animation: 'scanline 8s linear infinite',
  },

  // Scroll content
  scrollContent: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center',
    padding: 12, paddingVertical: 24,
    minHeight: '100%' as any,
  },

  // Menu card — glass
  menuCard: {
    width: '100%', maxWidth: 420,
    borderRadius: 20, padding: 16,
    overflow: 'hidden', position: 'relative' as any,
    // @ts-ignore
    boxShadow: '0 16px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(6,182,212,0.12)',
  },
  glassPanel: {
    position: 'absolute' as any, inset: 0, borderRadius: 20,
    backgroundColor: 'rgba(2,5,16,0.45)',
    // @ts-ignore
    backdropFilter: 'blur(28px) saturate(180%)',
    WebkitBackdropFilter: 'blur(28px) saturate(180%)',
    borderWidth: 1, borderColor: 'rgba(6,182,212,0.12)',
  },

  // Logo
  logoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  logoGrad: {
    alignItems: 'center', justifyContent: 'center',
    // @ts-ignore
    boxShadow: '0 0 24px rgba(6,182,212,0.4)',
  },
  logoTitle: {
    fontWeight: '900', color: '#fff', letterSpacing: 3,
    // @ts-ignore
    textShadow: '0 0 16px rgba(255,255,255,0.25)',
  },
  logoTitle2: {
    fontWeight: '900', color: '#06b6d4', letterSpacing: 3,
    // @ts-ignore
    textShadow: '0 0 16px rgba(6,182,212,0.7)',
    animation: 'neonFlicker 8s ease-in-out infinite',
  },
  betaTag: {
    paddingHorizontal: 6, paddingVertical: 2,
    backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 4,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
  },
  betaText: { fontSize: 8, fontWeight: '800', color: '#ef4444', letterSpacing: 0.8 },
  emailText: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },

  // User row
  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(99,102,241,0.08)',
    borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)',
    borderRadius: 12, padding: 8, marginBottom: 8,
  },
  userAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#6366f1',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  userName: { fontSize: 12, fontWeight: '700', color: '#e0e7ff' },
  userEmail: { fontSize: 10, color: '#94a3b8', fontWeight: '500' },

  // Google sign-in button
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#fff',
    borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16,
    marginBottom: 8,
    // @ts-ignore
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  googleBtnText: { fontSize: 13, fontWeight: '700', color: '#1f2937' },

  divider: {
    height: 1, backgroundColor: 'rgba(6,182,212,0.2)', marginBottom: 10,
    // @ts-ignore
    boxShadow: '0 0 6px rgba(6,182,212,0.3)',
  },

  // Menu items
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 8, paddingRight: 10, paddingLeft: 0,
    overflow: 'hidden',
    // @ts-ignore
    cursor: 'pointer', backdropFilter: 'blur(6px)',
  },
  accentBar: {
    width: 3, minHeight: 36,
    borderTopRightRadius: 2, borderBottomRightRadius: 2,
  },
  menuIcon: {
    borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  menuLabel: {
    fontSize: 14, fontWeight: '700', color: '#e2e8f0', marginBottom: 1,
  },
  menuSub: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
  soonTag: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1,
  },

  // Bottom bar
  bottomBar: {
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 6,
  },
  bottomStats: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', paddingVertical: 6,
  },
  bottomDiv: { width: 1, height: 22, backgroundColor: 'rgba(255,255,255,0.06)' },
  bottomVal: { fontSize: 14, fontWeight: '900', color: '#fff' },
  bottomLbl: { fontSize: 9, color: '#94a3b8', marginTop: 1, fontWeight: '600' },
  exitBtn: {
    backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)', borderRadius: 8, paddingVertical: 8,
    // @ts-ignore
    cursor: 'pointer',
  },
  exitText: { fontSize: 13, color: '#ef4444', textAlign: 'center', fontWeight: '700' },

  // HUD wrap
  hudWrap: {
    width: '100%', maxWidth: 420, marginTop: 10,
  },

  // Modal
  modalOverlay: {
    position: 'absolute' as any, inset: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center', justifyContent: 'center', zIndex: 100,
    // @ts-ignore
    backdropFilter: 'blur(8px)',
  },
  modalBox: {
    width: 320, backgroundColor: '#0a0f1e', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(6,182,212,0.25)',
    padding: 24, alignItems: 'center', gap: 10,
    // @ts-ignore
    boxShadow: '0 0 40px rgba(6,182,212,0.15)',
  },
  modalBtn: {
    marginTop: 6, paddingHorizontal: 24, paddingVertical: 8,
    backgroundColor: '#0ea5e9', borderRadius: 8,
  },
});
