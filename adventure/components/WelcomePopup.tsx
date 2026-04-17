import { useState, useEffect } from 'react';

const STORAGE_KEY = 'dispatch-welcome-shown';

interface Props {
  nickname: string;
  onClose: () => void;
}

export default function WelcomePopup({ nickname, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Плавное появление
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, '1');
      onClose();
    }, 400);
  }

  const steps = [
    {
      icon: '📋',
      title: 'Найди груз',
      desc: 'Открой вкладку «Грузы» → выбери рейс из Knoxville → нажми ▶ для переговоров с брокером.',
    },
    {
      icon: '🚛',
      title: 'Назначь трак',
      desc: 'После сделки выбери свободный трак. Он сразу отправится на погрузку.',
    },
    {
      icon: '🗺',
      title: 'Следи за картой',
      desc: 'Трак едет по реальным дорогам США. Кликни на него — увидишь статус, HOS и маршрут.',
    },
    {
      icon: '💰',
      title: 'Получи оплату',
      desc: 'При доставке деньги зачисляются автоматически. Цель смены — $7,500+. Удачи!',
    },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.4s ease',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    } as any}>
      <div style={{
        width: '92%', maxWidth: 420,
        background: 'linear-gradient(160deg, #0f1a2e 0%, #0a0f1e 100%)',
        border: '1px solid rgba(6,182,212,0.3)',
        borderRadius: 20,
        boxShadow: '0 0 60px rgba(6,182,212,0.15), 0 20px 60px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        transform: visible ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(20px)',
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      } as any}>

        {/* Top accent bar */}
        <div style={{
          height: 3,
          background: 'linear-gradient(90deg, #06b6d4, #818cf8, #06b6d4)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s linear infinite',
        } as any} />

        <div style={{ padding: '22px 24px 24px' }}>
          {/* Header */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 } as any}>
              🎮 Dispatch Office
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>
              Добро пожаловать,<br />
              <span style={{
                background: 'linear-gradient(90deg, #06b6d4, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              } as any}>{nickname}!</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
              Ты — диспетчер грузовых перевозок США.<br />
              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>3 трака и водителя ждут тебя в Knoxville, TN.</span><br />
              HOS полный · Траки свободны · Груза нет
            </div>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 } as any}>
            {steps.map((s, i) => (
              <div
                key={i}
                onClick={() => setStep(i)}
                style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
                  background: step === i
                    ? 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(129,140,248,0.1))'
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${step === i ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  transition: 'all 0.2s',
                } as any}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: step === i ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                } as any}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: step === i ? '#fff' : '#94a3b8', marginBottom: 2 }}>
                    <span style={{ color: step === i ? '#06b6d4' : '#475569', marginRight: 6, fontSize: 11, fontWeight: 900 }}>
                      {i + 1}.
                    </span>
                    {s.title}
                  </div>
                  {step === i && (
                    <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>
                      {s.desc}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Goal */}
          <div style={{
            padding: '10px 14px', borderRadius: 12, marginBottom: 18,
            background: 'rgba(74,222,128,0.08)',
            border: '1px solid rgba(74,222,128,0.2)',
            display: 'flex', alignItems: 'center', gap: 10,
          } as any}>
            <span style={{ fontSize: 20 }}>🏆</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#4ade80' }}>Цель смены</div>
              <div style={{ fontSize: 11, color: '#86efac' }}>Заработай $7,500+ · Оценка A или выше</div>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleClose}
            style={{
              width: '100%', padding: '14px 0',
              background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
              border: 'none', borderRadius: 14, cursor: 'pointer',
              fontSize: 15, fontWeight: 800, color: '#fff',
              letterSpacing: 0.3,
              boxShadow: '0 4px 20px rgba(6,182,212,0.4)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            } as any}
            onMouseEnter={e => {
              (e.target as HTMLElement).style.transform = 'translateY(-1px)';
              (e.target as HTMLElement).style.boxShadow = '0 6px 24px rgba(6,182,212,0.5)';
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.transform = 'translateY(0)';
              (e.target as HTMLElement).style.boxShadow = '0 4px 20px rgba(6,182,212,0.4)';
            }}
          >
            🚀 Начать работу
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

export function shouldShowWelcome(): boolean {
  try { return !localStorage.getItem(STORAGE_KEY); } catch { return false; }
}
