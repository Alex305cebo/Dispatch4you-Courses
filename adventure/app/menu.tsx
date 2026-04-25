/**
 * DISPATCH OFFICE — Главное меню 2026
 * Современный игровой интерфейс с:
 * - Продолжить игру / Новая игра
 * - Мои сохранения (Firebase)
 * - Гараж (покупка траков)
 * - Настройки (графика, звук, управление)
 * - Профиль (статистика, достижения)
 * - Выход
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { getCurrentUser } from '../utils/firebaseSaveSystem';
import SavesManagerPopup from '../components/SavesManagerPopup';
import SettingsPopup from '../components/SettingsPopup';
import TruckShopModal from '../components/TruckShopModal';

export default function MainMenu() {
  const router = useRouter();
  const { startShift, loadGame, phase } = useGameStore();
  
  const [hasSave, setHasSave] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSaves, setShowSaves] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGarage, setShowGarage] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    checkSaveAndUser();
  }, []);

  async function checkSaveAndUser() {
    // Проверяем наличие сохранения
    try {
      const raw = localStorage.getItem('dispatcher-game-save');
      if (raw) {
        const save = JSON.parse(raw);
        if (save?.version >= 5) {
          setHasSave(true);
        }
      }
    } catch {}

    // Проверяем авторизацию
    try {
      const user = await getCurrentUser();
      setUserEmail(user?.email || null);
    } catch {}
  }

  async function handleContinue() {
    setLoading(true);
    try {
      const loaded = await loadGame();
      if (loaded) {
        router.replace('/game');
      } else {
        alert('Не удалось загрузить сохранение');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleNewGame() {
    if (hasSave) {
      const confirm = window.confirm(
        '⚠️ Начать новую игру?\n\nТекущий прогресс будет потерян.\nРекомендуем сначала сохранить в облако (войдите в аккаунт).'
      );
      if (!confirm) return;
    }

    setLoading(true);
    try {
      await startShift(1, 'Новая смена');
      router.replace('/game');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.root}>
      {/* Animated Background */}
      <View style={s.bgContainer}>
        <LinearGradient
          colors={['#0a0e27', '#1a1f3a', '#0f1729']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Animated grid overlay */}
        <View style={s.gridOverlay}>
          {[...Array(20)].map((_, i) => (
            <View key={i} style={[s.gridLine, { top: `${i * 5}%` }]} />
          ))}
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo & Title */}
        <View style={s.header}>
          <View style={s.logoContainer}>
            <LinearGradient
              colors={['#06b6d4', '#0ea5e9', '#3b82f6']}
              style={s.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={s.logoIcon}>🚛</Text>
            </LinearGradient>
            <View style={s.logoGlow} />
          </View>
          
          <Text style={s.title}>DISPATCH OFFICE</Text>
          <Text style={s.subtitle}>Симулятор диспетчера грузоперевозок США</Text>
          
          <View style={s.versionBadge}>
            <Text style={s.versionText}>BETA v2.2</Text>
          </View>
        </View>

        {/* User Info */}
        {userEmail && (
          <View style={s.userCard}>
            <View style={s.userAvatar}>
              <Text style={s.userAvatarText}>{userEmail[0].toUpperCase()}</Text>
            </View>
            <View style={s.userInfo}>
              <Text style={s.userName}>{userEmail}</Text>
              <Text style={s.userStatus}>☁️ Синхронизация включена</Text>
            </View>
          </View>
        )}

        {/* Main Menu Buttons */}
        <View style={s.menuContainer}>
          
          {/* Continue Game */}
          {hasSave && (
            <TouchableOpacity
              style={s.menuButton}
              onPress={handleContinue}
              disabled={loading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#10b981', '#059669', '#047857']}
                style={s.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={s.buttonContent}>
                  <View style={s.buttonIconContainer}>
                    <Text style={s.buttonIcon}>▶️</Text>
                  </View>
                  <View style={s.buttonTextContainer}>
                    <Text style={s.buttonTitle}>Продолжить игру</Text>
                    <Text style={s.buttonSubtitle}>Последнее сохранение</Text>
                  </View>
                  <View style={s.buttonArrow}>
                    <Text style={s.buttonArrowText}>→</Text>
                  </View>
                </View>
                <View style={s.buttonShine} />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* New Game */}
          <TouchableOpacity
            style={s.menuButton}
            onPress={handleNewGame}
            disabled={loading}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#3b82f6', '#2563eb', '#1d4ed8']}
              style={s.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={s.buttonContent}>
                <View style={s.buttonIconContainer}>
                  <Text style={s.buttonIcon}>🚀</Text>
                </View>
                <View style={s.buttonTextContainer}>
                  <Text style={s.buttonTitle}>
                    {loading ? 'Загрузка...' : (hasSave ? 'Новая игра' : 'Начать игру')}
                  </Text>
                  <Text style={s.buttonSubtitle}>
                    {loading ? 'Строим маршруты...' : '1 трак · Knoxville, TN'}
                  </Text>
                </View>
                <View style={s.buttonArrow}>
                  <Text style={s.buttonArrowText}>→</Text>
                </View>
              </View>
              <View style={s.buttonShine} />
            </LinearGradient>
          </TouchableOpacity>

          {/* My Saves */}
          <TouchableOpacity
            style={s.menuButtonSecondary}
            onPress={() => setShowSaves(true)}
            activeOpacity={0.8}
          >
            <View style={s.buttonSecondaryContent}>
              <View style={s.buttonSecondaryIcon}>
                <Text style={s.buttonSecondaryIconText}>💾</Text>
              </View>
              <View style={s.buttonSecondaryTextContainer}>
                <Text style={s.buttonSecondaryTitle}>Мои сохранения</Text>
                <Text style={s.buttonSecondarySubtitle}>
                  {userEmail ? 'История последних 5 сохранений' : 'Войдите для облачных сохранений'}
                </Text>
              </View>
              <Text style={s.buttonSecondaryArrow}>→</Text>
            </View>
          </TouchableOpacity>

          {/* Garage */}
          <TouchableOpacity
            style={s.menuButtonSecondary}
            onPress={() => setShowGarage(true)}
            activeOpacity={0.8}
          >
            <View style={s.buttonSecondaryContent}>
              <View style={s.buttonSecondaryIcon}>
                <Text style={s.buttonSecondaryIconText}>🏪</Text>
              </View>
              <View style={s.buttonSecondaryTextContainer}>
                <Text style={s.buttonSecondaryTitle}>Гараж</Text>
                <Text style={s.buttonSecondarySubtitle}>Покупка и управление траками</Text>
              </View>
              <View style={s.garageBadge}>
                <Text style={s.garageBadgeText}>СКОРО</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            style={s.menuButtonSecondary}
            onPress={() => setShowSettings(true)}
            activeOpacity={0.8}
          >
            <View style={s.buttonSecondaryContent}>
              <View style={s.buttonSecondaryIcon}>
                <Text style={s.buttonSecondaryIconText}>⚙️</Text>
              </View>
              <View style={s.buttonSecondaryTextContainer}>
                <Text style={s.buttonSecondaryTitle}>Настройки</Text>
                <Text style={s.buttonSecondarySubtitle}>Графика · Звук · Управление</Text>
              </View>
              <Text style={s.buttonSecondaryArrow}>→</Text>
            </View>
          </TouchableOpacity>

          {/* Profile */}
          <TouchableOpacity
            style={s.menuButtonSecondary}
            onPress={() => setShowProfile(true)}
            activeOpacity={0.8}
          >
            <View style={s.buttonSecondaryContent}>
              <View style={s.buttonSecondaryIcon}>
                <Text style={s.buttonSecondaryIconText}>👤</Text>
              </View>
              <View style={s.buttonSecondaryTextContainer}>
                <Text style={s.buttonSecondaryTitle}>Профиль</Text>
                <Text style={s.buttonSecondarySubtitle}>Статистика · Достижения</Text>
              </View>
              <View style={s.garageBadge}>
                <Text style={s.garageBadgeText}>СКОРО</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Exit */}
          <TouchableOpacity
            style={s.menuButtonExit}
            onPress={() => {
              if (window.confirm('Выйти из игры?')) {
                window.location.href = '/';
              }
            }}
            activeOpacity={0.8}
          >
            <View style={s.buttonSecondaryContent}>
              <View style={s.buttonSecondaryIcon}>
                <Text style={s.buttonSecondaryIconText}>🚪</Text>
              </View>
              <Text style={s.buttonExitText}>Выход</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            💡 Игра автоматически сохраняется каждую минуту
          </Text>
          {!userEmail && (
            <Text style={s.footerWarning}>
              ⚠️ Войдите в аккаунт для облачных сохранений
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      {showSaves && <SavesManagerPopup onClose={() => setShowSaves(false)} />}
      {showSettings && <SettingsPopup onClose={() => setShowSettings(false)} />}
      {showGarage && <TruckShopModal onClose={() => setShowGarage(false)} />}
      
      {/* Profile Modal (placeholder) */}
      {showProfile && (
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>👤 Профиль</Text>
            <Text style={s.modalText}>Раздел в разработке</Text>
            <Text style={s.modalSubtext}>
              Здесь будет статистика, достижения и рейтинг
            </Text>
            <TouchableOpacity
              style={s.modalButton}
              onPress={() => setShowProfile(false)}
            >
              <Text style={s.modalButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <style>{`
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(20px); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
      `}</style>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#06b6d4',
  } as any,
  scroll: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    minHeight: '100%',
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 12,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  logoIcon: {
    fontSize: 40,
  },
  logoGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#06b6d4',
    opacity: 0.3,
  } as any,
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textShadowColor: '#06b6d4',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    maxWidth: 300,
  },
  versionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  versionText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ef4444',
    letterSpacing: 1,
  },

  // User Card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(6,182,212,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 30,
    width: '100%',
    maxWidth: 400,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 2,
  },
  userStatus: {
    fontSize: 11,
    color: '#94a3b8',
  },

  // Menu Container
  menuContainer: {
    width: '100%',
    maxWidth: 500,
    gap: 12,
  },

  // Primary Menu Button
  menuButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    position: 'relative',
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  buttonIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 24,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  buttonArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonArrowText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
  },
  buttonShine: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  } as any,

  // Secondary Menu Button
  menuButtonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    overflow: 'hidden',
  },
  buttonSecondaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  buttonSecondaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(6,182,212,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondaryIconText: {
    fontSize: 22,
  },
  buttonSecondaryTextContainer: {
    flex: 1,
  },
  buttonSecondaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 2,
  },
  buttonSecondarySubtitle: {
    fontSize: 11,
    color: '#94a3b8',
  },
  buttonSecondaryArrow: {
    fontSize: 20,
    color: '#06b6d4',
    fontWeight: '700',
  },
  garageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(251,191,36,0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
  },
  garageBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fbbf24',
    letterSpacing: 0.5,
  },

  // Exit Button
  menuButtonExit: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonExitText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },

  // Footer
  footer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  footerWarning: {
    fontSize: 11,
    color: '#f97316',
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  } as any,
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
    padding: 24,
    gap: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#e2e8f0',
  },
  modalText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  modalSubtext: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  modalButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#06b6d4',
    borderRadius: 12,
    marginTop: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
