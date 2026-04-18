import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import { Colors } from '../constants/colors';
import { useGameStore, Notification } from '../store/gameStore';
import RateConModal from './RateConModal';
import { useGuideStore } from '../store/guideStore';

// ─── Утилиты ─────────────────────────────────────────────────────────────────

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

function threadKey(n: Notification): string {
  // Группируем по отправителю + грузу (один тред = один брокер + один груз)
  const sender = n.from?.trim().toLowerCase() || 'unknown';
  const load = n.relatedLoadId ? `-${n.relatedLoadId}` : '';
  return `${sender}${load}`;
}

interface Thread {
  key: string;
  from: string;
  messages: Notification[];
  lastMessage: Notification;
  unreadCount: number;
}

function buildThreads(notifications: Notification[]): Thread[] {
  const map = new Map<string, Notification[]>();
  notifications.forEach(n => {
    const k = threadKey(n);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(n);
  });
  const threads: Thread[] = [];
  map.forEach((msgs, key) => {
    const sorted = [...msgs].sort((a, b) => a.minute - b.minute);
    threads.push({
      key,
      from: sorted[sorted.length - 1].from,
      messages: sorted,
      lastMessage: sorted[sorted.length - 1],
      unreadCount: sorted.filter(m => !m.read).length,
    });
  });
  // Сортируем: сначала с непрочитанными, потом по времени последнего
  return threads.sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
    return b.lastMessage.minute - a.lastMessage.minute;
  });
}

function getPhraseTiles(notif: Notification): string[] {
  const msg = ((notif.message || '') + ' ' + (notif.subject || '')).toLowerCase();
  if (msg.includes('pod') || msg.includes('proof of delivery'))
    return ['Hi,', 'POD is attached.', 'Driver delivered on time.', 'Please find the POD below.', 'No issues during delivery.', 'Please process the invoice.', 'Thank you!', 'Best regards,'];
  if (msg.includes('detention') || msg.includes('задержк'))
    return ['Hi,', 'Driver has been waiting for', '2 hours', '3 hours', 'at the shipper.', 'Detention started at', 'Please approve detention pay.', '$50/hour', 'BOL timestamp confirms arrival time.', 'Please confirm detention payment.', 'Thank you!'];
  if (msg.includes('rate con') || msg.includes('rate confirmation'))
    return ['Hi,', 'Rate Con received.', 'Confirmed.', 'Driver will be at pickup by', 'today', 'tomorrow', 'at 8:00 AM', 'at 10:00 AM', 'Please send updated Rate Con.', 'All good, thank you!', 'Best regards,'];
  if (msg.includes('issue') || msg.includes('problem') || msg.includes('complaint'))
    return ['Hi,', 'Apologies for the inconvenience.', 'Driver had a breakdown.', 'There was a traffic delay.', 'We will do better next time.', 'Driver arrived', '30 minutes late', '1 hour late', 'due to traffic.', 'Thank you for your patience.'];
  if (msg.includes('load') || msg.includes('available') || msg.includes('груз') || msg.includes('новый груз'))
    return ['Interested!', 'What\'s the rate?', 'Can you do $2.80/mile?', 'Can you do $3.00/mile?', 'Can you do $3.20/mile?', 'I have a Dry Van available.', 'I have a Reefer available.', 'Truck available today.', 'Truck available tomorrow.', 'Send me the Rate Con.', 'What\'s the pickup time?', 'Any detention policy?', 'We\'ll take it!', 'Pass on this one.'];
  return ['Hi,', 'Got it,', 'Confirmed.', 'Thank you for the update.', 'Driver is on the way.', 'Will keep you posted.', 'Please send details.', 'Rate Con received.', 'POD will follow.', 'Let me know.', 'Best regards,', 'Thanks!'];
}

