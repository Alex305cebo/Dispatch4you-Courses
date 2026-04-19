# 🏗️ Unified Chat — Архитектура системы

## Общая схема

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GAME LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Trucks     │  │    Loads     │  │   Events     │             │
│  │  (водители)  │  │   (грузы)    │  │  (события)   │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         │                  │                  │                      │
│         └──────────────────┴──────────────────┘                      │
│                            │                                         │
│                            ▼                                         │
│                  ┌──────────────────┐                               │
│                  │   Game Store     │                               │
│                  │  (notifications) │                               │
│                  └────────┬─────────┘                               │
└───────────────────────────┼─────────────────────────────────────────┘
                            │
                            │ useChatIntegration()
                            │ (автоматическая синхронизация)
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        CHAT LAYER                                   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │              Unified Chat Store (Zustand)                  │   │
│  │                                                             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │   │
│  │  │   Threads    │  │   Messages   │  │   Metadata   │    │   │
│  │  │              │  │              │  │              │    │   │
│  │  │ • id         │  │ • id         │  │ • unreadCount│    │   │
│  │  │ • participant│  │ • threadId   │  │ • lastUpdate │    │   │
│  │  │ • avatar     │  │ • type       │  │ • context    │    │   │
│  │  │ • messages[] │  │ • from       │  │              │    │   │
│  │  │ • unread     │  │ • text       │  │              │    │   │
│  │  │              │  │ • timestamp  │  │              │    │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │   │
│  │                                                             │   │
│  │  Actions:                                                  │   │
│  │  • createThread()                                          │   │
│  │  • addMessage()                                            │   │
│  │  • markAsRead()                                            │   │
│  │  • getUnreadCount()                                        │   │
│  │  • saveToStorage()                                         │   │
│  └────────────────────────────────────────────────────────────┘   │
│                            │                                        │
│                            │ useUnifiedChatStore()                  │
│                            │                                        │
│                            ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                  UnifiedChatUI Component                   │   │
│  │                                                             │   │
│  │  ┌─────────────────────┐  ┌─────────────────────┐        │   │
│  │  │   Thread List       │  │   Chat View         │        │   │
│  │  │                     │  │                     │        │   │
│  │  │ • Search            │  │ • Messages          │        │   │
│  │  │ • Filter            │  │ • Input             │        │   │
│  │  │ • Unread badges     │  │ • Send              │        │   │
│  │  │ • Avatars           │  │ • Scroll            │        │   │
│  │  └─────────────────────┘  └─────────────────────┘        │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ localStorage
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      STORAGE LAYER                                  │
│                                                                      │
│  unified-chat-{nickname}                                            │
│  {                                                                   │
│    "thread-driver-mike": { ... },                                   │
│    "thread-broker-sarah": { ... }                                   │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Поток данных

### 1. Входящее сообщение (от игры)

```
Game Event
    │
    ├─→ gameStore.addNotification()
    │       │
    │       ▼
    │   notifications[]
    │       │
    │       ▼
    └─→ useChatIntegration() (слушает notifications)
            │
            ├─→ Парсит from, role, company
            ├─→ Создаёт/находит thread
            └─→ unifiedChatStore.addMessage()
                    │
                    ├─→ Добавляет в thread.messages[]
                    ├─→ Обновляет unreadCount
                    ├─→ Обновляет lastMessageTime
                    └─→ Сохраняет в localStorage
                            │
                            ▼
                    UnifiedChatUI обновляется
                            │
                            ├─→ Список тредов
                            └─→ Бейдж непрочитанных
```

### 2. Исходящее сообщение (от игрока)

```
User Input
    │
    ▼
UnifiedChatUI.handleSendMessage()
    │
    ├─→ Создаёт ChatMessage
    │       from: 'dispatcher'
    │       text: input.value
    │       timestamp: Date.now()
    │
    └─→ unifiedChatStore.addMessage()
            │
            ├─→ Добавляет в thread.messages[]
            ├─→ Обновляет lastMessageTime
            └─→ Сохраняет в localStorage
                    │
                    ▼
            UnifiedChatUI обновляется
                    │
                    ├─→ Новый пузырь сообщения
                    └─→ Скролл вниз
```

### 3. Открытие треда

```
User Click on Thread
    │
    ▼
UnifiedChatUI.openThread(threadId)
    │
    ├─→ unifiedChatStore.markThreadAsRead(threadId)
    │       │
    │       ├─→ Помечает все messages.read = true
    │       └─→ Обнуляет thread.unreadCount
    │
    ├─→ Рендерит сообщения
    │       │
    │       ├─→ Группирует по отправителю
    │       ├─→ Показывает аватары
    │       └─→ Форматирует время
    │
    └─→ Обновляет UI
            │
            ├─→ Скрывает список (mobile)
            ├─→ Показывает чат
            └─→ Фокус на input
```

---

## Типы данных

### ChatMessage

```typescript
interface ChatMessage {
  id: string;                    // "msg-1234567890-abc123"
  threadId: string;              // "thread-driver-mike"
  type: MessageType;             // 'sms' | 'email' | 'voicemail' | ...
  from: SenderRole;              // 'driver' | 'broker' | 'system' | 'dispatcher'
  fromName: string;              // "Mike"
  text: string;                  // "Загрузился! Еду на delivery."
  timestamp: number;             // 1713542400000
  read: boolean;                 // false
  
  // Опционально
  priority?: MessagePriority;    // 'urgent' | 'high' | 'medium' | 'low'
  subject?: string;              // "Rate Con готов" (для email)
  audioUrl?: string;             // "/audio/voicemail-123.mp3" (для voicemail)
  duration?: number;             // 45 (секунды, для voicemail)
  
  // Метаданные
  metadata?: {
    truckId?: string;            // "T-001"
    loadId?: string;             // "LOAD-12345"
    eventId?: string;            // "EVENT-789"
  };
}
```

### ChatThread

```typescript
interface ChatThread {
  id: string;                    // "thread-driver-mike"
  participantName: string;       // "Mike"
  participantRole: SenderRole;   // 'driver'
  participantAvatar: string;     // "👨‍✈️"
  participantCompany?: string;   // "Водитель T-001"
  
  messages: ChatMessage[];       // [msg1, msg2, ...]
  lastMessageTime: number;       // 1713542400000
  unreadCount: number;           // 2
  
  // Контекст
  context?: {
    truckId?: string;            // "T-001"
    loadId?: string;             // "LOAD-12345"
    relatedThreads?: string[];   // ["thread-broker-sarah"]
  };
  
  // Статус
  isActive: boolean;             // true
  isPinned: boolean;             // false
  isMuted: boolean;              // false
}
```

---

## Интеграция с игрой

### Точки входа

1. **Водитель отправляет SMS**
   ```typescript
   // В gameStore.ts, когда трак начинает перерыв
   sendGameMessageToChat({
     from: truck.driver,
     role: 'driver',
     type: 'sms',
     message: `☕ Начинаю перерыв на ${stopName}`,
     truckId: truck.id,
   });
   ```

2. **Брокер отправляет Email**
   ```typescript
   // Когда брокер предлагает груз
   sendGameMessageToChat({
     from: load.brokerName,
     fromCompany: load.brokerCompany,
     role: 'broker',
     type: 'email',
     subject: 'Новый груз — Dallas → Chicago',
     message: `$${load.rate}. Интересно?`,
     priority: 'high',
     loadId: load.id,
   });
   ```

3. **Система отправляет уведомление**
   ```typescript
   // При поломке трака
   sendGameMessageToChat({
     from: 'Система',
     role: 'system',
     type: 'system',
     message: `⚠️ ${truck.name} — поломка!`,
     priority: 'urgent',
     truckId: truck.id,
   });
   ```

---

## Производительность

### Оптимизации

1. **Виртуализация списка** (для >100 тредов)
   ```typescript
   import { FlatList } from 'react-native';
   
   <FlatList
     data={threads}
     renderItem={({ item }) => <ThreadItem thread={item} />}
     keyExtractor={item => item.id}
     windowSize={10}
   />
   ```

2. **Мемоизация компонентов**
   ```typescript
   const ThreadItem = React.memo(({ thread }) => {
     // ...
   });
   ```

3. **Debounce поиска**
   ```typescript
   const debouncedSearch = useMemo(
     () => debounce(handleSearch, 300),
     []
   );
   ```

4. **Lazy loading сообщений**
   ```typescript
   // Загружать только последние 50 сообщений
   const recentMessages = thread.messages.slice(-50);
   ```

---

## Безопасность

### Валидация

```typescript
function validateMessage(message: ChatMessage): boolean {
  // Проверка длины
  if (message.text.length > 5000) return false;
  
  // Проверка типа
  if (!['sms', 'email', 'voicemail', 'voice_call', 'system'].includes(message.type)) {
    return false;
  }
  
  // Проверка роли
  if (!['driver', 'broker', 'system', 'dispatcher'].includes(message.from)) {
    return false;
  }
  
  return true;
}
```

### Санитизация

```typescript
function sanitizeText(text: string): string {
  // Удаляем HTML теги
  return text.replace(/<[^>]*>/g, '');
}
```

---

## Тестирование

### Unit тесты

```typescript
describe('unifiedChatStore', () => {
  it('should create thread', () => {
    const { createThread } = useUnifiedChatStore.getState();
    const threadId = createThread({
      participantName: 'Test',
      participantRole: 'driver',
      participantAvatar: '👨',
    });
    expect(threadId).toBe('thread-driver-test');
  });
  
  it('should add message', () => {
    const { addMessage, getThread } = useUnifiedChatStore.getState();
    addMessage({
      threadId: 'thread-driver-test',
      type: 'sms',
      from: 'driver',
      fromName: 'Test',
      text: 'Hello',
      read: false,
    });
    const thread = getThread('thread-driver-test');
    expect(thread?.messages.length).toBe(1);
  });
});
```

### Integration тесты

```typescript
describe('useChatIntegration', () => {
  it('should sync notifications', () => {
    const { notifications } = useGameStore.getState();
    const { getAllThreads } = useUnifiedChatStore.getState();
    
    useChatIntegration('test-user');
    
    expect(getAllThreads().length).toBe(notifications.length);
  });
});
```

---

## Roadmap

### Phase 2 — Real-time sync

```
┌─────────────────────────────────────────────────────────┐
│                    Firebase                             │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │  Firestore   │  │  Cloud Msg   │                    │
│  │  (threads)   │  │  (push)      │                    │
│  └──────┬───────┘  └──────┬───────┘                    │
└─────────┼──────────────────┼───────────────────────────┘
          │                  │
          │ onSnapshot()     │ onMessage()
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│              Unified Chat Store                         │
│  (автоматическая синхронизация)                         │
└─────────────────────────────────────────────────────────┘
```

### Phase 3 — AI features

```
User Message
    │
    ▼
AI Service
    │
    ├─→ Sentiment Analysis
    ├─→ Auto-reply Suggestions
    ├─→ Translation
    └─→ Voice-to-text
            │
            ▼
    Enhanced Message
```

---

**Документ обновлён:** 2026-04-19  
**Версия:** 1.0.0
