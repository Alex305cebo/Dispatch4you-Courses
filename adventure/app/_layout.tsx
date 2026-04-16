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
  const { loadGame, gameMinute, phase, setGameMinute } = useGameStore();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('dispatcher-game-save');
      if (!raw) return;
      const save = JSON.parse(raw);
      if (!save?.version || save.version < 3) return;
      if (save.phase !== 'playing') return;

      // Компенсируем реальное время пока страница была закрыта
      // TIME_SCALE: 1 реальная секунда = 1.2 игровых минуты (при speed×1)
      const realElapsedMs = Date.now() - (save.savedAt || Date.now());
      const realElapsedSec = Math.min(realElapsedMs / 1000, 600); // максимум 10 минут компенсации
      const gameMinutesElapsed = Math.round(realElapsedSec * 1.2);
      const restoredMinute = Math.min(save.gameMinute + gameMinutesElapsed, SHIFT_DURATION - 1);

      // Патчим сохранение с компенсированным временем
      save.gameMinute = restoredMinute;
      localStorage.setItem('dispatcher-game-save', JSON.stringify(save));

      const loaded = loadGame();
      if (loaded) {
        router.replace('/game');
      }
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
