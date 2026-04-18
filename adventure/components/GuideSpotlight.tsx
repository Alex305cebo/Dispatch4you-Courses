/**
 * GuideSpotlight — пульсирующая подсказка-стрелка для гайда.
 * Оборачивает любой элемент и показывает подсветку + tooltip когда активен нужный шаг.
 */
import { useGuideStore, GuideStep } from '../store/guideStore';

interface Props {
  step: GuideStep | GuideStep[];   // шаг(и) при которых подсвечивать
  tip?: string;                     // текст подсказки
  tipPosition?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  style?: React.CSSProperties;
  pulse?: boolean;                  // пульсировать (default true)
}

export default function GuideSpotlight({
  step,
  tip,
  tipPosition = 'bottom',
  children,
  style,
  pulse = true,
}: Props) {
  const activeStep = useGuideStore(s => s.activeStep);

  const steps = Array.isArray(step) ? step : [step];
  const isActive = activeStep !== null && steps.includes(activeStep);

  if (!isActive) {
    return <div style={{ position: 'relative', ...style }}>{children}</div>;
  }

  const tipStyles: Record<string, React.CSSProperties> = {
    bottom: {
      top: 'calc(100% + 8px)', left: '50%',
      transform: 'translateX(-50%)',
    },
    top: {
      bottom: 'calc(100% + 8px)', left: '50%',
      transform: 'translateX(-50%)',
    },
    right: {
      left: 'calc(100% + 8px)', top: '50%',
      transform: 'translateY(-50%)',
    },
    left: {
      right: 'calc(100% + 8px)', top: '50%',
      transform: 'translateY(-50%)',
    },
  };

  const arrowStyles: Record<string, React.CSSProperties> = {
    bottom: {
      top: -5, left: '50%', transform: 'translateX(-50%)',
      borderLeft: '5px solid transparent',
      borderRight: '5px solid transparent',
      borderBottom: '5px solid rgba(6,182,212,0.9)',
    },
    top: {
      bottom: -5, left: '50%', transform: 'translateX(-50%)',
      borderLeft: '5px solid transparent',
      borderRight: '5px solid transparent',
      borderTop: '5px solid rgba(6,182,212,0.9)',
    },
    right: {
      left: -5, top: '50%', transform: 'translateY(-50%)',
      borderTop: '5px solid transparent',
      borderBottom: '5px solid transparent',
      borderRight: '5px solid rgba(6,182,212,0.9)',
    },
    left: {
      right: -5, top: '50%', transform: 'translateY(-50%)',
      borderTop: '5px solid transparent',
      borderBottom: '5px solid transparent',
      borderLeft: '5px solid rgba(6,182,212,0.9)',
    },
  };

  return (
    <div style={{ position: 'relative', zIndex: 10, ...style }}>
      {/* Glow ring */}
      <div style={{
        position: 'absolute', inset: -3,
        borderRadius: 'inherit',
        border: '2px solid rgba(6,182,212,0.8)',
        boxShadow: '0 0 0 3px rgba(6,182,212,0.2), 0 0 16px rgba(6,182,212,0.4)',
        animation: pulse ? 'spotlightPulse 1.4s ease-in-out infinite' : 'none',
        pointerEvents: 'none',
        zIndex: 1,
        borderRadius: 12,
      } as any} />

      {children}

      {/* Tooltip */}
      {tip && (
        <div style={{
          position: 'absolute',
          ...tipStyles[tipPosition],
          zIndex: 100,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            width: 0, height: 0,
            ...arrowStyles[tipPosition],
          }} />
          <div style={{
            background: 'rgba(6,182,212,0.92)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            padding: '6px 10px',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            maxWidth: 200,
            whiteSpace: 'normal',
            textAlign: 'center',
            lineHeight: 1.4,
          }}>
            {tip}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spotlightPulse {
          0%,100% { box-shadow: 0 0 0 3px rgba(6,182,212,0.2), 0 0 16px rgba(6,182,212,0.4); opacity: 1; }
          50%      { box-shadow: 0 0 0 6px rgba(6,182,212,0.1), 0 0 28px rgba(6,182,212,0.7); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
