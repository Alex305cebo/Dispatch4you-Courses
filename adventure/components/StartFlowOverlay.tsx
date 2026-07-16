/**
 * START FLOW — гайдед-старт новой игры.
 * Водитель ведёт игрока: выбор трака (Truck Shop) → гараж (апгрейд) → первый груз.
 * Сам ничего не реализует заново — только оркестрирует существующие системы
 * через флаг guidedStartStep в gameStore.
 */
import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

const DRIVER_IMG = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Man%20Office%20Worker%20Light%20Skin%20Tone.png';

interface Props {
  /** Переключить игровую вкладку на Load Board */
  onOpenLoadBoard?: () => void;
}

export default function StartFlowOverlay({ onOpenLoadBoard }: Props) {
  const step = useGameStore(s => s.guidedStartStep);
  const trucks = useGameStore(s => s.trucks);
  const setStep = useGameStore(s => s.setGuidedStartStep);
  const setTruckShopOpen = useGameStore(s => s.setTruckShopOpen);
  const openGarageUpgrade = useGameStore(s => s.openGarageUpgrade);

  // Как только трак куплен (флот перестал быть пустым) — двигаемся к гаражу
  useEffect(() => {
    if (step === 'pick_truck' && trucks.length > 0) {
      setStep('garage_offer');
    }
  }, [step, trucks.length, setStep]);

  if (step === 'done') return null;
  // Пока открыт Truck Shop — прячем карточку, не мешаем выбирать
  if (step === 'pick_truck') return null;

  const card = (children: React.ReactNode) => (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    } as any}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,5,16,0.7)', backdropFilter: 'blur(4px)' } as any} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: 420,
        background: '#0b1220', borderRadius: 22, padding: 24,
        border: '1px solid rgba(56,189,248,0.25)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        animation: 'startCardIn 0.32s cubic-bezier(0.34,1.56,0.64,1)',
      } as any}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 } as any}>
          <img src={DRIVER_IMG} width={56} height={56} style={{ objectFit: 'contain', animation: 'driverBob 2.4s ease-in-out infinite' } as any} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#fff' } as any}>Джон</div>
            <div style={{ fontSize: 12, color: '#38bdf8', fontWeight: 700 } as any}>Твой водитель</div>
          </div>
        </div>
        {children}
      </div>
      <style>{`
        @keyframes startCardIn { from{opacity:0;transform:scale(0.92) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes driverBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
      `}</style>
    </div>
  );

  const btn = (label: string, onClick: () => void, primary = true) => (
    <button onClick={onClick} style={{
      width: '100%', padding: '14px', borderRadius: 14, marginTop: 10,
      fontSize: 15, fontWeight: 800, cursor: 'pointer', border: 'none',
      background: primary ? '#38bdf8' : 'rgba(255,255,255,0.07)',
      color: primary ? '#04121f' : '#cbd5e1',
    } as any}>{label}</button>
  );

  const text = (t: string) => (
    <div style={{ fontSize: 14, lineHeight: 1.6, color: '#e2e8f0', fontWeight: 500 } as any}>{t}</div>
  );

  if (step === 'driver_intro') {
    return card(<>
      {text('Привет, босс! Я Джон — готов рулить. Но мне нужна машина. Зайдём в Truck Shop и выберем трак: старый дешевле, новый надёжнее. Решать тебе!')}
      {btn('🏪 Выбрать трак', () => { setStep('pick_truck'); setTruckShopOpen(true); })}
    </>);
  }

  if (step === 'garage_offer') {
    const t = trucks[trucks.length - 1];
    return card(<>
      {text(`Отличный выбор — ${t?.name || 'трак'} мой! Перед рейсом можем заехать в гараж: подлатать и поставить апгрейды (двигатель, шины, GPS). Или сразу в путь — деньги ждать не любят.`)}
      {btn('🔧 Заехать в гараж', () => { setStep('find_load'); openGarageUpgrade(t?.id || ''); })}
      {btn('▶ Сразу к грузу', () => setStep('find_load'), false)}
    </>);
  }

  if (step === 'find_load') {
    return card(<>
      {text('Машина готова! Теперь самое главное — найди мне груз. Открой Load Board, выбери рейс повыгоднее, договорись о ставке и назначь меня. Поехали зарабатывать! 🚛💨')}
      {btn('📋 Открыть Load Board', () => { setStep('done'); onOpenLoadBoard?.(); })}
    </>);
  }

  return null;
}
