# 🚀 Quick Start — Интеграция Unified Chat

## За 5 минут

### 1. Добавьте экран в навигацию

```typescript
// app/_layout.tsx или navigation config
import { MessagesScreen } from '../screens/MessagesScreen';

<Stack.Screen 
  name="Messages" 
  component={MessagesScreen}
  options={{ title: '💬 Сообщения' }}
/>
```

### 2. Добавьте кнопку в UI

```typescript
import { useNavigation } from '@react-navigation/native';
import { useUnifiedChatStore } from '../store/unifiedChatStore';

function MyComponent() {
  const navigation = useNavigation();
  const { getUnreadCount } = useUnifiedChatStore();
  const unreadCount = getUnreadCount();
  
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Messages')}>
      <Text>💬 Сообщения</Text>
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text>{unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
```

### 3. Готово! 🎉

Система автоматически:
- Загрузит существующие уведомления
- Создаст треды для каждого участника
- Синхронизирует новые сообщения
- Сохранит историю в localStorage

---

## Отправка сообщений из игры

### Простой способ

```typescript
import { sendGameMessageToChat } from '../hooks/useChatIntegration';

// SMS от водителя
sendGameMessageToChat({
  from: 'Mike',
  role: 'driver',
  type: 'sms',
  message: 'Загрузился! Еду на delivery.',
  truckId: 'T-001',
});

// Email от брокера
sendGameMessageToChat({
  from: 'Sarah',
  fromCompany: 'QuickLoad Inc',
  role: 'broker',
  type: 'email',
  subject: 'Rate Con готов',
  message: 'Проверь почту!',
  priority: 'high',
  loadId: 'LOAD-123',
});
```

### Продвинутый способ

```typescript
import { useUnifiedChatStore } from '../store/unifiedChatStore';

const { createThread, addMessage } = useUnifiedChatStore();

// 1. Создать тред (если нужно)
const threadId = createThread({
  participantName: 'Mike',
  participantRole: 'driver',
  participantAvatar: '👨‍✈️',
  participantCompany: 'Водитель T-001',
});

// 2. Добавить сообщение
addMessage({
  threadId,
  type: 'sms',
  from: 'driver',
  fromName: 'Mike',
  text: 'Привет!',
  read: false,
  priority: 'medium',
});
```

---

## Замена старых уведомлений

### Было (старая система)

```typescript
get().addNotification({
  type: 'email',
  priority: 'medium',
  from: 'Tom (FastFreight LLC)',
  subject: 'Привет! Есть груз',
  message: 'Knoxville → Memphis, $1800',
});
```

### Стало (новая система)

```typescript
sendGameMessageToChat({
  from: 'Tom',
  fromCompany: 'FastFreight LLC',
  role: 'broker',
  type: 'email',
  subject: 'Привет! Есть груз',
  message: 'Knoxville → Memphis, $1800',
  priority: 'medium',
});
```

**Преимущества:**
- ✅ Все сообщения в одном месте
- ✅ История диалогов
- ✅ Аватары и контекст
- ✅ Можно отвечать
- ✅ Поиск по сообщениям

---

## Веб-версия

Просто добавьте ссылку в навигацию:

```html
<a href="pages/messages.html">💬 Сообщения</a>
```

Или встройте в iframe:

```html
<iframe src="pages/messages.html" style="width:100%;height:600px;border:none"></iframe>
```

---

## Миграция существующих данных

### Автоматическая миграция

```typescript
import { useChatIntegration } from '../hooks/useChatIntegration';

// В главном компоненте
function App() {
  const { sessionName } = useGameStore();
  
  // Это всё что нужно!
  useChatIntegration(sessionName);
  
  return <YourApp />;
}
```

### Ручная миграция

```typescript
import { useUnifiedChatStore } from '../store/unifiedChatStore';
import { useGameStore } from '../store/gameStore';

const { notifications } = useGameStore();
const { migrateFromNotifications } = useUnifiedChatStore();

// Мигрировать все уведомления
migrateFromNotifications(notifications);
```

---

## Кастомизация

### Изменить аватары

```typescript
// В unifiedChatStore.ts
function generateAvatar(name: string, role: SenderRole): string {
  const avatars = {
    driver: ['🚛', '👨‍✈️', '👨‍🔧'], // Ваши иконки
    broker: ['💼', '👔', '📊'],
    system: ['🤖', '⚙️'],
  };
  // ...
}
```

### Изменить цвета

```typescript
// В UnifiedChatUI.tsx styles
const styles = StyleSheet.create({
  messageBubble: {
    backgroundColor: 'rgba(15,23,42,0.8)', // Ваш цвет
  },
  messageBubbleOwn: {
    backgroundColor: 'rgba(6,182,212,0.15)', // Ваш цвет
  },
});
```

### Добавить новый тип сообщения

```typescript
// 1. В unifiedChatStore.ts
export type MessageType = 'sms' | 'email' | 'voicemail' | 'voice_call' | 'system' | 'fax'; // Добавили 'fax'

// 2. В UnifiedChatUI.tsx
const getMessageTypeIcon = (type: ChatMessage['type']) => {
  switch (type) {
    case 'fax': return '📠'; // Добавили иконку
    // ...
  }
};
```

---

## Troubleshooting

### Сообщения не появляются

1. Проверьте что `useChatIntegration` вызван
2. Проверьте что `nickname` передан правильно
3. Откройте DevTools → Application → LocalStorage → `unified-chat-{nickname}`

### Непрочитанные не обновляются

```typescript
// Вызовите вручную
const { markThreadAsRead } = useUnifiedChatStore();
markThreadAsRead(threadId);
```

### Треды дублируются

Проверьте что `participantName` одинаковый:
```typescript
// ❌ Плохо
'Mike (водитель)' !== 'Mike'

// ✅ Хорошо
'Mike' === 'Mike'
```

### Данные не сохраняются

Проверьте localStorage:
```typescript
// Ручное сохранение
const { saveToStorage } = useUnifiedChatStore();
saveToStorage(nickname);
```

---

## Примеры из реальной игры

### 1. Водитель начал перерыв

```typescript
// В gameStore.ts, когда трак начинает перерыв
sendGameMessageToChat({
  from: truck.driver,
  role: 'driver',
  type: 'sms',
  message: `☕ Начинаю обязательный 30-мин перерыв на ${stopName}`,
  priority: 'low',
  truckId: truck.id,
});
```

### 2. Брокер повышает ставку

```typescript
// Когда брокер предлагает больше денег
sendGameMessageToChat({
  from: load.brokerName,
  fromCompany: load.brokerCompany,
  role: 'broker',
  type: 'email',
  subject: '💰 Повышение ставки!',
  message: `Готов поднять ставку до $${newRate}. Берёшь?`,
  priority: 'high',
  loadId: load.id,
});
```

### 3. Система уведомляет о проблеме

```typescript
// Когда у трака поломка
sendGameMessageToChat({
  from: 'Система',
  role: 'system',
  type: 'system',
  message: `⚠️ ${truck.name} — поломка! Нужен roadside assistance.`,
  priority: 'urgent',
  truckId: truck.id,
});
```

---

## Полезные ссылки

- 📖 [Полная документация](./UNIFIED_CHAT_SYSTEM.md)
- 🎨 [Figma дизайн](https://figma.com/...) _(если есть)_
- 🐛 [Сообщить о баге](https://github.com/.../issues)

---

**Время интеграции:** ~10 минут  
**Сложность:** ⭐⭐☆☆☆ (Легко)  
**Поддержка:** React Native + Web
