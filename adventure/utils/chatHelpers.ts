import { useUnifiedChatStore } from '../store/unifiedChatStore';
import type { 
  InteractiveButton, 
  LoadCard, 
  DocumentPreview, 
  QuickReply,
  InteractiveContent,
  MessageType,
  MessagePriority,
  SenderRole 
} from '../store/unifiedChatStore';

// ═══════════════════════════════════════════════════════════════════════════
// CHAT HELPERS — Вспомогательные функции для отправки интерактивных сообщений
// ═══════════════════════════════════════════════════════════════════════════

interface SendMessageParams {
  participantName: string;
  participantRole: SenderRole;
  participantCompany?: string;
  participantAvatar?: string;
  type: MessageType;
  text: string;
  subject?: string;
  priority?: MessagePriority;
  interactive?: InteractiveContent;
  metadata?: {
    truckId?: string;
    loadId?: string;
    eventId?: string;
  };
}

/**
 * Отправить сообщение в unified chat
 */
export function sendChatMessage(params: SendMessageParams) {
  const store = useUnifiedChatStore.getState();
  
  // Создаём или получаем тред
  const threadId = store.createThread({
    participantName: params.participantName,
    participantRole: params.participantRole,
    participantAvatar: params.participantAvatar,
    participantCompany: params.participantCompany,
    context: {
      truckId: params.metadata?.truckId,
      loadId: params.metadata?.loadId,
    },
  });
  
  // Добавляем сообщение
  store.addMessage({
    threadId,
    type: params.type,
    from: params.participantRole,
    fromName: params.participantName,
    text: params.text,
    subject: params.subject,
    priority: params.priority || 'medium',
    interactive: params.interactive,
    metadata: params.metadata,
    read: false,
  });
}

/**
 * Отправить предложение груза от брокера
 */
export function sendLoadOffer(params: {
  brokerName: string;
  brokerCompany: string;
  loadCard: LoadCard;
  onAccept?: (loadId: string) => void;
  onDecline?: (loadId: string) => void;
  onNegotiate?: (loadId: string) => void;
}) {
  const buttons: InteractiveButton[] = [
    {
      id: 'accept',
      text: 'Принять',
      action: 'accept_load',
      style: 'success',
      icon: '✓',
      data: { 
        loadId: params.loadCard.loadId,
        callback: params.onAccept 
      },
    },
    {
      id: 'negotiate',
      text: 'Торговаться',
      action: 'negotiate_load',
      style: 'warning',
      icon: '💬',
      data: { 
        loadId: params.loadCard.loadId,
        callback: params.onNegotiate 
      },
    },
    {
      id: 'decline',
      text: 'Отказаться',
      action: 'decline_load',
      style: 'secondary',
      icon: '✕',
      data: { 
        loadId: params.loadCard.loadId,
        callback: params.onDecline 
      },
    },
  ];
  
  sendChatMessage({
    participantName: params.brokerName,
    participantRole: 'broker',
    participantCompany: params.brokerCompany,
    type: 'email',
    subject: `Новый груз: ${params.loadCard.from} → ${params.loadCard.to}`,
    text: `Привет! У меня есть груз ${params.loadCard.commodity || 'товар'} из ${params.loadCard.from} в ${params.loadCard.to}. ${params.loadCard.miles} миль, ставка $${params.loadCard.rate.toLocaleString()}. Интересно?`,
    priority: 'high',
    interactive: {
      type: 'load_card',
      loadCard: params.loadCard,
      buttons,
    },
    metadata: {
      loadId: params.loadCard.loadId,
    },
  });
}

/**
 * Отправить срочное уведомление о поломке
 */
export function sendBreakdownAlert(params: {
  driverName: string;
  truckId: string;
  truckName: string;
  location: string;
  issue: string;
  onCallRoadside?: () => void;
  onCallTow?: () => void;
}) {
  const buttons: InteractiveButton[] = [
    {
      id: 'roadside',
      text: 'Вызвать Roadside ($250)',
      action: 'call_roadside',
      style: 'warning',
      icon: '🔧',
      data: { 
        truckId: params.truckId,
        callback: params.onCallRoadside 
      },
    },
    {
      id: 'tow',
      text: 'Вызвать эвакуатор ($800)',
      action: 'call_tow',
      style: 'danger',
      icon: '🚛',
      data: { 
        truckId: params.truckId,
        callback: params.onCallTow 
      },
    },
  ];
  
  sendChatMessage({
    participantName: params.driverName,
    participantRole: 'driver',
    type: 'voice_call',
    text: `🚨 СРОЧНО! ${params.truckName} сломался! ${params.issue}. Я сейчас в ${params.location}. Что делать?`,
    priority: 'urgent',
    interactive: {
      type: 'alert',
      urgency: 'critical',
      buttons,
    },
    metadata: {
      truckId: params.truckId,
    },
  });
}

/**
 * Отправить уведомление о нарушении HOS
 */
