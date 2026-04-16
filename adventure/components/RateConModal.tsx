import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useState } from 'react';
import { Colors } from '../constants/colors';
import { Notification, ActiveLoad } from '../store/gameStore';
import { useGameStore } from '../store/gameStore';

interface Props {
  visible: boolean;
  notification: Notification | null;
  onClose: () => void;
}

// Парсим данные из текста письма как fallback
function parseFromMessage(msg: string, subject: string) {
  const routeMatch = subject.match(/([A-Za-z\s]+)\s*[→\-]\s*([A-Za-z\s]+)/);
  const rateMatch = msg.match(/\$([0-9,]+)/);
  const milesMatch = msg.match(/([0-9,]+)\s*miles/i);
  const weightMatch = msg.match(/([0-9,]+)\s*(?:lbs|lb)/i);
  const pickupMatch = msg.match(/pick\s*up[:\s]+(.+?)(?:\n|deliver|$)/i);
  const deliverMatch = msg.match(/deliver[y\s]*[:\s]+(.+?)(?:\n|rate|$)/i);
  const commodityMatch = msg.match(/(?:commodity|cargo|freight)[:\s]+(.+?)(?:\n|weight|$)/i);
  return {
    fromCity: routeMatch?.[1]?.trim() || 'Chicago, IL',
    toCity: routeMatch?.[2]?.trim() || 'Houston, TX',
    rate: rateMatch?.[1] || '2,450',
    miles: milesMatch?.[1] || '—',
    weight: weightMatch?.[1] || '—',
    pickup: pickupMatch?.[1]?.trim() || '08:00 - 14:00',
    delivery: deliverMatch?.[1]?.trim() || 'See details',
    commodity: commodityMatch?.[1]?.trim() || 'General Freight',
    equipment: 'Dry Van 53\'',
  };
}

