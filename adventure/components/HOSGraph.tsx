import { Colors } from '../constants/colors';
import { useGameStore } from '../store/gameStore';

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

function getHoursColor(remaining: number): string {
  if (remaining >= 4) return Colors.success;
  if (remaining >= 2) return '#ffd60a';
  return Colors.danger;
}

function Bar({ label, used, total, unit }: { label: string; used: number; total: number; unit?: string }) {
  const remaining = Math.max(0, total - used);
  const pct = Math.min(100, (used / total) * 100);
  const color = getHoursColor(remaining);

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: FONT }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color, fontFamily: FONT }}>
          {used.toFixed(1)}h / {total}h
        </span>
      </div>
      <div style={{
        height: 18, borderRadius: 9, background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 9,
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          transition: 'width 0.4s ease',
        }} />
        {/* remaining label inside bar */}
        <span style={{
          position: 'absolute', right: 8, top: 0, bottom: 0,
          display: 'flex', alignItems: 'center',
          fontSize: 11, fontWeight: 800, color: remaining > 0 ? '#fff' : 'rgba(255,255,255,0.4)',
          fontFamily: FONT, textShadow: '0 1px 3px rgba(0,0,0,0.5)',
        }}>
          {remaining.toFixed(1)}h left
        </span>
      </div>
    </div>
  );
}

export default function HOSGraph({ truck, onClose }: { truck: any; onClose: () => void }) {
  const drivingLimit = 11;
  const onDutyLimit = 14;
  const restRequired = 10;

  const hoursLeft = truck.hoursLeft ?? 11;
  const drivingUsed = drivingLimit - hoursLeft;
  const drivingRemaining = hoursLeft;

  // Estimate on-duty hours (driving + ~1.5h loading/paperwork per delivery cycle)
  const onDutyExtra = Math.min(3, (truck.totalDeliveries || 0) % 5) * 0.5;
  const onDutyUsed = Math.min(onDutyLimit, drivingUsed + onDutyExtra);

  // Rest calculation: if driving used > 8h, driver needs rest soon
  const restTaken = drivingUsed > 8 ? 0 : Math.min(restRequired, restRequired * (1 - drivingUsed / drivingLimit));

  const violations = truck.hosViolations ?? 0;
  const compliance = truck.complianceRate ?? 100;

  const statusColor = drivingRemaining >= 4 ? Colors.success : drivingRemaining >= 2 ? '#ffd60a' : Colors.danger;
  const statusLabel = drivingRemaining >= 4 ? '✅ Compliant' : drivingRemaining >= 2 ? '⚠️ Running Low' : '🚨 Critical';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT,
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      }} />

      {/* Modal */}
      <div style={{
        position: 'relative', width: '92%', maxWidth: 460, maxHeight: '88vh',
        overflowY: 'auto', background: 'linear-gradient(170deg, #1a1f2e, #0d1117)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)', padding: '24px 20px',
        scrollbarWidth: 'none',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>⏱ HOS Status</span>
            <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>
              {truck.name} · {truck.driver}
            </div>
          </div>
          <span onClick={onClose} style={{
            cursor: 'pointer', fontSize: 18, color: '#94a3b8',
            width: 28, height: 28, borderRadius: 14, background: 'rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</span>
        </div>

        {/* Status badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', borderRadius: 12, marginBottom: 18,
          background: `${statusColor}0a`, border: `1px solid ${statusColor}22`,
        }}>
          <span style={{ fontSize: 14 }}>{statusLabel.split(' ')[0]}</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: statusColor }}>
            {statusLabel.split(' ').slice(1).join(' ')}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 800, color: statusColor }}>
            {drivingRemaining.toFixed(1)}h available
          </span>
        </div>

        {/* Driving limit bar */}
        <Bar label="🚛 Driving (11h limit)" used={drivingUsed} total={drivingLimit} />

        {/* On-duty limit bar */}
        <Bar label="📋 On-Duty (14h limit)" used={onDutyUsed} total={onDutyLimit} />

        {/* Rest period */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: FONT }}>😴 Required Rest (10h)</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: Colors.primary, fontFamily: FONT }}>
              {restTaken.toFixed(1)}h taken
            </span>
          </div>
          <div style={{
            height: 18, borderRadius: 9, background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${(restTaken / restRequired) * 100}%`, borderRadius: 9,
              background: `linear-gradient(90deg, ${Colors.primary}cc, ${Colors.primary})`,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 18 }}>
          <div style={{
            background: violations > 0 ? 'rgba(255,69,58,0.08)' : 'rgba(48,209,88,0.08)',
            border: `1px solid ${violations > 0 ? 'rgba(255,69,58,0.2)' : 'rgba(48,209,88,0.2)'}`,
            borderRadius: 12, padding: '10px 12px',
          }}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>⚠️ Violations</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: violations > 0 ? Colors.danger : Colors.success }}>
              {violations}
            </div>
          </div>
          <div style={{
            background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.2)',
            borderRadius: 12, padding: '10px 12px',
          }}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>📊 Compliance</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: compliance >= 95 ? Colors.success : Colors.warning }}>
              {compliance}%
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '10px 12px',
          }}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>🛣 Total Miles</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>
              {(truck.totalMiles || 0).toLocaleString()}
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '10px 12px',
          }}>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>📦 Deliveries</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>
              {truck.totalDeliveries || 0}
            </div>
          </div>
        </div>

        {/* FMCSA note */}
        <div style={{
          marginTop: 16, padding: '10px 12px', borderRadius: 10,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700, color: '#fff' }}>FMCSA Rules:</span>{' '}
            11h driving / 14h on-duty window / 10h consecutive rest required.
            30-min break required after 8h driving.
          </div>
        </div>
      </div>
    </div>
  );
}