// Ответы брокера на сообщения о грузе
function getBrokerLoadReply(playerMsg: string, notif: Notification): string | null {
  const m = playerMsg.toLowerCase();
  const orig = ((notif.message || '') + ' ' + (notif.subject || '')).toLowerCase();

  // Извлекаем данные груза из оригинального сообщения
  const rateMatch = orig.match(/\$[\d,]+/);
  const origRate = rateMatch ? rateMatch[0] : '$2,500';
  const milesMatch = orig.match(/(\d+)\s*mi/);
  const miles = milesMatch ? parseInt(milesMatch[1]) : 800;

  if (m.includes('pass') || m.includes('не интересует')) {
    return `No problem! Let me know if you need loads in the future. We work a lot in this lane.`;
  }
  if (m.includes('interested') || m.includes('интересует') || m.includes('we\'ll take')) {
    return `Great! I can confirm the load. Rate is ${origRate} all-in. Pickup today at 10:00 AM. Can you confirm your truck info and driver name?`;
  }
  if (m.includes('rate con') || m.includes('send me')) {
    return `Sure! I'll send the Rate Con right now. Please confirm your MC# and truck plate so I can fill it out.`;
  }
  if (m.includes('pickup time') || m.includes('pickup')) {
    return `Pickup is today at 10:00 AM. Shipper is open until 4:00 PM. Driver needs to call ahead 30 min before arrival.`;
  }
  if (m.includes('detention')) {
    return `Detention is $50/hour after 2 free hours. Driver must check in on time and get BOL stamped to qualify.`;
  }
  if (m.includes('2.80') || m.includes('2.50')) {
    const counter = Math.round(miles * 2.95 / 50) * 50;
    return `I can't go that low on this one — shipper is tight on budget. Best I can do is $${counter.toLocaleString()} flat. That's ${(counter/miles).toFixed(2)}/mile. Works for you?`;
  }
  if (m.includes('3.00') || m.includes('3.20') || m.includes('3.50')) {
    return `${origRate} is already my best rate on this lane. But I'll see what I can do — let me check with my shipper. Give me 5 minutes.`;
  }
  if (m.includes('dry van') || m.includes('reefer') || m.includes('truck available')) {
    return `Perfect! Load requires ${orig.includes('reefer') ? 'Reefer, temp 34°F' : 'Dry Van, no hazmat'}. ${miles} miles, ${origRate} all-in. Ready to book?`;
  }
  if (m.includes('tomorrow')) {
    return `Shipper needs pickup today — can't push to tomorrow. If you have a truck available today, we can make it work!`;
  }
  if (m.includes('today') || m.includes('confirm') || m.includes('confirmed')) {
    return `Confirmed! I'll send the Rate Con to your email within 10 minutes. Driver should call the shipper at (555) 234-5678 before arrival.`;
  }
  return `Got it! Let me check on my end and get back to you shortly. This is a good lane — we move a lot of freight here.`;
}

