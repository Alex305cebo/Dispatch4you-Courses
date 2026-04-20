import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Animated } from 'react-native';
import { useUnifiedChatStore, ChatThread, ChatMessage } from '../store/unifiedChatStore';
import { useGameStore, Notification } from '../store/gameStore';
import { CHARACTERS } from '../data/dialogs';

// ═══ BROKER AVATARS POOL ═══
const BROKER_AVATARS = [
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Person%20Light%20Skin%20Tone%2C%20Curly%20Hair.png',
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Child.png',
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Older%20Person.png',
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Man%20Office%20Worker%20Medium%20Skin%20Tone.png',
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Woman%20Office%20Worker%20Medium-Dark%20Skin%20Tone.png',
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Man%20Beard%20Medium-Light%20Skin%20Tone.png',
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Man%20Curly%20Hair.png',
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Woman%20Technologist%20Medium%20Skin%20Tone.png',
];

// Детерминированный выбор аватара по имени — одно имя всегда = один аватар
function getBrokerAvatar(name: string): string {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return BROKER_AVATARS[hash % BROKER_AVATARS.length];
}

// Получить аватар по имени отправителя
function getAvatarByName(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('dispatch')) return 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Telephone.webp';
  if (n.includes('john') || n.includes('водитель') || n.includes('driver')) return CHARACTERS.driver.avatar;
  if (n.includes('mike') && !n.includes('fastfreight') && !n.includes('llc')) return CHARACTERS.driver2.avatar;
  return getBrokerAvatar(name);
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED CHAT UI — Интерфейс в стиле Duolingo для всех диалогов
// ═══════════════════════════════════════════════════════════════════════════

interface UnifiedChatUIProps {
  nickname: string;
  onClose?: () => void;
}

