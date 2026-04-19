# 💡 Unified Chat — Примеры использования

## Базовые примеры

### 1. Отправка SMS от водителя

```typescript
import { sendGameMessageToChat } from '../hooks/useChatIntegration';

// Водитель сообщает о прибытии
sendGameMessageToChat({
  from: 'Mike',
  role: 'driver',
  type: 'sms',
  message: 'Приехал на погрузку. Жду очереди.',
  truckId: 'T-001',
});

// Водитель сообщает о проблеме
sendGameMessageToChat({
  from: 'Carlos',
  role: 'driver',
  type: 'sms',
  message: '⚠️ Check engine light! Нужна помощь.',
  priority: 'urgent',
  truckId: 'T-003',
});

// Водитель завершил доставку
sendGameMessageToChat({
  from: 'Mike',
  role: 'driver',
  type: 'sms',
  message: '✅ Разгрузился, BOL подписан. Свободен!',
  priority: 'medium',
  truckId: 'T-001',
  loadId: 'LOAD-12345',
});
```

### 2. Отправка Email от брокера

```typescript
// Брокер предлагает груз
sendGameMessageToChat({
  from: 'Sarah',
  fromCompany: 'QuickLoad Inc',
  role: 'broker',
  type: 'email',
  subject: 'Новый груз — Dallas → Chicago',
  message: 'Привет! У меня есть груз из Dallas в Chicago. 1200 миль, $2800. Pickup завтра в 8:00. Интересно?',
  priority: 'high',
  loadId: 'LOAD-NEW-001',
});

// Брокер отправляет Rate Con
sendGameMessageToChat({
  from: 'Tom',
  fromCompany: 'FastFreight LLC',
  role: 'broker',
  type: 'email',
  subject: '📋 Rate Con готов',
  message: 'Rate Con для груза #12345 готов. Проверь почту и подтверди.',
  priority: 'medium',
  loadId: 'LOAD-12345',
});

// Брокер повышает ставку
sendGameMessageToChat({
  from: 'Sarah',
  fromCompany: 'QuickLoad Inc',
  role: 'broker',
  type: 'email',
  subject: '💰 Повышение ставки!',
  message: `Готов поднять ставку до $3200. Это моё финальное предложение. Берёшь?`,
  priority: 'high',
  loadId: 'LOAD-12345',
});
```

### 3. Системные уведомления

```typescript
// HOS нарушение
sendGameMessageToChat({
  from: 'Система',
  role: 'system',
  type: 'system',
  message: '⏰ T-001 — осталось 30 минут до обязательного перерыва',
  priority: 'medium',
  truckId: 'T-001',
});

// Поломка
sendGameMessageToChat({
  from: 'Система',
  role: 'system',
  type: 'system',
  message: '🔧 T-003 — поломка! Трак остановлен.',
  priority: 'urgent',
  truckId: 'T-003',
});

// Detention
sendGameMessageToChat({
  from: 'Система',
  role: 'system',
  type: 'system',
  message: '⏱️ T-001 — detention 2 часа. Можно требовать компенсацию.',
  priority: 'medium',
  truckId: 'T-001',
  loadId: 'LOAD-12345',
});
```

---

## Продвинутые примеры

### 4. Создание треда вручную

```typescript
import { useUnifiedChatStore } from '../store/unifiedChatStore';

const { createThread, addMessage } = useUnifiedChatStore();

// Создаём тред для нового водителя
const threadId = createThread({
  participantName: 'John',
  participantRole: 'driver',
  participantAvatar: '👨‍✈️',
  participantCompany: 'Водитель T-005',
  context: {
    truckId: 'T-005',
  },
});

// Добавляем приветственное сообщение
addMessage({
  threadId,
  type: 'sms',
  from: 'system',
  fromName: 'Система',
  text: '👋 Добро пожаловать! Я твой диспетчер. Пиши если что-то нужно.',
  read: true,
});
```

### 5. Массовая рассылка

```typescript
import { useGameStore } from '../store/gameStore';
import { sendGameMessageToChat } from '../hooks/useChatIntegration';

const { trucks } = useGameStore();

// Отправить сообщение всем водителям
trucks.forEach(truck => {
  sendGameMessageToChat({
    from: 'Система',
    role: 'system',
    type: 'system',
    message: '📢 Внимание! Завтра выходной. Планируйте маршруты заранее.',
    priority: 'medium',
    truckId: truck.id,
  });
});
```

### 6. Условная отправка

```typescript
import { useGameStore } from '../store/gameStore';
import { sendGameMessageToChat } from '../hooks/useChatIntegration';

const { trucks } = useGameStore();

// Отправить только тракам с низким HOS
trucks.forEach(truck => {
  if (truck.hoursLeft < 2) {
    sendGameMessageToChat({
      from: 'Система',
      role: 'system',
      type: 'system',
      message: `⚠️ ${truck.name} — осталось ${truck.hoursLeft.toFixed(1)} часов. Планируй остановку!`,
      priority: 'high',
      truckId: truck.id,
    });
  }
});
```

