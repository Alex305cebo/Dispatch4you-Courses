/**
 * OnboardingActionButton — яркая пульсирующая кнопка действия.
 *
 * Позиционируется рядом с целевым элементом (через targetRect).
 * Для шагов без target (1, 12) — targetRect === null → рендерится
 * внутри попапа по центру (родитель управляет позицией).
 *
 * Остаётся видимой когда попап скрыт.
 * Пульсирующая анимация для привлечения внимания.
 */

export interface OnboardingActionButtonProps {
  text: string;
  onClick: () => void;
  targetRect: DOMRect | null; // null = рендерить по центру (внутри попапа)
  visible: boolean;
}

const ACTION_BTN_OFFSET = 12; // px от целевого элемента

export default function OnboardingActionButton({
  text,
  onClick,
  targetRect,
  visible,
}: OnboardingActionButtonProps) {
  if (!visible) return null;

  // Если нет target — рендерим inline-кнопку (родитель позиционирует)
  if (!targetRect) {
    return (
      <div
        onClick={e => e.stopPropagation()}
        data-testid="onboarding-action-btn"
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 4,
          pointerEvents: 'auto',
        }}
      >
        {renderButton(text, onClick)}
        <style>{pulseKeyframes}</style>
      </div>
    );
  }

  // Позиционирование рядом с целевым элементом — под ним по центру
  const btnTop = targetRect.bottom + ACTION_BTN_OFFSET;
  const btnLeft = targetRect.left + targetRect.width / 2;

  return (
    <div
      onClick={e => e.stopPropagation()}
      data-testid="onboarding-action-btn"
      style={{
        position: 'fixed',
        top: btnTop,
        left: btnLeft,
        transform: 'translateX(-50%)',
        zIndex: 10003,
        pointerEvents: 'auto',
      }}
    >
      {renderButton(text, onClick)}
      <style>{pulseKeyframes}</style>
    </div>
  );
}

function renderButton(text: string, onClick: () => void) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        border: '2px solid rgba(6,182,212,0.6)',
        borderRadius: 12,
        padding: '10px 24px',
        fontSize: 15,
        fontWeight: 800,
        color: '#fff',
        cursor: 'pointer',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        boxShadow:
          '0 4px 20px rgba(6,182,212,0.4), 0 0 0 3px rgba(6,182,212,0.15)',
        animation: 'onbActionPulse 1.6s ease-in-out infinite',
        whiteSpace: 'nowrap',
        transition: 'transform 0.1s ease',
      }}
    >
      {text}
    </button>
  );
}

const pulseKeyframes = `
  @keyframes onbActionPulse {
    0%, 100% {
      box-shadow: 0 4px 20px rgba(6,182,212,0.4), 0 0 0 3px rgba(6,182,212,0.15);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 4px 28px rgba(6,182,212,0.6), 0 0 0 6px rgba(6,182,212,0.1);
      transform: scale(1.03);
    }
  }
`;
