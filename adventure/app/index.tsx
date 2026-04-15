import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { useGameStore } from '../store/gameStore';
import { useAccountStore } from '../store/accountStore';

type Screen = 'login' | 'menu';

export default function HomeScreen() {
  const router = useRouter();
  const { startShift, loadGame, phase } = useGameStore();
  const { currentNickname, login, logout, getAccount, loadFromStorage } = useAccountStore();

  const [screen, setScreen] = useState<Screen>('login');
  const [nicknameInput, setNicknameInput] = useState('');
  const [truckCount, setTruckCount] = useState<3 | 4 | 5>(3);
  const [error, setError] = useState('');
  const [hasSave, setHasSave] = useState(false);

  function checkSave() {
    try { setHasSave(!!localStorage.getItem('dispatcher-game-save')); } catch { setHasSave(false); }
  }

  useEffect(() => {
    loadFromStorage();
    checkSave();
  }, []);

  useEffect(() => {
    if (currentNickname) {
      setScreen('menu');
      checkSave();
      const acc = getAccount(currentNickname);
      if (acc?.truckCount) setTruckCount(acc.truckCount as 3 | 4 | 5);
    }
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
    if (loaded) {
      router.push('/game');
    } else {
      handleNewShift();
    }
  }

  function handleNewShift() {
    const sessionName = `${currentNickname} · ${truckCount} трака`;
    startShift(truckCount, sessionName);
    setHasSave(false);
    router.push('/game');
  }

  // ─── ЭКРАН ВХОДА ─────────────────────────────────────────────────────────
  if (screen === 'login') {
    return (
      <LinearGradient colors={['#050a14', '#0a0f1e', '#050a14']} style={styles.container}>
        <View style={styles.loginWrap}>
          <Text style={styles.logoTitle}>DISPATCH</Text>
          <Text style={styles.logoSub}>OFFICE</Text>
          <View style={styles.betaBadge}><Text style={styles.betaText}>BETA v0.1</Text></View>

          <Text style={styles.loginTitle}>Введи никнейм</Text>
          <Text style={styles.loginHint}>Твоя история и статистика сохранятся за этим именем</Text>

          <TextInput
            style={styles.nickInput}
            value={nicknameInput}
            onChangeText={v => { setNicknameInput(v); setError(''); }}
            placeholder="Dispatcher_Pro"
            placeholderTextColor={Colors.textDim}
            maxLength={20}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.loginBtn, !nicknameInput.trim() && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={!nicknameInput.trim()}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.loginBtnGrad}>
              <Text style={styles.loginBtnText}>Войти →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // ─── ГЛАВНОЕ МЕНЮ ─────────────────────────────────────────────────────────
  return (
    <LinearGradient colors={['#050a14', '#0a0f1e', '#050a14']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* LOGO */}
        <View style={styles.logoWrap}>
          <Text style={styles.logoTitle}>DISPATCH</Text>
          <Text style={styles.logoSub}>OFFICE</Text>
          <View style={styles.betaBadge}><Text style={styles.betaText}>BETA v0.1</Text></View>
        </View>

        {/* АККАУНТ */}
        <View style={styles.accountCard}>
          <View style={styles.accountLeft}>
            <Text style={styles.accountAvatar}>👤</Text>
            <View>
              <Text style={styles.accountNick}>{currentNickname}</Text>
              {account && (
                <Text style={styles.accountStats}>
                  {account.totalShifts} смен · ${account.totalEarned.toLocaleString()} заработано
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={() => { logout(); setScreen('login'); setNicknameInput(''); }} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Выйти</Text>
          </TouchableOpacity>
        </View>

        {/* КНОПКИ ДЕЙСТВИЙ */}
        <View style={styles.actionBtns}>
          {hasSave && (
            <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
              <LinearGradient colors={['#06b6d4', '#0284c7']} style={styles.actionBtnGrad}>
                <Text style={styles.actionBtnText}>▶ Продолжить</Text>
                <Text style={styles.actionBtnSub}>сохранённая сессия</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.startBtn, hasSave && styles.startBtnSmall]}
            onPress={handleNewShift}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.actionBtnGrad}>
              <Text style={styles.actionBtnText}>🚀 {hasSave ? 'Новая' : `Начать · ${truckCount} трака`}</Text>
              {hasSave && <Text style={styles.actionBtnSub}>{truckCount} трака</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ВЫБОР ТРАКОВ */}
        <View style={styles.truckSelect}>
          <Text style={styles.truckSelectLabel}>Новая смена — сколько траков?</Text>
          <Text style={styles.truckSelectHint}>Больше траков — больше денег и больше хаоса</Text>
          <View style={styles.truckBtns}>
            {([3, 4, 5] as const).map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.truckBtn, truckCount === n && styles.truckBtnActive]}
                onPress={() => setTruckCount(n)}
                activeOpacity={0.8}
              >
                <Text style={[styles.truckBtnNum, truckCount === n && styles.truckBtnNumActive]}>{n}</Text>
                <Text style={[styles.truckBtnLabel, truckCount === n && styles.truckBtnLabelActive]}>
                  {n === 3 ? 'Легко' : n === 4 ? 'Средне' : 'Хардкор'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* КАК ИГРАТЬ */}
        <View style={styles.howto}>
          <Text style={styles.howtoTitle}>Как играть</Text>
          <View style={styles.steps}>
            {[
              { n: '1', icon: '🌅', title: 'Утро диспетчера', desc: 'Проверь статус траков, обработай почту, оцени ситуацию на рынке.' },
              { n: '2', icon: '🚛', title: 'Веди флот', desc: 'Траки всегда в движении — на пикапе, деливери или в пути. Следи за каждым.' },
              { n: '3', icon: '⚡', title: 'Решай проблемы', desc: 'Поломки, detention, задержки, вопросы водителей — всё как в реальной жизни.' },
              { n: '4', icon: '📊', title: 'Веди бухгалтерию', desc: 'Доходы и расходы по каждому траку. Твоя статистика — твой рейтинг.' },
              { n: '5', icon: '🏆', title: 'Набирай очки', desc: 'Больше траков без ошибок = больше денег = выше место в рейтинге.' },
            ].map(s => (
              <View key={s.n} style={styles.step}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>{s.n}</Text></View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{s.icon} {s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Login
  loginWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loginTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginTop: 24, marginBottom: 8 },
  loginHint: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  nickInput: {
    width: '100%', maxWidth: 340,
    backgroundColor: Colors.bgCard, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: '#fff', fontWeight: '700',
    marginBottom: 8,
  },
  errorText: { fontSize: 12, color: Colors.danger, marginBottom: 12 },
  loginBtn: { width: '100%', maxWidth: 340, borderRadius: 16, overflow: 'hidden', marginTop: 8 },
  loginBtnDisabled: { opacity: 0.4 },
  loginBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  loginBtnText: { fontSize: 17, fontWeight: '900', color: '#fff' },

  // Menu
  scroll: { padding: 20, paddingTop: 40, alignItems: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 16 },
  logoTitle: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: 4 },
  logoSub: { fontSize: 22, fontWeight: '900', color: Colors.primary, letterSpacing: 6, marginTop: -4 },
  betaBadge: {
    marginTop: 10, paddingHorizontal: 14, paddingVertical: 4,
    backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)',
  },
  betaText: { fontSize: 11, fontWeight: '800', color: '#ef4444', letterSpacing: 2 },

  // Account card
  accountCard: {
    width: '100%', maxWidth: 380, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, padding: 14, marginBottom: 16,
  },
  accountLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  accountAvatar: { fontSize: 28 },
  accountNick: { fontSize: 16, fontWeight: '900', color: '#fff' },
  accountStats: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  logoutBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8, borderWidth: 1, borderColor: Colors.border,
  },
  logoutText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },

  // Continue + Start buttons
  actionBtns: { flexDirection: 'row', gap: 10, width: '100%', maxWidth: 380, marginBottom: 28 },
  continueBtn: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  startBtn: { flex: 2, borderRadius: 16, overflow: 'hidden' },
  startBtnSmall: { flex: 1 },
  actionBtnGrad: { paddingVertical: 18, alignItems: 'center' },
  actionBtnText: { fontSize: 15, fontWeight: '900', color: '#fff' },
  actionBtnSub: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2, fontWeight: '600' },

  // Truck select
  truckSelect: {
    width: '100%', maxWidth: 380, marginBottom: 14,
    backgroundColor: Colors.bgCard, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border, padding: 16,
  },
  truckSelectLabel: { fontSize: 13, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 4 },
  truckSelectHint: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginBottom: 14 },
  truckBtns: { flexDirection: 'row', gap: 10 },
  truckBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  truckBtnActive: { backgroundColor: 'rgba(6,182,212,0.15)', borderColor: Colors.primary },
  truckBtnNum: { fontSize: 24, fontWeight: '900', color: Colors.textMuted },
  truckBtnNumActive: { color: Colors.primary },
  truckBtnLabel: { fontSize: 10, color: Colors.textDim, fontWeight: '600', marginTop: 2 },
  truckBtnLabelActive: { color: Colors.primary },

  startBtnGrad: { paddingVertical: 18, alignItems: 'center' },
  startBtnText: { fontSize: 17, fontWeight: '900', color: '#fff', letterSpacing: 1 },

  howto: { width: '100%', maxWidth: 560, marginBottom: 36 },
  howtoTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 16, textAlign: 'center' },
  steps: { gap: 12 },
  step: {
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    backgroundColor: Colors.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, padding: 14,
  },
  stepNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepNumText: { fontSize: 13, fontWeight: '900', color: '#fff' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: '800', color: '#fff', marginBottom: 3 },
  stepDesc: { fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
});
