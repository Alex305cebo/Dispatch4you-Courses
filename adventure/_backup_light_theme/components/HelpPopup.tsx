export default function HelpPopup({ onClose }: { onClose: () => void }) {
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
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      } as any} />
      <div style={{
        position: 'relative', width: '90%', maxWidth: 460, maxHeight: '85vh',
        overflowY: 'auto', background: '#ffffff',
        border: '1px solid rgba(255,214,10,0.2)', borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)', padding: '24px 20px',
        scrollbarWidth: 'none',
      } as any}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#111827' }}>❓ Как играть</span>
          <span onClick={onClose} style={{ cursor: 'pointer', fontSize: 18, color: '#6b7280' }}>✕</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 } as any}>
          {sections.map((s, i) => (
            <div key={i} style={{
              background: '#f9fafb', border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 12, padding: '10px 12px',
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{s.icon} {s.title}</div>
              <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{s.text}</div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 14, padding: '10px 12px', borderRadius: 12,
          background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.2)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0a84ff', marginBottom: 4 }}>💡 Горячие клавиши</div>
          <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.6 }}>
            Клик на трак на карте → детальная карточка<br/>
            Клик на штат → инфо о штате<br/>
            ☰ Меню → все разделы игры
          </div>
        </div>
      </div>
    </div>
  );
}
