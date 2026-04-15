import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { Notification } from '../store/gameStore';

interface Props {
  visible: boolean;
  notification: Notification | null;
  onClose: () => void;
}

// Парсим данные из текста письма
function parseRateCon(msg: string) {
  const fromMatch = msg.match(/from[:\s]+([A-Za-z\s,]+?)(?:\n|to|→)/i) ||
                    msg.match(/([A-Za-z\s]+)\s*→\s*([A-Za-z\s]+)/i);
  const rateMatch = msg.match(/\$([0-9,]+)/);
  const milesMatch = msg.match(/([0-9,]+)\s*miles/i);
  const weightMatch = msg.match(/([0-9,]+)\s*(?:lbs|lb)/i);
  const pickupMatch = msg.match(/pick\s*up[:\s]+(.+?)(?:\n|deliver)/i);
  const deliverMatch = msg.match(/deliver[y\s]*[:\s]+(.+?)(?:\n|rate|$)/i);
  const commodityMatch = msg.match(/(?:commodity|cargo|freight)[:\s]+(.+?)(?:\n|weight|$)/i);

  return {
    from: fromMatch?.[1]?.trim() || '—',
    to: fromMatch?.[2]?.trim() || '—',
    rate: rateMatch?.[1] || '—',
    miles: milesMatch?.[1] || '—',
    weight: weightMatch?.[1] || '—',
    pickup: pickupMatch?.[1]?.trim() || '—',
    delivery: deliverMatch?.[1]?.trim() || '—',
    commodity: commodityMatch?.[1]?.trim() || 'Dry Van',
  };
}

