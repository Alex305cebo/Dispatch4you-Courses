/**
 * Highlight System Component
 * Event-driven система подсветки элементов UI
 */

import React, { useEffect, useState } from 'react';
import { getEventBus, TutorialEvent, HighlightPayload } from '../utils/eventBus';

interface HighlightedElement {
  selector: string;
  message?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  pulse: boolean;
}

export const HighlightSystem: React.FC = () => {
  const [highlightedElements, setHighlightedElements] = useState<Map<string, HighlightedElement>>(new Map());
  const eventBus = getEventBus();

  useEffect(() => {
    // Подписываемся на события подсветки
    const unsubHighlight = eventBus.on<HighlightPayload>(
      TutorialEvent.HIGHLIGHT_ELEMENT,
      (payload) => {
        setHighlightedElements(prev => {
          const next = new Map(prev);
          next.set(payload.selector, {
            selector: payload.selector,
            message: payload.message,
            position: payload.position,
            pulse: payload.pulse ?? true,
          });
          return next;
        });

        // Прокручиваем к элементу
        setTimeout(() => {
          const element = document.querySelector(payload.selector);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    );

    const unsubUnhighlight = eventBus.on<HighlightPayload>(
      TutorialEvent.UNHIGHLIGHT_ELEMENT,
      (payload) => {
        setHighlightedElements(prev => {
          const next = new Map(prev);
          next.delete(payload.selector);
          return next;
        });
      }
    );

    const unsubClear = eventBus.on(TutorialEvent.CLEAR_HIGHLIGHTS, () => {
      setHighlightedElements(new Map());
    });

    return () => {
      unsubHighlight();
      unsubUnhighlight();
      unsubClear();
    };
  }, [eventBus]);

  // Применяем стили к подсвеченным элементам
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.id = 'tutorial-highlight-styles';

    let css = '';

    highlightedElements.forEach((highlight, selector) => {
      const pulseAnimation = highlight.pulse ? 'tutorial-pulse 2s ease-in-out infinite' : 'none';
      
      css += `
        ${selector} {
          position: relative !important;
          z-index: 9999 !important;
          animation: ${pulseAnimation} !important;
          box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.6), 
                      0 0 20px rgba(6, 182, 212, 0.4),
                      0 0 40px rgba(6, 182, 212, 0.2) !important;
          border-radius: 12px !important;
          transition: all 0.3s ease !important;
        }

        ${selector}::before {
          content: '';
          position: absolute;
          inset: -8px;
          border: 3px solid rgba(6, 182, 212, 0.8);
          border-radius: 16px;
          pointer-events: none;
          animation: tutorial-border-pulse 2s ease-in-out infinite;
        }
      `;
    });

    // Добавляем keyframes анимации
    css += `
      @keyframes tutorial-pulse {
        0%, 100% {
          box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.6), 
                      0 0 20px rgba(6, 182, 212, 0.4),
                      0 0 40px rgba(6, 182, 212, 0.2);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(6, 182, 212, 0.4), 
                      0 0 30px rgba(6, 182, 212, 0.6),
                      0 0 60px rgba(6, 182, 212, 0.3);
        }
      }

      @keyframes tutorial-border-pulse {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.6;
          transform: scale(1.05);
        }
      }
    `;

    styleElement.textContent = css;
    document.head.appendChild(styleElement);

    return () => {
      const existingStyle = document.getElementById('tutorial-highlight-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [highlightedElements]);

  // Рендерим подсказки для подсвеченных элементов
  return (
    <>
      {Array.from(highlightedElements.values()).map((highlight) => {
        if (!highlight.message) return null;

        return (
          <HighlightTooltip
            key={highlight.selector}
            selector={highlight.selector}
            message={highlight.message}
            position={highlight.position}
          />
        );
      })}
    </>
  );
};

// Компонент подсказки для подсвеченного элемента
interface HighlightTooltipProps {
  selector: string;
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const HighlightTooltip: React.FC<HighlightTooltipProps> = ({
  selector,
  message,
  position = 'top',
}) => {
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      const element = document.querySelector(selector);
      if (element) {
        setElementRect(element.getBoundingClientRect());
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [selector]);

  if (!elementRect) return null;

  // Вычисляем позицию подсказки
  const getTooltipStyle = (): React.CSSProperties => {
    const offset = 16;
    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = elementRect.top - offset;
        left = elementRect.left + elementRect.width / 2;
        return {
          top: `${top}px`,
          left: `${left}px`,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        top = elementRect.bottom + offset;
        left = elementRect.left + elementRect.width / 2;
        return {
          top: `${top}px`,
          left: `${left}px`,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        top = elementRect.top + elementRect.height / 2;
        left = elementRect.left - offset;
        return {
          top: `${top}px`,
          left: `${left}px`,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        top = elementRect.top + elementRect.height / 2;
        left = elementRect.right + offset;
        return {
          top: `${top}px`,
          left: `${left}px`,
          transform: 'translate(0, -50%)',
        };
      default:
        return {};
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 10000,
        maxWidth: '300px',
        padding: '12px 16px',
        background: 'rgba(6, 182, 212, 0.95)',
        backdropFilter: 'blur(10px)',
        color: '#fff',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 600,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        pointerEvents: 'none',
        animation: 'tooltip-fade-in 0.3s ease',
        ...getTooltipStyle(),
      }}
    >
      {message}
      
      {/* Стрелка */}
      <div
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          borderStyle: 'solid',
          ...(position === 'top' && {
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '8px 8px 0 8px',
            borderColor: 'rgba(6, 182, 212, 0.95) transparent transparent transparent',
          }),
          ...(position === 'bottom' && {
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '0 8px 8px 8px',
            borderColor: 'transparent transparent rgba(6, 182, 212, 0.95) transparent',
          }),
          ...(position === 'left' && {
            right: '-8px',
            top: '50%',
            transform: 'translateY(-50%)',
            borderWidth: '8px 0 8px 8px',
            borderColor: 'transparent transparent transparent rgba(6, 182, 212, 0.95)',
          }),
          ...(position === 'right' && {
            left: '-8px',
            top: '50%',
            transform: 'translateY(-50%)',
            borderWidth: '8px 8px 8px 0',
            borderColor: 'transparent rgba(6, 182, 212, 0.95) transparent transparent',
          }),
        }}
      />

      <style>{`
        @keyframes tooltip-fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -100%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -100%) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