function getDriverResponses(notif: Notification) {
  const msg = ((notif.message || '') + ' ' + (notif.subject || '')).toLowerCase();
  if (msg.includes('задержк') || msg.includes('delay') || msg.includes('погрузк'))
    return [
      { text: 'Жди — фиксируй время. Если больше 2 часов — detention.', icon: '⏰', outcome: 'Водитель ждёт. Detention clock запущен.', money: 0, mood: 0, correct: true },
      { text: 'Уезжай — найдём другой груз.', icon: '🚛', outcome: 'Груз отменён. TONU fee $150.', money: -150, mood: -10, correct: false },
      { text: 'Позвони брокеру и сообщи о задержке.', icon: '📞', outcome: 'Брокер в курсе. Репутация +2.', money: 0, mood: 5, correct: true },
    ];
  if (msg.includes('поломк') || msg.includes('breakdown') || msg.includes('сломал'))
    return [
      { text: 'Вызови техпомощь. Сообщи брокеру о задержке.', icon: '🔧', outcome: 'Техпомощь вызвана. Задержка ~3 часа. Брокер уведомлён.', money: -200, mood: 0, correct: true },
      { text: 'Попробуй починить сам.', icon: '🛠️', outcome: 'Водитель потратил 2 часа. Не починил. Всё равно вызвал техпомощь.', money: -350, mood: -15, correct: false },
      { text: 'Найди другой трак для перегрузки.', icon: '🔄', outcome: 'Перегрузка организована. Доп. расходы $300.', money: -300, mood: 5, correct: false },
    ];
  if (msg.includes('detention') || msg.includes('ждёт') || msg.includes('ждет'))
    return [
      { text: 'Требуй detention у брокера — $50/час после 2 часов.', icon: '💰', outcome: 'Detention claim отправлен брокеру. Ожидай подтверждения.', money: 100, mood: 5, correct: true },
      { text: 'Скажи водителю ждать без detention.', icon: '😐', outcome: 'Водитель недоволен. Настроение -10.', money: 0, mood: -10, correct: false },
      { text: 'Уточни у водителя точное время прибытия.', icon: '🕐', outcome: 'Водитель прислал BOL с временем. Detention подтверждён.', money: 75, mood: 0, correct: true },
    ];
  if (msg.includes('pod') || msg.includes('разгрузил') || msg.includes('доставил'))
    return [
      { text: 'Отлично! Попроси POD и отправь брокеру.', icon: '📄', outcome: 'POD получен. Инвойс выставлен. Оплата через 30 дней.', money: 50, mood: 10, correct: true },
      { text: 'Найди следующий груз для этого трака.', icon: '📋', outcome: 'Водитель ждёт следующего груза. POD не отправлен — штраф.', money: -50, mood: 0, correct: false },
      { text: 'Скажи водителю отдохнуть — он заслужил.', icon: '😴', outcome: 'Водитель доволен. Настроение +15. Трак простаивает 2 часа.', money: 0, mood: 15, correct: false },
    ];
  return [
    { text: 'Понял, продолжай по плану.', icon: '✅', outcome: 'Водитель продолжает маршрут.', money: 0, mood: 5, correct: true },
    { text: 'Уточни детали — позвони мне.', icon: '📞', outcome: 'Водитель перезвонил. Ситуация прояснилась.', money: 0, mood: 5, correct: true },
    { text: 'Игнорировать — разберётся сам.', icon: '🙈', outcome: 'Водитель недоволен. Настроение -10.', money: 0, mood: -10, correct: false },
  ];
}

// ─── Чат-попап треда ─────────────────────────────────────────────────────────