export function sendHOSViolation(params: {
  driverName: string;
  truckId: string;
  truckName: string;
  hoursLeft: number;
  onFindTruckStop?: () => void;
  onContinue?: () => void;
}) {
  const buttons: InteractiveButton[] = [
    {
      id: 'find_stop',
      text: 'Найти Truck Stop',
      action: 'find_truck_stop',
      style: 'primary',
      icon: '🅿️',
      data: { 
        truckId: params.truckId,
        callback: params.onFindTruckStop 
      },
    },
    {
      id: 'continue',
      text: 'Продолжить (риск)',
      action: 'continue_driving',
      style: 'danger',
      icon: '⚠️',
      data: { 
        truckId: params.truckId,
        callback: params.onContinue 
      },
    },
  ];
  
  sendChatMessage({
    participantName: params.driverName,
    participantRole: 'driver',
    type: 'sms',
    text: `⚠️ У меня осталось ${params.hoursLeft.toFixed(1)} часов HOS. Нужно искать место для отдыха или продолжать?`,
    priority: 'high',
    interactive: {
      type: 'alert',
      urgency: 'high',
      buttons,
    },
    metadata: {
      truckId: params.truckId,
    },
  });
}

/**
 * Отправить документ (Rate Con, BOL, POD)
 */
export function sendDocument(params: {
  brokerName: string;
  brokerCompany: string;
  document: DocumentPreview;
  loadId: string;
  onView?: () => void;
  onSign?: () => void;
}) {
  const buttons: InteractiveButton[] = [];
  
  if (params.onView) {
    buttons.push({
      id: 'view',
      text: 'Посмотреть',
      action: 'view_document',
      style: 'primary',
      icon: '👁️',
      data: { 
        documentId: params.document.documentId,
        callback: params.onView 
      },
    });
  }
  
  if (params.onSign) {
    buttons.push({
      id: 'sign',
      text: 'Подписать',
      action: 'sign_document',
      style: 'success',
      icon: '✍️',
      data: { 
        documentId: params.document.documentId,
        callback: params.onSign 
      },
    });
  }
  
  sendChatMessage({
    participantName: params.brokerName,
    participantRole: 'broker',
    participantCompany: params.brokerCompany,
    type: 'email',
    subject: `Документ: ${params.document.title}`,
    text: `Отправляю ${params.document.title} для груза #${params.loadId}. Проверь и подпиши, пожалуйста.`,
    priority: 'medium',
    interactive: {
      type: 'document',
      document: params.document,
      buttons,
    },
    metadata: {
      loadId: params.loadId,
    },
  });
}

/**
 * Отправить вопрос водителя с быстрыми ответами
 */
export function sendDriverQuestion(params: {
  driverName: string;
  truckId: string;
  question: string;
  quickReplies: QuickReply[];
}) {
  sendChatMessage({
    participantName: params.driverName,
    participantRole: 'driver',
    type: 'sms',
    text: params.question,
    priority: 'medium',
    interactive: {
      type: 'quick_replies',
      quickReplies: params.quickReplies,
    },
    metadata: {
      truckId: params.truckId,
    },
  });
}

/**
 * Отправить системное уведомление
 */
export function sendSystemNotification(params: {
  title: string;
  message: string;
  priority?: MessagePriority;
  buttons?: InteractiveButton[];
}) {
  sendChatMessage({
    participantName: 'Система',
    participantRole: 'system',
    type: 'system',
    subject: params.title,
    text: params.message,
    priority: params.priority || 'medium',
    interactive: params.buttons ? {
      type: 'buttons',
      buttons: params.buttons,
    } : undefined,
  });
}

/**
 * Отправить detention claim от брокера
 */
export function sendDetentionClaim(params: {
  brokerName: string;
  brokerCompany: string;
  loadId: string;
  detentionHours: number;
  amount: number;
  onAccept?: () => void;
  onDispute?: () => void;
}) {
  const buttons: InteractiveButton[] = [
    {
      id: 'accept',
      text: 'Принять',
      action: 'accept_detention',
      style: 'success',
      icon: '✓',
      data: { 
        loadId: params.loadId,
        callback: params.onAccept 
      },
    },
    {
      id: 'dispute',
      text: 'Оспорить',
      action: 'dispute_detention',
      style: 'warning',
      icon: '⚖️',
      data: { 
        loadId: params.loadId,
        callback: params.onDispute 
      },
    },
  ];
  
  sendChatMessage({
    participantName: params.brokerName,
    participantRole: 'broker',
    participantCompany: params.brokerCompany,
    type: 'email',
    subject: `Detention Claim — Груз #${params.loadId}`,
    text: `Привет! По грузу #${params.loadId} было ${params.detentionHours} часов detention. Выплачиваю $${params.amount}. Согласен?`,
    priority: 'medium',
    interactive: {
      type: 'buttons',
      buttons,
    },
    metadata: {
      loadId: params.loadId,
    },
  });
}

/**
 * Отправить входящий звонок
 */
export function sendIncomingCall(params: {
  callerName: string;
  callerRole: SenderRole;
  callerCompany?: string;
  reason: string;
  onAnswer?: () => void;
  onDecline?: () => void;
}) {
  const buttons: InteractiveButton[] = [
    {
      id: 'answer',
      text: 'Ответить',
      action: 'answer_call',
      style: 'success',
      icon: '📞',
      data: { callback: params.onAnswer },
    },
    {
      id: 'decline',
      text: 'Сбросить',
      action: 'decline_call',
      style: 'danger',
      icon: '✕',
      data: { callback: params.onDecline },
    },
  ];
  
  sendChatMessage({
    participantName: params.callerName,
    participantRole: params.callerRole,
    participantCompany: params.callerCompany,
    type: 'voice_call',
    text: `📞 Входящий звонок: ${params.reason}`,
    priority: 'high',
    interactive: {
      type: 'call',
      buttons,
      autoExpire: 30, // автоматически истекает через 30 секунд
    },
  });
}
