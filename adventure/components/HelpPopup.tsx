import { useThemeStore } from '../store/themeStore';

export default function HelpPopup({ onClose }: { onClose: () => void }) {
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';

  const BG     = isDark ? '#0d1117' : '#ffffff';
  const SURF   = isDark ? '#161b22' : '#f9fafb';
  const BORDER = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const TEXT1  = isDark ? '#e2e8f0' : '#111827';
  const TEXT2  = isDark ? '#94a3b8' : '#6b7280';
  const ACCENT = '#06b6d4';

  const sections = [
    { icon: '🎯', title: 'Цель игры', text: 'Управляй флотом траков как реальный диспетчер. Находи грузы, договаривайся о ставках, доставляй вовремя и зарабатывай.' },
    { icon: '🚛', title: 'Траки', text: 'Каждый трак имеет водителя, HOS (часы вождения), статус и местоположение. Следи за HOS — если часы кончатся, водитель должен отдыхать.' },
    { icon: '📦', title: 'Грузы', text: 'Открой Load Board, найди груз рядом с твоим траком. Договорись о ставке с брокером, назначь трак — и он поедет.' },
    { icon: '💬', title: 'Переговоры', text: 'Брокер предлагает ставку. Ты можешь принять, отклонить или предложить свою. Не жадничай — брокер может разозлиться.' },
    { icon: '📧', title: 'Почта', text: 'Брокеры и водители пишут тебе. Отвечай на Rate Con, POD запросы, detention claims. Быстрые ответы — плитки внизу.' },
    { icon: '⏱', title: 'Время', text: 'Смена длится 1 игровой день. Скорость: ×1 (реальное), ×2 (быстрее), ×5 (очень быстро). Меняй в топбаре.' },
    { icon: '💰', title: 'Финансы', text: 'Доход = ставки за грузы. Расходы = топливо, detention, штрафы, TONU. Цель: минимум $2500 прибыли на трак.' },
    { icon: '⭐', title: 'Оценка', text: 'S = $4000+/трак, A = $2500+, B = $1500+, C = $500+, D = меньше. Чем больше траков без ошибок — тем круче.' },
    { icon: '🗺', title: 'Карта', text: 'Кликни на трак — откроется детальная карточка. Кликни на штат — увидишь траки и грузы в нём. Оранжевые штаты = surge zone (+15% ставки).' },
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
        position: 'relative', width: '90%', maxWidth: 460, maxHeight: '85vh',
        overflowY: 'auto', background: BG,
        border: `1px solid ${isDark ? 'rgba(251,191,36,0.2)' : 'rgba(255,214,10,0.2)'}`,
        borderRadius: 20,
        boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.8)' : '0 20px 60px rgba(0,0,0,0.6)',
        padding: '20px',
        scrollbarWidth: 'none',
      } as any}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 17, fontWeight: 900, color: TEXT1 }}>❓ Как играть</span>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: '50%',
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${BORDER}`,
            cursor: 'pointer', fontSize: 16, color: TEXT2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 } as any}>
          {sections.map((s, i) => (
            <div key={i} style={{
              background: SURF, border: `1px solid ${BORDER}`,
              borderRadius: 12, padding: '10px 12px',
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: TEXT1, marginBottom: 4 }}>{s.icon} {s.title}</div>
              <div style={{ fontSize: 12, color: TEXT2, lineHeight: 1.5 }}>{s.text}</div>
            </div>
          ))}
        </div>

        {/* Hotkeys */}
        <div style={{
          marginTop: 14, padding: '10px 12px', borderRadius: 12,
          background: isDark ? 'rgba(6,182,212,0.08)' : 'rgba(10,132,255,0.08)',
          border: `1px solid ${isDark ? 'rgba(6,182,212,0.2)' : 'rgba(10,132,255,0.2)'}`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, marginBottom: 4 }}>💡 Горячие клавиши</div>
          <div style={{ fontSize: 11, color: TEXT2, lineHeight: 1.6 }}>
            Клик на трак на карте → детальная карточка<br/>
            Клик на штат → инфо о штате<br/>
            ☰ Меню → все разделы игры
          </div>
        </div>
      </div>
    </div>
  );
}
