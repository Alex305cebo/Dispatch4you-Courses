# Примеры интеграции Unified Chat с игровыми событиями

## 1. Предложение груза от брокера

```typescript
import { sendLoadOffer } from '../utils/chatHelpers';
import { useGameStore } from '../store/gameStore';

// В gameStore.ts или где генерируются грузы
function offerLoadToBroker(load: LoadOffer) {
  sendLoadOffer({
    brokerName: load.brokerName,
    brokerCompany: load.brokerCompany,
    loadCard: {
      loadId: load.id,
      from: load.fromCity,
      to: load.toCity,
      pickup: load.pickupTime,
      delivery: load.deliveryTime,
      rate: load.postedRate,
      miles: load.miles,
      weight: `${load.weight} lbs`,
      commodity: load.commodity,
    },
    onAccept: (loadId) => {
      // Принять груз
      const gameStore = useGameStore.getState();
      const load = gameStore.availableLoads.find(l => l.id === loadId);
      if (load) {
        gameStore.openNegotiation(load);
        // или сразу забукать
        gameStore.bookLoad({ ...load, agreedRate: load.postedRate } as any);
      }
    },
    onNegotiate: (loadId) => {
      // Открыть окно переговоров
      const gameStore = useGameStore.getState();
      const load = gameStore.availableLoads.find(l => l.id === loadId);
      if (load) {
        gameStore.openNegotiation(load);
      }
    },
    onDecline: (loadId) => {
      // Просто игнорируем
      console.log('Load declined:', loadId);
    },
  });
}
```

## 2. Поломка трака

```typescript
import { sendBreakdownAlert } from '../utils/chatHelpers';
import { useGameStore } from '../store/gameStore';

// В gameStore.ts когда происходит breakdown
function handleBreakdown(truck: Truck) {
  const nearestCity = getNearestCity(truck.position[0], truck.position[1]);
  
  sendBreakdownAlert({
    driverName: truck.driver,
    truckId: truck.id,
    truckName: truck.name,
    location: nearestCity,
    issue: 'Проблема с двигателем',
    onCallRoadside: () => {
      const gameStore = useGameStore.getState();
      gameStore.repairBreakdown(truck.id, 'roadside');
    },
    onCallTow: () => {
      const gameStore = useGameStore.getState();
      gameStore.repairBreakdown(truck.id, 'tow');
    },
  });
}
```

## 3. Нарушение HOS

```typescript
import { sendHOSViolation } from '../utils/chatHelpers';
import { useGameStore } from '../store/gameStore';

// В gameStore.ts когда HOS < 2 часов
function checkHOSWarning(truck: Truck) {
  if (truck.hoursLeft < 2 && truck.status === 'loaded') {
    sendHOSViolation({
      driverName: truck.driver,
      truckId: truck.id,
      truckName: truck.name,
      hoursLeft: truck.hoursLeft,
      onFindTruckStop: () => {
        // Найти ближайший truck stop и отправить трак туда
        const nearestStop = findNearestTruckStop(truck.position[0], truck.position[1]);
        // ... логика отправки трака на отдых
      },
      onContinue: () => {
        // Продолжить движение (риск штрафа)
        console.log('Driver continues despite HOS warning');
      },
    });
  }
}
```

## 4. Отправка документов

```typescript
import { sendDocument } from '../utils/chatHelpers';

// После букирования груза — отправить Rate Con
function sendRateCon(load: ActiveLoad) {
  sendDocument({
    brokerName: load.brokerName,
    brokerCompany: load.brokerCompany,
    document: {
      type: 'rate_con',
      title: 'Rate Confirmation',
      documentId: `RC-${load.id}`,
      preview: {
        'Load ID': load.id,
        'From': load.fromCity,
        'To': load.toCity,
        'Rate': `$${load.agreedRate}`,
        'Miles': `${load.miles} mi`,
      },
    },
    loadId: load.id,
    onView: () => {
      // Открыть полный документ
      console.log('View Rate Con');
    },
    onSign: () => {
      // Подписать документ
      console.log('Sign Rate Con');
    },
  });
}

// После доставки — запросить POD
function requestPOD(load: ActiveLoad) {
  sendDocument({
    brokerName: load.brokerName,
    brokerCompany: load.brokerCompany,
    document: {
      type: 'pod',
      title: 'Proof of Delivery',
      documentId: `POD-${load.id}`,
      preview: {
        'Load ID': load.id,
        'Delivered': new Date().toLocaleString(),
        'Receiver': 'Warehouse Manager',
      },
    },
    loadId: load.id,
    onView: () => {
      console.log('View POD');
    },
  });
}
```

