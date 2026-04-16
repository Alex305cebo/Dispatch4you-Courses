import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { useGameStore } from '../store/gameStore';
import { useAccountStore } from '../store/accountStore';

type Screen = 'login' | 'menu';

export default function HomeScreen() {
  const router = useRouter();
  const { startShift, loadGame } = useGameStore();
  const { currentNickname, login, logout, getAccount, loadFromStorage } = useAccountStore();

  const [screen, setScreen] = useState<Screen>('login');
  const [nicknameInput, setNicknameInput] = useState('');
  const [error, setError] = useState('');
  const [hasSave, setHasSave] = useState(false);
  const TRUCK_COUNT = 3;

  function checkSave() {
    try { setHasSave(!!localStorage.getItem('dispatcher-game-save')); } catch { setHasSave(false); }
  }

  useEffect(() => { loadFromStorage(); checkSave(); }, []);

  useEffect(() => {
    if (currentNickname) { setScreen('menu'); checkSave(); }
  }, [currentNickname]);

  const account = currentNickname ? getAccount(currentNickname) : null;

  function handleLogin() {
    const nick = nicknameInput.trim();
    if (!nick || nick.length < 2) { setError('Минимум 2 символа'); return; }
    if (nick.length > 20) { setError('Максимум 20 символов'); return; }
    setError('');
    login(nick);
    setScreen('menu');
  }

  function handleContinue() {
    const loaded = loadGame();
    if (loaded) router.push('/game');
    else handleNewShift();
  }

  function handleNewShift() {
    startShift(TRUCK_COUNT, `${currentNickname} · ${TRUCK_COUNT} трака`);
    setHasSave(false);
    router.push('/game');
  }

  // ─── LOGIN ───────────────────────────────────────────────────────────────
  if (screen === 'login') {
    return (
      <View style={s.root}>
        <View style={s.loginWrap}>
          {/* Logo */}
          <View style={s.logoMark}>
            <Text style={s.logoEmoji}>🚛</Text>
          </View>
          <Text style={s.appName}>Dispatch Office</Text>
          <Text style={s.appTagline}>Симулятор диспетчера грузоперевозок</Text>

          <View style={s.betaBadge}><Text style={s.betaText}>BETA</Text></View>

          {/* Input */}
          <View style={s.inputWrap}>
            <Text style={s.inputLabel}>Никнейм</Text>
            <TextInput
              style={s.input}
              value={nicknameInput}
              onChangeText={v => { setNicknameInput(v); setError(''); }}
              placeholder="Dispatcher_Pro"
              placeholderTextColor={Colors.textDim}
              maxLength={20}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {error ? <Text style={s.errorText}>{error}</Text> : null}
          </View>

          <TouchableOpacity
            style={[s.primaryBtn, !nicknameInput.trim() && s.primaryBtnDisabled]}
            onPress={handleLogin}
            disabled={!nicknameInput.trim()}
            activeOpacity={0.8}
          >
            <LinearGradient colors={Colors.gradPrimary} style={s.primaryBtnGrad} start={{x:0,y:0}} end={{x:1,y:1}}>
              <Text style={s.primaryBtnText}>Начать →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── MENU ────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.menuScroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroIcon}>
            <Text style={s.heroEmoji}>🚛</Text>
          </View>
          <Text style={s.heroTitle}>Dispatch Office</Text>
          <Text style={s.heroSub}>Симулятор диспетчера грузоперевозок США</Text>
        </View>

        {/* Account card */}
        <View style={s.accountCard}>
          <View style={s.accountAvatar}>
            <Text style={s.accountAvatarText}>{(currentNickname || '?')[0].toUpperCase()}</Text>
          </View>
          <View style={s.accountInfo}>
            <Text style={s.accountName}>{currentNickname}</Text>
            {account && (
              <Text style={s.accountStats}>
                {account.totalShifts} смен · ${account.totalEarned.toLocaleString()}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={() => { logout(); setScreen('login'); setNicknameInput(''); }} style={s.logoutBtn} activeOpacity={0.7}>
            <Text style={s.logoutText}>Выйти</Text>
          </TouchableOpacity>
        </View>

        {/* Action buttons */}
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
          <TouchableOpacity style={s.newBtn} onPress={handleNewShift} activeOpacity={0.8}>
            <LinearGradient colors={Colors.gradSuccess} style={s.actionBtnGrad} start={{x:0,y:0}} end={{x:1,y:1}}>
              <Text style={s.actionBtnIcon}>🚀</Text>
              <View>
                <Text style={s.actionBtnTitle}>{hasSave ? 'Новая смена' : 'Начать игру'}</Text>
                <Text style={s.actionBtnSub}>3 трака · стандарт</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Fleet info */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Твой флот</Text>
          <View style={s.fleetRow}>
            {[
              { n: '3', label: 'Старт', active: true, price: null },
              { n: '4', label: '$15,000', active: false, price: '$15k' },
              { n: '5', label: '$30,000', active: false, price: '$30k' },
            ].map((item, i) => (
              <View key={i} style={[s.fleetCard, item.active && s.fleetCardActive, !item.active && s.fleetCardLocked]}>
                <Text style={[s.fleetNum, item.active && s.fleetNumActive]}>{item.n}</Text>
                <Text style={[s.fleetLabel, item.active && s.fleetLabelActive]}>
                  {item.active ? '✓ Доступно' : `🔒 ${item.price}`}
                </Text>
              </View>
            ))}
          </View>
          <Text style={s.fleetHint}>Дополнительные траки покупаются за заработанные деньги</Text>
        </View>

        {/* How to play */}
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
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  // Login
  loginWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 32, gap: 12,
  },
  logoMark: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: Colors.bgCard,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 20,
  },
  logoEmoji: { fontSize: 40 },
  appName: { fontSize: 28, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  appTagline: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: 4 },
  betaBadge: {
    paddingHorizontal: 10, paddingVertical: 3,
    backgroundColor: 'rgba(255,69,58,0.15)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,69,58,0.3)',
    marginBottom: 8,
  },
  betaText: { fontSize: 10, fontWeight: '800', color: Colors.danger, letterSpacing: 2 },

  inputWrap: { width: '100%', maxWidth: 340, gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.textMuted, marginLeft: 4 },
  input: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: Colors.text, fontWeight: '600',
  },
  errorText: { fontSize: 12, color: Colors.danger, marginLeft: 4 },

  primaryBtn: { width: '100%', maxWidth: 340, borderRadius: 16, overflow: 'hidden', marginTop: 4 },
  primaryBtnDisabled: { opacity: 0.35 },
  primaryBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },

  // Menu
  menuScroll: { padding: 20, paddingTop: 60, alignItems: 'center' },

  hero: { alignItems: 'center', marginBottom: 28, gap: 8 },
  heroIcon: {
    width: 72, height: 72, borderRadius: 18,
    backgroundColor: Colors.bgCard,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 16,
  },
  heroEmoji: { fontSize: 36 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  heroSub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },

  accountCard: {
    width: '100%', maxWidth: 400,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
    padding: 14, marginBottom: 16,
  },
  accountAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  accountAvatarText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  accountStats: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  logoutBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'rgba(255,69,58,0.1)',
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,69,58,0.2)',
  },
  logoutText: { fontSize: 12, fontWeight: '600', color: Colors.danger },

  actions: { width: '100%', maxWidth: 400, gap: 10, marginBottom: 24 },
  continueBtn: { borderRadius: 16, overflow: 'hidden' },
  newBtn: { borderRadius: 16, overflow: 'hidden' },
  actionBtnGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 16, paddingHorizontal: 20,
  },
  actionBtnIcon: { fontSize: 24 },
  actionBtnTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  actionBtnSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 1 },

  section: { width: '100%', maxWidth: 400, marginBottom: 24 },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginLeft: 4,
  },

  fleetRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  fleetCard: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    backgroundColor: Colors.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  fleetCardActive: { borderColor: Colors.primary, backgroundColor: 'rgba(10,132,255,0.08)' },
  fleetCardLocked: { opacity: 0.45 },
  fleetNum: { fontSize: 26, fontWeight: '900', color: Colors.textMuted },
  fleetNumActive: { color: Colors.primary },
  fleetLabel: { fontSize: 10, color: Colors.textDim, fontWeight: '600', marginTop: 3 },
  fleetLabelActive: { color: Colors.primary },
  fleetHint: { fontSize: 12, color: Colors.textDim, textAlign: 'center', marginTop: 4 },

  steps: { gap: 8 },
  step: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, padding: 14,
  },
  stepIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  stepIconText: { fontSize: 20 },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  stepDesc: { fontSize: 12, color: Colors.textMuted, lineHeight: 17 },
});