export const UnifiedChatUI: React.FC<UnifiedChatUIProps> = ({ nickname, onClose }) => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  
  const {
    threads,
    getAllThreads,
    getThread,
    addMessage,
    markThreadAsRead,
    getUnreadCount,
    loadFromStorage,
    saveToStorage,
    onboardingActive,
    startOnboarding,
    nextOnboardingStep,
  } = useUnifiedChatStore();
  
  const scrollViewRef = useRef<ScrollView>(null);
  const onboardingStarted = useRef(false);
  
  // Загрузка при монтировании
  useEffect(() => {
    loadFromStorage(nickname);
    
    // Проверяем нужно ли запустить онбординг
    const { isOnboardingComplete } = require('../data/onboardingSteps');
    if (!isOnboardingComplete(nickname) && !onboardingStarted.current) {
      onboardingStarted.current = true;
      setTimeout(() => {
        startOnboarding();
      }, 500);
    }
  }, [nickname]);
  
  // Автосохранение
  useEffect(() => {
    const interval = setInterval(() => {
      saveToStorage(nickname);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [nickname]);
  
  // Получаем список тредов
  const allThreads = getAllThreads();

  // ═══ EMAIL ТРЕДЫ из gameStore.notifications ═══
  const notifications = useGameStore(s => s.notifications);
  const markNotificationRead = useGameStore(s => s.markNotificationRead);

  // Группируем уведомления в email-треды
  const emailNotifs = notifications.filter(n =>
    ['email','pod_ready','rate_con','detention','missed_call','voicemail','text','urgent'].includes(n.type)
  );

  function getEmailIcon(type: string) {
    if (type === 'missed_call') return '📵';
    if (type === 'voicemail') return '📱';
    if (type === 'text') return '💬';
    if (type === 'pod_ready') return '📄';
    if (type === 'rate_con') return '📋';
    if (type === 'detention') return '⏰';
    if (type === 'urgent') return '🚨';
    return '📧';
  }

  // Группируем по отправителю
  const emailThreadMap = new Map<string, Notification[]>();
  emailNotifs.forEach(n => {
    const key = (n.from || 'unknown').trim().toLowerCase();
    if (!emailThreadMap.has(key)) emailThreadMap.set(key, []);
    emailThreadMap.get(key)!.push(n);
  });

  interface EmailThread {
    key: string;
    from: string;
    messages: Notification[];
    lastMessage: Notification;
    unreadCount: number;
  }

  const emailThreads: EmailThread[] = [];
  emailThreadMap.forEach((msgs, key) => {
    const sorted = [...msgs].sort((a, b) => a.minute - b.minute);
    const last = sorted[sorted.length - 1];
    emailThreads.push({
      key,
      from: last.from || key,
      messages: sorted,
      lastMessage: last,
      unreadCount: sorted.filter(m => !m.read).length,
    });
  });
  emailThreads.sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
    return b.lastMessage.minute - a.lastMessage.minute;
  });

  const [selectedEmailThread, setSelectedEmailThread] = useState<string | null>(null);
  const activeEmailThread = selectedEmailThread ? emailThreads.find(t => t.key === selectedEmailThread) : null;

  const filteredThreads = allThreads;
  
  const selectedThread = selectedThreadId ? getThread(selectedThreadId) : null;
  const unreadCount = getUnreadCount();
  
  // Генерация быстрых ответов на основе последнего сообщения
  const getQuickReplies = (): string[] => {
    if (!selectedThread || selectedThread.messages.length === 0) {
      return [];
    }
    
    const lastMessage = selectedThread.messages[selectedThread.messages.length - 1];
    
    // Если последнее сообщение от нас — не показываем ответы
    if (lastMessage.from === 'dispatcher') {
      return [];
    }
    
    const messageText = lastMessage.text.toLowerCase();
    const replies: string[] = [];
    
    // Вопросы о грузе
    if (messageText.includes('груз') || messageText.includes('найд')) {
      replies.push('🔍 🔥 Ищу груз');
      replies.push('⏰ ⏰ Подожди');
    }
    
    // Прибытие
    if (messageText.includes('приехал') || messageText.includes('разгрузился') || messageText.includes('готов')) {
      replies.push('🔍 Ищу груз');
      replies.push('⏰ Подожди');
      replies.push('👍 Да');
    }
    
    // Проблемы
    if (messageText.includes('перегруз') || messageText.includes('показали')) {
      replies.push('🔍 Ищу груз');
      replies.push('⏰ Подожди');
      replies.push('👍 Да');
      replies.push('✕');
    }
    
    // HOS/остановка
    if (messageText.includes('останов') || messageText.includes('ночь') || messageText.includes('hos')) {
      replies.push('🔍 Ищу груз');
      replies.push('⏰ Подожди');
      replies.push('👍 Да');
      replies.push('✕');
    }
    
    // Общие ответы
    if (replies.length === 0) {
      replies.push('👍 Понятно');
      replies.push('✅ Хорошо');
      replies.push('📞 Позвони');
    }
    
    return replies;
  };
  
  const quickReplies = selectedThreadId ? getQuickReplies() : [];
  
  // Отправка сообщения (через выбор подсказки)
  const handleQuickReply = (text: string, messageId?: string) => {
    if (!selectedThreadId || text === '✕') return;
    
    addMessage({
      threadId: selectedThreadId,
      type: 'sms',
      from: 'dispatcher',
      fromName: 'Вы',
      text: text,
      read: true,
    });
    
    // Помечаем сообщение как отвеченное если передан messageId
    if (messageId) {
      const { handleButtonAction } = useUnifiedChatStore.getState();
      handleButtonAction(messageId, 'replied', 'replied', { reply: text });
    }
    
    // Скролл вниз
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };
  
  // Открытие треда
  const handleOpenThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    markThreadAsRead(threadId);
  };
  
  // Форматирование времени
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} д назад`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };
  
  // Иконка типа сообщения
  const getMessageTypeIcon = (type: ChatMessage['type']) => {
    switch (type) {
      case 'sms': return '💬';
      case 'email': return '📧';
      case 'voicemail': return '🎤';
      case 'voice_call': return '📞';
      case 'system': return '🔔';
      default: return '💬';
    }
  };
  
  // Цвет приоритета
  const getPriorityColor = (priority?: ChatMessage['priority']) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      case 'low': return '#94a3b8';
      default: return '#94a3b8';
    }
  };
  
  return (
    <>
      {/* ═══ СПИСОК ТРЕДОВ ═══ */}
      {!selectedThreadId && !selectedEmailThread && (
        <>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Сообщения</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            {onClose && (
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Thread List */}
          <ScrollView style={styles.threadList}>
            {filteredThreads.length === 0 && emailThreads.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>💬</Text>
                <Text style={styles.emptyStateText}>Нет сообщений</Text>
              </View>
            ) : (
              <>
                {filteredThreads.map(thread => (
                  <ThreadItem
                    key={thread.id}
                    thread={thread}
                    onPress={() => handleOpenThread(thread.id)}
                    formatTime={formatTime}
                  />
                ))}
                {/* ═══ EMAIL ТРЕДЫ ═══ */}
                {emailThreads.length > 0 && filteredThreads.length > 0 && (
                  <View style={{ height: 1, marginHorizontal: 0, marginVertical: 0 }}>
                    <View style={{
                      position: 'absolute', left: 0, right: 0, top: 0, height: 1,
                      background: 'linear-gradient(90deg, transparent 0%, #06b6d4 30%, #f97316 70%, transparent 100%)',
                      opacity: 0.5,
                    } as any} />
                  </View>
                )}
        {emailThreads.map((et, idx) => (
                  <React.Fragment key={et.key}>
                  <TouchableOpacity
                    style={[styles.threadItem, et.unreadCount > 0 && styles.threadItemUnread]}
                    onPress={() => {
                      setSelectedEmailThread(et.key);
                      et.messages.forEach(m => { if (!m.read) markNotificationRead(m.id); });
                    }}
                  >
                    <View style={[styles.threadAvatar, et.unreadCount > 0 && styles.threadAvatarUnread]}>
                      {(() => {
                        const avatarUrl = getAvatarByName(et.from);
                        return <img src={avatarUrl} width={40} height={40} 
                          style={{ objectFit: 'contain' } as any}
                          onError={(e: any) => { e.target.src = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Child.png'; }}
                        />;
                      })()}
                      {et.unreadCount > 0 && <View style={styles.threadAvatarDot} />}
                    </View>
                    <View style={styles.threadContent}>
                      <View style={styles.threadHeader}>
                        <Text style={[styles.threadName, et.unreadCount > 0 && styles.threadNameUnread]} numberOfLines={1}>
                          {et.from}
                        </Text>
                        <Text style={styles.threadTime}>{et.lastMessage.minute}m</Text>
                      </View>
                      {et.lastMessage.subject && (
                        <Text style={styles.threadCompany} numberOfLines={1}>{et.lastMessage.subject}</Text>
                      )}
                      <Text style={[styles.threadPreviewText, et.unreadCount > 0 && styles.threadPreviewTextUnread]} numberOfLines={2}>
                        {et.lastMessage.message}
                      </Text>
                    </View>
                    {et.unreadCount > 0 && (
                      <View style={styles.threadUnreadBadge}>
                        <Text style={styles.threadUnreadBadgeText}>{et.unreadCount}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <View style={{ height: 1, background: 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.5) 30%, rgba(249,115,22,0.5) 70%, transparent 100%)' } as any} />
                  </React.Fragment>
                ))}
              </>
            )}
          </ScrollView>
          
          {/* ═══ КОМАНДА (фиксированная внизу) ═══ */}
          <View style={styles.teamFooter}>
            <TouchableOpacity 
              style={styles.teamButton}
              onPress={() => {
                const threadId = useUnifiedChatStore.getState().createThread({
                  participantName: CHARACTERS.driver.name,
                  participantRole: 'driver',
                  participantAvatar: CHARACTERS.driver.avatar,
                  participantCompany: CHARACTERS.driver.role,
                });
                handleOpenThread(threadId);
              }}
            >
              <img src={CHARACTERS.driver.avatar} width={28} height={28} style={{ objectFit: 'contain' } as any} />
              <Text style={styles.teamButtonText}>Водитель</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.teamButton}
              onPress={() => {
                const threadId = useUnifiedChatStore.getState().createThread({
                  participantName: CHARACTERS.owner.name,
                  participantRole: 'system',
                  participantAvatar: CHARACTERS.owner.avatar,
                  participantCompany: CHARACTERS.owner.role,
                });
                handleOpenThread(threadId);
              }}
            >
              <img src={CHARACTERS.owner.avatar} width={28} height={28} style={{ objectFit: 'contain' } as any} />
              <Text style={styles.teamButtonText}>Владелец</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.teamButton}
              onPress={() => {
                const threadId = useUnifiedChatStore.getState().createThread({
                  participantName: CHARACTERS.accountant.name,
                  participantRole: 'system',
                  participantAvatar: CHARACTERS.accountant.avatar,
                  participantCompany: CHARACTERS.accountant.role,
                });
                handleOpenThread(threadId);
              }}
            >
              <img src={CHARACTERS.accountant.avatar} width={28} height={28} style={{ objectFit: 'contain' } as any} />
              <Text style={styles.teamButtonText}>Бухгалтер</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      
      {/* ═══ EMAIL ДИАЛОГ ═══ */}
      {selectedEmailThread && activeEmailThread && (() => {
        const emailAvatar = getAvatarByName(activeEmailThread.from);
        return (
        <>
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setSelectedEmailThread(null)} style={styles.backBtn}>
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>
            <View style={[styles.chatHeaderAvatar, { backgroundColor: 'transparent' }]}>
              <img src={emailAvatar} width={44} height={44} style={{ objectFit: 'contain' } as any} />
            </View>
            <View style={styles.chatHeaderInfo}>
              <Text style={styles.chatHeaderName}>{activeEmailThread.from}</Text>
              {activeEmailThread.lastMessage.subject && (
                <Text style={styles.chatHeaderCompany} numberOfLines={1}>{activeEmailThread.lastMessage.subject}</Text>
              )}
            </View>
          </View>
          <ScrollView style={styles.messageList} contentContainerStyle={styles.messageListContent}>
            {activeEmailThread.messages.map((notif, idx) => (
              <React.Fragment key={notif.id}>
              <View style={styles.messageBubbleContainer}>
                <View style={[styles.duoAvatar, { marginRight: 10 }]}>
                  <img src={emailAvatar} width={82} height={82} 
                    style={{ objectFit: 'contain' } as any}
                    onError={(e: any) => { e.target.src = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Child.png'; }}
                  />
                </View>
                <View style={styles.messageBubble}>
                  {notif.subject && <Text style={styles.messageSubject}>{notif.subject}</Text>}
                  <Text style={styles.messageText}>{notif.message}</Text>
                  {notif.replies && notif.replies.map((r, ri) => (
                    <View key={ri} style={r.isMe ? [styles.messageBubble, styles.messageBubbleOwn, {marginTop:6}] : {marginTop:6, padding:6, background:'rgba(255,255,255,0.04)', borderRadius:8} as any}>
                      <Text style={r.isMe ? styles.messageTextOwn : styles.messageText}>{r.message}</Text>
                    </View>
                  ))}
                  <View style={styles.messageFooter}>
                    <Text style={styles.messageTypeIcon}>{getEmailIcon(notif.type)}</Text>
                    <Text style={styles.messageTime}>{notif.minute}m</Text>
                  </View>
                </View>
              </View>
              {idx < activeEmailThread.messages.length - 1 && (
                <View style={{ height: 1, marginVertical: 2, background: 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.4) 30%, rgba(249,115,22,0.4) 70%, transparent 100%)' } as any} />
              )}
              </React.Fragment>
            ))}
          </ScrollView>
        </>
        );
      })()}

      {/* ═══ ДИАЛОГ ═══ */}
      {selectedThreadId && selectedThread && (
        <>
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity 
              onPress={() => setSelectedThreadId(null)}
              style={styles.backBtn}
            >
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.chatHeaderAvatar}>
              {(selectedThread.participantAvatar.startsWith('http') || selectedThread.participantAvatar.startsWith('/'))
                ? <img src={selectedThread.participantAvatar} width={36} height={36} style={{ objectFit: 'contain' } as any} />
                : <Text style={styles.chatHeaderAvatarText}>{selectedThread.participantAvatar}</Text>
              }
            </View>
            
            <View style={styles.chatHeaderInfo}>
              <Text style={styles.chatHeaderName}>{selectedThread.participantName}</Text>
              {selectedThread.participantCompany && (
                <Text style={styles.chatHeaderCompany}>{selectedThread.participantCompany}</Text>
              )}
            </View>
          </View>
          
          {/* Messages */}
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
          >
            {selectedThread.messages.map((message, index) => (
              <React.Fragment key={message.id}>
              <MessageBubble
                message={message}
                isOwn={message.from === 'dispatcher'}
                showAvatar={
                  index === 0 || 
                  selectedThread.messages[index - 1].from !== message.from
                }
                avatar={selectedThread.participantAvatar}
                formatTime={formatTime}
                getMessageTypeIcon={getMessageTypeIcon}
                getPriorityColor={getPriorityColor}
              />
              {index < selectedThread.messages.length - 1 && (
                <View style={{ height: 1, marginVertical: 2, background: 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.4) 30%, rgba(249,115,22,0.4) 70%, transparent 100%)' } as any} />
              )}
              </React.Fragment>
            ))}
          </ScrollView>
          
          {/* Quick Replies Footer */}
          {quickReplies.length > 0 && (
            <View style={styles.quickRepliesFooter}>
              <Text style={styles.quickRepliesLabel}>Быстрые ответы:</Text>
              <View style={styles.quickRepliesGrid}>
                {quickReplies.map((reply, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.quickReplyButton,
                      reply === '✕' && styles.quickReplyButtonClose
                    ]}
                    onPress={() => handleQuickReply(reply)}
                  >
                    <Text style={[
                      styles.quickReplyButtonText,
                      reply === '✕' && styles.quickReplyButtonCloseText
                    ]}>
                      {reply}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// THREAD ITEM — Элемент списка тредов
// ═══════════════════════════════════════════════════════════════════════════

interface ThreadItemProps {
  thread: ChatThread;
  onPress: () => void;
  formatTime: (timestamp: number) => string;
}

const ThreadItem: React.FC<ThreadItemProps> = ({ thread, onPress, formatTime }) => {
  const lastMessage = thread.messages[thread.messages.length - 1];
  const hasUnread = thread.unreadCount > 0;
  
  return (
    <>
    <TouchableOpacity 
      style={[styles.threadItem, hasUnread && styles.threadItemUnread]}
      onPress={onPress}
    >
      {/* Avatar */}
      <View style={[styles.threadAvatar, hasUnread && styles.threadAvatarUnread]}>
        {(thread.participantAvatar.startsWith('http') || thread.participantAvatar.startsWith('/'))
          ? <img src={thread.participantAvatar} width={36} height={36} style={{ objectFit: 'contain', borderRadius: 8 } as any} onError={(e: any) => { e.target.style.opacity = '0'; }} />
          : <Text style={styles.threadAvatarText}>{thread.participantAvatar}</Text>
        }
        {hasUnread && <View style={styles.threadAvatarDot} />}
      </View>
      
      {/* Content */}
      <View style={styles.threadContent}>
        <View style={styles.threadHeader}>
          <Text style={[styles.threadName, hasUnread && styles.threadNameUnread]}>
            {thread.participantName}
          </Text>
          <Text style={styles.threadTime}>{formatTime(thread.lastMessageTime)}</Text>
        </View>
        
        {thread.participantCompany && (
          <Text style={styles.threadCompany}>{thread.participantCompany}</Text>
        )}
        
        <View style={styles.threadPreview}>
          <Text 
            style={[styles.threadPreviewText, hasUnread && styles.threadPreviewTextUnread]}
            numberOfLines={2}
          >
            {lastMessage?.subject && `${lastMessage.subject}: `}
            {lastMessage?.text || 'Нет сообщений'}
          </Text>
        </View>
      </View>
      
      {/* Unread Badge */}
      {hasUnread && (
        <View style={styles.threadUnreadBadge}>
          <Text style={styles.threadUnreadBadgeText}>{thread.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
    <View style={{ height: 1, background: 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.5) 30%, rgba(249,115,22,0.5) 70%, transparent 100%)' } as any} />
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE BUBBLE — Пузырь сообщения
// ═══════════════════════════════════════════════════════════════════════════

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
  avatar: string;
  formatTime: (timestamp: number) => string;
  getMessageTypeIcon: (type: ChatMessage['type']) => string;
  getPriorityColor: (priority?: ChatMessage['priority']) => string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar,
  avatar,
  formatTime,
  getMessageTypeIcon,
  getPriorityColor,
}) => {
  const { handleButtonAction, nextOnboardingStep, onboardingActive } = useUnifiedChatStore();
  
  const onButtonPress = (buttonId: string, action: string, data?: any) => {
    handleButtonAction(message.id, buttonId, action, data);
    if (onboardingActive) {
      setTimeout(() => { nextOnboardingStep(); }, 500);
    }
  };

  // Duolingo-style: персонаж + пузырь
  const isAvatarUrl = avatar.startsWith('http');

  return (
    <View style={[
      styles.messageBubbleContainer,
      isOwn && styles.messageBubbleContainerOwn,
      { marginBottom: 20, alignItems: 'flex-end' },
    ]}>
      {/* Аватар персонажа (только для входящих) */}
      {!isOwn && showAvatar && (
        <View style={styles.duoAvatar}>
          {(isAvatarUrl || avatar.startsWith('/'))
            ? <img src={avatar} width={82} height={82} style={{ objectFit: 'contain' } as any} onError={(e: any) => { e.target.style.opacity = '0'; }} />
            : <Text style={styles.duoAvatarEmoji}>{avatar}</Text>
          }
        </View>
      )}
      {!isOwn && !showAvatar && <View style={{ width: 82 }} />}

      {/* Пузырь */}
      <View style={[styles.duoBubble, isOwn && styles.duoBubbleOwn]}>
        {/* Хвостик пузыря */}
        {!isOwn && <View style={styles.duoTailLeft} />}
        {isOwn && <View style={styles.duoTailRight} />}

        {/* Subject */}
        {message.subject && (
          <Text style={styles.duoSubject}>{message.subject}</Text>
        )}

        {/* Текст */}
        <Text style={[styles.duoText, isOwn && styles.duoTextOwn]}>
          {message.text}
        </Text>

        {/* Интерактивные элементы */}
        {message.interactive && !message.actionStatus?.completed && (
          <View style={styles.interactiveContainer}>
            {message.interactive.type === 'buttons' && message.interactive.buttons && (
              <InteractiveButtons buttons={message.interactive.buttons} onPress={onButtonPress} />
            )}
            {message.interactive.type === 'load_card' && message.interactive.loadCard && (
              <LoadCardComponent loadCard={message.interactive.loadCard} buttons={message.interactive.buttons} onPress={onButtonPress} />
            )}
            {message.interactive.type === 'document' && message.interactive.document && (
              <DocumentPreviewComponent document={message.interactive.document} buttons={message.interactive.buttons} onPress={onButtonPress} />
            )}
            {message.interactive.type === 'quick_replies' && message.interactive.quickReplies && (
              <QuickRepliesComponent replies={message.interactive.quickReplies} onPress={(reply) => useUnifiedChatStore.getState().handleQuickReply(message.threadId, reply)} />
            )}
            {message.interactive.type === 'alert' && (
              <AlertComponent urgency={message.interactive.urgency || 'medium'} buttons={message.interactive.buttons} onPress={onButtonPress} />
            )}
          </View>
        )}

        {message.actionStatus?.completed && (
          <View style={styles.actionStatusContainer}>
            <Text style={styles.actionStatusIcon}>✓</Text>
            <Text style={styles.actionStatusText}>{message.actionStatus.result}</Text>
          </View>
        )}

        {/* Время */}
        <Text style={[styles.duoTime, isOwn && styles.duoTimeOwn]}>
          {formatTime(message.timestamp)}
        </Text>

        {message.type === 'voicemail' && message.duration && (
          <View style={styles.voicemailPlayer}>
            <Text style={styles.voicemailIcon}>▶️</Text>
            <Text style={styles.voicemailDuration}>{Math.floor(message.duration / 60)}:{(message.duration % 60).toString().padStart(2, '0')}</Text>
          </View>
        )}
      </View>

      {/* Аватар для исходящих */}
      {isOwn && showAvatar && (
        <View style={[styles.duoAvatar, styles.duoAvatarOwn]}>
          <img
            src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Man%20Technologist%20Medium-Light%20Skin%20Tone.png"
            width={82} height={82}
            style={{ objectFit: 'contain' } as any}
          />
        </View>
      )}
      {isOwn && !showAvatar && <View style={{ width: 82 }} />}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// INTERACTIVE COMPONENTS — Интерактивные элементы
// ═══════════════════════════════════════════════════════════════════════════

interface InteractiveButtonsProps {
  buttons: Array<{
    id: string;
    text: string;
    action: string;
    style?: 'primary' | 'success' | 'danger' | 'warning' | 'secondary';
    icon?: string;
    disabled?: boolean;
    loading?: boolean;
    data?: any;
  }>;
  onPress: (buttonId: string, action: string, data?: any) => void;
}

const InteractiveButtons: React.FC<InteractiveButtonsProps> = ({ buttons, onPress }) => {
  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'primary': return { bg: '#06b6d4', border: '#0891b2' };
      case 'success': return { bg: '#10b981', border: '#059669' };
      case 'danger': return { bg: '#ef4444', border: '#dc2626' };
      case 'warning': return { bg: '#f59e0b', border: '#d97706' };
      case 'secondary': return { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.15)' };
      default: return { bg: '#06b6d4', border: '#0891b2' };
    }
  };
  
  return (
    <View style={styles.interactiveButtons}>
      {buttons.map(btn => {
        const btnStyle = getButtonStyle(btn.style);
        return (
          <TouchableOpacity
            key={btn.id}
            style={[
              styles.interactiveButton,
              { backgroundColor: btnStyle.bg, borderColor: btnStyle.border },
              btn.disabled && styles.interactiveButtonDisabled
            ]}
            onPress={() => !btn.disabled && onPress(btn.id, btn.action, btn.data)}
            disabled={btn.disabled}
          >
            {btn.icon && <Text style={styles.interactiveButtonIcon}>{btn.icon}</Text>}
            <Text style={styles.interactiveButtonText}>{btn.text}</Text>
            {btn.loading && <Text style={styles.interactiveButtonLoader}>⏳</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

interface LoadCardComponentProps {
  loadCard: {
    loadId: string;
    from: string;
    to: string;
    pickup: string;
    delivery: string;
    rate: number;
    miles: number;
    weight?: string;
    commodity?: string;
  };
  buttons?: InteractiveButtonsProps['buttons'];
  onPress: InteractiveButtonsProps['onPress'];
}

const LoadCardComponent: React.FC<LoadCardComponentProps> = ({ loadCard, buttons, onPress }) => {
  return (
    <View style={styles.loadCard}>
      <View style={styles.loadCardHeader}>
        <Text style={styles.loadCardTitle}>🚚 Предложение груза</Text>
        <Text style={styles.loadCardId}>#{loadCard.loadId}</Text>
      </View>
      
      <View style={styles.loadCardRoute}>
        <View style={styles.loadCardCity}>
          <Text style={styles.loadCardCityLabel}>Откуда</Text>
          <Text style={styles.loadCardCityName}>{loadCard.from}</Text>
          <Text style={styles.loadCardTime}>{loadCard.pickup}</Text>
        </View>
        
        <View style={styles.loadCardArrow}>
          <Text style={styles.loadCardArrowText}>→</Text>
          <Text style={styles.loadCardMiles}>{loadCard.miles} mi</Text>
        </View>
        
        <View style={styles.loadCardCity}>
          <Text style={styles.loadCardCityLabel}>Куда</Text>
          <Text style={styles.loadCardCityName}>{loadCard.to}</Text>
          <Text style={styles.loadCardTime}>{loadCard.delivery}</Text>
        </View>
      </View>
      
      <View style={styles.loadCardDetails}>
        {loadCard.commodity && (
          <View style={styles.loadCardDetail}>
            <Text style={styles.loadCardDetailLabel}>Груз:</Text>
            <Text style={styles.loadCardDetailValue}>{loadCard.commodity}</Text>
          </View>
        )}
        {loadCard.weight && (
          <View style={styles.loadCardDetail}>
            <Text style={styles.loadCardDetailLabel}>Вес:</Text>
            <Text style={styles.loadCardDetailValue}>{loadCard.weight}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.loadCardRate}>
        <Text style={styles.loadCardRateLabel}>Ставка</Text>
        <Text style={styles.loadCardRateValue}>${loadCard.rate.toLocaleString()}</Text>
        <Text style={styles.loadCardRatePerMile}>${(loadCard.rate / loadCard.miles).toFixed(2)}/mi</Text>
      </View>
      
      {buttons && buttons.length > 0 && (
        <InteractiveButtons buttons={buttons} onPress={onPress} />
      )}
    </View>
  );
};

interface DocumentPreviewComponentProps {
  document: {
    type: 'rate_con' | 'bol' | 'pod' | 'invoice';
    title: string;
    documentId: string;
    preview?: { [key: string]: string };
  };
  buttons?: InteractiveButtonsProps['buttons'];
  onPress: InteractiveButtonsProps['onPress'];
}

const DocumentPreviewComponent: React.FC<DocumentPreviewComponentProps> = ({ document, buttons, onPress }) => {
  const getDocIcon = (type: string) => {
    switch (type) {
      case 'rate_con': return '📄';
      case 'bol': return '📋';
      case 'pod': return '✅';
      case 'invoice': return '💰';
      default: return '📄';
    }
  };
  
  return (
    <View style={styles.documentPreview}>
      <View style={styles.documentHeader}>
        <Text style={styles.documentIcon}>{getDocIcon(document.type)}</Text>
        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle}>{document.title}</Text>
          <Text style={styles.documentId}>#{document.documentId}</Text>
        </View>
      </View>
      
      {document.preview && (
        <View style={styles.documentPreviewContent}>
          {Object.entries(document.preview).map(([key, value]) => (
            <View key={key} style={styles.documentPreviewRow}>
              <Text style={styles.documentPreviewKey}>{key}:</Text>
              <Text style={styles.documentPreviewValue}>{value}</Text>
            </View>
          ))}
        </View>
      )}
      
      {buttons && buttons.length > 0 && (
        <InteractiveButtons buttons={buttons} onPress={onPress} />
      )}
    </View>
  );
};

interface QuickRepliesComponentProps {
  replies: Array<{
    text: string;
    action: string;
    value: string;
    icon?: string;
  }>;
  onPress: (reply: QuickRepliesComponentProps['replies'][0]) => void;
}

const QuickRepliesComponent: React.FC<QuickRepliesComponentProps> = ({ replies, onPress }) => {
  return (
    <View style={styles.quickReplies}>
      <Text style={styles.quickRepliesLabel}>Быстрые ответы:</Text>
      <View style={styles.quickRepliesButtons}>
        {replies.map((reply, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.quickReplyButton}
            onPress={() => onPress(reply)}
          >
            {reply.icon && <Text style={styles.quickReplyIcon}>{reply.icon}</Text>}
            <Text style={styles.quickReplyText}>{reply.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

interface AlertComponentProps {
  urgency: 'low' | 'medium' | 'high' | 'critical';
  buttons?: InteractiveButtonsProps['buttons'];
  onPress: InteractiveButtonsProps['onPress'];
}

const AlertComponent: React.FC<AlertComponentProps> = ({ urgency, buttons, onPress }) => {
  const getAlertStyle = (urgency: string) => {
    switch (urgency) {
      case 'critical': return { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', icon: '🚨' };
      case 'high': return { bg: 'rgba(249,115,22,0.15)', border: '#f97316', icon: '⚠️' };
      case 'medium': return { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', icon: '⚡' };
      case 'low': return { bg: 'rgba(6,182,212,0.15)', border: '#06b6d4', icon: 'ℹ️' };
      default: return { bg: 'rgba(6,182,212,0.15)', border: '#06b6d4', icon: 'ℹ️' };
    }
  };
  
  const alertStyle = getAlertStyle(urgency);
  
  return (
    <View style={[styles.alertContainer, { backgroundColor: alertStyle.bg, borderColor: alertStyle.border }]}>
      <Text style={styles.alertIcon}>{alertStyle.icon}</Text>
      {buttons && buttons.length > 0 && (
        <InteractiveButtons buttons={buttons} onPress={onPress} />
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // ─── THREAD LIST ─────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  
  unreadBadge: {
    backgroundColor: '#58cc02',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  closeBtnText: {
    fontSize: 18,
    color: '#6b7280',
  },
  
  threadList: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // ─── TEAM FOOTER (фиксированный внизу) ──────────────────────────────────
  teamFooter: {
    flexDirection: 'row',
    padding: 8,
    gap: 6,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  
  teamButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    gap: 6,
  },
  
  teamButtonIcon: {
    fontSize: 18,
    marginBottom: 0,
  },
  
  teamButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  
  emptyStateText: {
    fontSize: 15,
    color: '#64748b',
  },
  
  threadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 0,
    backgroundColor: '#ffffff',
  },
  
  threadItemDivider: {
    height: 1,
    marginHorizontal: 0,
    background: 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.4) 30%, rgba(249,115,22,0.4) 70%, transparent 100%)',
  } as any,
  
  threadItemUnread: {
    backgroundColor: '#f0fdf4',
  },
  
  threadAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  
  threadAvatarUnread: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#58cc02',
  },
  
  threadAvatarText: {
    fontSize: 24,
  },
  
  threadAvatarDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#58cc02',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  
  threadContent: {
    flex: 1,
  },
  
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  
  threadName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  
  threadNameUnread: {
    fontWeight: '700',
    color: '#111827',
  },
  
  threadTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  
  threadCompany: {
    fontSize: 12,
    color: '#58cc02',
    marginBottom: 4,
  },
  
  threadPreview: {
    marginTop: 2,
  },
  
  threadPreviewText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  
  threadPreviewTextUnread: {
    fontWeight: '500',
    color: '#374151',
  },
  
  threadUnreadBadge: {
    backgroundColor: '#58cc02',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    marginLeft: 8,
  },
  
  threadUnreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  
  // ─── CHAT ────────────────────────────────────────────────────────────────
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  
  backBtnText: {
    fontSize: 20,
    color: '#58cc02',
  },
  
  chatHeaderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  chatHeaderAvatarText: {
    fontSize: 22,
  },
  
  chatHeaderInfo: {
    flex: 1,
  },
  
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  
  chatHeaderCompany: {
    fontSize: 13,
    color: '#58cc02',
    marginTop: 2,
  },
  
  messageList: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  
  messageListContent: {
    padding: 16,
    paddingBottom: 24,
  },
  
  messageBubbleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  
  messageBubbleContainerOwn: {
    justifyContent: 'flex-end',
  },

  messageDivider: {
    height: 1,
    marginVertical: 2,
    background: 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.35) 30%, rgba(249,115,22,0.35) 70%, transparent 100%)',
  } as any,

  // ─── DUOLINGO STYLE ──────────────────────────────────────────────────────
  duoAvatar: {
    width: 82,
    height: 82,
    borderRadius: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  duoAvatarOwn: {
    marginRight: 0,
    marginLeft: 10,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    width: 82,
    height: 82,
    borderRadius: 0,
  },
  duoAvatarEmoji: {
    fontSize: 36,
  },
  duoBubble: {
    maxWidth: '72%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  duoBubbleOwn: {
    backgroundColor: '#e8fdf0',
    borderColor: '#86efac',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  duoTailLeft: {
    position: 'absolute',
    left: -10,
    bottom: 4,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderTopColor: 'transparent',
    borderRightWidth: 12,
    borderRightColor: '#e2e8f0',
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  duoTailRight: {
    position: 'absolute',
    right: -10,
    bottom: 4,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderTopColor: 'transparent',
    borderLeftWidth: 12,
    borderLeftColor: '#86efac',
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  duoSoundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  duoSoundBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1cb0f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  duoSoundIcon: {
    fontSize: 14,
  },
  duoSubject: {
    fontSize: 12,
    fontWeight: '700',
    color: '#58cc02',
    flex: 1,
  },
  duoText: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 23,
    fontWeight: '500',
  },
  duoTextOwn: {
    color: '#166534',
  },
  duoTime: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 6,
    textAlign: 'right',
  },
  duoTimeOwn: {
    color: '#4ade80',
  },

  // legacy (kept for email thread view)
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  
  messageAvatarText: {
    fontSize: 16,
  },
  
  messageAvatarSpacer: {
    width: 40,
  },
  
  messageBubble: {
    maxWidth: '75%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  messageBubbleOwn: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  
  messageSubject: {
    fontSize: 13,
    fontWeight: '700',
    color: '#58cc02',
    marginBottom: 6,
  },
  
  messageText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 21,
  },
  
  messageTextOwn: {
    color: '#166534',
  },
  
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  
  messageTypeIcon: {
    fontSize: 11,
  },
  
  messageTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  
  messageTimeOwn: {
    color: '#86efac',
  },
  
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  
  voicemailPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(6,182,212,0.1)',
    borderRadius: 8,
    gap: 8,
  },
  
  voicemailIcon: {
    fontSize: 14,
  },
  
  voicemailDuration: {
    fontSize: 13,
    fontWeight: '600',
    color: '#06b6d4',
  },
  
  // ─── INTERACTIVE ELEMENTS ────────────────────────────────────────────────
  interactiveContainer: {
    marginTop: 10,
  },
  
  // Buttons
  interactiveButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  
  interactiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  
  interactiveButtonDisabled: {
    opacity: 0.5,
  },
  
  interactiveButtonIcon: {
    fontSize: 14,
  },
  
  interactiveButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  
  interactiveButtonLoader: {
    fontSize: 12,
  },
  
  // Action Status
  actionStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#dcfce7',
    borderRadius: 6,
    gap: 6,
  },
  
  actionStatusIcon: {
    fontSize: 14,
    color: '#16a34a',
  },
  
  actionStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  
  // ─── QUICK REPLIES FOOTER (внизу экрана) ────────────────────────────────
  quickRepliesFooter: {
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 12,
  },
  
  quickRepliesLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  
  quickRepliesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  quickReplyButton: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  quickReplyButtonClose: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  
  quickReplyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  
  quickReplyButtonCloseText: {
    color: '#dc2626',
  },
  
  // Load Card
  loadCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#86efac',
    marginTop: 8,
  },
  
  loadCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  
  loadCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  
  loadCardId: {
    fontSize: 11,
    color: '#9ca3af',
  },
  
  loadCardRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  
  loadCardCity: {
    flex: 1,
  },
  
  loadCardCityLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 2,
  },
  
  loadCardCityName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  
  loadCardTime: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  
  loadCardArrow: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  
  loadCardArrowText: {
    fontSize: 18,
    color: '#58cc02',
  },
  
  loadCardMiles: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  
  loadCardDetails: {
    marginBottom: 10,
    gap: 4,
  },
  
  loadCardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  loadCardDetailLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  
  loadCardDetailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  
  loadCardRate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    marginBottom: 8,
  },
  
  loadCardRateLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  
  loadCardRateValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16a34a',
  },
  
  loadCardRatePerMile: {
    fontSize: 12,
    color: '#9ca3af',
  },
  
  // Document Preview
  documentPreview: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginTop: 8,
  },
  
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  
  documentIcon: {
    fontSize: 24,
  },
  
  documentInfo: {
    flex: 1,
  },
  
  documentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  
  documentId: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  
  documentPreviewContent: {
    gap: 6,
    marginBottom: 10,
  },
  
  documentPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  documentPreviewKey: {
    fontSize: 12,
    color: '#6b7280',
    minWidth: 80,
  },
  
  documentPreviewValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  
  // Quick Replies (inline component)
  quickReplies: {
    marginTop: 8,
  },
  
  quickRepliesButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  
  quickReplyIcon: {
    fontSize: 12,
  },
  
  quickReplyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  
  // Alert
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    marginTop: 8,
    gap: 10,
  },
  
  alertIcon: {
    fontSize: 20,
  },
});
