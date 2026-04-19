# 🚀 Unified Chat — Быстрый старт

## 1. Установка (уже готово)

Все файлы уже созданы и готовы к использованию:

```
adventure/
├── store/unifiedChatStore.ts          ✅ Store
├── components/UnifiedChatUI.tsx       ✅ UI Component
├── utils/chatHelpers.ts               ✅ Helper functions
├── hooks/useChatIntegration.ts        ✅ Integration hook
└── screens/MessagesScreen.tsx         ✅ Screen
```

## 2. Добавить в навигацию

```typescript
// В вашем навигаторе (App.tsx или Navigation.tsx)
import { MessagesScreen } from './screens/MessagesScreen';

<Stack.Screen 
  name="Messages" 
  component={MessagesScreen}
  options={{
    title: 'Сообщения',
    headerShown: true,
  }}
/>
```

## 3. Подключить автосинхронизацию

```typescript
// В главном компоненте игры (App.tsx или GameScreen.tsx)
import { useChatIntegration } from './hooks/useChatIntegration';
import { useGameStore } from './store/gameStore';

function App() {
  const { sessionName } = useGameStore();
  
  // Это всё! Автоматически синхронизирует уведомления
  useChatIntegration(sessionName);
  
  return <YourGameUI />;
}
```

## 4. Добавить кнопку открытия чата

```typescript
import { useNavigation } from '@react-navigation/native';
import { useUnifiedChatStore } from './store/unifiedChatStore';

function GameHeader() {
  const navigation = useNavigation();
  const unreadCount = useUnifiedChatStore(state => state.getUnreadCount());
  
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Messages')}>
      <View style={styles.messageButton}>
        <Text style={styles.messageIcon}>💬</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
```

## 5. Отправить первое интерактивное сообщение

```typescript
import { sendLoadOffer } from './utils/chatHelpers';

// Предложение груза от брокера
sendLoadOffer({
  brokerName: 'Tom',
  brokerCompany: 'FastFreight LLC',
  loadCard: {
    loadId: 'L123',
    from: 'Chicago',
    to: 'Houston',
    pickup: 'Today 14:00',
    delivery: 'Tomorrow 08:00',
    rate: 2500,
    miles: 1092,
    weight: '42,000 lbs',
    commodity: 'Электроника',
  },
  onAccept: (loadId) => {
    console.log('Load accepted:', loadId);
    // Здесь ваша логика принятия груза
  },
  onNegotiate: (loadId) => {
    console.log('Open negotiation:', loadId);
    // Здесь открыть окно переговоров
  },
  onDecline: (loadId) => {
    console.log('Load declined:', loadId);
  },
});
```

## 6. Готово! 🎉

Теперь у вас есть:

✅ Единый чат для всех коммуникаций  
✅ Интерактивные кнопки в сообщениях  
✅ Карточки грузов  
✅ Превью документов  
✅ Быстрые ответы  
✅ Срочные алерты  
✅ Входящие звонки  

## Примеры использования

### Поломка трака

```typescript
import { sendBreakdownAlert } from './utils/chatHelpers';

sendBreakdownAlert({
  driverName: 'Mike',
  truckId: 'T1',
  truckName: 'Truck 1047',
  location: 'Kansas City',
  issue: 'Проблема с двигателем',
  onCallRoadside: () => {
    // Вызвать roadside assistance
  },
  onCallTow: () => {
    // Вызвать эвакуатор
  },
});
```

### HOS Warning

```typescript
import { sendHOSViolation } from './utils/chatHelpers';

sendHOSViolation({
  driverName: 'Mike',
  truckId: 'T1',
  truckName: 'Truck 1047',
  hoursLeft: 1.5,
  onFindTruckStop: () => {
    // Найти truck stop
  },
  onContinue: () => {
    // Продолжить (риск)
  },
});
```

### Отправка документа

```typescript
import { sendDocument } from './utils/chatHelpers';

sendDocument({
  brokerName: 'Tom',
  brokerCompany: 'FastFreight LLC',
  document: {
    type: 'rate_con',
    title: 'Rate Confirmation',
    documentId: 'RC-L123',
    preview: {
      'Load ID': 'L123',
      'From': 'Chicago',
      'To': 'Houston',
      'Rate': '$2,500',
    },
  },
  loadId: 'L123',
  onView: () => {
    // Посмотреть документ
  },
  onSign: () => {
    // Подписать документ
  },
});
```

### Вопрос водителя

```typescript
import { sendDriverQuestion } from './utils/chatHelpers';

sendDriverQuestion({
  driverName: 'Mike',
  truckId: 'T1',
  question: 'Я уже 2 часа жду на погрузке. Считать detention?',
  quickReplies: [
    {
      text: 'Да, считай',
      action: 'start_detention',
      value: 'Да, начинай считать detention.',
      icon: '✓',
    },
    {
      text: 'Подожди ещё',
      action: 'wait_more',
      value: 'Подожди ещё час.',
      icon: '⏳',
    },
  ],
});
```

## Документация

- `INTERACTIVE_FEATURES.md` — все интерактивные возможности
- `CHAT_INTEGRATION_EXAMPLES.md` — 10+ примеров интеграции
- `UNIFIED_CHAT_SUMMARY.md` — полный обзор системы

## Поддержка

Вопросы? Смотрите примеры в `CHAT_INTEGRATION_EXAMPLES.md` или создайте issue.
