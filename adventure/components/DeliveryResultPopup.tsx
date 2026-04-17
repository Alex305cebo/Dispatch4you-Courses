import { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useGameStore, DeliveryResult } from '../store/gameStore';

// ─── Чат с брокером после доставки ──────────────────────────────────────────
const BROKER_CHAT = [
  { from: 'broker', text: (r: DeliveryResult) => `Hey! Driver confirmed delivery in ${r.toCity}. BOL signed. Great job on this load!` },
  { from: 'broker', text: (r: DeliveryResult) => `Rate Con was $${r.agreedRate.toLocaleString()} all-in. I'll process the invoice today.` },
];

const DRIVER_CHAT = [
  { from: 'driver', text: (r: DeliveryResult) => `Dispatcher, I'm empty in ${r.toCity}. BOL signed, all good. What's next?` },
];

const QUICK_REPLIES_BROKER = [
  'Thanks! Send the invoice.', 'Please confirm detention.', 'POD attached.', 'Great working with you!', 'Send Rate Con for next load.',
];
const QUICK_REPLIES_DRIVER = [
  'Great job! Rest up.', 'Find a truck stop nearby.', 'I\'ll find you a load ASAP.', 'Check your HOS.', 'Head to Chicago.',
];

export default function DeliveryResultPopup() {
  const { deliveryResults, dismissDeliveryResult } = useGameStore();
  const [tab, setTab] = useState<'pnl' | 'broker' | 'driver'>('pnl');
  const [brokerMsgs, setBrokerMsgs] = useState<string[]>([]);
  const [driverMsgs, setDriverMsgs] = useState<string[]>([]);

  if (deliveryResults.length === 0) return null;
  const result = deliveryResults[0];

  const profitColor = result.netProfit >= 0 ? '#4ade80' : '#f87171';
  const rpmColor = result.ratePerMile >= 2.5 ? '#4ade80' : result.ratePerMile >= 2.0 ? '#fbbf24' : '#f87171';

  function sendBroker(msg: string) {
    setBrokerMsgs(prev => [...prev, msg]);
    setTimeout(() => {
      setBrokerMsgs(prev => [...prev, `__broker__Got it! ${msg.includes('invoice') ? 'Invoice will be processed in 30 days.' : msg.includes('detention') ? 'Detention approved — $' + result.detentionPay + ' added.' : 'Thanks for the update!'}`]);
    }, 800);
  }

  function sendDriver(msg: string) {
    setDriverMsgs(prev => [...prev, msg]);
    setTimeout(() => {
      setDriverMsgs(prev => [...prev, `__driver__${msg.includes('load') ? 'Copy that, waiting for next load.' : msg.includes('HOS') ? 'HOS is good, 8 hours left.' : 'Roger that, dispatcher!'}`]);
    }, 600);
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => dismissDeliveryResult(result.loadId)}>
      <View style={s.overlay}>
        <View style={s.sheet}>

          {/* Шапка */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <View style={[s.truckBadge, { backgroundColor: profitColor + '22', borderColor: profitColor + '55' }]}>
                <Text style={[s.truckBadgeText, { color: profitColor }]}>🚛 {result.truckName}</Text>
              </View>
              <View>
                <Text style={s.headerTitle}>Доставка завершена!</Text>
                <Text style={s.headerSub}>{result.fromCity} → {result.toCity} · {result.miles} mi</Text>
              </View>
            </View>
            <TouchableOpacity style={s.closeBtn} onPress={() => dismissDeliveryResult(result.loadId)}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Итог сверху */}
          <View style={s.summaryRow}>
            <View style={s.summaryChip}>
              <Text style={s.summaryLabel}>GROSS</Text>
              <Text style={[s.summaryVal, { color: '#38bdf8' }]}>${result.grossRevenue.toLocaleString()}</Text>
            </View>
            <View style={s.summaryChip}>
              <Text style={s.summaryLabel}>РАСХОДЫ</Text>
              <Text style={[s.summaryVal, { color: '#f87171' }]}>-${result.totalExpenses.toLocaleString()}</Text>
            </View>
            <View style={[s.summaryChip, { borderColor: profitColor + '55', backgroundColor: profitColor + '11' }]}>
              <Text style={s.summaryLabel}>NET</Text>
              <Text style={[s.summaryVal, { color: profitColor }]}>${result.netProfit.toLocaleString()}</Text>
            </View>
            <View style={s.summaryChip}>
              <Text style={s.summaryLabel}>$/MILE</Text>
              <Text style={[s.summaryVal, { color: rpmColor }]}>{result.ratePerMile.toFixed(2)}</Text>
            </View>
          </View>

          {/* Табы */}
          <View style={s.tabs}>
            {(['pnl', 'broker', 'driver'] as const).map(t => (
              <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
                <Text style={[s.tabText, tab === t && s.tabTextActive]}>
                  {t === 'pnl' ? '💰 P&L' : t === 'broker' ? '📧 Брокер' : '🚛 Водитель'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={s.body} showsVerticalScrollIndicator={false}>

            {/* P&L */}
            {tab === 'pnl' && (
              <View style={s.pnlWrap}>
                <Text style={s.pnlTitle}>Расчёт поездки</Text>
                <Text style={s.pnlSub}>{result.driverName} · {result.fromCity} → {result.toCity}</Text>

                {/* Доходы */}
                <View style={s.section}>
                  <Text style={s.sectionTitle}>📈 ДОХОДЫ</Text>
                  <PnlRow label="Agreed Rate" value={result.agreedRate} color="#4ade80" />
                  {result.detentionPay > 0 && <PnlRow label="Detention Pay" value={result.detentionPay} color="#fbbf24" />}
                  <PnlRow label="GROSS REVENUE" value={result.grossRevenue} color="#38bdf8" bold />
                </View>

                {/* Расходы */}
                <View style={s.section}>
                  <Text style={s.sectionTitle}>📉 РАСХОДЫ</Text>
                  <PnlRow label={`Топливо (${result.miles}mi × $0.45)`} value={-result.fuelCost} color="#f87171" />
                  <PnlRow label={`Водитель (${result.miles}mi × $0.55)`} value={-result.driverPay} color="#f87171" />
                  <PnlRow label="Dispatch Fee (8%)" value={-result.dispatchFee} color="#f87171" />
                  <PnlRow label="Factoring Fee (3%)" value={-result.factoringFee} color="#f87171" />
                  {result.lumperCost > 0 && <PnlRow label="Lumper (разгрузка)" value={-result.lumperCost} color="#f87171" />}
                  <PnlRow label="TOTAL EXPENSES" value={-result.totalExpenses} color="#f87171" bold />
                </View>

                {/* Итог */}
                <View style={[s.netRow, { borderColor: profitColor + '44' }]}>
                  <Text style={s.netLabel}>NET PROFIT</Text>
                  <Text style={[s.netVal, { color: profitColor }]}>
                    {result.netProfit >= 0 ? '+' : ''}${result.netProfit.toLocaleString()}
                  </Text>
                </View>
                <View style={s.rpmRow}>
                  <Text style={s.rpmText}>Rate/mile: <Text style={{ color: rpmColor }}>${result.ratePerMile.toFixed(2)}</Text></Text>
                  <Text style={s.rpmText}>Profit/mile: <Text style={{ color: profitColor }}>${result.profitPerMile.toFixed(2)}</Text></Text>
                </View>

                {/* Оценка */}
                <View style={[s.gradeBox, { borderColor: profitColor + '44' }]}>
                  <Text style={[s.gradeText, { color: profitColor }]}>
                    {result.profitPerMile >= 1.0 ? '⭐ Отличная поездка!' : result.profitPerMile >= 0.5 ? '👍 Нормально' : '⚠️ Слабая маржа'}
                  </Text>
                  <Text style={s.gradeHint}>
                    {result.profitPerMile >= 1.0 ? 'Держи такой темп — это хорошая ставка.' : result.profitPerMile >= 0.5 ? 'Можно лучше — торгуйся выше $3/mile.' : 'В следующий раз торгуйся агрессивнее!'}
                  </Text>
                </View>
              </View>
            )}

            {/* Чат с брокером */}
            {tab === 'broker' && (
              <View style={s.chatWrap}>
                {BROKER_CHAT.map((m, i) => (
                  <ChatBubble key={i} text={m.text(result)} isMe={false} name={result.fromCity + ' Broker'} />
                ))}
                {brokerMsgs.map((m, i) => (
                  <ChatBubble key={'b' + i} text={m.replace('__broker__', '')} isMe={!m.startsWith('__broker__')} name={m.startsWith('__broker__') ? 'Broker' : 'Я'} />
                ))}
                <View style={s.quickReplies}>
                  {QUICK_REPLIES_BROKER.map((r, i) => (
                    <TouchableOpacity key={i} style={s.quickBtn} onPress={() => sendBroker(r)}>
                      <Text style={s.quickBtnText}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Чат с водителем */}
            {tab === 'driver' && (
              <View style={s.chatWrap}>
                {DRIVER_CHAT.map((m, i) => (
                  <ChatBubble key={i} text={m.text(result)} isMe={false} name={result.driverName} />
                ))}
                {driverMsgs.map((m, i) => (
                  <ChatBubble key={'d' + i} text={m.replace('__driver__', '')} isMe={!m.startsWith('__driver__')} name={m.startsWith('__driver__') ? result.driverName : 'Я'} />
                ))}
                <View style={s.quickReplies}>
                  {QUICK_REPLIES_DRIVER.map((r, i) => (
                    <TouchableOpacity key={i} style={s.quickBtn} onPress={() => sendDriver(r)}>
                      <Text style={s.quickBtnText}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

          </ScrollView>

          {/* Кнопка закрыть */}
          <TouchableOpacity style={s.doneBtn} onPress={() => dismissDeliveryResult(result.loadId)}>
            <Text style={s.doneBtnText}>✓ Закрыть и найти следующий груз</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

function PnlRow({ label, value, color, bold }: { label: string; value: number; color: string; bold?: boolean }) {
  return (
    <View style={pnl.row}>
      <Text style={[pnl.label, bold && pnl.bold]}>{label}</Text>
      <Text style={[pnl.val, { color }, bold && pnl.bold]}>
        {value >= 0 ? '+' : ''}${Math.abs(value).toLocaleString()}
      </Text>
    </View>
  );
}

function ChatBubble({ text, isMe, name }: { text: string; isMe: boolean; name: string }) {
  return (
    <View style={[chat.wrap, isMe ? chat.wrapMe : chat.wrapThem]}>
      {!isMe && <Text style={chat.name}>{name}</Text>}
      <View style={[chat.bubble, isMe ? chat.bubbleMe : chat.bubbleThem]}>
        <Text style={[chat.text, isMe && chat.textMe]}>{text}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  sheet: { width: '100%', maxWidth: 520, maxHeight: '90%', backgroundColor: '#0d1b2e', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)', overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  truckBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  truckBadgeText: { fontSize: 12, fontWeight: '800' },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 11, color: '#64748b', marginTop: 1 },
  closeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 12, color: '#94a3b8', fontWeight: '700' },
  summaryRow: { flexDirection: 'row', gap: 8, padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  summaryChip: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 8, alignItems: 'center' },
  summaryLabel: { fontSize: 8, color: '#64748b', fontWeight: '700', letterSpacing: 0.5, marginBottom: 3 },
  summaryVal: { fontSize: 14, fontWeight: '900' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#38bdf8' },
  tabText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  tabTextActive: { color: '#38bdf8' },
  body: { flex: 1, maxHeight: 380 },
  pnlWrap: { padding: 16 },
  pnlTitle: { fontSize: 16, fontWeight: '900', color: '#fff', marginBottom: 2 },
  pnlSub: { fontSize: 11, color: '#64748b', marginBottom: 14 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 9, fontWeight: '700', color: '#475569', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  netRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)', marginBottom: 8 },
  netLabel: { fontSize: 14, fontWeight: '900', color: '#fff' },
  netVal: { fontSize: 22, fontWeight: '900' },
  rpmRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  rpmText: { fontSize: 11, color: '#64748b' },
  gradeBox: { padding: 12, borderRadius: 10, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center' },
  gradeText: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  gradeHint: { fontSize: 11, color: '#64748b', textAlign: 'center' },
  chatWrap: { padding: 12 },
  quickReplies: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  quickBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(56,189,248,0.1)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(56,189,248,0.25)' },
  quickBtnText: { fontSize: 11, color: '#38bdf8', fontWeight: '600' },
  doneBtn: { margin: 12, padding: 14, backgroundColor: 'rgba(56,189,248,0.15)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)', alignItems: 'center' },
  doneBtnText: { fontSize: 13, fontWeight: '800', color: '#38bdf8' },
});

const pnl = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  label: { fontSize: 12, color: '#94a3b8' },
  val: { fontSize: 12, fontWeight: '700' },
  bold: { fontWeight: '900', fontSize: 13, color: '#fff' },
});

const chat = StyleSheet.create({
  wrap: { marginBottom: 8 },
  wrapMe: { alignItems: 'flex-end' },
  wrapThem: { alignItems: 'flex-start' },
  name: { fontSize: 10, color: '#64748b', marginBottom: 3, marginLeft: 4 },
  bubble: { maxWidth: '80%', padding: 10, borderRadius: 12 },
  bubbleMe: { backgroundColor: 'rgba(56,189,248,0.15)', borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)' },
  bubbleThem: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  text: { fontSize: 12, color: '#e2e8f0', lineHeight: 18 },
  textMe: { color: '#bae6fd' },
});
