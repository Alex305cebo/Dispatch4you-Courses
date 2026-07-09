// ═══════════════════════════════════════════════════════
//  BottomSheet.tsx — centered popup (replaces bottom sheet)
//  Opens as modal overlay, closes on backdrop click
// ═══════════════════════════════════════════════════════
import { type ReactNode } from 'react';
import styles from './BottomSheet.module.css';

interface Props {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
}

export function BottomSheet({ children, open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.handleBar} />
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
