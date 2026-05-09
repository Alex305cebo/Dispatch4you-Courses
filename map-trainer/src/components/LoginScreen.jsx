const LOGIN_URL = 'https://dispatch4you.com/login.html';
const RETURN_URL = 'https://dispatch4you.com/map-trainer/';

export default function LoginScreen({ loading }) {
  const goToLogin = () => {
    // Сохраняем куда вернуться после логина
    try {
      localStorage.setItem('returnUrl', RETURN_URL);
    } catch (e) {}
    window.location.href = LOGIN_URL;
  };

  return (
    <div style={{
      height: "100dvh",
      background: "linear-gradient(160deg,#060d1a 0%,#0f172a 50%,#1a1040 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      {/* Логотип */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ fontSize: "56px", marginBottom: "12px" }}>🇺🇸</div>
        <h1 style={{
          fontSize: "26px", fontWeight: 900, color: "#fff",
          margin: "0 0 6px 0", letterSpacing: "-0.5px",
        }}>
          USA Map Trainer
        </h1>
        <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
          Тренажёр географии для диспетчеров
        </p>
      </div>

      {/* Карточка входа */}
      <div style={{
        width: "100%",
        maxWidth: "360px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "20px",
        padding: "28px 24px",
        textAlign: "center",
      }}>
        <p style={{ fontSize: "16px", fontWeight: 700, color: "#e2e8f0", margin: "0 0 6px 0" }}>
          Войди чтобы сохранить прогресс
        </p>
        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 24px 0", lineHeight: 1.5 }}>
          Прогресс синхронизируется между устройствами и с основным курсом
        </p>

        {/* Преимущества */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px", textAlign: "left" }}>
          {[
            { icon: "☁️", text: "Прогресс сохраняется в облаке" },
            { icon: "📱", text: "Доступен на любом устройстве" },
            { icon: "🔗", text: "Единый аккаунт с курсом и игрой" },
            { icon: "⭐", text: "XP суммируется со всеми проектами" },
          ].map((item) => (
            <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: "13px", color: "#94a3b8" }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Кнопка входа — редирект на главный сайт */}
        <button
          onClick={goToLogin}
          disabled={loading}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "13px 20px",
            background: loading ? "rgba(255,255,255,0.1)" : "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: 700,
            color: loading ? "#94a3b8" : "#1f2937",
            cursor: loading ? "default" : "pointer",
            touchAction: "manipulation",
            transition: "all 0.2s ease",
            boxShadow: loading ? "none" : "0 4px 16px rgba(0,0,0,0.3)",
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: "18px", height: "18px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#94a3b8",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
              Загрузка...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Войти через Google
            </>
          )}
        </button>

        <p style={{ fontSize: "11px", color: "#334155", margin: "14px 0 0 0" }}>
          Тот же аккаунт что и на dispatch4you.com
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
