import { useEffect } from 'react';
import { useUnifiedChatStore } from '../store/unifiedChatStore';
import { useGameStore } from '../store/gameStore';

// ═══════════════════════════════════════════════════════════════════════════
// CHAT INTEGRATION HOOK — Интеграция с существующей системой уведомлений
// ═══════════════════════════════════════════════════════════════════════════

export function useChatIntegration(nickname: string) {
  const { notifications } = useGameStore();
  const { 
    createThread, 
    addMessage, 
    getThreadByParticipant,
    loadFromStorage,
    saveToStorage,
  } = useUnifiedChatStore();
  
  // Загрузка при монтировании
  useEffect(() => {
    loadFromStorage(nickname);
  }, [nickname]);
  
  // Синхронизация уведомлений с чатом
  useEffect(() => {
    notifications.forEach(notif => {
      // Определяем роль отправителя
      let role: 'driver' | 'broker' | 'system' = 'system';
      let participantName = notif.from;
      let participantCompany: string | undefined;
      
      // Парсим имя и компанию
      if (notif.from.includes('(') && notif.from.includes(')')) {
        const match = notif.from.match(/^(.+?)\s*\((.+?)\)$/);
        if (match) {
          participantName = match[1].trim();
          participantCompany = match[2].trim();
        }
      }
      
      // Определяем роль
      if (notif.from.toLowerCase().includes('водитель') || 
          notif.from.toLowerCase().includes('driver') ||
          participantCompany?.toLowerCase().includes('водитель')) {
        role = 'driver';
      } else if (
        notif.from.includes('LLC') || 
        notif.from.includes('Inc') || 
        notif.from.includes('Freight') ||
        notif.from.includes('Load') ||
        notif.from.includes('Logistics')
      ) {
        role = 'broker';
      }
      
      // Проверяем существует ли тред
      let thread = getThreadByParticipant(participantName);
      
      // Если треда нет — создаём
      if (!thread) {
        const threadId = createThread({
          participantName,
          participantRole: role,
          participantAvatar: '', // Будет сгенерирован автоматически
          participantCompany,
          context: {
            truckId: notif.metadata?.truckId,
            loadId: notif.metadata?.loadId,
          },
        });
        
        thread = { id: threadId } as any;
      }
      
      // Проверяем есть ли уже это сообщение в треде
      const existingThread = getThreadByParticipant(participantName);
      const messageExists = existingThread?.messages.some(
        m => m.text === notif.message && Math.abs(m.timestamp - notif.timestamp) < 1000
      );
      
      if (!messageExists && thread) {
        // Добавляем сообщение
        addMessage({
          threadId: thread.id,
          type: notif.type === 'text' ? 'sms' : notif.type,
          from: role,
          fromName: participantName,
          text: notif.message,
          read: notif.read || false,
          priority: notif.priority,
          subject: notif.subject,
          metadata: {
            truckId: notif.metadata?.truckId,
            loadId: notif.metadata?.loadId,
            eventId: notif.id,
          },
        });
      }
    });
    
    // Автосохранение после синхронизации
    saveToStorage(nickname);
  }, [notifications, nickname]);
  
  return {
    // Можно добавить дополнительные методы для интеграции
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Отправка сообщения из игры в чат
// ═══════════════════════════════════════════════════════════════════════════

export function sendGameMessageToChat(params: {
  from: string;
  fromCompany?: string;
  role: 'driver' | 'broker' | 'system';
  type: 'sms' | 'email' | 'voicemail' | 'voice_call';
  subject?: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  truckId?: string;
  loadId?: string;
}) {
  const { 
    createThread, 
    addMessage, 
    getThreadByParticipant 
  } = useUnifiedChatStore.getState();
  
  // Получаем или создаём тред
  let thread = getThreadByParticipant(params.from);
  
  if (!thread) {
    const threadId = createThread({
      participantName: params.from,
      participantRole: params.role,
      participantAvatar: '',
      participantCompany: params.fromCompany,
      context: {
        truckId: params.truckId,
        loadId: params.loadId,
      },
    });
    
    thread = { id: threadId } as any;
  }
  
  // Добавляем сообщение
  addMessage({
    threadId: thread!.id,
    type: params.type,
    from: params.role,
    fromName: params.from,
    text: params.message,
    read: false,
    priority: params.priority,
    subject: params.subject,
    metadata: {
      truckId: params.truckId,
      loadId: params.loadId,
    },
  });
}
