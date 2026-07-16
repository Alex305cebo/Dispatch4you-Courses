/**
 * GARAGE UPGRADE SCREEN — экран тюнинга трака.
 * Слева — трак + бары характеристик; справа — сетка апгрейдов с ценами.
 * Клик по апгрейду: списываются деньги, иконка «улетает» к траку, нужные
 * бары характеристик подсвечиваются и растут.
 *
 * Web-компонент (raw div/css) — для полного контроля над анимацией.
 */
import { useRef, useState } from 'react';
import { Image } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { TRUCK_UPGRADES, UpgradeStat } from '../data/truckUpgrades';
import { getTruckImage } from '../utils/truckImages';

const STAT_META: { key: UpgradeStat; label: string; color: string }[] = [
  { key: 'reliability', label: 'Надёжность',     color: '#f87171' },
  { key: 'comfort',     label: 'Комфорт',        color: '#fb923c' },
  { key: 'legalStatus', label: 'Тех. состояние', color: '#4ade80' },
  { key: 'performance', label: 'Производит.',    color: '#06b6d4' },
];

type Flying = { id: number; icon: string; color: string; x: number; y: number; tx: number; ty: number };

export default function GarageUpgradeScreen() {
  const truckId = useGameStore(s => s.garageUpgradeTruckId);
  const truck = useGameStore(s => s.trucks.find(t => t.id === truckId));
  const balance = useGameStore(s => s.balance);
  const installUpgrade = useGameStore(s => s.installUpgrade);
  const close = useGameStore(s => s.closeGarageUpgrade);

  const truckRef = useRef<HTMLDivElement>(null);
  const [flying, setFlying] = useState<Flying[]>([]);
  const [flash, setFlash] = useState<Record<string, number>>({}); // statKey -> timestamp
  const flyId = useRef(0);

  if (!truckId || !truck) return null;

  const owned: string[] = (truck as any).garageUpgrades || [];
  const imgId = (truck as any).truckImageId;
  const truckSrc = getTruckImage(imgId);

  function buy(e: React.MouseEvent, upId: string) {
    const up = TRUCK_UPGRADES.find(u => u.id === upId);
    if (!up) return;
    const cell = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const ok = installUpgrade(truckId!, upId);
    if (!ok) return;

    // Иконка летит от ячейки к траку
    const target = truckRef.current?.getBoundingClientRect();
    if (target) {
      const id = ++flyId.current;
      setFlying(f => [...f, {
        id, icon: up.icon, color: up.color,
        x: cell.left + cell.width / 2, y: cell.top + cell.height / 2,
        tx: target.left + target.width / 2, ty: target.top + target.height / 2,
      }]);
      setTimeout(() => setFlying(f => f.filter(x => x.id !== id)), 650);
    }
    // Подсветка затронутых баров
    const ts = Date.now();
    setFlash(prev => { const n = { ...prev }; up.affects.forEach(s => { n[s] = ts; }); return n; });
  }

  const statColor = (v: number) => (v >= 70 ? '#4ade80' : v >= 40 ? '#fbbf24' : '#f87171');

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    } as any}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,5,16,0.78)', backdropFilter: 'blur(6px)' } as any} onClick={close} />

      <div style={{
        position: 'relative', width: '100%', maxWidth: 760, maxHeight: '90vh', overflow: 'hidden',
        background: '#0b1220', borderRadius: 22, border: '1px solid rgba(245,158,11,0.3)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column',
        animation: 'garageIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      } as any}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' } as any}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 } as any}>
            <span style={{ fontSize: 22 } as any}>🔧</span>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#f59e0b', letterSpacing: 0.5 } as any}>ГАРАЖ — ТЮНИНГ</div>
              <div style={{ fontSize: 12, color: '#94a3b8' } as any}>Улучши трак перед рейсом</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 } as any}>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#4ade80' } as any}>${balance.toLocaleString()}</div>
            <button onClick={close} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8', fontSize: 16, cursor: 'pointer' } as any}>✕</button>
          </div>
        </div>

        {/* BODY: 2 колонки */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: 18, overflowY: 'auto', flex: 1, minHeight: 0 } as any}>

          {/* ЛЕВО — трак + характеристики */}
          <div ref={truckRef} style={{ flex: '1 1 260px', minWidth: 240 } as any}>
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: 14,
            } as any}>
              <div style={{ width: '100%', height: 150, borderRadius: 12, overflow: 'hidden', background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' } as any}>
                {truckSrc
                  ? <Image source={truckSrc} style={{ width: '100%', height: 150 } as any} resizeMode="contain" />
                  : <span style={{ fontSize: 60 } as any}>🚛</span>}
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', marginTop: 10 } as any}>{truck.name}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 } as any}>👤 {truck.driver}</div>

              {STAT_META.map(st => {
                const v = Math.round((truck as any)[st.key] ?? 100);
                const flashed = flash[st.key] && Date.now() - flash[st.key] < 900;
                return (
                  <div key={st.key} style={{ marginBottom: 10 } as any}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 } as any}>
                      <span style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600 } as any}>{st.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: statColor(v) } as any}>{v}/100</span>
                    </div>
                    <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', boxShadow: flashed ? `0 0 10px ${st.color}` : 'none', transition: 'box-shadow 0.3s' } as any}>
                      <div style={{ height: '100%', width: `${v}%`, borderRadius: 5, background: statColor(v), transition: 'width 0.6s cubic-bezier(0.34,1.4,0.64,1)' } as any} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ПРАВО — апгрейды */}
          <div style={{ flex: '1 1 300px', minWidth: 260 } as any}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 } as any}>⬆️ Доступные апгрейды</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } as any}>
              {TRUCK_UPGRADES.map(up => {
                const isOwned = owned.includes(up.id);
                const canBuy = !isOwned && balance >= up.cost;
                return (
                  <button
                    key={up.id}
                    onClick={(e) => canBuy && buy(e, up.id)}
                    disabled={!canBuy}
                    style={{
                      textAlign: 'left', cursor: canBuy ? 'pointer' : 'default',
                      background: isOwned ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.04)',
                      border: `1.5px solid ${isOwned ? 'rgba(74,222,128,0.5)' : canBuy ? up.color + '55' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 14, padding: 12, opacity: !canBuy && !isOwned ? 0.5 : 1,
                      transition: 'transform 0.12s, border-color 0.2s',
                    } as any}
                    onMouseEnter={(e: any) => { if (canBuy) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e: any) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ fontSize: 26, marginBottom: 4 } as any}>{up.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: isOwned ? '#4ade80' : '#e2e8f0' } as any}>{up.label}</div>
                    <div style={{ fontSize: 10.5, color: '#94a3b8', lineHeight: 1.4, margin: '3px 0 8px', minHeight: 28 } as any}>{up.desc}</div>
                    {isOwned
                      ? <div style={{ fontSize: 12, fontWeight: 800, color: '#4ade80' } as any}>✅ Установлено</div>
                      : <div style={{ fontSize: 14, fontWeight: 900, color: canBuy ? up.color : '#64748b' } as any}>${up.cost.toLocaleString()}</div>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ padding: '12px 18px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' } as any}>
          <button onClick={close} style={{
            width: '100%', padding: 14, borderRadius: 14, border: 'none', cursor: 'pointer',
            background: '#f59e0b', color: '#1a1205', fontSize: 15, fontWeight: 900,
          } as any}>▶ Готово — в путь</button>
        </div>
      </div>

      {/* Летящие иконки апгрейдов */}
      {flying.map(f => (
        <div key={f.id} style={{
          position: 'fixed', left: 0, top: 0, zIndex: 10001, pointerEvents: 'none',
          fontSize: 28, filter: `drop-shadow(0 0 8px ${f.color})`,
          // @ts-ignore CSS custom props для keyframes
          '--fx': `${f.x}px`, '--fy': `${f.y}px`, '--tx': `${f.tx}px`, '--ty': `${f.ty}px`,
          animation: 'flyToTruck 0.6s cubic-bezier(0.5,0,0.3,1) forwards',
        } as any}>{f.icon}</div>
      ))}

      <style>{`
        @keyframes garageIn { from{opacity:0;transform:scale(0.94) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes flyToTruck {
          0%   { transform: translate(var(--fx), var(--fy)) scale(1); opacity: 1; }
          70%  { opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
