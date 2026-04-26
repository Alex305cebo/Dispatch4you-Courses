import { useGameStore } from '../store/gameStore';
import { useTheme } from '../hooks/useTheme';
import { useThemeStore } from '../store/themeStore';

export default function StatsPopup({ onClose }: { onClose: () => void }) {
  const T = useTheme();
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';
  const { trucks, totalEarned, totalLost, score, reputation, day } = useGameStore();

  const profit = totalEarned - totalLost;
  const totalMiles = trucks.reduce((s, t) => s + (t.totalMiles || 0), 0);
  const totalDeliveries = trucks.reduce((s, t) => s + (t.totalDeliveries || 0), 0);
  const avgSafety = trucks.length > 0 ? Math.round(trucks.reduce((s, t) => s + (t.safetyScore || 100), 0) / trucks.length) : 100;
  const hosViolations = trucks.reduce((s, t) => s + (t.hosViolations || 0), 0);
  const perTruck = trucks.length > 0 ? Math.round(profit / trucks.length) : 0;

  const BG     = isDark ? '#0d1117' : '#ffffff';
  const SURF   = isDark ? '#161b22' : '#f9fafb';
  const BORDER = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const TEXT1  = isDark ? '#e2e8f0' : '#111827';
  const TEXT2  = isDark ? '#94a3b8' : '#6b7280';
  const TEXT3  = isDark ? '#64748b' : '#9ca3af';

  const stats = [
    { label: 'День', value: `${day}`, icon: '📅', color: T.primary },
    { label: 'Очки', value: `${score}`, icon: '⭐', color: '#fbbf24' },
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
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      } as any} />
      <div style={{
        position: 'relative', width: '90%', maxWidth: 440, maxHeight: '85vh',
        overflowY: 'auto', background: BG,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: 20,
        boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.8)' : '0 8px 32px rgba(0,0,0,0.12)',
        padding: '20px',
        scrollbarWidth: 'none',
      } as any}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 17, fontWeight: 900, color: TEXT1 }}>📈 Статистика</span>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: '50%',
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${BORDER}`,
            cursor: 'pointer', fontSize: 16, color: TEXT2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } as any}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: `${s.color}${isDark ? '18' : '0a'}`,
              border: `1px solid ${s.color}${isDark ? '30' : '22'}`,
              borderRadius: 12, padding: '10px 12px',
            }}>
              <div style={{ fontSize: 10, color: TEXT3, fontWeight: 600, marginBottom: 4 }}>{s.icon} {s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Trucks */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: TEXT2, marginBottom: 8 }}>🚛 По тракам</div>
          {trucks.map(t => (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
              background: SURF, border: `1px solid ${BORDER}`,
              borderRadius: 8, marginBottom: 4,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: TEXT1 }}>{t.name}</div>
                <div style={{ fontSize: 10, color: TEXT3 }}>{t.driver}</div>
              </div>
              <div style={{ fontSize: 11, color: TEXT2, textAlign: 'right' } as any}>
                {(t.totalMiles || 0).toLocaleString()} mi · {t.totalDeliveries || 0} дост.
              </div>
              <div style={{
                padding: '3px 6px', borderRadius: 6,
                background: (t.safetyScore || 100) >= 90 ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.15)',
              }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: (t.safetyScore || 100) >= 90 ? T.success : T.warning }}>
                  {t.safetyScore || 100}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
