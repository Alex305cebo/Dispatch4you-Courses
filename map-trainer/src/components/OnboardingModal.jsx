import { useState } from "react";

const STEPS = [
  {
    icon: "🚛",
    title: "Добро пожаловать!",
    text: "Ты — стажёр-диспетчер. Твоя задача — выучить карту США как свои пять пальцев. Штаты, города, часовые пояса, регионы — всё, что нужно для работы.",
  },
  {
    icon: "🗺️",
    title: "Как играть",
    text: "Проходи уровни по порядку. Каждый уровень — новый навык. Кликай на карте, выбирай варианты, отвечай на время. Чем быстрее и точнее — тем больше очков.",
  },
  {
    icon: "⭐",
    title: "Зарабатывай XP",
    text: "За каждый пройденный уровень ты получаешь XP. Набирай ранги: от Стажёра до Dispatcher Pro. Соревнуйся с другими в рейтинге!",
  },
];

export default function OnboardingModal({ onComplete }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(8px)",
      padding: "20px",
    }}>
      <div style={{
        background: "linear-gradient(160deg,#0f172a 0%,#1e293b 100%)",
        border: "1px solid rgba(6,182,212,0.3)",
        borderRadius: "20px",
        padding: "32px 28px",
        maxWidth: "380px",
        width: "100%",
        textAlign: "center",
        position: "relative",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(6,182,212,0.1)",
      }}>
        {/* Иконка */}
        <div style={{
          fontSize: "48px",
          marginBottom: "16px",
          lineHeight: 1,
          animation: "bounceIn 0.4s ease-out",
        }}>
          {current.icon}
        </div>

        {/* Заголовок */}
        <h2 style={{
          fontSize: "20px",
          fontWeight: 800,
          color: "#fff",
          margin: "0 0 10px 0",
          lineHeight: 1.2,
        }}>
          {current.title}
        </h2>

        {/* Текст */}
        <p style={{
          fontSize: "14px",
          color: "#94a3b8",
          margin: "0 0 24px 0",
          lineHeight: 1.6,
        }}>
          {current.text}
        </p>

        {/* Точки-индикаторы */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "20px",
        }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? "24px" : "8px",
              height: "8px",
              borderRadius: "4px",
              background: i === step ? "#06b6d4" : "rgba(255,255,255,0.15)",
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>

        {/* Кнопки */}
        <div style={{ display: "flex", gap: "8px" }}>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                flex: 1,
                padding: "12px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "#94a3b8",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                touchAction: "manipulation",
              }}
            >
              ← Назад
            </button>
          )}
          <button
            onClick={() => {
              if (isLast) {
                onComplete();
              } else {
                setStep(step + 1);
              }
            }}
            style={{
              flex: 1,
              padding: "12px",
              background: isLast
                ? "linear-gradient(135deg,#06b6d4,#0284c7)"
                : "rgba(6,182,212,0.15)",
              border: isLast ? "none" : "1px solid rgba(6,182,212,0.3)",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              touchAction: "manipulation",
              boxShadow: isLast ? "0 4px 16px rgba(6,182,212,0.3)" : "none",
            }}
          >
            {isLast ? "🚀 Начать!" : "Далее →"}
          </button>
        </div>

        {/* Кнопка пропустить */}
        {!isLast && (
          <button
            onClick={onComplete}
            style={{
              marginTop: "12px",
              background: "none",
              border: "none",
              color: "#475569",
              fontSize: "12px",
              cursor: "pointer",
              touchAction: "manipulation",
            }}
          >
            Пропустить
          </button>
        )}

        <style>{`
          @keyframes bounceIn {
            0% { transform: scale(0.5); opacity: 0; }
            60% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
