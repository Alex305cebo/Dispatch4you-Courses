import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { UnifiedChatUI } from '../components/UnifiedChatUI';
import { useChatIntegration } from '../hooks/useChatIntegration';
import { useGameStore } from '../store/gameStore';

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGES SCREEN — Экран сообщений в стиле Duolingo
// ═══════════════════════════════════════════════════════════════════════════

interface MessagesScreenProps {
  navigation?: any;
}

export const MessagesScreen: React.FC<MessagesScreenProps> = ({ navigation }) => {
  const { sessionName } = useGameStore();
  const nickname = sessionName || 'default';
  
  // Интеграция с существующей системой
  useChatIntegration(nickname);
  
  const handleClose = () => {
    if (navigation) {
      navigation.goBack();
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050a12" />
      <UnifiedChatUI 
        nickname={nickname}
        onClose={navigation ? handleClose : undefined}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050a12',
  },
});
