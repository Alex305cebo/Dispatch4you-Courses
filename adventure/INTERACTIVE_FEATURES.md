# 🎮 Интерактивные возможности Unified Chat

## Обзор

Unified Chat теперь поддерживает **максимальную интерактивность** — все сообщения могут содержать кнопки, карточки, документы, алерты и другие элементы для быстрых действий.

## 1. 🔘 Интерактивные кнопки

Любое сообщение может содержать кнопки для быстрых действий.

### Стили кнопок

- **primary** (синяя) — основное действие
- **success** (зелёная) — подтверждение, принятие
- **danger** (красная) — отмена, отказ, срочное
- **warning** (оранжевая) — предупреждение, риск
- **secondary** (серая) — второстепенное действие

### Пример

```typescript
{
  type: 'buttons',
  buttons: [
    {
      id: 'accept',
      text: 'Принять',
      action: 'accept_load',
      style: 'success',
      icon: '✓',
      data: { loadId: 'L123' }
    },
    {
      id: 'decline',
      text: 'Отказаться',
      action: 'decline_load',
      style: 'secondary',
      icon: '✕',
      data: { loadId: 'L123' }
    }
  ]
}
```

## 2. 🚚 Карточки грузов (Load Cards)

Красивое отображение предложений грузов с деталями маршрута, ставкой и кнопками действий.

### Что показывается

- Откуда → Куда (города)
- Время pickup и delivery
- Расстояние в милях
- Ставка ($) и цена за милю ($/mi)
- Груз (commodity) и вес
- Кнопки: Принять / Торговаться / Отказаться

### Пример

```typescript
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
  onAccept: (loadId) => { /* ... */ },
  onNegotiate: (loadId) => { /* ... */ },
  onDecline: (loadId) => { /* ... */ },
});
```

### Визуально

```
┌─────────────────────────────────────┐
│ 🚚 Предложение груза        #L123   │
├─────────────────────────────────────┤
│ Откуда          →          Куда     │
│ Chicago      1092 mi      Houston   │
│ Today 14:00              Tomorrow   │
│                            08:00    │
├─────────────────────────────────────┤
│ Груз: Электроника                   │
│ Вес: 42,000 lbs                     │
├─────────────────────────────────────┤
│ Ставка        $2,500      $2.29/mi  │
├─────────────────────────────────────┤
│ [✓ Принять] [💬 Торговаться] [✕]   │
└─────────────────────────────────────┘
```

## 3. 📄 Превью документов

Отображение документов (Rate Con, BOL, POD, Invoice) с ключевыми полями и кнопками просмотра/подписи.

### Типы документов

- **rate_con** (📄) — Rate Confirmation
- **bol** (📋) — Bill of Lading
- **pod** (✅) — Proof of Delivery
- **invoice** (💰) — Invoice

### Пример

```typescript
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
      'Miles': '1,092 mi',
    },
  },
  loadId: 'L123',
  onView: () => { /* открыть полный документ */ },
  onSign: () => { /* подписать документ */ },
});
```

### Визуально

```
┌─────────────────────────────────────┐
│ 📄 Rate Confirmation                │
│    #RC-L123                         │
├─────────────────────────────────────┤
│ Load ID:    L123                    │
│ From:       Chicago                 │
│ To:         Houston                 │
│ Rate:       $2,500                  │
│ Miles:      1,092 mi                │
├─────────────────────────────────────┤
│ [👁️ Посмотреть] [✍️ Подписать]      │
└─────────────────────────────────────┘
```

## 4. ⚡ Быстрые ответы (Quick Replies)

Предложенные варианты ответов для быстрой реакции на вопросы водителей.

### Пример

```typescript
sendDriverQuestion({
  driverName: 'Mike',
  truckId: 'T1',
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
```

### Визуально

```
┌─────────────────────────────────────┐
│ Mike (водитель)                     │
│ Я уже 2 часа жду на погрузке.       │
│ Считать detention?                  │
├─────────────────────────────────────┤
│ Быстрые ответы:                     │
│ [✓ Да, считай]                      │
│ [⏳ Подожди ещё]                     │
│ [📞 Позвони брокеру]                │
└─────────────────────────────────────┘
```

## 5. 🚨 Срочные алерты

Уведомления с цветовой индикацией срочности и кнопками действий.

### Уровни срочности

- **critical** (🚨 красный) — критическая ситуация
- **high** (⚠️ оранжевый) — важное предупреждение
- **medium** (⚡ жёлтый) — среднее
- **low** (ℹ️ синий) — информация

### Пример

```typescript
sendBreakdownAlert({
  driverName: 'Mike',
  truckId: 'T1',
  truckName: 'Truck 1047',
  location: 'Kansas City',
  issue: 'Проблема с двигателем',
  onCallRoadside: () => { /* вызвать roadside */ },
  onCallTow: () => { /* вызвать эвакуатор */ },
});
```

### Визуально

```
┌─────────────────────────────────────┐
│ 🚨 Mike (водитель)                  │
│ СРОЧНО! Truck 1047 сломался!        │
│ Проблема с двигателем.              │
│ Я сейчас в Kansas City.             │
│ Что делать?                         │
├─────────────────────────────────────┤
│ [🔧 Roadside ($250)]                │
│ [🚛 Эвакуатор ($800)]               │
└─────────────────────────────────────┘
```