## 5. Вопросы водителя с быстрыми ответами

```typescript
import { sendDriverQuestion } from '../utils/chatHelpers';

// Водитель спрашивает про detention
function askAboutDetention(truck: Truck, load: ActiveLoad) {
  sendDriverQuestion({
    driverName: truck.driver,
    truckId: truck.id,
    question: 'Я уже 2 часа жду на погрузке. Считать detention?',
    quickReplies: [
      {
        text: 'Да, считай',
        action: 'start_detention',
        value: 'Да, начинай считать detention с 2 часов ожидания.',
        icon: '✓',
      },
      {
        text: 'Подожди ещё',
        action: 'wait_more',
        value: 'Подожди ещё час, потом начнём считать.',
        icon: '⏳',
      },
      {
        text: 'Позвони брокеру',
        action: 'call_broker',
        value: 'Позвони брокеру и узнай что происходит.',
        icon: '📞',
      },
    ],
  });
}

// Водитель спрашивает про маршрут
function askAboutRoute(truck: Truck) {
  sendDriverQuestion({
    driverName: truck.driver,
    truckId: truck.id,
    question: 'Какой маршрут лучше взять — через I-80 или I-70?',
    quickReplies: [
      {
        text: 'I-80 (быстрее)',
        action: 'route_i80',
        value: 'Езжай через I-80, там меньше траффика.',
        icon: '🛣️',
      },
      {
        text: 'I-70 (дешевле)',
        action: 'route_i70',
        value: 'Лучше I-70, там дешевле топливо.',
        icon: '⛽',
      },
      {
        text: 'Сам выбирай',
        action: 'driver_choice',
        value: 'Решай сам, ты лучше знаешь.',
        icon: '🤷',
      },
    ],
  });
}
```

## 6. Системные уведомления

```typescript
import { sendSystemNotification } from '../utils/chatHelpers';

// Начало смены
function notifyShiftStart(truckCount: number) {
  sendSystemNotification({
    title: '🌅 Смена началась',
    message: `Доброе утро! У тебя ${truckCount} траков. Проверь статус каждого и найди грузы для свободных.`,
    priority: 'medium',
  });
}

// Конец смены
function notifyShiftEnd(profit: number, grade: string) {
  sendSystemNotification({
    title: '🌙 Смена завершена',
    message: `Отличная работа! Прибыль: $${profit.toLocaleString()}. Оценка: ${grade}`,
    priority: 'low',
  });
}

// Критическая ситуация
function notifyCriticalIssue(issue: string) {
  sendSystemNotification({
    title: '🚨 СРОЧНО',
    message: issue,
    priority: 'urgent',
    buttons: [
      {
        id: 'view',
        text: 'Посмотреть',
        action: 'view_issue',
        style: 'danger',
        icon: '👁️',
      },
    ],
  });
}
```

## 7. Detention Claim

```typescript
import { sendDetentionClaim } from '../utils/chatHelpers';

// После доставки с detention
function processDetentionClaim(load: ActiveLoad, detentionHours: number) {
  const amount = detentionHours * 50; // $50/час
  
  sendDetentionClaim({
    brokerName: load.brokerName,
    brokerCompany: load.brokerCompany,
    loadId: load.id,
    detentionHours,
    amount,
    onAccept: () => {
      // Принять выплату
      const gameStore = useGameStore.getState();
      gameStore.addMoney(amount, `Detention payment — Load #${load.id}`);
    },
    onDispute: () => {
      // Оспорить (может быть больше денег или меньше)
      console.log('Dispute detention claim');
    },
  });
}
```

## 8. Входящий звонок

```typescript
import { sendIncomingCall } from '../utils/chatHelpers';

