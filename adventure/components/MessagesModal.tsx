import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UnifiedChatUI } from './UnifiedChatUI';

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGES MODAL — Модальное окно с чатом для игры
// ═══════════════════════════════════════════════════════════════════════════

interface MessagesModalProps {
  visible: boolean;
  nickname: string;
  onClose: () => void;
}

export const MessagesModal: React.FC<MessagesModalProps> = ({ visible, nickname, onClose }) => {
  if (!visible) return null;
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9998,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      fontFamily: 'sans-serif',
    } as any}>
      {/* Backdrop */}
      <div 
        style={{ 
          flex: 1,
          background: 'rgba(0,0,0,0.5)' 
        } as any} 
        onClick={onClose} 
      />
      
      {/* Chat Container */}
      <div style={{
        background: '#fff',
        borderRadius: '24px 24px 0 0',
        width: '100%',
        maxWidth: 500,
        margin: '0 auto',
        minHeight: '40vh',
        maxHeight: '70vh',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      } as any}>
        {/* Handle */}
        <div style={{ 
          width: 40, 
          height: 4, 
          borderRadius: 2, 
          background: '#d1d5db', 
          margin: '12px auto 0',
        } as any} />
        
        {/* Chat UI */}
        <View style={styles.chatContainer}>
          <UnifiedChatUI nickname={nickname} onClose={onClose} />
        </View>
      </div>
    </div>
  );
};

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    overflow: 'hidden',
  },
});
