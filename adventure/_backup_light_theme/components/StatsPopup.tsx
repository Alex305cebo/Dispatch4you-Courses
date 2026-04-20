import { useGameStore } from '../store/gameStore';
import { Colors } from '../constants/colors';
import { useTheme } from '../hooks/useTheme';

export default function StatsPopup({ onClose }: { onClose: () => void }) {
  const T = useTheme();
  const { trucks, totalEarned, totalLost, financeLog, score, reputation, day, activeLoads, bookedLoads } = useGameStore();

  const profit = totalEarned - totalLost;
  const totalMiles = trucks.reduce((s, t) => s + (t.totalMiles || 0), 0);
  const totalDeliveries = trucks.reduce((s, t) => s + (t.totalDeliveries || 0), 0);
  const avgSafety = trucks.length > 0 ? Math.round(trucks.reduce((s, t) => s + (t.safetyScore || 100), 0) / trucks.length) : 100;
  const hosViolations = trucks.reduce((s, t) => s + (t.hosViolations || 0), 0);
  const perTruck = trucks.length > 0 ? Math.round(profit / trucks.length) : 0;

  const stats = [
    { label: 'День', value: `${day}`, icon: '📅', color: T.primary },
    { label: 'Очки', value: `${score}`, icon: '⭐', color: '#ffd60a' },
    { label: 'Репутация', value: `${reputation}%`, icon: '🏆', color: reputation > 70 ? T.success : T.warning },
    { label: 'Траки', value: `${trucks.length}`, icon: '🚛', color: T.primary },
    { label: 'Доход', value: `$${totalEarned.toLocaleString()}`, icon: '💰', color: T.success },
    { label: 'Расходы', value: `-$${totalLost.toLocaleString()}`, icon: '📉', color: T.danger },
    { label: 'Прибыль', value: `${profit >= 0 ? '+' : ''}$${profit.toLocaleString()}`, icon: '💵', color: profit >= 0 ? T.success : T.danger },
    { label: 'На трак', value: `$${perTruck.toLocaleString()}`, icon: '📊', color: T.primary },
    { label: 'Доставки', value: `${totalDeliveries}`, icon: '📦', color: '#5ac8fa' },
    { label: 'Мили', value: totalMiles.toLocaleString(), icon: '🛣', color: T.purple },
    { label: 'Safety', value: `${avgSafety}%`, icon: '🛡', color: avgSafety >= 90 ? T.success : T.warning },
    { label: 'HOS нарушения', value: `${hosViolations}`, icon: '⚠️', color: hosViolations > 0 ? T.danger : T.success },
  ];

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
        position: 'relative', width: '90%', maxWidth: 440, maxHeight: '85vh',
        overflowY: 'auto', background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.08)', borderRadius: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '24px 20px',
        scrollbarWidth: 'none',
      } as any}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#111827' }}>📈 Статистика</span>
          <span onClick={onClose} style={{ cursor: 'pointer', fontSize: 18, color: '#9ca3af' }}>✕</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } as any}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: `${s.color}0a`, border: `1px solid ${s.color}22`,
              borderRadius: 12, padding: '10px 12px',
            }}>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>{s.icon} {s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Truck breakdown */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#6b7280', marginBottom: 8 }}>🚛 По тракам</div>
          {trucks.map(t => (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
              background: '#f9fafb', border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 8, marginBottom: 4,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#111827' }}>{t.name}</div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>{t.driver}</div>
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'right' } as any}>
                {(t.totalMiles || 0).toLocaleString()} mi · {t.totalDeliveries || 0} дост.
              </div>
              <div style={{
                padding: '3px 6px', borderRadius: 6,
                background: (t.safetyScore || 100) >= 90 ? 'rgba(48,209,88,0.12)' : 'rgba(255,159,10,0.12)',
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 900,
                  color: (t.safetyScore || 100) >= 90 ? T.success : T.warning,
                }}>{t.safetyScore || 100}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
