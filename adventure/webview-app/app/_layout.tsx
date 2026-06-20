import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0a0f1e" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
