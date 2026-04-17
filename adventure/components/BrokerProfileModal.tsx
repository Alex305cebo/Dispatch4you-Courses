import { useGameStore, Broker } from '../store/gameStore';
import { Colors } from '../constants/colors';

interface Props {
  broker: Broker;
  onClose: () => void;
}

export default function BrokerProfileModal({ broker, onClose }: Props) {
  const { financeLog, notifications } = useGameStore();

  // Calculate stats from finance log
  const brokerDeals = financeLog.filter(f =>
    f.type === 'income' && f.description.toLowerCase().includes(broker.company.toLowerCase())
  );
  const totalRevenue = brokerDeals.reduce((s, f) => s + f.amount, 0);
  const avgDeal = brokerDeals.length > 0 ? Math.round(totalRevenue / brokerDeals.length) : 0;

  // Relationship color
  const relColor = broker.relationship >= 70 ? Colors.success
    : broker.relationship >= 40 ? Colors.warning : Colors.danger;
  const relLabel = broker.relationship >= 80 ? 'Excellent'
    : broker.relationship >= 60 ? 'Good'
    : broker.relationship >= 40 ? 'Neutral'
    : broker.relationship >= 20 ? 'Strained' : 'Poor';

  // Recent communications
  const recentComms = notifications
    .filter(n => n.from.toLowerCase().includes(broker.name.toLowerCase()) ||
                 n.from.toLowerCase().includes(broker.company.toLowerCase()))
    .slice(-5).reverse();

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      } as any} />
      <div style={{
        position: 'relative', width: '90%', maxWidth: 420, maxHeight: '85vh',
        overflowY: 'auto', background: 'linear-gradient(170deg, #1a1f2e, #0d1117)',
        border: '1px solid rgba(10,132,255,0.2)', borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)', padding: '24px 20px',
        scrollbarWidth: 'none',
      } as any}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 24,
              background: `linear-gradient(135deg, ${Colors.primary}33, ${Colors.primary}11)`,
              border: `2px solid ${Colors.primary}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>{broker.avatar || '👤'}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{broker.name}</div>
              <div style={{ fontSize: 12, color: Colors.primary, fontWeight: 700 }}>{broker.company}</div>
            </div>
          </div>
          <span onClick={onClose} style={{ cursor: 'pointer', fontSize: 18, color: '#64748b' }}>✕</span>
        </div>

        {/* Relationship bar */}
        <div style={{
          background: `${relColor}0a`, border: `1px solid ${relColor}22`,
          borderRadius: 14, padding: '12px 14px', marginBottom: 14,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>🤝 Relationship</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: relColor }}>{relLabel} · {broker.relationship}%</span>
          </div>
          <div style={{
            height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${broker.relationship}%`, borderRadius: 4,
              background: `linear-gradient(90deg, ${relColor}88, ${relColor})`,
              transition: 'width 0.4s',
            }} />
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Loads Done', value: broker.loadsCompleted.toString(), icon: '📦', color: Colors.success },
            { label: 'Calls Answered', value: broker.callsAnswered.toString(), icon: '📞', color: Colors.primary },
            { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: '💰', color: Colors.success },
            { label: 'Avg Deal', value: avgDeal > 0 ? `$${avgDeal.toLocaleString()}` : 'N/A', icon: '📊', color: '#5ac8fa' },
          ].map((s, i) => (
            <div key={i} style={{
              background: `${s.color}08`, border: `1px solid ${s.color}18`,
              borderRadius: 12, padding: '10px 12px',
            }}>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>{s.icon} {s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Negotiation tips */}
        <div style={{
          background: 'rgba(255,214,10,0.06)', border: '1px solid rgba(255,214,10,0.15)',
          borderRadius: 12, padding: '10px 12px', marginBottom: 14,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: Colors.warning, marginBottom: 4 }}>💡 Negotiation Tips</div>
          <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>
            {broker.relationship >= 70
              ? 'Strong relationship — broker likely to accept fair offers. Can push for better rates.'
              : broker.relationship >= 40
              ? 'Neutral relationship — standard negotiation. Don\'t lowball too aggressively.'
              : 'Weak relationship — be careful. Broker may reject reasonable offers. Build trust first.'}
          </div>
        </div>

        {/* Recent communications */}
        {recentComms.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', marginBottom: 8 }}>📧 Recent Messages</div>
            {recentComms.map((n, i) => (
              <div key={i} style={{
                padding: '6px 10px', marginBottom: 4,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>{n.subject}</div>
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                  {n.message.substring(0, 80)}{n.message.length > 80 ? '...' : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
