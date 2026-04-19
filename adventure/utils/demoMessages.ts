import { 
  sendLoadOffer, 
  sendBreakdownAlert, 
  sendDriverQuestion,
  sendDocument,
  sendSystemNotification 
} from './chatHelpers';

// ═══════════════════════════════════════════════════════════════════════════
// DEMO MESSAGES — Тестовые интерактивные сообщения для демонстрации
// ═══════════════════════════════════════════════════════════════════════════

export function createDemoMessages() {
  // 1. Системное приветствие
  sendSystemNotification({
    title: '🌅 Добро пожаловать!',
    message: 'Новая смена началась. Проверь статус траков и найди грузы для свободных.',
    priority: 'medium',
  });
  
  // 2. Предложение груза от брокера
  setTimeout(() => {
    sendLoadOffer({
      brokerName: 'Tom',
      brokerCompany: 'FastFreight LLC',
      loadCard: {
        loadId: 'DEMO-L1',
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
        console.log('✅ Load accepted:', loadId);
        sendSystemNotification({
          title: '✅ Груз принят',
          message: `Груз ${loadId} успешно забукан. Назначь трак для доставки.`,
          priority: 'high',
        });
      },
      onNegotiate: (loadId) => {
        console.log('💬 Open negotiation:', loadId);
        sendSystemNotification({
          title: '💬 Переговоры',
          message: 'Функция переговоров будет доступна в следующей версии.',
          priority: 'medium',
        });
      },
      onDecline: (loadId) => {
        console.log('❌ Load declined:', loadId);
      },
    });
  }, 2000);
  
  // 3. Вопрос водителя с быстрыми ответами
  setTimeout(() => {
    sendDriverQuestion({
      driverName: 'John Martinez',
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
  }, 4000);
  
  // 4. Документ от брокера
  setTimeout(() => {
    sendDocument({
      brokerName: 'Sarah',
      brokerCompany: 'QuickLoad Inc',
      document: {
        type: 'rate_con',
        title: 'Rate Confirmation',
        documentId: 'RC-DEMO-1',
        preview: {
          'Load ID': 'DEMO-L1',
          'From': 'Chicago',
          'To': 'Houston',
          'Rate': '$2,500',
          'Miles': '1,092 mi',
          'Pickup': 'Today 14:00',
        },
      },
      loadId: 'DEMO-L1',
      onView: () => {
        console.log('👁️ View document');
        sendSystemNotification({
          title: '📄 Документ',
          message: 'Полный просмотр документов будет доступен в следующей версии.',
          priority: 'low',
        });
      },
      onSign: () => {
        console.log('✍️ Sign document');
        sendSystemNotification({
          title: '✍️ Подпись',
          message: 'Документ подписан электронной подписью.',
          priority: 'medium',
        });
      },
    });
  }, 6000);
  
  // 5. Ещё одно предложение груза
  setTimeout(() => {
    sendLoadOffer({
      brokerName: 'Mike',
      brokerCompany: 'EastFreight Co',
      loadCard: {
        loadId: 'DEMO-L2',
        from: 'Los Angeles',
        to: 'Dallas',
        pickup: 'Tomorrow 10:00',
        delivery: 'Day after tomorrow 18:00',
        rate: 3200,
        miles: 1435,
        weight: '38,000 lbs',
        commodity: 'Автозапчасти',
      },
      onAccept: (loadId) => {
        console.log('✅ Load accepted:', loadId);
        sendSystemNotification({
          title: '✅ Груз принят',
          message: `Груз ${loadId} успешно забукан.`,
          priority: 'high',
        });
      },
      onNegotiate: (loadId) => {
        console.log('💬 Open negotiation:', loadId);
      },
      onDecline: (loadId) => {
        console.log('❌ Load declined:', loadId);
      },
    });
  }, 8000);
}
