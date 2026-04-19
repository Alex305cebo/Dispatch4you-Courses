# 💬 Unified Chat System — Единая система диалогов

## Обзор

Единая система диалогов в стиле Duolingo для всех коммуникаций в игре Dispatch Office:
- SMS от водителей
- Email от брокеров
- Voicemail сообщения
- Голосовые звонки
- Системные уведомления

Все диалоги хранятся в **тредах** (threads) с аватарами, историей и контекстом.

---

## Архитектура

### 1. **Store** — `store/unifiedChatStore.ts`

Zustand store для управления всеми диалогами:

```typescript
interface ChatMessage {
  id: string;
  threadId: string;
  type: 'sms' | 'email' | 'voicemail' | 'voice_call' | 'system';
  from: 'driver' | 'broker' | 'system' | 'dispatcher';
  fromName: string;
  text: string;
  timestamp: number;
  read: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  subject?: string; // для email
  audioUrl?: string; // для voicemail
  metadata?: { truckId?, loadId?, eventId? };
}

interface ChatThread {
  id: string;
  participantName: string;
  participantRole: 'driver' | 'broker' | 'system';
  participantAvatar: string;
  participantCompany?: string;
  messages: ChatMessage[];
  lastMessageTime: number;
  unreadCount: number;
  isActive: boolean;
  isPinned: boolean;
  isMuted: boolean;
}
```

**Основные методы:**

- `createThread()` — создать новый тред
- `addMessage()` — добавить сообщение в тред
- `markThreadAsRead()` — пометить тред как прочитанный
- `getThread()` — получить тред по ID
- `getAllThreads()` — получить все активные треды
- `getUnreadCount()` — количество непрочитанных сообщений

### 2. **UI Component** — `components/UnifiedChatUI.tsx`

React Native компонент с двумя режимами:

**Список тредов:**
- Поиск по сообщениям
- Сортировка (закреплённые → по времени)
- Бейджи непрочитанных
- Аватары с индикаторами

**Диалог:**
- История сообщений с аватарами
- Пузыри сообщений (свои/чужие)
- Типы сообщений (SMS/Email/Voicemail)
- Приоритеты (цветные точки)
- Ввод текста с автоотправкой

### 3. **Integration Hook** — `hooks/useChatIntegration.ts`

Интеграция с существующей системой уведомлений:

```typescript
useChatIntegration(nickname: string)
```

- Автоматически синхронизирует `notifications` из `gameStore` с чатом
- Создаёт треды для новых участников
- Парсит имена и компании
- Определяет роли (driver/broker/system)
- Автосохранение в localStorage

### 4. **Screen** — `screens/MessagesScreen.tsx`

Полноэкранный экран сообщений для React Native приложения.

### 5. **Web Version** — `pages/messages.html`

Веб-версия с аналогичным функционалом:
- Адаптивный дизайн (desktop/mobile)
- LocalStorage для хранения
- Демо-данные для тестирования

---

## Использование

### React Native (Adventure App)

```typescript
import { MessagesScreen } from './screens/MessagesScreen';

// В навигации
<Stack.Screen name="Messages" component={MessagesScreen} />

// Или как компонент
import { UnifiedChatUI } from './components/UnifiedChatUI';
import { useChatIntegration } from './hooks/useChatIntegration';

function MyScreen() {
  const { sessionName } = useGameStore();
  useChatIntegration(sessionName);
  
  return <UnifiedChatUI nickname={sessionName} />;
}
```

### Web (HTML)

Просто откройте `pages/messages.html` — всё работает из коробки.

### Отправка сообщения из игры

```typescript
import { sendGameMessageToChat } from './hooks/useChatIntegration';

sendGameMessageToChat({
  from: 'Mike',
  fromCompany: 'Водитель T-001',
  role: 'driver',
  type: 'sms',
  message: 'Загрузился! Еду на delivery.',
  priority: 'medium',
  truckId: 'T-001',
  loadId: 'LOAD-123',
});
```

---

## Миграция из старой системы

Существующие уведомления автоматически мигрируют в треды:

```typescript
const { migrateFromNotifications } = useUnifiedChatStore();

// Передаём массив notifications из gameStore
migrateFromNotifications(notifications);
```

Миграция происходит автоматически через `useChatIntegration` hook.

---

## Особенности

### 1. **Автоматические аватары**

Генерируются по имени и роли:
- Водители: 👨‍✈️ 👨‍🔧 👨‍💼
- Брокеры: 👔 💼 👨‍💻 👩‍💻
- Система: 🤖 ⚙️ 📢

### 2. **Типы сообщений**

- 💬 SMS — быстрые сообщения от водителей
- 📧 Email — письма от брокеров с темой
- 🎤 Voicemail — голосовые сообщения с длительностью
- 📞 Voice Call — пропущенные/принятые звонки
- 🔔 System — системные уведомления