export default function RateConModal({ visible, notification, onClose }: Props) {
  if (!notification) return null;

  const brokerName = notification.from.split(' - ')[0] || notification.from;
  const brokerCompany = notification.from.split(' - ')[1] || 'Freight LLC';
  const rc = parseRateCon(notification.message);

  // Извлекаем маршрут из темы письма если есть
  const routeMatch = notification.subject.match(/([A-Za-z\s]+)\s*[→\-]\s*([A-Za-z\s]+)/);
  const fromCity = routeMatch?.[1]?.trim() || rc.from;
  const toCity = routeMatch?.[2]?.trim() || rc.to;

  const rcNumber = `RC-${Date.now().toString().slice(-6)}`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>📋 Rate Confirmation</Text>
              <Text style={styles.headerSub}>{notification.subject}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* Документ */}
            <View style={styles.doc}>

              {/* Шапка документа */}
              <View style={styles.docHeader}>
                <View>
                  <Text style={styles.docCompany}>{brokerCompany.toUpperCase()}</Text>
                  <Text style={styles.docType}>RATE CONFIRMATION</Text>
                </View>
                <View style={styles.docMeta}>
                  <Text style={styles.docMetaLabel}>RC #</Text>
                  <Text style={styles.docMetaVal}>{rcNumber}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Брокер */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>BROKER</Text>
                <Text style={styles.sectionVal}>{brokerName}</Text>
                <Text style={styles.sectionSub}>{brokerCompany}</Text>
              </View>

              <View style={styles.divider} />

              {/* Маршрут */}
              <View style={styles.routeRow}>
                <View style={styles.routeCity}>
                  <Text style={styles.routeLabel}>PICKUP</Text>
                  <Text style={styles.routeCityName}>{fromCity}</Text>
                  <Text style={styles.routeTime}>{rc.pickup !== '—' ? rc.pickup : 'See details'}</Text>
                </View>
                <View style={styles.routeArrow}>
                  <Text style={styles.routeArrowText}>→</Text>
                  <Text style={styles.routeMiles}>{rc.miles !== '—' ? `${rc.miles} mi` : ''}</Text>
                </View>
                <View style={styles.routeCity}>
                  <Text style={styles.routeLabel}>DELIVERY</Text>
                  <Text style={styles.routeCityName}>{toCity}</Text>
                  <Text style={styles.routeTime}>{rc.delivery !== '—' ? rc.delivery : 'See details'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Детали груза */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>COMMODITY</Text>
                  <Text style={styles.detailVal}>{rc.commodity}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>WEIGHT</Text>
                  <Text style={styles.detailVal}>{rc.weight !== '—' ? `${rc.weight} lbs` : '—'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>MILES</Text>
                  <Text style={styles.detailVal}>{rc.miles !== '—' ? `${rc.miles} mi` : '—'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>EQUIPMENT</Text>
                  <Text style={styles.detailVal}>Dry Van</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Ставка */}
              <View style={styles.rateRow}>
                <Text style={styles.rateLabel}>AGREED RATE</Text>
                <Text style={styles.rateVal}>${rc.rate !== '—' ? rc.rate : '—'}</Text>
              </View>

              <View style={styles.divider} />

              {/* Оригинальное письмо */}
              <View style={styles.originalMsg}>
                <Text style={styles.originalLabel}>Оригинальное сообщение:</Text>
                <Text style={styles.originalText}>{notification.message}</Text>
              </View>

            </View>
          </ScrollView>

          {/* Кнопки */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeFooterBtn} onPress={onClose}>
              <Text style={styles.closeFooterText}>Закрыть</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={onClose}>
              <Text style={styles.confirmBtnText}>✅ Подтвердить</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#0d1526',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderWidth: 1, borderColor: Colors.border,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  closeBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 14, color: Colors.textMuted },
  scroll: { flex: 1 },

  // Документ
  doc: {
    margin: 12, backgroundColor: '#fff',
    borderRadius: 10, overflow: 'hidden',
  },
  docHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    backgroundColor: '#1a1a2e', padding: 14,
  },
  docCompany: { fontSize: 14, fontWeight: '900', color: '#06b6d4', letterSpacing: 1 },
  docType: { fontSize: 11, color: '#94a3b8', fontWeight: '700', letterSpacing: 2, marginTop: 2 },
  docMeta: { alignItems: 'flex-end' },
  docMetaLabel: { fontSize: 9, color: '#64748b', fontWeight: '700', textTransform: 'uppercase' },
  docMetaVal: { fontSize: 13, color: '#fff', fontWeight: '800' },

  divider: { height: 1, backgroundColor: '#e5e7eb' },

  section: { padding: 12 },
  sectionTitle: { fontSize: 9, color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  sectionVal: { fontSize: 14, fontWeight: '800', color: '#000' },
  sectionSub: { fontSize: 11, color: '#64748b' },

  routeRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, gap: 8,
  },
  routeCity: { flex: 1 },
  routeLabel: { fontSize: 9, color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  routeCityName: { fontSize: 14, fontWeight: '900', color: '#000' },
  routeTime: { fontSize: 10, color: '#64748b', marginTop: 2 },
  routeArrow: { alignItems: 'center', paddingHorizontal: 4 },
  routeArrowText: { fontSize: 20, color: '#06b6d4', fontWeight: '900' },
  routeMiles: { fontSize: 9, color: '#94a3b8', fontWeight: '700' },

  detailsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', padding: 8,
  },
  detailItem: { width: '50%', padding: 6 },
  detailLabel: { fontSize: 9, color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  detailVal: { fontSize: 13, fontWeight: '700', color: '#000' },

  rateRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, backgroundColor: '#f0fdf4',
  },
  rateLabel: { fontSize: 12, fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: 1 },
  rateVal: { fontSize: 24, fontWeight: '900', color: '#16a34a' },

  originalMsg: { padding: 12, backgroundColor: '#f8fafc' },
  originalLabel: { fontSize: 9, color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  originalText: { fontSize: 11, color: '#374151', lineHeight: 17 },

  footer: {
    flexDirection: 'row', gap: 10, padding: 14,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  closeFooterBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  closeFooterText: { fontSize: 14, color: Colors.textMuted, fontWeight: '600' },
  confirmBtn: {
    flex: 2, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#16a34a', alignItems: 'center',
  },
  confirmBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
