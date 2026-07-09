// ═══════════════════════════════════════════════════════
//  MainMenu.tsx — стартовый экран игры
//  New Game / Continue / Settings
// ═══════════════════════════════════════════════════════
import { useState } from 'react';
import styles from './MainMenu.module.css';

interface MainMenuProps {
  onNewGame: (truckCount: 3 | 4 | 5) => void;
  onContinue: () => void;
  hasSave: boolean;
}

export function MainMenu({ onNewGame, onContinue, hasSave }: MainMenuProps) {
  const [showNewGame, setShowNewGame] = useState(false);

  return (
    <div className={styles.container}>
      {/* Background animation */}
      <div className={styles.bgGrid} />

      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoEmoji}>🚛</span>
          <h1 className={styles.title}>Dispatch Office</h1>
          <p className={styles.subtitle}>Симулятор диспетчера грузоперевозок</p>
          <span className={styles.version}>v2.0 · React</span>
        </div>

        {/* Menu buttons */}
        {!showNewGame ? (
          <div className={styles.buttons}>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => setShowNewGame(true)}
            >
              <span className={styles.btnIcon}>🎮</span>
              <span className={styles.btnText}>Новая игра</span>
            </button>

            {hasSave && (
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={onContinue}
              >
                <span className={styles.btnIcon}>▶️</span>
                <span className={styles.btnText}>Продолжить</span>
              </button>
            )}

            <button className={`${styles.btn} ${styles.btnGhost}`} disabled>
              <span className={styles.btnIcon}>⚙️</span>
              <span className={styles.btnText}>Настройки</span>
            </button>
          </div>
        ) : (
          /* Truck count selection */
          <div className={styles.truckSelect}>
            <h3 className={styles.selectTitle}>Выбери количество траков</h3>
            <p className={styles.selectHint}>Больше траков = больше хаоса и денег</p>

            <div className={styles.truckOptions}>
              <button
                className={styles.truckOption}
                onClick={() => onNewGame(3)}
              >
                <span className={styles.truckCount}>3</span>
                <span className={styles.truckLabel}>трака</span>
                <span className={styles.truckDifficulty}>Новичок</span>
              </button>

              <button
                className={`${styles.truckOption} ${styles.recommended}`}
                onClick={() => onNewGame(4)}
              >
                <span className={styles.truckCount}>4</span>
                <span className={styles.truckLabel}>трака</span>
                <span className={styles.truckDifficulty}>Стандарт</span>
                <span className={styles.recBadge}>★</span>
              </button>

              <button
                className={styles.truckOption}
                onClick={() => onNewGame(5)}
              >
                <span className={styles.truckCount}>5</span>
                <span className={styles.truckLabel}>траков</span>
                <span className={styles.truckDifficulty}>Хардкор</span>
              </button>
            </div>

            <button
              className={styles.backBtn}
              onClick={() => setShowNewGame(false)}
            >
              ← Назад
            </button>
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <p>dispatch4you.com · 2025</p>
        </div>
      </div>
    </div>
  );
}