function ThreadChat({ thread, onClose }: { thread: Thread; onClose: () => void }) {
  const { sendEmail, addMoney, addNotification, markNotificationRead } = useGameStore();
  const { removeMoney } = useGameStore.getState();
  // Подписываемся на живые данные треда из стора
  const liveNotifs = useGameStore(s => s.notifications);

  const lastMsg = thread.messages[thread.messages.length - 1];
  const rootMsg = thread.messages[0]; // корневое сообщение треда
  const isDriver = lastMsg.type === 'text' || lastMsg.type === 'voicemail';
  const isCall = lastMsg.type === 'missed_call';
  const hasRateCon = thread.messages.some(m => m.type === 'rate_con' || m.subject?.toLowerCase().includes('rate con'));

  const [selected, setSelected] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);
  const [callDone, setCallDone] = useState(false);
  const [rateConOpen, setRateConOpen] = useState(false);

  const tiles = getPhraseTiles(lastMsg);
  const driverResponses = getDriverResponses(lastMsg);
  const bodyText = selected.join(' ');

  function handleTile(tile: string) {
    if (selected.includes(tile)) setSelected(selected.filter(t => t !== tile));
    else setSelected([...selected, tile]);
  }

  function handleSend() {
    if (!bodyText.trim()) return;
    // Отправляем ответ в тот же тред (replyToId = id корневого сообщения)
    sendEmail({ to: lastMsg.from, subject: `Re: ${lastMsg.subject}`, body: bodyText, isReply: true, replyToId: rootMsg.id });
    setSent(true);
    setTimeout(() => { setSent(false); setSelected([]); }, 1200);
  }

  function handleDriverChoice(idx: number) {
    if (chosen !== null) return;
    setChosen(idx);
    const r = driverResponses[idx];
    if (r.money > 0) addMoney(r.money, `Решение: ${r.text.slice(0, 30)}`);
    if (r.money < 0) removeMoney(Math.abs(r.money), `Решение: ${r.text.slice(0, 30)}`);
    addNotification({ type: 'text', from: lastMsg.from, subject: `Re: ${lastMsg.subject}`, message: r.outcome, priority: 'low', actionRequired: false });
  }

  function handleCall(callback: boolean) {
    setCallDone(true);
    if (callback) {
      addNotification({ type: 'email', from: lastMsg.from, subject: `Re: ${lastMsg.subject}`, message: 'Брокер ответил на звонок. Обсудили детали груза. Ожидай Rate Con.', priority: 'low', actionRequired: false });
    } else {
      addNotification({ type: 'email', from: lastMsg.from, subject: `Missed call ignored`, message: 'Брокер не дождался ответа. Репутация -2.', priority: 'low', actionRequired: false });
    }
  }

  const result = chosen !== null ? driverResponses[chosen] : null;

  // Живые replies из стора (обновляются в реальном времени)
  const liveRoot = liveNotifs.find(n => n.id === rootMsg.id);
  const allReplies = liveRoot?.replies || rootMsg.replies || [];
  
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={cs.overlay}>
        <View style={cs.sheet}>
          {/* Шапка */}
          <View style={cs.header}>
            <View style={cs.headerLeft}>
              <Text style={cs.headerIcon}>{getEmailIcon(lastMsg.type)}</Text>
              <View>
                <Text style={cs.headerFrom}>{thread.from}</Text>
                <Text style={cs.headerSub}>{thread.messages.length + allReplies.length} сообщ.</Text>
              </View>
            </View>
            <View style={cs.headerRight}>
              {hasRateCon && (
                <TouchableOpacity style={cs.rateConBtn} onPress={() => setRateConOpen(true)}>
                  <Text style={cs.rateConBtnText}>📋 Rate Con</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={cs.closeBtn} onPress={onClose}>
                <Text style={cs.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* История сообщений */}
          <ScrollView style={cs.messages} showsVerticalScrollIndicator={false}>
            {thread.messages.map((msg, i) => {
              const isMe = msg.from === 'Я' || (msg as any).isMe;
              return (
                <View key={msg.id} style={[cs.bubble, isMe ? cs.bubbleMe : cs.bubbleThem]}>
                  <View style={[cs.bubbleInner, isMe ? cs.bubbleInnerMe : cs.bubbleInnerThem]}>
                    {!isMe && <Text style={cs.bubbleIcon}>{getEmailIcon(msg.type)}</Text>}
                    <View style={{ flex: 1 }}>
                      {!isMe && <Text style={cs.bubbleSubject}>{msg.subject}</Text>}
                      <Text style={[cs.bubbleText, isMe && cs.bubbleTextMe]}>{msg.message}</Text>
                      <Text style={cs.bubbleTime}>{msg.minute < 0 ? 'До смены' : `+${Math.round(msg.minute)} мин`}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
            {/* Replies (ответы игрока и брокера в треде) */}
            {allReplies.map((reply, i) => {
              const isMe = reply.isMe === true || reply.from === 'Я';
              return (
                <View key={`reply-${i}`} style={[cs.bubble, isMe ? cs.bubbleMe : cs.bubbleThem]}>
                  <View style={[cs.bubbleInner, isMe ? cs.bubbleInnerMe : cs.bubbleInnerThem]}>
                    {!isMe && <Text style={cs.bubbleIcon}>📧</Text>}
                    <View style={{ flex: 1 }}>
                      <Text style={[cs.bubbleText, isMe && cs.bubbleTextMe]}>{reply.message}</Text>
                      <Text style={cs.bubbleTime}>{reply.minute < 0 ? 'До смены' : `+${Math.round(reply.minute)} мин`}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
            <View style={{ height: 8 }} />
          </ScrollView>

          {/* Зона ответа */}
          <View style={cs.replyZone}>
            {/* Звонок */}
            {isCall && !callDone && (
              <View style={cs.replyOptions}>
                <TouchableOpacity style={cs.optionBtn} onPress={() => handleCall(true)}>
                  <Text style={cs.optionIcon}>📞</Text>
                  <Text style={cs.optionText}>Перезвонить</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[cs.optionBtn, cs.optionBtnDim]} onPress={() => handleCall(false)}>
                  <Text style={cs.optionIcon}>🙈</Text>
                  <Text style={[cs.optionText, { color: '#64748b' }]}>Игнорировать</Text>
                </TouchableOpacity>
              </View>
            )}
            {isCall && callDone && <Text style={cs.doneText}>✅ Обработано</Text>}

            {/* Водитель */}
            {isDriver && chosen === null && (
              <View style={cs.replyOptions}>
                {driverResponses.map((r, i) => (
                  <TouchableOpacity key={i} style={cs.optionBtn} onPress={() => handleDriverChoice(i)}>
                    <Text style={cs.optionIcon}>{r.icon}</Text>
                    <Text style={cs.optionText}>{r.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {isDriver && chosen !== null && result && (
              <View style={[cs.resultCard, result.correct ? cs.resultOk : cs.resultBad]}>
                <Text style={cs.resultText}>{result.correct ? '✅' : '⚠️'} {result.outcome}</Text>
                {result.money !== 0 && <Text style={{ color: result.money > 0 ? '#4ade80' : '#f87171', fontWeight: '800', fontSize: 14 }}>{result.money > 0 ? '+' : ''}{result.money}$</Text>}
              </View>
            )}

            {/* Брокер — плитки */}
            {!isDriver && !isCall && !sent && (
              <>
                <View style={cs.tilesWrap}>
                  {tiles.map((tile, i) => {
                    const sel = selected.includes(tile);
                    return (
                      <TouchableOpacity key={i} style={[cs.tile, sel && cs.tileSel]} onPress={() => handleTile(tile)}>
                        <Text style={[cs.tileText, sel && cs.tileTextSel]}>{tile}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {selected.length > 0 && (
                  <View style={cs.sendRow}>
                    <Text style={cs.preview} numberOfLines={1}>{bodyText}</Text>
                    <TouchableOpacity style={cs.sendBtn} onPress={handleSend}>
                      <Text style={cs.sendBtnText}>↗</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
            {!isDriver && !isCall && sent && <Text style={cs.doneText}>✅ Отправлено</Text>}
          </View>
        </View>
      </View>
      <RateConModal visible={rateConOpen} notification={lastMsg} onClose={() => setRateConOpen(false)} />
    </Modal>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────

// Экспортируемый попап для открытия из NotificationBell
export function ThreadChatPopup({ notification, onClose }: { notification: Notification; onClose: () => void }) {
  // Строим тред из всех уведомлений с тем же ключом (отправитель + груз)
  const allNotifs = useGameStore(s => s.notifications);
  const key = threadKey(notification);
  const related = allNotifs.filter(n => threadKey(n) === key);
  const sorted = [...(related.length > 0 ? related : [notification])].sort((a, b) => a.minute - b.minute);
  const thread: Thread = {
    key,
    from: notification.from,
    messages: sorted,
    lastMessage: sorted[sorted.length - 1],
    unreadCount: sorted.filter(n => !n.read).length,
  };
  return <ThreadChat thread={thread} onClose={onClose} />;
}

export default function EmailPanel({ visible, onClose, inline }: { visible?: boolean; onClose?: () => void; inline?: boolean }) {
  const { notifications, markNotificationRead } = useGameStore();
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const activeStep = useGuideStore(s => s.activeStep);

  const allEmails = notifications.filter(n =>
    n.type === 'email' || n.type === 'pod_ready' || n.type === 'rate_con' ||
    n.type === 'detention' || n.type === 'missed_call' || n.type === 'voicemail' ||
    n.type === 'text' || n.type === 'urgent'
  );

  const threads = buildThreads(allEmails);
  const totalUnread = allEmails.filter(n => !n.read).length;

  function openThread(thread: Thread) {
    thread.messages.forEach(m => { if (!m.read) markNotificationRead(m.id); });
    setSelectedThread(thread);
  }

  const listContent = (
    <>
      {/* Шапка */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>📧 Почта</Text>
          <Text style={s.headerSub}>{totalUnread > 0 ? `${totalUnread} непрочитанных` : 'Всё прочитано'}</Text>
        </View>
        {!inline && onClose && (
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={s.list}>
        {threads.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📭</Text>
            <Text style={s.emptyTitle}>Нет сообщений</Text>
          </View>
        )}
        {/* Подсказка гайда */}
        {activeStep === 'check_email' && threads.length > 0 && (
          <View style={{
            margin: 10, marginBottom: 4,
            padding: 10, borderRadius: 10,
            backgroundColor: 'rgba(6,182,212,0.1)',
            borderWidth: 1, borderColor: 'rgba(6,182,212,0.4)',
            flexDirection: 'row', alignItems: 'center', gap: 8,
          }}>
            <Text style={{ fontSize: 18 }}>👆</Text>
            <Text style={{ fontSize: 12, color: '#67e8f9', fontWeight: '700', flex: 1 }}>
              Нажми на письмо чтобы открыть и прочитать
            </Text>
          </View>
        )}
        {threads.map((thread, idx) => {
          const last = thread.lastMessage;
          const hasUnread = thread.unreadCount > 0;
          const isUrgent = last.priority === 'critical' || last.priority === 'high';
          const isGuideTarget = activeStep === 'check_email' && hasUnread && idx === 0;
          return (
            <View key={thread.key} style={isGuideTarget ? {
              margin: 10, marginVertical: 4,
              borderRadius: 14,
              borderWidth: 2, borderColor: 'rgba(6,182,212,0.7)',
              shadowColor: '#06b6d4', shadowOpacity: 0.5, shadowRadius: 10,
            } as any : {}}>
              <TouchableOpacity
                style={[s.threadCard, hasUnread && s.threadCardUnread, isUrgent && s.threadCardUrgent,
                  isGuideTarget && { margin: 0, borderWidth: 0 }
                ]}
                onPress={() => openThread(thread)}
                activeOpacity={0.75}
              >
                <View style={[s.avatar, { backgroundColor: hasUnread ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.06)' }]}>
                  <Text style={s.avatarIcon}>{getEmailIcon(last.type)}</Text>
                </View>
                <View style={s.threadContent}>
                  <View style={s.threadTop}>
                    <Text style={[s.threadFrom, hasUnread && s.threadFromUnread]} numberOfLines={1}>{last.from}</Text>
                    <Text style={s.threadTime}>{last.minute < 0 ? 'До смены' : `+${Math.round(last.minute)} мин`}</Text>
                  </View>
                  <Text style={[s.threadSubject, hasUnread && s.threadSubjectUnread]} numberOfLines={1}>{last.subject}</Text>
                  <Text style={s.threadPreview} numberOfLines={1}>{last.message}</Text>
                </View>
                {hasUnread && (
                  <View style={s.badge}>
                    <Text style={s.badgeText}>{thread.unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>
    </>
  );

  if (inline) {
    return (
      <>
        <View style={{ flex: 1, backgroundColor: '#0d1f35', overflow: 'hidden' } as any}>{listContent}</View>
        {selectedThread && (
          <ThreadChat thread={selectedThread} onClose={() => setSelectedThread(null)} />
        )}
      </>
    );
  }

  return (
    <>
      <Modal visible={!!visible} animationType="slide" transparent onRequestClose={onClose}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            {listContent}
          </View>
        </View>
      </Modal>

      {selectedThread && (
        <ThreadChat thread={selectedThread} onClose={() => setSelectedThread(null)} />
      )}
    </>
  );
}

// ─── Стили списка ─────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center', alignItems: 'center',
    padding: 16,
  },
  sheet: {
    backgroundColor: '#0d1f35',
    borderRadius: 20,
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%' as any,
    borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 14, color: '#94a3b8', fontWeight: '700' },
  list: { flex: 1 },
  empty: { alignItems: 'center', padding: 60, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },

  threadCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, marginHorizontal: 10, marginVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  threadCardUnread: { backgroundColor: 'rgba(6,182,212,0.05)', borderColor: 'rgba(6,182,212,0.25)' },
  threadCardUrgent: { borderColor: 'rgba(239,68,68,0.4)', backgroundColor: 'rgba(239,68,68,0.05)' },

  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarIcon: { fontSize: 22 },

  threadContent: { flex: 1, gap: 2 },
  threadTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  threadFrom: { fontSize: 13, fontWeight: '600', color: '#94a3b8', flex: 1 },
  threadFromUnread: { color: '#06b6d4', fontWeight: '800' },
  threadTime: { fontSize: 10, color: '#94a3b8' },
  threadSubject: { fontSize: 13, fontWeight: '600', color: '#cbd5e1' },
  threadSubjectUnread: { color: '#fff', fontWeight: '800' },
  threadPreview: { fontSize: 11, color: '#94a3b8' },

  badge: { backgroundColor: '#06b6d4', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText: { fontSize: 10, fontWeight: '900', color: '#fff' },
});

// ─── Стили чата ───────────────────────────────────────────────────────────────

const cs = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#0d1f35', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%', borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: { fontSize: 28 },
  headerFrom: { fontSize: 15, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rateConBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: 'rgba(251,191,36,0.15)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(251,191,36,0.4)' },
  rateConBtnText: { fontSize: 11, fontWeight: '700', color: '#fbbf24' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 14, color: '#94a3b8', fontWeight: '700' },

  messages: { maxHeight: 320, paddingHorizontal: 12, paddingTop: 8 },
  bubble: { marginBottom: 8 },
  bubbleMe: { alignItems: 'flex-end' },
  bubbleThem: { alignItems: 'flex-start' },
  bubbleInner: { maxWidth: '85%', borderRadius: 14, padding: 10, gap: 3, flexDirection: 'row', alignItems: 'flex-start' },
  bubbleInnerMe: { backgroundColor: 'rgba(6,182,212,0.2)', borderBottomRightRadius: 4 },
  bubbleInnerThem: { backgroundColor: 'rgba(255,255,255,0.06)', borderBottomLeftRadius: 4 },
  bubbleIcon: { fontSize: 16, marginRight: 6, marginTop: 1 },
  bubbleSubject: { fontSize: 11, fontWeight: '700', color: '#06b6d4', marginBottom: 2 },
  bubbleText: { fontSize: 13, color: '#e2e8f0', lineHeight: 18 },
  bubbleTextMe: { color: '#fff' },
  bubbleTime: { fontSize: 10, color: '#94a3b8', marginTop: 3 },

  replyZone: { padding: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', gap: 8 },

  replyOptions: { gap: 6 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 10 },
  optionBtnDim: { opacity: 0.6 },
  optionIcon: { fontSize: 18 },
  optionText: { flex: 1, fontSize: 13, color: '#e2e8f0', fontWeight: '600' },

  resultCard: { borderRadius: 12, padding: 12, gap: 4, borderWidth: 1 },
  resultOk: { backgroundColor: 'rgba(74,222,128,0.1)', borderColor: 'rgba(74,222,128,0.3)' },
  resultBad: { backgroundColor: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.3)' },
  resultText: { fontSize: 13, color: '#e2e8f0', lineHeight: 18 },

  tilesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tile: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tileSel: { backgroundColor: 'rgba(6,182,212,0.15)', borderColor: '#06b6d4' },
  tileText: { fontSize: 12, color: '#cbd5e1', fontWeight: '600' },
  tileTextSel: { color: '#06b6d4' },

  sendRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(6,182,212,0.08)', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)' },
  preview: { flex: 1, fontSize: 12, color: '#94a3b8' },
  sendBtn: { backgroundColor: '#06b6d4', borderRadius: 10, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { fontSize: 16, color: '#fff', fontWeight: '900' },

  doneText: { fontSize: 13, color: '#4ade80', fontWeight: '700', textAlign: 'center', padding: 8 },
});
