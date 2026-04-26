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
  // Автовосстановление отключено — пользователь сам выбирает в меню
  return null;
}

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar style="light" backgroundColor={Colors.bg} />
      <AutoRestore />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="menu" />
        <Stack.Screen name="game" />
      </Stack>
    </View>
  );
}
