import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { useGameStore } from '../store/gameStore';
import { useAccountStore } from '../store/accountStore';

export default function HomeScreen() {
  const router = useRouter();
  const { startShift, loadGame } = useGameStore();
  const { currentNickname, login, logout, getAccount, loadFromStorage } = useAccountStore();
  const accounts = useAccountStore(s => s.accounts);

  const [nicknameInput, setNicknameInput] = useState('');
  const [error, setError] = useState('');
  const [hasSave, setHasSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNewProfileModal, setShowNewProfileModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileError, setNewProfileError] = useState('');
  const TRUCK_COUNT = 1;

  // Случайный водитель — меняется при каждом открытии экрана
  const DRIVERS = [
    { name: 'John Martinez',  exp: '6 лет опыта', miles: '45,230 mi', mood: '😊', city: 'Knoxville, TN', cdl: 'CDL-A', safe: 95 },
    { name: 'Carlos Rivera',  exp: '4 года опыта', miles: '38,450 mi', mood: '😄', city: 'Nashville, TN',  cdl: 'CDL-A', safe: 92 },
    { name: 'Mike Chen',      exp: '8 лет опыта', miles: '52,100 mi', mood: '🙂', city: 'Memphis, TN',    cdl: 'CDL-A', safe: 98 },
    { name: 'Tom Wilson',     exp: '3 года опыта', miles: '29,800 mi', mood: '😊', city: 'Atlanta, GA',    cdl: 'CDL-A', safe: 88 },
    { name: 'Lisa Brown',     exp: '5 лет опыта', miles: '41,600 mi', mood: '😄', city: 'Charlotte, NC',  cdl: 'CDL-A', safe: 97 },
    { name: 'James Anderson', exp: '7 лет опыта', miles: '48,900 mi', mood: '🙂', city: 'Louisville, KY', cdl: 'CDL-A', safe: 96 },
    { name: 'Maria Garcia',   exp: '5 лет опыта', miles: '44,200 mi', mood: '😊', city: 'Indianapolis, IN', cdl: 'CDL-A', safe: 99 },
    { name: 'David Kim',      exp: '2 года опыта', miles: '18,500 mi', mood: '😄', city: 'Columbus, OH',   cdl: 'CDL-A', safe: 90 },
  ];
  const [driver] = useState(() => DRIVERS[Math.floor(Math.random() * DRIVERS.length)]);

  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const modalInputRef = useRef<TextInput>(null);

  function checkSave() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) { setHasSave(false); return; }
      const raw = localStorage.getItem('dispatcher-game-save');
      if (!raw) { setHasSave(false); return; }
      const save = JSON.parse(raw);
      if (!save?.version || save.version < 3 || (save.trucks && save.trucks.length > 5)) {
        localStorage.removeItem('dispatcher-game-save');
        setHasSave(false); return;
      }
      setHasSave(true);
    } catch { setHasSave(false); }
  }

  useEffect(() => { loadFromStorage(); checkSave(); }, []);

  useEffect(() => {
    if (currentNickname) {
      checkSave();
      try {
        const raw = localStorage.getItem('dispatcher-game-save');
        if (raw) {
          const save = JSON.parse(raw);
          if (save?.version >= 3 && save.phase === 'playing') {
            const loaded = loadGame();
            if (loaded) { router.push('/game'); return; }
          }
        }
      } catch {}
    }
  }, [currentNickname]);

  const account = currentNickname ? getAccount(currentNickname) : null;

  function handleEmptySlot() {
    // Открываем модалку для создания нового профиля
    setNewProfileName('');
    setNewProfileError('');
    setShowNewProfileModal(true);
    setTimeout(() => modalInputRef.current?.focus(), 100);
  }

  function handleCreateProfile() {
    const nick = newProfileName.trim();
    if (!nick || nick.length < 2) { setNewProfileError('Минимум 2 символа'); return; }
    if (nick.length > 20) { setNewProfileError('Максимум 20 символов'); return; }
    
    // Проверяем что такого профиля ещё нет
    const exists = accounts.some(acc => acc && acc.nickname.toLowerCase() === nick.toLowerCase());
    if (exists) { setNewProfileError('Профиль уже существует'); return; }
    
    setNewProfileError('');
    login(nick);
    setShowNewProfileModal(false);
  }

  function handleLogin() {
    const nick = nicknameInput.trim();
    if (!nick || nick.length < 2) { setError('Минимум 2 символа'); return; }
    if (nick.length > 20) { setError('Максимум 20 символов'); return; }
    setError('');
    login(nick);
  }

  function handleContinue() {
    const loaded = loadGame();
    if (loaded) router.push('/game');
    else handleNewShift();
  }

  async function handleNewShift() {
    setLoading(true);
    try {
      await startShift(TRUCK_COUNT, `${currentNickname} · ${TRUCK_COUNT} трака`);
      setHasSave(false);
      // Сбрасываем вкладку — карта будет главной
      try { localStorage.removeItem('dispatch-active-tab'); } catch {}
      router.push('/game');
    } finally { setLoading(false); }
  }

  return (
    <View style={s.root}>
      <ScrollView ref={scrollRef} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroIcon}>
            <Text style={s.heroEmoji}>🚛</Text>
          </View>
          <Text style={s.heroTitle}>Dispatch Office</Text>
          <Text style={s.heroSub}>Симулятор диспетчера грузоперевозок США</Text>
          <View style={s.betaBadge}><Text style={s.betaText}>BETA</Text></View>
        </View>

        {/* Слоты профилей */}
        <View style={s.slotsSection}>
          <Text style={s.sectionTitle}>Профили</Text>
          <View style={s.slotsRow}>
            {[0, 1, 2].map(i => {
              const acc = accounts[i] ?? null;
              const isActive = acc && acc.nickname === currentNickname;
              return (
                <TouchableOpacity
                  key={i}
                  style={[s.slot, isActive && s.slotActive, acc && !isActive && s.slotFilled]}
                  activeOpacity={0.8}
                  onPress={() => { if (acc) login(acc.nickname); else handleEmptySlot(); }}
                >
                  {acc ? (
                    <>
                      <View style={[s.slotAvatar, isActive && s.slotAvatarActive]}>
                        <Text style={s.slotAvatarText}>{acc.nickname[0].toUpperCase()}</Text>
                      </View>
                      <Text style={[s.slotName, isActive && s.slotNameActive]} numberOfLines={1}>
                        {acc.nickname}
                      </Text>
                      <Text style={s.slotStats}>${acc.totalEarned.toLocaleString()}</Text>
                      {isActive && <Text style={s.slotActiveBadge}>● активен</Text>}
                    </>
                  ) : (
                    <>
                      <View style={s.slotEmpty}>
                        <Text style={s.slotEmptyIcon}>+</Text>
                      </View>
                      <Text style={s.slotEmptyText}>Новый{'\n'}профиль</Text>
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Аккаунт или форма входа */}
        {currentNickname ? (
          <View style={s.accountCard}>
            <View style={s.accountAvatar}>
              <Text style={s.accountAvatarText}>{currentNickname[0].toUpperCase()}</Text>
            </View>
            <View style={s.accountInfo}>
              <Text style={s.accountName}>{currentNickname}</Text>
              {account && (
                <Text style={s.accountStats}>
                  {account.totalShifts} смен · ${account.totalEarned.toLocaleString()}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => { logout(); setNicknameInput(''); }}
              style={s.logoutBtn} activeOpacity={0.7}
            >
              <Text style={s.logoutText}>Сменить</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.loginBlock}>
            <Text style={s.inputLabel}>Никнейм</Text>
            <TextInput
              ref={inputRef}
              style={s.input}
              value={nicknameInput}
              onChangeText={v => { setNicknameInput(v); setError(''); }}
              placeholder="Dispatcher_Pro"
              placeholderTextColor={Colors.textDim}
              maxLength={20}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={handleLogin}
            />
            {error ? <Text style={s.errorText}>{error}</Text> : null}
            <TouchableOpacity
              style={[s.loginBtn, !nicknameInput.trim() && s.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={!nicknameInput.trim()}
              activeOpacity={0.8}
            >
              <LinearGradient colors={Colors.gradPrimary} style={s.loginBtnGrad} start={{x:0,y:0}} end={{x:1,y:1}}>
                <Text style={s.loginBtnText}>Начать →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Кнопки действий — только если залогинен */}
        {currentNickname && (
          <View style={s.actions}>
            {hasSave && (
              <TouchableOpacity style={s.continueBtn} onPress={handleContinue} activeOpacity={0.8}>
                <LinearGradient colors={Colors.gradPrimary} style={s.actionBtnGrad} start={{x:0,y:0}} end={{x:1,y:1}}>
                  <Text style={s.actionBtnIcon}>▶</Text>
                  <View>
                    <Text style={s.actionBtnTitle}>Продолжить</Text>
                    <Text style={s.actionBtnSub}>сохранённая сессия</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.newBtn} onPress={handleNewShift} activeOpacity={0.8} disabled={loading}>
              <LinearGradient colors={Colors.gradSuccess} style={s.actionBtnGrad} start={{x:0,y:0}} end={{x:1,y:1}}>
                <Text style={s.actionBtnIcon}>{loading ? '⏳' : '🚀'}</Text>
                <View>
                  <Text style={s.actionBtnTitle}>{loading ? 'Загрузка...' : (hasSave ? 'Новая смена' : 'Начать игру')}</Text>
                  <Text style={s.actionBtnSub}>{loading ? 'Строим маршруты траков' : '1 трак · старт'}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Флот */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Твой флот</Text>

          {/* Инфо-плашка */}
          <View style={s.fleetInfoBanner}>
            <Text style={s.fleetInfoIcon}>🚛</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.fleetInfoTitle}>Начинаешь с 1 траком</Text>
              <Text style={s.fleetInfoDesc}>Зарабатывай деньги → покупай новые траки прямо в игре и расширяй флот</Text>
            </View>
          </View>

          {/* Карточка трака */}
          <View style={s.truckCard}>
            <View style={s.truckCardHeader}>
              <View style={s.truckIconWrap}>
                <Text style={s.truckIconEmoji}>🚚</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.truckCardName}>Truck 1047</Text>
                <View style={s.truckStatusBadge}>
                  <Text style={s.truckStatusText}>⚪ Свободен · Ждёт груза</Text>
                </View>
              </View>
              <View style={s.truckIdBadge}>
                <Text style={s.truckIdText}>TRK 001</Text>
              </View>
            </View>

            {/* Водитель */}
            <View style={s.driverRow}>
              <View style={s.driverAvatar}>
                <Text style={s.driverAvatarText}>{driver.name.split(' ').map(w => w[0]).join('')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.driverName}>{driver.name} {driver.mood}</Text>
                <Text style={s.driverSub}>{driver.cdl} · {driver.exp} · {driver.city}</Text>
              </View>
            </View>

            {/* Метрики */}
            <View style={s.truckMetrics}>
              <View style={s.truckMetric}>
                <Text style={s.truckMetricVal}>{driver.miles}</Text>
                <Text style={s.truckMetricLabel}>Пробег</Text>
              </View>
              <View style={s.truckMetricDivider} />
              <View style={s.truckMetric}>
                <Text style={s.truckMetricVal}>{driver.safe}%</Text>
                <Text style={s.truckMetricLabel}>Safety</Text>
              </View>
              <View style={s.truckMetricDivider} />
              <View style={s.truckMetric}>
                <Text style={s.truckMetricVal}>11.0ч</Text>
                <Text style={s.truckMetricLabel}>HOS</Text>
              </View>
              <View style={s.truckMetricDivider} />
              <View style={s.truckMetric}>
                <Text style={[s.truckMetricVal, { color: '#4ade80' }]}>Готов</Text>
                <Text style={s.truckMetricLabel}>Статус</Text>
              </View>
            </View>
          </View>

          {/* Плашка магазина */}
          <View style={s.shopBanner}>
            <Text style={s.shopBannerEmoji}>🏪</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.shopBannerTitle}>Магазин флота</Text>
              <Text style={s.shopBannerDesc}>2-й трак — $15k · 3-й трак — $30k · и больше...</Text>
            </View>
            <View style={s.shopBannerBadge}>
              <Text style={s.shopBannerBadgeText}>Скоро</Text>
            </View>
          </View>
        </View>

        {/* Как играть */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Как играть</Text>
          <View style={s.steps}>
            {[
              { icon: '🌅', title: 'Утро диспетчера', desc: 'Проверь статус траков, обработай почту, оцени рынок.' },
              { icon: '🚛', title: 'Веди флот', desc: 'Траки всегда в движении — пикап, деливери, в пути.' },
              { icon: '⚡', title: 'Решай проблемы', desc: 'Поломки, detention, задержки — всё как в реальной жизни.' },
              { icon: '💰', title: 'Зарабатывай', desc: 'Доходы и расходы по каждому траку. Твой P&L — твой рейтинг.' },
            ].map((step, i) => (
              <View key={i} style={s.step}>
                <View style={s.stepIcon}><Text style={s.stepIconText}>{step.icon}</Text></View>
                <View style={s.stepContent}>
                  <Text style={s.stepTitle}>{step.title}</Text>
                  <Text style={s.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Модалка создания профиля */}
      <Modal
        visible={showNewProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewProfileModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Новый профиль</Text>
            <Text style={s.modalDesc}>Придумай никнейм для диспетчера</Text>
            
            <TextInput
              ref={modalInputRef}
              style={s.modalInput}
              value={newProfileName}
              onChangeText={v => { setNewProfileName(v); setNewProfileError(''); }}
              placeholder="Dispatcher_Pro"
              placeholderTextColor={Colors.textDim}
              maxLength={20}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={handleCreateProfile}
            />
            {newProfileError ? <Text style={s.modalError}>{newProfileError}</Text> : null}
            
            <View style={s.modalButtons}>
              <TouchableOpacity
                style={s.modalBtnCancel}
                onPress={() => setShowNewProfileModal(false)}
                activeOpacity={0.7}
              >
                <Text style={s.modalBtnCancelText}>Отмена</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[s.modalBtnCreate, !newProfileName.trim() && s.modalBtnDisabled]}
                onPress={handleCreateProfile}
                disabled={!newProfileName.trim()}
                activeOpacity={0.8}
              >
                <LinearGradient colors={Colors.gradPrimary} style={s.modalBtnGrad} start={{x:0,y:0}} end={{x:1,y:1}}>
                  <Text style={s.modalBtnCreateText}>Создать</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 16, paddingTop: 40, alignItems: 'center' },

  hero: { alignItems: 'center', marginBottom: 16, gap: 4 },
  heroIcon: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: Colors.bgCard,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
  },
  heroEmoji: { fontSize: 28 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  heroSub: { fontSize: 12, color: Colors.textMuted, textAlign: 'center' },
  betaBadge: {
    paddingHorizontal: 8, paddingVertical: 2,
    backgroundColor: 'rgba(255,69,58,0.15)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,69,58,0.3)',
    marginTop: 2,
  },
  betaText: { fontSize: 9, fontWeight: '800', color: Colors.danger, letterSpacing: 2 },

  // Login block (inline)
  loginBlock: { width: '100%', maxWidth: 400, gap: 6, marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, marginLeft: 4 },
  input: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: Colors.text, fontWeight: '600',
  },
  errorText: { fontSize: 11, color: Colors.danger, marginLeft: 4 },
  loginBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 2 },
  loginBtnDisabled: { opacity: 0.35 },
  loginBtnGrad: { paddingVertical: 14, alignItems: 'center' },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },

  // Account card
  accountCard: {
    width: '100%', maxWidth: 400,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.bgCard,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
    padding: 10, marginBottom: 10,
  },
  accountAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  accountAvatarText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  accountStats: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  logoutBtn: {
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: 'rgba(255,69,58,0.1)',
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,69,58,0.2)',
  },
  logoutText: { fontSize: 11, fontWeight: '600', color: Colors.danger },

  actions: { width: '100%', maxWidth: 400, gap: 8, marginBottom: 16 },
  continueBtn: { borderRadius: 14, overflow: 'hidden' },
  newBtn: { borderRadius: 14, overflow: 'hidden' },
  actionBtnGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 13, paddingHorizontal: 18,
  },
  actionBtnIcon: { fontSize: 20 },
  actionBtnTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  actionBtnSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 },

  section: { width: '100%', maxWidth: 400, marginBottom: 16 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginLeft: 2,
  },
  // Fleet info banner
  fleetInfoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(10,132,255,0.08)',
    borderWidth: 1.5, borderColor: 'rgba(10,132,255,0.25)',
    borderRadius: 12, padding: 10, marginBottom: 8,
  },
  fleetInfoIcon: { fontSize: 22 },
  fleetInfoTitle: { fontSize: 13, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  fleetInfoDesc: { fontSize: 11, color: Colors.textMuted, lineHeight: 15 },

  // Truck card
  truckCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1.5, borderColor: 'rgba(56,189,248,0.3)',
    borderRadius: 14, padding: 12, marginBottom: 8, gap: 10,
  },
  truckCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  truckIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(56,189,248,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  truckIconEmoji: { fontSize: 18 },
  truckCardName: { fontSize: 14, fontWeight: '800', color: Colors.text, marginBottom: 3 },
  truckStatusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(148,163,184,0.12)',
    borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2,
  },
  truckStatusText: { fontSize: 10, fontWeight: '600', color: '#94a3b8' },
  truckIdBadge: {
    backgroundColor: 'rgba(6,182,212,0.15)',
    borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)',
  },
  truckIdText: { fontSize: 10, fontWeight: '800', color: '#06b6d4' },

  driverRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10, padding: 10,
  },
  driverAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(56,189,248,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  driverAvatarText: { fontSize: 11, fontWeight: '800', color: '#38bdf8' },
  driverName: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 1 },
  driverSub: { fontSize: 10, color: Colors.textMuted },

  truckMetrics: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10, padding: 10,
  },
  truckMetric: { flex: 1, alignItems: 'center' },
  truckMetricVal: { fontSize: 12, fontWeight: '800', color: Colors.text, marginBottom: 1 },
  truckMetricLabel: { fontSize: 9, fontWeight: '600', color: Colors.textDim },
  truckMetricDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.08)' },

  // Shop banner
  shopBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(251,191,36,0.07)',
    borderWidth: 1.5, borderColor: 'rgba(251,191,36,0.25)',
    borderRadius: 12, padding: 10,
  },
  shopBannerEmoji: { fontSize: 20 },
  shopBannerTitle: { fontSize: 12, fontWeight: '800', color: '#fbbf24', marginBottom: 1 },
  shopBannerDesc: { fontSize: 10, color: Colors.textMuted, lineHeight: 14 },
  shopBannerBadge: {
    backgroundColor: 'rgba(251,191,36,0.15)',
    borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(251,191,36,0.3)',
  },
  shopBannerBadgeText: { fontSize: 10, fontWeight: '800', color: '#fbbf24' },

  steps: { gap: 6 },
  step: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, padding: 10,
  },
  stepIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  stepIconText: { fontSize: 17 },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 1 },
  stepDesc: { fontSize: 11, color: Colors.textMuted, lineHeight: 15 },

  // Profile slots
  slotsSection: { width: '100%', maxWidth: 400, marginBottom: 12 },
  slotsRow: { flexDirection: 'row', gap: 8 },
  slot: {
    flex: 1, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4,
    backgroundColor: Colors.bgCard, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.border,
    gap: 3, minHeight: 82,
  },
  slotFilled: { borderColor: 'rgba(56,189,248,0.3)' },
  slotActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(10,132,255,0.1)',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 8,
  },
  slotAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(56,189,248,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  slotAvatarActive: { backgroundColor: Colors.primary },
  slotAvatarText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  slotName: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, textAlign: 'center' },
  slotNameActive: { color: Colors.primary },
  slotStats: { fontSize: 9, color: Colors.textDim },
  slotActiveBadge: { fontSize: 8, fontWeight: '700', color: '#4ade80' },
  slotEmpty: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  slotEmptyIcon: { fontSize: 16, color: 'rgba(255,255,255,0.2)', fontWeight: '300' },
  slotEmptyText: { fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    gap: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  modalDesc: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginTop: -8 },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  modalError: { fontSize: 12, color: Colors.danger, textAlign: 'center', marginTop: -8 },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 8 },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  modalBtnCancelText: { fontSize: 15, fontWeight: '600', color: Colors.textMuted },
  modalBtnCreate: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  modalBtnDisabled: { opacity: 0.35 },
  modalBtnGrad: { paddingVertical: 14, alignItems: 'center' },
  modalBtnCreateText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
