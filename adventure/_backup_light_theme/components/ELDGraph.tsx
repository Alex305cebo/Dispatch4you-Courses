import { Colors } from '../constants/colors';
import { useGameStore } from '../store/gameStore';

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

type DutyStatus = 'off_duty' | 'sleeper' | 'driving' | 'on_duty';

interface ELDSegment {
  status: DutyStatus;
  startHour: number; // 0-24
  endHour: number;
}

const STATUS_CONFIG: Record<DutyStatus, { label: string; color: string; icon: string }> = {
  off_duty: { label: 'Off Duty', color: '#64748b', icon: '🏠' },
  sleeper:  { label: 'Sleeper Berth', color: Colors.primary, icon: '😴' },
  driving:  { label: 'Driving', color: Colors.success, icon: '🚛' },
  on_duty:  { label: 'On Duty (Not Driving)', color: '#ffd60a', icon: '📋' },
};

function generateELDData(truck: any): ELDSegment[] {
  const hoursLeft = truck.hoursLeft ?? 11;
  const drivingUsed = 11 - hoursLeft;
  const status = truck.status;
  const segments: ELDSegment[] = [];

  // Build a realistic 24h ELD log based on truck state
  // Midnight to early morning: sleeper/off-duty
  if (drivingUsed <= 2) {
    // Driver started recently — mostly resting
    segments.push({ status: 'off_duty', startHour: 0, endHour: 1 });
    segments.push({ status: 'sleeper', startHour: 1, endHour: 7 });
    segments.push({ status: 'on_duty', startHour: 7, endHour: 7.5 }); // pre-trip
    if (status === 'driving' || status === 'loaded') {
      segments.push({ status: 'driving', startHour: 7.5, endHour: 7.5 + drivingUsed });
      const now = 7.5 + drivingUsed;
      if (now < 24) segments.push({ status: status === 'idle' ? 'off_duty' : 'driving', startHour: now, endHour: Math.min(24, now + 0.5) });
    } else if (status === 'at_pickup' || status === 'at_delivery') {
      segments.push({ status: 'on_duty', startHour: 7.5, endHour: 8.5 + drivingUsed });
    } else {
      segments.push({ status: 'off_duty', startHour: 7.5, endHour: 24 });
    }
  } else if (drivingUsed <= 6) {
    // Mid-shift driver
    segments.push({ status: 'sleeper', startHour: 0, endHour: 5 });
    segments.push({ status: 'off_duty', startHour: 5, endHour: 5.5 });
    segments.push({ status: 'on_duty', startHour: 5.5, endHour: 6 }); // pre-trip
    segments.push({ status: 'driving', startHour: 6, endHour: 6 + Math.min(4, drivingUsed) });
    const breakStart = 6 + Math.min(4, drivingUsed);
    segments.push({ status: 'on_duty', startHour: breakStart, endHour: breakStart + 0.5 }); // fuel/break
    const resumeAt = breakStart + 0.5;
    const remainDriving = Math.max(0, drivingUsed - 4);
    if (remainDriving > 0) {
      segments.push({ status: 'driving', startHour: resumeAt, endHour: resumeAt + remainDriving });
    }
    if (status === 'at_pickup' || status === 'at_delivery') {
      const onDutyStart = resumeAt + remainDriving;
      segments.push({ status: 'on_duty', startHour: onDutyStart, endHour: Math.min(24, onDutyStart + 1) });
    }
  } else {
    // Heavy driving day
    segments.push({ status: 'sleeper', startHour: 0, endHour: 4 });
    segments.push({ status: 'on_duty', startHour: 4, endHour: 4.5 }); // pre-trip
    segments.push({ status: 'driving', startHour: 4.5, endHour: 8.5 }); // 4h block
    segments.push({ status: 'on_duty', startHour: 8.5, endHour: 9 }); // 30-min break
    segments.push({ status: 'driving', startHour: 9, endHour: 9 + Math.min(4, drivingUsed - 4) });
    const block2End = 9 + Math.min(4, drivingUsed - 4);
    const remainDriving = Math.max(0, drivingUsed - 8);
    if (remainDriving > 0) {
      segments.push({ status: 'on_duty', startHour: block2End, endHour: block2End + 0.5 });
      segments.push({ status: 'driving', startHour: block2End + 0.5, endHour: block2End + 0.5 + remainDriving });
    }
    if (status === 'idle') {
      const offStart = block2End + (remainDriving > 0 ? 0.5 + remainDriving : 0);
      segments.push({ status: 'off_duty', startHour: offStart, endHour: Math.min(24, offStart + 2) });
    }
  }

  // Fill gaps to 24h
  const filled: ELDSegment[] = [];
  let cursor = 0;
  for (const seg of segments) {
    if (seg.startHour > cursor) {
      filled.push({ status: 'off_duty', startHour: cursor, endHour: seg.startHour });
    }
    filled.push(seg);
    cursor = seg.endHour;
  }
  if (cursor < 24) {
    filled.push({ status: 'off_duty', startHour: cursor, endHour: 24 });
  }
  return filled;
}