### 3. **Приоритеты**

Цветные точки рядом с временем:
- 🔴 Urgent — срочно
- 🟠 High — важно
- 🟡 Medium — средне
- ⚪ Low — низкий (не показывается)

### 4. **Контекст**

Каждый тред может иметь контекст:
- `truckId` — связь с траком
- `loadId` — связь с грузом
- `relatedThreads` — связанные диалоги

### 5. **Управление тредами**

- **Pin** — закрепить тред сверху
- **Mute** — отключить уведомления
- **Archive** — архивировать (скрыть из списка)

---

## Хранение данных

### LocalStorage

```
unified-chat-{nickname}
```

Автосохранение каждые 5 секунд.

### Структура

```json
{
  "thread-driver-mike": {
    "id": "thread-driver-mike",
    "participantName": "Mike",
    "participantRole": "driver",
    "participantAvatar": "👨‍✈️",
    "messages": [...],
    "unreadCount": 2,
    ...
  }
}
```

---

## Стилизация (Duolingo-style)

### Цвета

- **Primary**: `#06b6d4` (cyan) — акценты, активные элементы
- **Background**: `#050a12` (dark blue) — основной фон
- **Card**: `rgba(15,23,42,0.8)` — карточки сообщений
- **Border**: `rgba(255,255,255,0.08)` — границы

### Анимации

- Fade-in для новых сообщений
- Slide-in для тредов
- Pulse для непрочитанных
- Smooth scroll

### Адаптивность

- **Desktop**: 2 колонки (список + чат)
- **Mobile**: 1 колонка (переключение)
- **Tablet**: адаптивная ширина колонок

---

## Roadmap

### Phase 1 ✅ (Completed)
- [x] Unified store
- [x] React Native UI
- [x] Web UI
- [x] Integration hook
- [x] Migration from notifications

### Phase 2 (Next)
- [ ] Firebase sync (real-time)
- [ ] Push notifications
- [ ] Voice message recording
- [ ] Image attachments
- [ ] Quick replies (шаблоны ответов)

### Phase 3 (Future)
- [ ] AI-powered suggestions
- [ ] Translation (EN/RU)
- [ ] Voice-to-text
- [ ] Read receipts
- [ ] Typing indicators

---

## Примеры использования

### 1. Водитель отправляет SMS

```typescript
sendGameMessageToChat({
  from: 'Carlos',
  role: 'driver',
  type: 'sms',
  message: 'Разгрузился, BOL подписан. Свободен. Куда дальше?',
  truckId: 'T-003',
});
```

### 2. Брокер отправляет Email

```typescript
sendGameMessageToChat({
  from: 'Sarah',
  fromCompany: 'QuickLoad Inc',
  role: 'broker',
  type: 'email',
  subject: 'Rate Con готов',
  message: 'Привет! Rate Con для груза #12345 готов. Проверь почту.',
  priority: 'high',
  loadId: 'LOAD-12345',
});
```

### 3. Система отправляет уведомление

```typescript
sendGameMessageToChat({
  from: 'Система',
  role: 'system',
  type: 'system',
  message: 'T-001 начал обязательный 30-мин перерыв',
  priority: 'low',
  truckId: 'T-001',
});
```

---

## Тестирование

### Демо-данные

Откройте `pages/messages.html` — там уже есть демо-треды:
- Mike (водитель) — 1 непрочитанное SMS
- Sarah (брокер) — 1 непрочитанный Email

### Создание тестовых тредов

```typescript
const { createThread, addMessage } = useUnifiedChatStore();

const threadId = createThread({
  participantName: 'Test Driver',
  participantRole: 'driver',
  participantAvatar: '👨‍✈️',
});

addMessage({
  threadId,
  type: 'sms',
  from: 'driver',
  fromName: 'Test Driver',
  text: 'Test message',
  read: false,
});
```

---

## FAQ

**Q: Как подключить к существующей игре?**

A: Используйте `useChatIntegration(nickname)` hook — он автоматически синхронизирует notifications.

**Q: Можно ли использовать без React Native?**

A: Да! Используйте веб-версию `pages/messages.html` или создайте свой UI поверх store.

**Q: Как добавить новый тип сообщения?**

A: Добавьте тип в `MessageType` в store и иконку в `getMessageTypeIcon()`.

**Q: Поддерживается ли real-time sync?**

A: Пока нет, но в Phase 2 добавим Firebase sync.

**Q: Можно ли удалить сообщение?**

A: Пока нет, но можно добавить метод `deleteMessage()` в store.

---

## Поддержка

Вопросы и предложения: создайте issue в репозитории.

---

**Создано:** 2026-04-19  
**Версия:** 1.0.0  
**Статус:** ✅ Production Ready
