import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Colors } from '../constants/colors';
import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { SHIFT_DURATION } from '../constants/config';

// Импорт глобальных стилей (включая темный скроллбар)
if (typeof document !== 'undefined') {
  require('../global.css');
}

function AutoRestore() {
  const router = useRouter();
  const { loadGame } = useGameStore();

  useEffect(() => {
    try {
      // Принудительно очищаем любое старое сохранение
      const raw = localStorage.getItem('dispatcher-game-save');
      if (!raw) return;
      const save = JSON.parse(raw);

      // Сбрасываем если: старая версия, не playing, или > 5 траков (старое сохранение)
      if (!save?.version || save.version < 3 || save.phase !== 'playing' || (save.trucks && save.trucks.length > 5)) {
        localStorage.removeItem('dispatcher-game-save');
        return;
      }

      // Компенсируем реальное время пока страница была закрыта
      const realElapsedMs = Date.now() - (save.savedAt || Date.now());
      const realElapsedSec = Math.min(realElapsedMs / 1000, 600);
      const gameMinutesElapsed = Math.round(realElapsedSec * 1.2);
      save.gameMinute = Math.min(save.gameMinute + gameMinutesElapsed, SHIFT_DURATION - 1);
      localStorage.setItem('dispatcher-game-save', JSON.stringify(save));

      const loaded = loadGame();
      if (loaded) router.replace('/game');
    } catch {}
  }, []);

  return null;
}

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar style="light" backgroundColor={Colors.bg} />
      <AutoRestore />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="game" />
        <Stack.Screen name="shift-end" />
      </Stack>
    </View>
  );
}
