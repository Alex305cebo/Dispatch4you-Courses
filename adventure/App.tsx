import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from './constants/colors';
import HomeScreen from './screens/HomeScreen';
import LoadBoardScreen from './screens/LoadBoardScreen';
import MapScreen from './screens/MapScreen';
import EventScreen from './screens/EventScreen';
import FinishScreen from './screens/FinishScreen';

export type Screen = 'home' | 'loadboard' | 'map' | 'event' | 'finish';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');

  const navigate = (s: Screen) => setScreen(s);

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor={Colors.bg} />
      {screen === 'home' && <HomeScreen navigate={navigate} />}
      {screen === 'loadboard' && <LoadBoardScreen navigate={navigate} />}
      {screen === 'map' && <MapScreen navigate={navigate} />}
      {screen === 'event' && <EventScreen navigate={navigate} />}
      {screen === 'finish' && <FinishScreen navigate={navigate} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
});