// Брокер звонит с новым грузом
function brokerCallsWithLoad(broker: Broker, load: LoadOffer) {
  sendIncomingCall({
    callerName: broker.name,
    callerRole: 'broker',
    callerCompany: broker.company,
    reason: `Новый груз: ${load.fromCity} → ${load.toCity}`,
    onAnswer: () => {
      // Открыть диалог с предложением груза
      sendLoadOffer({
        brokerName: broker.name,
        brokerCompany: broker.company,
        loadCard: {
          loadId: load.id,
          from: load.fromCity,
          to: load.toCity,
          pickup: load.pickupTime,
          delivery: load.deliveryTime,
          rate: load.postedRate,
          miles: load.miles,
          weight: `${load.weight} lbs`,
          commodity: load.commodity,
        },
        onAccept: (loadId) => { /* ... */ },
        onNegotiate: (loadId) => { /* ... */ },
        onDecline: (loadId) => { /* ... */ },
      });
    },
    onDecline: () => {
      // Пропущенный звонок
      console.log('Missed call from broker');
    },
  });
}

// Водитель звонит с вопросом
function driverCallsWithQuestion(truck: Truck, question: string) {
  sendIncomingCall({
    callerName: truck.driver,
    callerRole: 'driver',
    reason: question,
    onAnswer: () => {
      // Открыть диалог с водителем
      console.log('Answer driver call');
    },
    onDecline: () => {
      // Пропущенный звонок — водитель оставит voicemail
      console.log('Missed call from driver');
    },
  });
}
```

## 9. Интеграция с useChatIntegration hook

```typescript
// В adventure/hooks/useChatIntegration.ts уже есть автосинхронизация
// Но можно добавить дополнительные триггеры:

import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { sendLoadOffer, sendBreakdownAlert, sendHOSViolation } from '../utils/chatHelpers';

export function useChatIntegration() {
  const gameStore = useGameStore();
  
  useEffect(() => {
    // Слушаем новые грузы
    const unsubscribe = useGameStore.subscribe(
      (state) => state.availableLoads,
      (loads, prevLoads) => {
        // Новый груз появился
        const newLoads = loads.filter(l => !prevLoads.find(p => p.id === l.id));
        newLoads.forEach(load => {
          // Отправить предложение в чат
          offerLoadToBroker(load);
        });
      }
    );
    
    return unsubscribe;
  }, []);
  
  useEffect(() => {
    // Слушаем события
    const unsubscribe = useGameStore.subscribe(
      (state) => state.activeEvents,
      (events, prevEvents) => {
        // Новое событие
        const newEvents = events.filter(e => !prevEvents.find(p => p.id === e.id));
        newEvents.forEach(event => {
          if (event.type === 'breakdown') {
            const truck = gameStore.trucks.find(t => t.id === event.truckId);
            if (truck) {
              handleBreakdown(truck);
            }
          }
          // ... другие типы событий
        });
      }
    );
    
    return unsubscribe;
  }, []);
}
```

## 10. Миграция старых уведомлений

```typescript
import { useUnifiedChatStore } from '../store/unifiedChatStore';
import { useGameStore } from '../store/gameStore';

// При загрузке игры — мигрировать старые уведомления
function migrateOldNotifications() {
  const gameStore = useGameStore.getState();
  const chatStore = useUnifiedChatStore.getState();
  
  chatStore.migrateFromNotifications(gameStore.notifications);
  
  // Очистить старые уведомления
  gameStore.clearNotifications();
}
```

## Итого

Все игровые события теперь могут отправлять интерактивные сообщения в unified chat:
- ✅ Предложения грузов с кнопками (принять/торговаться/отказаться)
- ✅ Срочные уведомления о поломках с выбором действий
- ✅ HOS warnings с поиском truck stop
- ✅ Документы (Rate Con, BOL, POD) с просмотром и подписью
- ✅ Вопросы водителей с быстрыми ответами
- ✅ Detention claims с принятием/оспариванием
- ✅ Входящие звонки с ответом/сбросом
- ✅ Системные уведомления

Все сообщения группируются по участникам (водитель, брокер, система) с полной историей диалога.
