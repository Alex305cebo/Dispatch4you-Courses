import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { useGameStore, Notification } from '../store/gameStore';
import RateConModal from './RateConModal';

type Group = 'unread' | 'read';

const GROUPS: { id: Group; label: string; icon: string }[] = [
  { id: 'unread', label: 'Новые', icon: '🔔' },
  { id: 'read',   label: 'Прочитанные', icon: '✅' },
];

function getGroup(n: Notification): Group {
  return n.read ? 'read' : 'unread';
}

function getEmailIcon(type: string) {
  if (type === 'missed_call') return '📵';
  if (type === 'voicemail') return '📱';
  if (type === 'text') return '💬';
  if (type === 'pod_ready') return '📄';
  if (type === 'rate_con') return '📋';
  if (type === 'detention') return '⏰';
  return '📧';
}

// ─── Фразы для ответа брокеру ────────────────────────────────────────────────
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
  if (msg.includes('load') || msg.includes('available') || msg.includes('груз'))
    return ['Hi,', 'I have a truck available.', 'Dry Van', 'Reefer', 'available in', 'Chicago', 'Dallas', 'Atlanta', 'What is the rate?', 'Can you do', '$2.50/mile?', '$3.00/mile?', 'Send me the Rate Con.', 'Thank you!'];
  return ['Hi,', 'Got it,', 'Confirmed.', 'Thank you for the update.', 'Driver is on the way.', 'Will keep you posted.', 'Please send details.', 'Rate Con received.', 'POD will follow.', 'Let me know.', 'Best regards,', 'Thanks!'];
}

// ─── Варианты ответа водителю ─────────────────────────────────────────────────
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