## 6. 📞 Входящие звонки

Имитация входящего звонка с кнопками ответа/сброса и автоматическим истечением.

### Особенности

- Автоматически истекает через 30 секунд
- Кнопки: Ответить / Сбросить
- После истечения → пропущенный звонок

### Пример

```typescript
sendIncomingCall({
  callerName: 'Tom',
  callerRole: 'broker',
  callerCompany: 'FastFreight LLC',
  reason: 'Новый груз: Chicago → Houston',
  onAnswer: () => { /* ответить */ },
  onDecline: () => { /* сбросить */ },
});
```

### Визуально

```
┌─────────────────────────────────────┐
│ 📞 Tom (FastFreight LLC)            │
│ Входящий звонок:                    │
│ Новый груз: Chicago → Houston       │
├─────────────────────────────────────┤
│ [📞 Ответить] [✕ Сбросить]          │
│                                     │
│ Истекает через 30 сек...            │
└─────────────────────────────────────┘
```

## 7. ✅ Статусы действий

После нажатия кнопки сообщение показывает статус выполненного действия.

### Пример

```
┌─────────────────────────────────────┐
│ Tom (брокер)                        │
│ Привет! У меня есть груз...         │
│                                     │
│ [Карточка груза]                    │
│                                     │
│ ✓ Груз принят                       │
│   (выполнено 2 минуты назад)        │
└─────────────────────────────────────┘
```

## Интеграция с игровыми событиями

### Предложение груза

```typescript
// Когда появляется новый груз на load board
function onNewLoadAvailable(load: LoadOffer) {
  sendLoadOffer({
    brokerName: load.brokerName,
    brokerCompany: load.brokerCompany,
    loadCard: { /* ... */ },
    onAccept: (loadId) => {
      gameStore.bookLoad(load);
    },
    onNegotiate: (loadId) => {
      gameStore.openNegotiation(load);
    },
    onDecline: (loadId) => {
      // Просто игнорируем
    },
  });
}
```

### Поломка трака

```typescript
// Когда трак ломается
function onTruckBreakdown(truck: Truck) {
  sendBreakdownAlert({
    driverName: truck.driver,
    truckId: truck.id,
    truckName: truck.name,
    location: truck.currentCity,
    issue: 'Проблема с двигателем',
    onCallRoadside: () => {
      gameStore.repairBreakdown(truck.id, 'roadside');
    },
    onCallTow: () => {
      gameStore.repairBreakdown(truck.id, 'tow');
    },
  });
}
```

### HOS Warning

```typescript
// Когда HOS < 2 часов
function onHOSWarning(truck: Truck) {
  sendHOSViolation({
    driverName: truck.driver,
    truckId: truck.id,
    truckName: truck.name,
    hoursLeft: truck.hoursLeft,
    onFindTruckStop: () => {
      // Найти ближайший truck stop
      const stop = findNearestTruckStop(truck.position);
      // Отправить трак на отдых
    },
    onContinue: () => {
      // Продолжить движение (риск штрафа)
    },
  });
}
```

### Отправка документов

```typescript
// После букирования груза
function onLoadBooked(load: ActiveLoad) {
  sendDocument({
    brokerName: load.brokerName,
    brokerCompany: load.brokerCompany,
    document: {
      type: 'rate_con',
      title: 'Rate Confirmation',
      documentId: `RC-${load.id}`,
      preview: { /* ... */ },
    },
    loadId: load.id,
    onView: () => {
      // Открыть полный документ
    },
    onSign: () => {
      // Подписать документ
    },
  });
}
```

### Detention Claim

```typescript
// После доставки с detention
function onDeliveryWithDetention(load: ActiveLoad, hours: number) {
  sendDetentionClaim({
    brokerName: load.brokerName,
    brokerCompany: load.brokerCompany,
    loadId: load.id,
    detentionHours: hours,
    amount: hours * 50,
    onAccept: () => {
      gameStore.addMoney(hours * 50, 'Detention payment');
    },
    onDispute: () => {
      // Оспорить (может быть больше денег)
    },
  });
}
```

## Преимущества

✅ **Быстрые действия** — не нужно искать кнопки в UI, всё в сообщении  
✅ **Контекст** — все данные (груз, трак, документ) в одном месте  
✅ **История** — все действия сохраняются в истории диалога  
✅ **Интуитивность** — понятные иконки и цвета  
✅ **Реалистичность** — как в реальной жизни диспетчера  

## Следующие шаги

- [ ] Добавить анимации при нажатии кнопок
- [ ] Добавить звуковые эффекты для срочных алертов
- [ ] Добавить вибрацию для входящих звонков
- [ ] Добавить таймер обратного отсчёта для звонков
- [ ] Добавить подтверждение для критических действий

## Документация

- `CHAT_INTEGRATION_EXAMPLES.md` — 10+ примеров интеграции
- `chatHelpers.ts` — все helper-функции
- `unifiedChatStore.ts` — типы данных
- `UnifiedChatUI.tsx` — UI компоненты