### 7. Цепочка сообщений

```typescript
// Сценарий: брокер предлагает груз → игрок отвечает → брокер повышает ставку

// 1. Брокер предлагает
sendGameMessageToChat({
  from: 'Sarah',
  fromCompany: 'QuickLoad Inc',
  role: 'broker',
  type: 'email',
  subject: 'Груз Dallas → Chicago',
  message: '$2500. Берёшь?',
  priority: 'high',
  loadId: 'LOAD-001',
});

// 2. Игрок отвечает (через UI)
// addMessage({ text: 'Мало. Нужно минимум $2800.' })

// 3. Брокер повышает (через setTimeout или событие)
setTimeout(() => {
  sendGameMessageToChat({
    from: 'Sarah',
    fromCompany: 'QuickLoad Inc',
    role: 'broker',
    type: 'email',
    subject: 'Re: Груз Dallas → Chicago',
    message: 'Окей, $2700. Финальное предложение.',
    priority: 'high',
    loadId: 'LOAD-001',
  });
}, 5000);
```

---

## Интеграция с игровыми событиями

### 8. HOS система

```typescript
// В gameStore.ts, функция updateTruckMovement()

if (truck.hoursLeft <= 0) {
  // Трак должен остановиться
  sendGameMessageToChat({
    from: truck.driver,
    role: 'driver',
    type: 'sms',
    message: `🛑 HOS закончился. Останавливаюсь на ${nearestStop.name} на 10 часов.`,
    priority: 'medium',
    truckId: truck.id,
  });
}

if (truck.hoursLeft < 2 && truck.hoursLeft > 1.9) {
  // Предупреждение за 2 часа
  sendGameMessageToChat({
    from: 'Система',
    role: 'system',
    type: 'system',
    message: `⏰ ${truck.name} — осталось 2 часа. Планируй остановку!`,
    priority: 'medium',
    truckId: truck.id,
  });
}
```

### 9. Погрузка/разгрузка

```typescript
// Начало погрузки
if (truck.status === 'loading') {
  sendGameMessageToChat({
    from: truck.driver,
    role: 'driver',
    type: 'sms',
    message: `📦 Начинаю погрузку на ${truck.currentLoad.fromCity}`,
    priority: 'low',
    truckId: truck.id,
    loadId: truck.currentLoad.id,
  });
}

// Завершение погрузки
if (truck.status === 'loaded') {
  sendGameMessageToChat({
    from: truck.driver,
    role: 'driver',
    type: 'sms',
    message: `✅ Загрузился! Еду на ${truck.currentLoad.toCity}`,
    priority: 'medium',
    truckId: truck.id,
    loadId: truck.currentLoad.id,
  });
}

// Завершение разгрузки
if (truck.status === 'delivered') {
  sendGameMessageToChat({
    from: truck.driver,
    role: 'driver',
    type: 'sms',
    message: `🎉 Доставил! BOL подписан. Свободен.`,
    priority: 'medium',
    truckId: truck.id,
    loadId: truck.currentLoad.id,
  });
  
  // Брокер благодарит
  setTimeout(() => {
    sendGameMessageToChat({
      from: truck.currentLoad.brokerName,
      fromCompany: truck.currentLoad.brokerCompany,
      role: 'broker',
      type: 'email',
      subject: 'Спасибо за доставку!',
      message: 'Отличная работа! POD получен. Оплата в течение 30 дней.',
      priority: 'low',
      loadId: truck.currentLoad.id,
    });
  }, 2000);
}
```

### 10. Случайные события

```typescript
// Поломка
if (Math.random() < 0.01) { // 1% шанс
  sendGameMessageToChat({
    from: truck.driver,
    role: 'driver',
    type: 'sms',
    message: '🔧 Поломка! Вызываю roadside assistance.',
    priority: 'urgent',
    truckId: truck.id,
  });
  
  // Через 30 минут — починили
  setTimeout(() => {
    sendGameMessageToChat({
      from: truck.driver,
      role: 'driver',
      type: 'sms',
      message: '✅ Починили! Продолжаю маршрут.',
      priority: 'medium',
      truckId: truck.id,
    });
  }, 30 * 60 * 1000);
}

// Detention
if (waitTime > 2 * 60) { // Больше 2 часов
  sendGameMessageToChat({
    from: truck.driver,
    role: 'driver',
    type: 'sms',
    message: `⏱️ Жду уже ${Math.floor(waitTime / 60)} часов! Можно требовать detention pay?`,
    priority: 'high',
    truckId: truck.id,
    loadId: truck.currentLoad.id,
  });
}
```

---

## UI примеры

### 11. Показать непрочитанные

```typescript
import { useUnifiedChatStore } from '../store/unifiedChatStore';

function NotificationBadge() {
  const { getUnreadCount } = useUnifiedChatStore();
  const unreadCount = getUnreadCount();
  
  if (unreadCount === 0) return null;
  
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{unreadCount}</Text>
    </View>
  );
}
```

