// ═══════════════════════════════════════════════════════
//  ProfileButton.tsx — кнопка профиля в Header
//  Показывает аватар Google или кнопку входа
// ═══════════════════════════════════════════════════════
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { saveToCloud, loadFromCloud } from '@/utils/saveSystem';
import { useGameStore } from '@/store/gameStore';
import styles from './ProfileButton.module.css';

export function ProfileButton() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const logout = useAuthStore((s) => s.logout);
  const [showMenu, setShowMenu] = useState(false);
  const [syncing, setSyncing] = useState(false);

  if (loading) return null;

  // Не авторизован — кнопка входа
  if (!user) {
    return (
      <button
        className={styles.signInBtn}
        onClick={signInWithGoogle}
        title="Войти через Google"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span>Войти</span>
      </button>
    );
  }

  // Авторизован — аватар + dropdown
  async function handleCloudSave() {
    setSyncing(true);
    await saveToCloud();
    setSyncing(false);
    setShowMenu(false);
  }

  async function handleCloudLoad() {
    setSyncing(true);
    const session = await loadFromCloud();
    if (session) {
      useGameStore.getState().loadSession(session);
    }
    setSyncing(false);
    setShowMenu(false);
  }

  return (
    <div className={styles.wrap}>
      <button
        className={styles.avatarBtn}
        onClick={() => setShowMenu(!showMenu)}
        title={user.displayName || user.email || 'Профиль'}
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className={styles.avatar} referrerPolicy="no-referrer" />
        ) : (
          <span className={styles.avatarFallback}>
            {(user.displayName || user.email || '?')[0].toUpperCase()}
          </span>
        )}
      </button>

      {showMenu && (
        <>
          <div className={styles.backdrop} onClick={() => setShowMenu(false)} />
          <div className={styles.menu}>
            <div className={styles.menuHeader}>
              <div className={styles.menuName}>{user.displayName || 'Player'}</div>
              <div className={styles.menuEmail}>{user.email}</div>
            </div>

            <div className={styles.menuDivider} />

            <button className={styles.menuItem} onClick={handleCloudSave} disabled={syncing}>
              <span>☁️</span>
              <span>{syncing ? 'Сохраняю...' : 'Сохранить в облако'}</span>
            </button>

            <button className={styles.menuItem} onClick={handleCloudLoad} disabled={syncing}>
              <span>📥</span>
              <span>{syncing ? 'Загружаю...' : 'Загрузить из облака'}</span>
            </button>

            <div className={styles.menuDivider} />

            <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={logout}>
              <span>🚪</span>
              <span>Выйти</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