function getCurrentHour(): number {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

export default function ELDGraph({ truck, onClose }: { truck: any; onClose: () => void }) {
  const segments = generateELDData(truck);
  const currentHour = getCurrentHour();

  // Calculate duty summary
  const summary: Record<DutyStatus, number> = { off_duty: 0, sleeper: 0, driving: 0, on_duty: 0 };
  for (const seg of segments) {
    summary[seg.status] += seg.endHour - seg.startHour;
  }

  const hourMarkers = [0, 3, 6, 9, 12, 15, 18, 21, 24];

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
        position: 'relative', width: '94%', maxWidth: 520, maxHeight: '88vh',
        overflowY: 'auto', background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.06)', borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)', padding: '24px 20px',
        scrollbarWidth: 'none',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#111827' }}>📟 ELD Log</span>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, marginTop: 2 }}>
              {truck.name} · {truck.driver}
            </div>
          </div>
          <span onClick={onClose} style={{
            cursor: 'pointer', fontSize: 18, color: '#94a3b8',
            width: 28, height: 28, borderRadius: 14, background: '#f3f4f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          {(Object.keys(STATUS_CONFIG) as DutyStatus[]).map(key => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 12, height: 12, borderRadius: 3,
                background: STATUS_CONFIG[key].color,
              }} />
              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>
                {STATUS_CONFIG[key].label}
              </span>
            </div>
          ))}
        </div>

        {/* 24-hour timeline */}
        <div style={{
          background: '#f9fafb', border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 14, padding: '16px 14px', marginBottom: 16,
        }}>
          {/* Hour markers */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, position: 'relative' }}>
            {hourMarkers.map(h => (
              <span key={h} style={{
                fontSize: 11, color: '#94a3b8', fontWeight: 600, fontFamily: FONT,
                width: 0, textAlign: 'center', position: 'relative',
              }}>
                <span style={{ position: 'absolute', transform: 'translateX(-50%)' }}>
                  {h === 0 ? '12a' : h === 12 ? '12p' : h < 12 ? `${h}a` : h === 24 ? '12a' : `${h - 12}p`}
                </span>
              </span>
            ))}
          </div>

          {/* Timeline bar */}
          <div style={{
            height: 32, borderRadius: 8, overflow: 'hidden',
            display: 'flex', position: 'relative',
            border: '1px solid rgba(0,0,0,0.08)',
          }}>
            {segments.map((seg, i) => {
              const widthPct = ((seg.endHour - seg.startHour) / 24) * 100;
              return (
                <div key={i} title={`${STATUS_CONFIG[seg.status].label}: ${seg.startHour.toFixed(1)}h - ${seg.endHour.toFixed(1)}h`} style={{
                  width: `${widthPct}%`, height: '100%',
                  background: STATUS_CONFIG[seg.status].color,
                  borderRight: i < segments.length - 1 ? '1px solid rgba(0,0,0,0.3)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: widthPct > 4 ? undefined : 2,
                }}>
                  {widthPct > 8 && (
                    <span style={{
                      fontSize: 10, fontWeight: 800, color: '#fff',
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                      whiteSpace: 'nowrap', overflow: 'hidden',
                    }}>
                      {(seg.endHour - seg.startHour).toFixed(1)}h
                    </span>
                  )}
                </div>
              );
            })}

            {/* Current time marker */}
            <div style={{
              position: 'absolute', left: `${(currentHour / 24) * 100}%`, top: -4, bottom: -4,
              width: 2, background: '#ff375f', zIndex: 2,
              boxShadow: '0 0 6px rgba(255,55,95,0.6)',
            }}>
              <div style={{
                position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                width: 8, height: 8, borderRadius: 4, background: '#ff375f',
                border: '1.5px solid #fff',
              }} />
            </div>
          </div>

          {/* Grid lines */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            {hourMarkers.map(h => (
              <div key={h} style={{ width: 1, height: 6, background: 'rgba(255,255,255,0.15)' }} />
            ))}
          </div>
        </div>

        {/* ELD graph rows (traditional 4-row format) */}
        <div style={{
          background: '#f9fafb', border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 14, padding: '14px', marginBottom: 16,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#6b7280', marginBottom: 12 }}>
            📊 Duty Status Graph
          </div>

          {/* Hour grid header */}
          <div style={{ display: 'flex', marginLeft: 36, marginBottom: 4 }}>
            {hourMarkers.map(h => (
              <div key={h} style={{ flex: h === 24 ? 0 : 1, textAlign: 'left' }}>
                <span style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>
                  {h === 0 ? '12a' : h === 12 ? '12p' : h < 12 ? `${h}a` : h === 24 ? '12a' : `${h-12}p`}
                </span>
              </div>
            ))}
          </div>

          {(Object.keys(STATUS_CONFIG) as DutyStatus[]).map((statusKey, rowIdx) => {
            const cfg = STATUS_CONFIG[statusKey];
            const rowSegs = segments.filter(s => s.status === statusKey);
            const totalHours = rowSegs.reduce((s, seg) => s + seg.endHour - seg.startHour, 0);
            return (
              <div key={statusKey} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: rowIdx < 3 ? 6 : 0,
              }}>
                {/* Icon */}
                <span style={{ fontSize: 16, width: 24, textAlign: 'center', flexShrink: 0 }}>
                  {cfg.icon}
                </span>

                {/* Bar track */}
                <div style={{
                  flex: 1, height: 22, position: 'relative',
                  background: '#f9fafb',
                  borderRadius: 6,
                  border: '1px solid rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}>
                  {/* Vertical grid lines */}
                  {[3,6,9,12,15,18,21].map(h => (
                    <div key={h} style={{
                      position: 'absolute', left: `${(h/24)*100}%`, top: 0, bottom: 0,
                      width: 1, background: 'rgba(255,255,255,0.06)',
                    }} />
                  ))}

                  {/* Segments */}
                  {rowSegs.map((seg, i) => {
                    const left = (seg.startHour / 24) * 100;
                    const width = ((seg.endHour - seg.startHour) / 24) * 100;
                    const dur = seg.endHour - seg.startHour;
                    return (
                      <div key={i} style={{
                        position: 'absolute', left: `${left}%`, width: `${width}%`,
                        top: 0, bottom: 0,
                        background: cfg.color,
                        opacity: 0.9,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                      }}>
                        {width > 10 && (
                          <span style={{
                            fontSize: 10, fontWeight: 800, color: '#fff',
                            textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                            whiteSpace: 'nowrap',
                          }}>
                            {dur.toFixed(1)}h
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Total hours label */}
                <span style={{
                  fontSize: 11, fontWeight: 800,
                  color: totalHours > 0 ? cfg.color : '#334155',
                  width: 32, textAlign: 'right', flexShrink: 0,
                }}>
                  {totalHours > 0 ? `${totalHours.toFixed(1)}h` : '—'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Duty status summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {(Object.keys(STATUS_CONFIG) as DutyStatus[]).map(key => {
            const cfg = STATUS_CONFIG[key];
            const hours = summary[key];
            return (
              <div key={key} style={{
                background: `${cfg.color}0a`, border: `1px solid ${cfg.color}22`,
                borderRadius: 12, padding: '10px 12px',
              }}>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>
                  {cfg.icon} {cfg.label}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: cfg.color }}>
                  {hours.toFixed(1)}h
                </div>
              </div>
            );
          })}
        </div>

        {/* Current status */}
        <div style={{
          marginTop: 14, padding: '10px 14px', borderRadius: 12,
          background: 'rgba(255,55,95,0.08)', border: '1px solid rgba(255,55,95,0.2)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 14 }}>📍</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>
              Current: {truck.status === 'loaded' || truck.status === 'driving' ? 'Driving' :
                truck.status === 'at_pickup' || truck.status === 'at_delivery' ? 'On Duty' :
                truck.status === 'idle' ? 'Off Duty' : truck.status}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              {truck.currentCity || 'En route'} · {truck.hoursLeft?.toFixed(1) ?? '11.0'}h driving left
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
