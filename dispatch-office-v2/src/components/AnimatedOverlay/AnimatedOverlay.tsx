// ═══════════════════════════════════════════════════════
//  AnimatedOverlay.tsx — обёртка для popup/modal
//  Анимация входа и выхода (стандарт iOS/Android/Web)
//  - Desktop: fade + scale
//  - Mobile: fade + slide up / slide down
// ═══════════════════════════════════════════════════════
import { useState, useEffect, useCallback, type ReactNode } from 'react';
import styles from './AnimatedOverlay.module.css';

interface AnimatedOverlayProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Закрытие по клику на backdrop (default: true) */
  closeOnBackdrop?: boolean;
  /** Вариант анимации */
  variant?: 'center' | 'bottom';
}

export function AnimatedOverlay({
  visible,
  onClose,
  children,
  closeOnBackdrop = true,
  variant = 'center',
}: AnimatedOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState<'in' | 'out' | null>(null);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // Небольшая задержка чтобы CSS transition сработал
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating('in'));
      });
    } else if (mounted) {
      setAnimating('out');
      const timer = setTimeout(() => {
        setMounted(false);
        setAnimating(null);
      }, 250); // длительность анимации выхода
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdrop) onClose();
  }, [closeOnBackdrop, onClose]);

  if (!mounted) return null;

  const overlayClass = [
    styles.overlay,
    animating === 'in' ? styles.overlayIn : '',
    animating === 'out' ? styles.overlayOut : '',
  ].join(' ');

  const contentClass = [
    styles.content,
    variant === 'bottom' ? styles.contentBottom : styles.contentCenter,
    animating === 'in' ? styles.contentIn : '',
    animating === 'out' ? styles.contentOut : '',
    variant === 'bottom' && animating === 'in' ? styles.contentBottomIn : '',
    variant === 'bottom' && animating === 'out' ? styles.contentBottomOut : '',
  ].join(' ');

  return (
    <div className={overlayClass} onClick={handleBackdropClick}>
      <div className={contentClass} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