### 12. Список непрочитанных тредов

```typescript
import { useUnifiedChatStore } from '../store/unifiedChatStore';

function UnreadThreadsList() {
  const { getUnreadThreads } = useUnifiedChatStore();
  const unreadThreads = getUnreadThreads();
  
  return (
    <View>
      <Text>Непрочитанные ({unreadThreads.length})</Text>
      {unreadThreads.map(thread => (
        <ThreadItem key={thread.id} thread={thread} />
      ))}
    </View>
  );
}
```

### 13. Фильтр по типу

```typescript
import { useUnifiedChatStore } from '../store/unifiedChatStore';

function FilteredMessages({ type }: { type: 'sms' | 'email' }) {
  const { getAllThreads } = useUnifiedChatStore();
  const threads = getAllThreads();
  
  const filtered = threads.filter(thread => 
    thread.messages.some(msg => msg.type === type)
  );
  
  return (
    <View>
      <Text>{type === 'sms' ? '💬 SMS' : '📧 Email'}</Text>
      {filtered.map(thread => (
        <ThreadItem key={thread.id} thread={thread} />
      ))}
    </View>
  );
}
```

---

## Тестовые сценарии

### 14. Создать демо-данные

```typescript
import { useUnifiedChatStore } from '../store/unifiedChatStore';

function createDemoData() {
  const { createThread, addMessage } = useUnifiedChatStore();
  
  // Тред 1: Водитель Mike
  const thread1 = createThread({
    participantName: 'Mike',
    participantRole: 'driver',
    participantAvatar: '👨‍✈️',
    participantCompany: 'Водитель T-001',
  });
  
  addMessage({
    threadId: thread1,
    type: 'sms',
    from: 'driver',
    fromName: 'Mike',
    text: 'Привет! Я на месте погрузки.',
    read: true,
  });
  
  addMessage({
    threadId: thread1,
    type: 'sms',
    from: 'dispatcher',
    fromName: 'Вы',
    text: 'Отлично! Держи меня в курсе.',
    read: true,
  });
  
  addMessage({
    threadId: thread1,
    type: 'sms',
    from: 'driver',
    fromName: 'Mike',
    text: 'Загрузился! Еду на delivery.',
    read: false,
  });
  
  // Тред 2: Брокер Sarah
  const thread2 = createThread({
    participantName: 'Sarah',
    participantRole: 'broker',
    participantAvatar: '👩‍💼',
    participantCompany: 'QuickLoad Inc',
  });
  
  addMessage({
    threadId: thread2,
    type: 'email',
    from: 'broker',
    fromName: 'Sarah',
    subject: 'Новый груз — Dallas → Chicago',
    text: 'Привет! У меня есть груз из Dallas в Chicago. $2800. Интересно?',
    read: false,
    priority: 'high',
  });
}
```

### 15. Симуляция диалога

```typescript
async function simulateConversation() {
  const { createThread, addMessage } = useUnifiedChatStore();
  
  const threadId = createThread({
    participantName: 'Test Driver',
    participantRole: 'driver',
    participantAvatar: '👨‍✈️',
  });
  
  // Сообщение 1
  addMessage({
    threadId,
    type: 'sms',
    from: 'driver',
    fromName: 'Test Driver',
    text: 'Привет!',
    read: false,
  });
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Сообщение 2
  addMessage({
    threadId,
    type: 'sms',
    from: 'dispatcher',
    fromName: 'Вы',
    text: 'Привет! Как дела?',
    read: true,
  });
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Сообщение 3
  addMessage({
    threadId,
    type: 'sms',
    from: 'driver',
    fromName: 'Test Driver',
    text: 'Всё отлично! Еду на погрузку.',
    read: false,
  });
}
```

---

## Полезные хелперы

### 16. Форматирование времени

```typescript
function formatMessageTime(timestamp: number): string {
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
  
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'short' 
  });
}
```

### 17. Группировка сообщений по дате

```typescript
function groupMessagesByDate(messages: ChatMessage[]) {
  const groups: Record<string, ChatMessage[]> = {};
  
  messages.forEach(msg => {
    const date = new Date(msg.timestamp);
    const key = date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    if (!groups[key]) {
      groups[key] = [];
    }
    
    groups[key].push(msg);
  });
  
  return groups;
}
```

### 18. Поиск по сообщениям

```typescript
function searchMessages(query: string) {
  const { getAllThreads } = useUnifiedChatStore();
  const threads = getAllThreads();
  
  const results: Array<{ thread: ChatThread; message: ChatMessage }> = [];
  
  threads.forEach(thread => {
    thread.messages.forEach(message => {
      if (
        message.text.toLowerCase().includes(query.toLowerCase()) ||
        message.subject?.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push({ thread, message });
      }
    });
  });
  
  return results;
}
```

---

**Документ обновлён:** 2026-04-19  
**Всего примеров:** 18  
**Категории:** Базовые, Продвинутые, Интеграция, UI, Тесты, Хелперы