// ─── Детальный вид письма с ответом ──────────────────────────────────────────
function EmailDetail({ email, onBack }: { email: Notification; onBack: () => void }) {
  const { sendEmail, addMoney, addNotification } = useGameStore();
  const { removeMoney } = useGameStore.getState();

  const isDriver = email.type === 'text' || email.type === 'voicemail';
  const isCall = email.type === 'missed_call';
  const isRateCon = email.type === 'rate_con' || email.subject?.toLowerCase().includes('rate con');

  // Состояние для ответа брокеру (плитки)
  const [selected, setSelected] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const [rateConOpen, setRateConOpen] = useState(false);

  // Состояние для ответа водителю (варианты)
  const [chosen, setChosen] = useState<number | null>(null);

  // Состояние для звонка
  const [callDone, setCallDone] = useState(false);

  const tiles = getPhraseTiles(email);
  const driverResponses = getDriverResponses(email);
  const bodyText = selected.join(' ');

  function handleTile(tile: string) {
    if (selected.includes(tile)) setSelected(selected.filter(t => t !== tile));
    else setSelected([...selected, tile]);
  }

  function handleSend() {
    if (!bodyText.trim()) return;
    sendEmail({ to: email.from, subject: `Re: ${email.subject}`, body: bodyText, isReply: true, replyToId: email.id });
    setSent(true);
    setTimeout(() => { setSent(false); setSelected([]); onBack(); }, 1200);
  }

  function handleDriverChoice(idx: number) {
    if (chosen !== null) return;
    setChosen(idx);
    const r = driverResponses[idx];
    if (r.money > 0) addMoney(r.money, `Решение: ${r.text.slice(0, 30)}`);
    if (r.money < 0) removeMoney(Math.abs(r.money), `Решение: ${r.text.slice(0, 30)}`);
    addNotification({ type: 'text', from: email.from, subject: `Re: ${email.subject}`, message: r.outcome, priority: 'low', actionRequired: false });
  }

  function handleCall(callback: boolean) {
    setCallDone(true);
    if (callback) {
      addNotification({ type: 'email', from: email.from, subject: `Re: ${email.subject}`, message: 'Брокер ответил на звонок. Обсудили детали груза. Ожидай Rate Con.', priority: 'low', actionRequired: false });
    } else {
      addNotification({ type: 'email', from: email.from, subject: `Missed call ignored`, message: 'Брокер не дождался ответа. Репутация -2.', priority: 'low', actionRequired: false });
    }
  }

  const result = chosen !== null ? driverResponses[chosen] : null;

  return (
    <View style={s.detailWrap}>
      {/* Шапка */}
      <View style={s.detailHeader}>
        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Text style={s.backBtnText}>← Назад</Text>
        </TouchableOpacity>
        <View style={s.detailHeaderActions}>
          {isRateCon && (
            <TouchableOpacity style={s.rateConBtn} onPress={() => setRateConOpen(true)}>
              <Text style={s.rateConBtnText}>📋 Rate Con</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={s.detailScroll} showsVerticalScrollIndicator={false}>
        {/* Мета */}
        <View style={s.detailMeta}>
          <Text style={s.detailIcon}>{getEmailIcon(email.type)}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.detailFrom}>{email.from}</Text>
            <Text style={s.detailTime}>{email.minute < 0 ? 'До смены' : `+${Math.round(email.minute)} мин`}</Text>
          </View>
        </View>
        <Text style={s.detailSubject}>{email.subject}</Text>
        <View style={s.detailBody}>
          <Text style={s.detailBodyText}>{email.message}</Text>
        </View>

        {/* ── ОТВЕТ: ЗВОНОК ── */}
        {isCall && !callDone && (
          <View style={s.replySection}>
            <Text style={s.replySectionTitle}>Что делаешь?</Text>
            <TouchableOpacity style={s.callBtn} onPress={() => handleCall(true)} activeOpacity={0.8}>
              <Text style={s.callBtnIcon}>📞</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.callBtnText}>Перезвонить</Text>
                <Text style={s.callBtnSub}>Брокер предложит груз или уточнит детали</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[s.callBtn, s.callBtnIgnore]} onPress={() => handleCall(false)} activeOpacity={0.8}>
              <Text style={s.callBtnIcon}>🙈</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.callBtnText, { color: '#94a3b8' }]}>Игнорировать</Text>
                <Text style={s.callBtnSub}>Репутация с брокером упадёт</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        {isCall && callDone && (
          <View style={s.doneBanner}>
            <Text style={s.doneBannerText}>✅ Обработано</Text>
          </View>
        )}

        {/* ── ОТВЕТ: ВОДИТЕЛЬ ── */}
        {isDriver && chosen === null && (
          <View style={s.replySection}>
            <Text style={s.replySectionTitle}>Как ответишь?</Text>
            {driverResponses.map((r, i) => (
              <TouchableOpacity key={i} style={s.choiceBtn} onPress={() => handleDriverChoice(i)} activeOpacity={0.75}>
                <Text style={s.choiceIcon}>{r.icon}</Text>
                <Text style={s.choiceText}>{r.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {isDriver && chosen !== null && result && (
          <View style={[s.resultCard, result.correct ? s.resultCorrect : s.resultWrong]}>
            <Text style={s.resultIcon}>{result.correct ? '✅' : '⚠️'}</Text>
            <Text style={s.resultTitle}>{result.correct ? 'Правильное решение!' : 'Не лучший выбор'}</Text>
            <Text style={s.resultOutcome}>{result.outcome}</Text>
            {result.money !== 0 && (
              <Text style={[s.resultMoney, { color: result.money > 0 ? Colors.success : Colors.danger }]}>
                {result.money > 0 ? '+' : ''}{result.money}$
              </Text>
            )}
            {result.mood !== 0 && (
              <Text style={[s.resultMood, { color: result.mood > 0 ? Colors.success : Colors.danger }]}>
                Настроение: {result.mood > 0 ? '+' : ''}{result.mood}
              </Text>
            )}
            <TouchableOpacity style={s.doneBtn} onPress={onBack}>
              <Text style={s.doneBtnText}>Готово</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── ОТВЕТ: БРОКЕР / EMAIL ── */}
        {!isDriver && !isCall && !sent && (
          <View style={s.replySection}>
            <Text style={s.replySectionTitle}>Ответить</Text>

            {/* Собранное письмо */}
            <View style={s.composedWrap}>
              <View style={s.composedHeader}>
                <Text style={s.composedLabel}>Твоё письмо:</Text>
                {selected.length > 0 && (
                  <TouchableOpacity onPress={() => setSelected([])}>
                    <Text style={s.clearBtn}>Очистить</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={s.composedTokens}>
                {selected.length === 0
                  ? <Text style={s.placeholder}>Нажимай на фразы ниже →</Text>
                  : selected.map((t, i) => (
                    <TouchableOpacity key={i} style={s.token} onPress={() => handleTile(t)}>
                      <Text style={s.tokenText}>{t}</Text>
                      <Text style={s.tokenX}> ×</Text>
                    </TouchableOpacity>
                  ))
                }
              </View>
            </View>

            {/* Плитки фраз */}
            <View style={s.tilesGrid}>
              {tiles.map((tile, i) => {
                const sel = selected.includes(tile);
                return (
                  <TouchableOpacity key={i} style={[s.tile, sel && s.tileSel]} onPress={() => handleTile(tile)} activeOpacity={0.7}>
                    <Text style={[s.tileText, sel && s.tileTextSel]}>{tile}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Кнопка отправить */}
            <TouchableOpacity
              style={[s.sendBtn, !bodyText.trim() && s.sendDisabled]}
              onPress={handleSend}
              disabled={!bodyText.trim()}
            >
              <Text style={s.sendBtnText}>Отправить ↗</Text>
            </TouchableOpacity>
          </View>
        )}
        {!isDriver && !isCall && sent && (
          <View style={s.doneBanner}>
            <Text style={s.doneBannerText}>✅ Письмо отправлено</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <RateConModal visible={rateConOpen} notification={email} onClose={() => setRateConOpen(false)} />
    </View>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────
export default function EmailPanel() {
  const { notifications, markNotificationRead } = useGameStore();
  const [activeGroup, setActiveGroup] = useState<Group>('unread');
  const [selectedEmail, setSelectedEmail] = useState<Notification | null>(null);

  const allEmails = notifications.filter(n =>
    n.type === 'email' || n.type === 'pod_ready' || n.type === 'rate_con' ||
    n.type === 'detention' || n.type === 'missed_call' || n.type === 'voicemail' || n.type === 'text'
  );

  const grouped = (g: Group) => allEmails.filter(n => getGroup(n) === g);
  const filteredEmails = grouped(activeGroup);
  const unreadCount = allEmails.filter(e => !e.read).length;

  function handleEmailClick(email: Notification) {
    markNotificationRead(email.id);
    setSelectedEmail(email);
  }

  if (selectedEmail) {
    return <EmailDetail email={selectedEmail} onBack={() => setSelectedEmail(null)} />;
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>📧 Почта</Text>
          <Text style={s.headerSub}>{unreadCount} непрочитанных</Text>
        </View>
        <TouchableOpacity style={s.composeBtn} onPress={() => {
          // Открыть пустое письмо — создаём фейковый notif для compose
          setSelectedEmail({ id: '__new__', type: 'email', from: '', subject: 'Новое письмо', message: '', priority: 'low', minute: 0, read: false, actionRequired: false } as any);
        }}>
          <Text style={s.composeBtnText}>✉️ Написать</Text>
        </TouchableOpacity>
      </View>

      {/* Group tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.groupTabsScroll}>
        <View style={s.groupTabs}>
          {GROUPS.map(g => {
            const count = grouped(g.id).length;
            const isActive = activeGroup === g.id;
            return (
              <TouchableOpacity
                key={g.id}
                style={[s.groupTab, isActive && s.groupTabActive]}
                onPress={() => setActiveGroup(g.id)}
              >
                <Text style={s.groupTabIcon}>{g.icon}</Text>
                <Text style={[s.groupTabLabel, isActive && s.groupTabLabelActive]}>{g.label}</Text>
                {count > 0 && (
                  <View style={[s.groupTabBadge, isActive && s.groupTabBadgeActive]}>
                    <Text style={s.groupTabBadgeText}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Email List */}
      <ScrollView style={s.emailList}>
        {filteredEmails.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📭</Text>
            <Text style={s.emptyTitle}>Нет писем</Text>
            <Text style={s.emptySub}>{activeGroup === 'read' ? 'Нет прочитанных' : 'Нет новых уведомлений'}</Text>
          </View>
        ) : (
          filteredEmails.map(email => (
            <TouchableOpacity
              key={email.id}
              style={[
                s.emailCard,
                !email.read && s.emailCardUnread,
                (email.type === 'missed_call' || email.type === 'voicemail') && s.emailCardCall,
                (email.priority === 'critical' || email.priority === 'high') && s.emailCardUrgent,
              ]}
              onPress={() => handleEmailClick(email)}
              activeOpacity={0.7}
            >
              <View style={s.emailHeader}>
                <Text style={s.emailIcon}>{getEmailIcon(email.type)}</Text>
                <View style={s.emailHeaderInfo}>
                  <Text style={s.emailFrom}>{email.from}</Text>
                  <Text style={s.emailTime}>{email.minute < 0 ? 'До смены' : `+${Math.round(email.minute)} мин`}</Text>
                </View>
                {!email.read && <View style={s.unreadDot} />}
              </View>
              <Text style={s.emailSubject} numberOfLines={1}>{email.subject}</Text>
              <Text style={s.emailPreview} numberOfLines={2}>{email.message}</Text>
              {/* Подсказка что делать */}
              <Text style={s.emailAction}>
                {email.type === 'missed_call' ? '📞 Нажми чтобы перезвонить' :
                 email.type === 'voicemail' || email.type === 'text' ? '💬 Нажми чтобы ответить водителю' :
                 email.type === 'rate_con' ? '📋 Нажми чтобы открыть Rate Con' :
                 '↩️ Нажми чтобы ответить'}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ─── Стили ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 11, color: Colors.textDim, marginTop: 2 },
  composeBtn: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: Colors.primary, borderRadius: 10 },
  composeBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  // Group tabs
  groupTabsScroll: { borderBottomWidth: 1, borderBottomColor: Colors.border, flexGrow: 0, flexShrink: 0, height: 52 },
  groupTabs: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8, gap: 6, alignItems: 'center', height: 52 },
  groupTab: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: Colors.bgCard, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, flexShrink: 0, height: 36 },
  groupTabActive: { backgroundColor: 'rgba(6,182,212,0.15)', borderColor: Colors.primary },
  groupTabIcon: { fontSize: 13 },
  groupTabLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMuted },
  groupTabLabelActive: { color: Colors.primary },
  groupTabBadge: { backgroundColor: Colors.border, borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1, minWidth: 16, alignItems: 'center' },
  groupTabBadgeActive: { backgroundColor: Colors.primary },
  groupTabBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },

  // Email list
  emailList: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 60, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  emptySub: { fontSize: 12, color: Colors.textDim, textAlign: 'center' },

  emailCard: { padding: 14, marginHorizontal: 10, marginVertical: 6, backgroundColor: Colors.bgCard, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, gap: 5 },
  emailCardUnread: { backgroundColor: 'rgba(6,182,212,0.05)', borderColor: 'rgba(6,182,212,0.2)' },
  emailCardCall: { backgroundColor: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' },
  emailCardUrgent: { backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.35)' },
  emailHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emailIcon: { fontSize: 20 },
  emailHeaderInfo: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emailFrom: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  emailTime: { fontSize: 10, color: Colors.textDim },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  emailSubject: { fontSize: 14, fontWeight: '700', color: '#fff' },
  emailPreview: { fontSize: 12, color: '#cbd5e1', lineHeight: 17 },
  emailAction: { fontSize: 11, color: '#64748b', marginTop: 2, fontStyle: 'italic' },

  // Detail view
  detailWrap: { flex: 1, backgroundColor: Colors.bg },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  detailHeaderActions: { flexDirection: 'row', gap: 8 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: Colors.bgCard, borderRadius: 8 },
  backBtnText: { fontSize: 13, fontWeight: '600', color: '#cbd5e1' },
  rateConBtn: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(251,191,36,0.15)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(251,191,36,0.4)' },
  rateConBtnText: { fontSize: 12, fontWeight: '700', color: '#fbbf24' },
  detailScroll: { flex: 1, padding: 16 },
  detailMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  detailIcon: { fontSize: 32 },
  detailFrom: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  detailTime: { fontSize: 11, color: Colors.textDim, marginTop: 2 },
  detailSubject: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 14 },
  detailBody: { backgroundColor: Colors.bgCard, borderRadius: 12, padding: 14, marginBottom: 20 },
  detailBodyText: { fontSize: 14, color: '#e2e8f0', lineHeight: 22 },

  // Reply section
  replySection: { gap: 10, marginBottom: 16 },
  replySectionTitle: { fontSize: 12, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Call buttons
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', padding: 14 },
  callBtnIgnore: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: Colors.border },
  callBtnIcon: { fontSize: 24 },
  callBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  callBtnSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },

  // Driver choices
  choiceBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.bgCard, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14 },
  choiceIcon: { fontSize: 22, flexShrink: 0 },
  choiceText: { flex: 1, fontSize: 14, color: '#fff', fontWeight: '600', lineHeight: 20 },

  // Result
  resultCard: { borderRadius: 14, padding: 16, gap: 6, borderWidth: 1, alignItems: 'center', marginBottom: 12 },
  resultCorrect: { backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)' },
  resultWrong: { backgroundColor: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.3)' },
  resultIcon: { fontSize: 32, marginBottom: 4 },
  resultTitle: { fontSize: 16, fontWeight: '900', color: '#fff' },
  resultOutcome: { fontSize: 13, color: '#cbd5e1', textAlign: 'center', lineHeight: 20 },
  resultMoney: { fontSize: 18, fontWeight: '900', marginTop: 4 },
  resultMood: { fontSize: 13, fontWeight: '700' },
  doneBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', width: '100%', marginTop: 8 },
  doneBtnText: { fontSize: 15, fontWeight: '900', color: '#fff' },

  // Compose (broker reply)
  composedWrap: { backgroundColor: 'rgba(6,182,212,0.06)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)', minHeight: 60, padding: 10 },
  composedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  composedLabel: { fontSize: 10, fontWeight: '700', color: '#06b6d4', textTransform: 'uppercase', letterSpacing: 0.5 },
  clearBtn: { fontSize: 11, color: '#ef4444', fontWeight: '700' },
  composedTokens: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  placeholder: { fontSize: 12, color: '#475569', fontStyle: 'italic' },
  token: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#06b6d4', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  tokenText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  tokenX: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '900' },
  tilesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: Colors.bgCard, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border },
  tileSel: { backgroundColor: 'rgba(6,182,212,0.12)', borderColor: '#06b6d4', opacity: 0.6 },
  tileText: { fontSize: 13, color: '#e2e8f0', fontWeight: '600' },
  tileTextSel: { color: '#06b6d4' },
  sendBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  sendDisabled: { opacity: 0.35 },
  sendBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  // Done banner
  doneBanner: { backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', padding: 16, alignItems: 'center' },
  doneBannerText: { fontSize: 15, fontWeight: '800', color: '#4ade80' },
});