export default function RateConModal({ visible, notification, onClose }: Props) {
  if (!notification) return null;

  const trucks = useGameStore(s => s.trucks);

  // Ищем связанный груз через truckId или relatedLoadId
  let load: ActiveLoad | null = null;
  if (notification.relatedTruckId) {
    const truck = trucks.find(t => t.id === notification.relatedTruckId);
    if (truck?.currentLoad) load = truck.currentLoad;
  }
  if (!load) {
    for (const truck of trucks) {
      if (truck.currentLoad) { load = truck.currentLoad; break; }
    }
  }

  const brokerName = load?.brokerName || notification.from.split(' (')[0] || notification.from;
  const brokerCompany = load?.brokerCompany || notification.from.split(' - ')[1] || 'Freight Solutions LLC';
  const parsed = parseFromMessage(notification.message, notification.subject);

  const fromCity = load?.fromCity || parsed.fromCity;
  const toCity = load?.toCity || parsed.toCity;
  const commodity = load?.commodity || parsed.commodity;
  const weight = load ? `${load.weight.toLocaleString()} lbs` : (parsed.weight !== '—' ? `${parsed.weight} lbs` : '—');
  const miles = load ? `${load.miles.toLocaleString()} mi` : (parsed.miles !== '—' ? `${parsed.miles} mi` : '—');
  const equipment = load?.equipment || parsed.equipment;
  const agreedRate = load?.agreedRate || parseInt(parsed.rate.replace(',', '')) || 0;
  const pickupTime = load?.pickupTime || parsed.pickup;
  const deliveryTime = load?.deliveryTime || parsed.delivery;
  const rpmRaw = load && load.miles > 0 ? (agreedRate / load.miles) : null;
  const rpm = rpmRaw ? `$${rpmRaw.toFixed(2)}/mi` : '—';

  const rcNumber = `RC-${Date.now().toString().slice(-6)}`;
  const today = new Date();
  const dateStr = `${String(today.getMonth()+1).padStart(2,'0')}/${String(today.getDate()).padStart(2,'0')}/${today.getFullYear()}`;

  const [signed, setSigned] = useState(false);
  const signedDate = dateStr;
  const signedTime = `${today.getHours()}:${String(today.getMinutes()).padStart(2,'0')}`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.modal}>

          {/* App Header */}
          <View style={s.appHeader}>
            <View>
              <Text style={s.appHeaderTitle}>📋 Rate Confirmation</Text>
              <Text style={s.appHeaderSub}>{notification.subject}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
            <View style={s.doc}>

              {/* ── ШАПКА ДОКУМЕНТА ── */}
              <View style={s.docTop}>
                <View style={s.docTopLeft}>
                  <Text style={s.docBrokerName}>{brokerCompany.toUpperCase()}</Text>
                  <Text style={s.docTitle}>RATE CONFIRMATION</Text>
                  <Text style={s.docSubtitle}>Broker-Carrier Agreement</Text>
                </View>
                <View style={s.docTopRight}>
                  {signed && (
                    <View style={s.signedStamp}>
                      <Text style={s.signedStampText}>✓ SIGNED</Text>
                    </View>
                  )}
                  <Text style={s.docMetaLabel}>LOAD #</Text>
                  <Text style={s.docMetaVal}>{rcNumber}</Text>
                  <Text style={[s.docMetaLabel, {marginTop: 6}]}>DATE</Text>
                  <Text style={s.docMetaVal}>{dateStr}</Text>
                </View>
              </View>

              <View style={s.divider} />

              {/* ── BROKER / CARRIER ── */}
              <View style={s.twoCol}>
                <View style={s.colBox}>
                  <Text style={s.colBoxLabel}>BROKER</Text>
                  <Text style={s.colBoxName}>{brokerName}</Text>
                  <Text style={s.colBoxCompany}>{brokerCompany}</Text>
                  <Text style={s.colBoxDetail}>MC# 295957 · DOT# 802616</Text>
                  <Text style={s.colBoxDetail}>Phone: (513) 831-2600</Text>
                </View>
                <View style={[s.colBox, s.colBoxRight]}>
                  <Text style={s.colBoxLabel}>CARRIER</Text>
                  <Text style={s.colBoxName}>Your Trucking Co. LLC</Text>
                  <Text style={s.colBoxCompany}>Dallas, TX 75201</Text>
                  <Text style={s.colBoxDetail}>MC# 1234567 · DOT# 7654321</Text>
                  <Text style={s.colBoxDetail}>Phone: (555) 123-4567</Text>
                </View>
              </View>

              <View style={s.divider} />

              {/* ── SUMMARY ROW ── */}
              <View style={s.summaryRow}>
                <View style={s.summaryItem}>
                  <Text style={s.summaryLabel}>DATE</Text>
                  <Text style={s.summaryVal}>{dateStr}</Text>
                </View>
                <View style={s.summaryItem}>
                  <Text style={s.summaryLabel}>EQUIPMENT</Text>
                  <Text style={s.summaryVal}>{equipment}</Text>
                </View>
                <View style={s.summaryItem}>
                  <Text style={s.summaryLabel}>COMMODITY</Text>
                  <Text style={s.summaryVal}>{commodity}</Text>
                </View>
                <View style={[s.summaryItem, s.summaryItemRate]}>
                  <Text style={s.summaryLabel}>TOTAL RATE</Text>
                  <Text style={s.summaryValRate}>${agreedRate.toLocaleString()}.00</Text>
                </View>
              </View>

              <View style={s.divider} />

              {/* ── PICKUP ── */}
              <View style={s.stopBlock}>
                <View style={s.stopBadge}>
                  <Text style={s.stopBadgeText}>PICKUP</Text>
                </View>
                <Text style={s.stopCity}>{fromCity}</Text>
                <Text style={s.stopAddress}>Shipper Warehouse · {fromCity}</Text>
                <View style={s.stopDetails}>
                  <View style={s.stopDetailItem}>
                    <Text style={s.stopDetailLabel}>TIME WINDOW</Text>
                    <Text style={s.stopDetailVal}>{pickupTime}</Text>
                  </View>
                  <View style={s.stopDetailItem}>
                    <Text style={s.stopDetailLabel}>CONTACT</Text>
                    <Text style={s.stopDetailVal}>Dock Manager</Text>
                  </View>
                  <View style={s.stopDetailItem}>
                    <Text style={s.stopDetailLabel}>PHONE</Text>
                    <Text style={s.stopDetailVal}>(312) 555-0100</Text>
                  </View>
                </View>
              </View>

              <View style={s.routeArrowRow}>
                <View style={s.routeArrowLine} />
                <Text style={s.routeArrowIcon}>▼</Text>
                <Text style={s.routeArrowMiles}>{miles}</Text>
                <View style={s.routeArrowLine} />
              </View>

              {/* ── DELIVERY ── */}
              <View style={s.stopBlock}>
                <View style={[s.stopBadge, s.stopBadgeDelivery]}>
                  <Text style={s.stopBadgeText}>DELIVERY</Text>
                </View>
                <Text style={s.stopCity}>{toCity}</Text>
                <Text style={s.stopAddress}>Distribution Center · {toCity}</Text>
                <View style={s.stopDetails}>
                  <View style={s.stopDetailItem}>
                    <Text style={s.stopDetailLabel}>TIME WINDOW</Text>
                    <Text style={s.stopDetailVal}>{deliveryTime}</Text>
                  </View>
                  <View style={s.stopDetailItem}>
                    <Text style={s.stopDetailLabel}>CONTACT</Text>
                    <Text style={s.stopDetailVal}>Receiving Dept.</Text>
                  </View>
                  <View style={s.stopDetailItem}>
                    <Text style={s.stopDetailLabel}>PHONE</Text>
                    <Text style={s.stopDetailVal}>(404) 555-0200</Text>
                  </View>
                </View>
              </View>

              <View style={s.divider} />

              {/* ── COMMODITY DETAILS ── */}
              <View style={s.section}>
                <Text style={s.sectionTitle}>COMMODITY DETAILS</Text>
                <View style={s.detailsGrid}>
                  <View style={s.detailItem}>
                    <Text style={s.detailLabel}>Description</Text>
                    <Text style={s.detailVal}>{commodity}</Text>
                  </View>
                  <View style={s.detailItem}>
                    <Text style={s.detailLabel}>Weight</Text>
                    <Text style={s.detailVal}>{weight}</Text>
                  </View>
                  <View style={s.detailItem}>
                    <Text style={s.detailLabel}>Miles</Text>
                    <Text style={s.detailVal}>{miles}</Text>
                  </View>
                  <View style={s.detailItem}>
                    <Text style={s.detailLabel}>Rate/Mile</Text>
                    <Text style={s.detailVal}>{rpm}</Text>
                  </View>
                  <View style={s.detailItem}>
                    <Text style={s.detailLabel}>Equipment</Text>
                    <Text style={s.detailVal}>{equipment}</Text>
                  </View>
                  <View style={s.detailItem}>
                    <Text style={s.detailLabel}>Pieces</Text>
                    <Text style={s.detailVal}>—</Text>
                  </View>
                </View>
                <View style={s.specialInstr}>
                  <Text style={s.specialInstrLabel}>Special Instructions:</Text>
                  <Text style={s.specialInstrVal}>No stacking · Handle with care · Driver assist if required</Text>
                </View>
              </View>

              <View style={s.divider} />

              {/* ── PAYMENT & TERMS ── */}
              <View style={s.section}>
                <Text style={s.sectionTitle}>PAYMENT & ADDITIONAL TERMS</Text>
                <View style={s.paymentGrid}>
                  <View style={s.paymentRow}>
                    <Text style={s.paymentKey}>Payment Terms:</Text>
                    <Text style={s.paymentVal}>Net 30 days from invoice date</Text>
                  </View>
                  <View style={s.paymentRow}>
                    <Text style={s.paymentKey}>Quick Pay:</Text>
                    <Text style={s.paymentVal}>Available — 2% discount (within 5 days)</Text>
                  </View>
                  <View style={s.paymentRow}>
                    <Text style={s.paymentKey}>Detention:</Text>
                    <Text style={s.paymentVal}>$75/hour after 2 hours free time</Text>
                  </View>
                  <View style={s.paymentRow}>
                    <Text style={s.paymentKey}>TONU:</Text>
                    <Text style={s.paymentVal}>$250 if cancelled after dispatch</Text>
                  </View>
                  <View style={s.paymentRow}>
                    <Text style={s.paymentKey}>POD Deadline:</Text>
                    <Text style={[s.paymentVal, s.paymentValWarn]}>Within 48 hours of delivery</Text>
                  </View>
                  <View style={s.paymentRow}>
                    <Text style={s.paymentKey}>Lumper:</Text>
                    <Text style={s.paymentVal}>Carrier responsible — keep receipt</Text>
                  </View>
                </View>
              </View>

              <View style={s.divider} />

              {/* ── AGREED RATE BOX ── */}
              <View style={s.rateBox}>
                <View>
                  <Text style={s.rateBoxLabel}>AGREED RATE</Text>
                  <Text style={s.rateBoxSub}>{fromCity} → {toCity} · {miles}</Text>
                </View>
                <Text style={s.rateBoxVal}>${agreedRate.toLocaleString()}.00</Text>
              </View>

              <View style={s.divider} />

              {/* ── LEGAL ── */}
              <View style={s.legalBlock}>
                <Text style={s.legalText}>
                  By accepting this load, Carrier agrees to all terms and conditions outlined in the Broker-Carrier Agreement on file.
                  Carrier certifies proper authority, insurance coverage ($1,000,000 min. liability, $100,000 min. cargo), and qualified drivers.
                  This Rate Confirmation constitutes a binding contract between Broker and Carrier.
                </Text>
                <View style={s.sigRow}>
                  <View style={s.sigBox}>
                    <Text style={s.sigLabel}>CARRIER SIGNATURE</Text>
                    {signed ? (
                      <>
                        <Text style={s.sigActual}>Your Trucking Co.</Text>
                        <View style={s.sigLine} />
                        <Text style={s.sigSub}>Print Name: Dispatcher</Text>
                        <Text style={s.sigSub}>Date: {signedDate} {signedTime}</Text>
                      </>
                    ) : (
                      <>
                        <View style={s.sigLine} />
                        <Text style={s.sigSub}>Print Name: _______________</Text>
                        <Text style={s.sigSub}>Date: _______________</Text>
                      </>
                    )}
                  </View>
                  <View style={s.sigBox}>
                    <Text style={s.sigLabel}>BROKER SIGNATURE</Text>
                    <Text style={s.sigActual}>{brokerName}</Text>
                    <View style={s.sigLine} />
                    <Text style={s.sigSub}>Print Name: {brokerName}</Text>
                    <Text style={s.sigSub}>Date: {dateStr}</Text>
                  </View>
                </View>
              </View>

            </View>
          </ScrollView>

          {/* Footer */}
          <View style={s.footer}>
            <TouchableOpacity style={s.closeFooterBtn} onPress={onClose}>
              <Text style={s.closeFooterText}>Закрыть</Text>
            </TouchableOpacity>
            {!signed ? (
              <TouchableOpacity style={s.signBtn} onPress={() => setSigned(true)} activeOpacity={0.85}>
                <Text style={s.signBtnText}>✍️ Подписать Rate Con</Text>
              </TouchableOpacity>
            ) : (
              <View style={s.signedBanner}>
                <Text style={s.signedBannerText}>✅ Rate Con подписан</Text>
                <Text style={s.signedBannerSub}>{signedDate} · {signedTime}</Text>
              </View>
            )}
          </View>

        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modal: { backgroundColor: '#0d1526', borderRadius: 16, borderWidth: 1, borderColor: Colors.border, width: '100%', maxWidth: 720, maxHeight: '92%' },

  appHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  appHeaderTitle: { fontSize: 16, fontWeight: '900', color: '#fff' },
  appHeaderSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  closeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 14, color: Colors.textMuted },
  scroll: { flex: 1 },

  // Документ (белый фон)
  doc: { margin: 10, backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden' },

  // Шапка документа
  docTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: '#1a1a2e', padding: 16 },
  docTopLeft: {},
  docTopRight: { alignItems: 'flex-end' },
  docBrokerName: { fontSize: 13, fontWeight: '900', color: '#06b6d4', letterSpacing: 1 },
  docTitle: { fontSize: 16, fontWeight: '900', color: '#fff', marginTop: 2, letterSpacing: 1.5 },
  docSubtitle: { fontSize: 10, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
  docMetaLabel: { fontSize: 9, color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  docMetaVal: { fontSize: 13, color: '#fff', fontWeight: '800' },

  divider: { height: 1, backgroundColor: '#e5e7eb' },

  // Broker / Carrier
  twoCol: { flexDirection: 'row' },
  colBox: { flex: 1, padding: 12 },
  colBoxRight: { borderLeftWidth: 1, borderLeftColor: '#e5e7eb' },
  colBoxLabel: { fontSize: 9, color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  colBoxName: { fontSize: 13, fontWeight: '800', color: '#000' },
  colBoxCompany: { fontSize: 11, color: '#374151', marginTop: 1 },
  colBoxDetail: { fontSize: 10, color: '#64748b', marginTop: 2 },

  // Summary row
  summaryRow: { flexDirection: 'row', backgroundColor: '#f8fafc' },
  summaryItem: { flex: 1, padding: 10, borderRightWidth: 1, borderRightColor: '#e5e7eb' },
  summaryItemRate: { borderRightWidth: 0, backgroundColor: '#f0fdf4' },
  summaryLabel: { fontSize: 8, color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 },
  summaryVal: { fontSize: 11, fontWeight: '700', color: '#000' },
  summaryValRate: { fontSize: 14, fontWeight: '900', color: '#16a34a' },

  // Stop blocks
  stopBlock: { padding: 14 },
  stopBadge: { alignSelf: 'flex-start', backgroundColor: '#000', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6 },
  stopBadgeDelivery: { backgroundColor: '#1e3a5f' },
  stopBadgeText: { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
  stopCity: { fontSize: 16, fontWeight: '900', color: '#000', marginBottom: 2 },
  stopAddress: { fontSize: 11, color: '#64748b', marginBottom: 8 },
  stopDetails: { flexDirection: 'row', gap: 0 },
  stopDetailItem: { flex: 1 },
  stopDetailLabel: { fontSize: 8, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  stopDetailVal: { fontSize: 11, fontWeight: '700', color: '#000' },

  // Route arrow
  routeArrowRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 4, backgroundColor: '#f8fafc' },
  routeArrowLine: { flex: 1, height: 1, backgroundColor: '#06b6d4' },
  routeArrowIcon: { fontSize: 14, color: '#06b6d4', marginHorizontal: 8 },
  routeArrowMiles: { fontSize: 10, color: '#06b6d4', fontWeight: '700', marginHorizontal: 4 },

  // Section
  section: { padding: 14 },
  sectionTitle: { fontSize: 9, color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },

  // Commodity details grid
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  detailItem: { width: '33.33%', paddingVertical: 5, paddingRight: 8 },
  detailLabel: { fontSize: 8, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  detailVal: { fontSize: 12, fontWeight: '700', color: '#000' },
  specialInstr: { backgroundColor: '#fef9c3', borderRadius: 6, padding: 8, borderLeftWidth: 3, borderLeftColor: '#f59e0b' },
  specialInstrLabel: { fontSize: 9, fontWeight: '800', color: '#92400e', textTransform: 'uppercase', marginBottom: 2 },
  specialInstrVal: { fontSize: 11, color: '#78350f', fontWeight: '600' },

  // Payment terms
  paymentGrid: { gap: 6 },
  paymentRow: { flexDirection: 'row', gap: 8 },
  paymentKey: { fontSize: 11, fontWeight: '700', color: '#374151', minWidth: 110 },
  paymentVal: { fontSize: 11, color: '#374151', flex: 1 },
  paymentValWarn: { color: '#dc2626', fontWeight: '700' },

  // Agreed rate box
  rateBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f0fdf4' },
  rateBoxLabel: { fontSize: 12, fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: 1 },
  rateBoxSub: { fontSize: 10, color: '#4ade80', marginTop: 2 },
  rateBoxVal: { fontSize: 28, fontWeight: '900', color: '#16a34a' },

  // Legal
  legalBlock: { padding: 14, backgroundColor: '#f8fafc' },
  legalText: { fontSize: 9, color: '#64748b', lineHeight: 14, marginBottom: 14 },
  sigRow: { flexDirection: 'row', gap: 12 },
  sigBox: { flex: 1 },
  sigLabel: { fontSize: 8, fontWeight: '800', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  sigLine: { height: 1, backgroundColor: '#000', marginBottom: 6 },
  sigSub: { fontSize: 9, color: '#64748b', marginBottom: 3 },

  // Footer
  footer: { flexDirection: 'row', gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  closeFooterBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  closeFooterText: { fontSize: 14, color: Colors.textMuted, fontWeight: '600' },
  signBtn: { flex: 2, paddingVertical: 12, borderRadius: 12, backgroundColor: '#1d4ed8', alignItems: 'center', borderWidth: 1, borderColor: '#3b82f6' },
  signBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  signedBanner: { flex: 2, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(34,197,94,0.12)', borderWidth: 1.5, borderColor: '#22c55e', alignItems: 'center', justifyContent: 'center' },
  signedBannerText: { fontSize: 14, fontWeight: '900', color: '#4ade80' },
  signedBannerSub: { fontSize: 10, color: '#86efac', marginTop: 2 },

  // Signed stamp on document
  signedStamp: { alignSelf: 'flex-end', backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 2, borderColor: '#22c55e', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8, transform: [{ rotate: '-8deg' }] },
  signedStampText: { fontSize: 13, fontWeight: '900', color: '#16a34a', letterSpacing: 2 },

  // Signature actual text
  sigActual: { fontSize: 16, fontFamily: 'serif', color: '#1e3a5f', fontStyle: 'italic', marginBottom: 2 },
});
