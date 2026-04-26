/**
 * firebase-auth-init.js v4.0
 * Простая надёжная авторизация через Google
 * Загружается на всех страницах через nav-loader.js
 */
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const CFG = {
    apiKey: "AIzaSyC505dhT1WjUPhXbinqLvEOTlEXWxYy8GI",
    authDomain: "dispatch4you-80e0f.firebaseapp.com",
    projectId: "dispatch4you-80e0f",
    storageBucket: "dispatch4you-80e0f.appspot.com",
    messagingSenderId: "349235354473",
    appId: "1:349235354473:web:488aeb29211b02bb153bf8"
};

const app = getApps().length ? getApps()[0] : initializeApp(CFG);
const auth = getAuth(app);
const db = getFirestore(app);
const gProvider = new GoogleAuthProvider();
gProvider.setCustomParameters({ prompt: 'select_account' });

window._fbAuth = auth;

// НЕ сбрасываем user_role при старте — role-guard.js может прочитать его раньше
// Роль обновится после onAuthStateChanged

// ── Глобальные функции ────────────────────────────────────────────
window.signInWithGoogle = async () => {
    try {
        await signInWithPopup(auth, gProvider);
    } catch(e) {
        if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
            console.error('Google sign-in:', e.code);
        }
    }
};

window.authLogout = async (e) => {
    if (e) e.preventDefault();
    await signOut(auth).catch(() => {});
    localStorage.removeItem('user');
    localStorage.removeItem('xp_data');
    applyUI(null);
};

// ── Шаг 1: Мгновенно показываем из localStorage ───────────────────
function applyFromCache() {
    try {
        const u = JSON.parse(localStorage.getItem('user') || 'null');
        applyUI(u);
    } catch(e) {}
}

// ── Шаг 2: Firebase подтверждает и обновляет ─────────────────────
let fbInitialized = false;

onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
        fbInitialized = true;
        const parts = (fbUser.displayName || '').trim().split(' ');
        const user = {
            uid: fbUser.uid,
            firstName: parts[0] || fbUser.email.split('@')[0],
            lastName: parts.slice(1).join(' ') || '',
            email: fbUser.email,
            photoURL: fbUser.photoURL || null
        };
        localStorage.setItem('user', JSON.stringify(user));

        // Читаем XP и роль из Firestore
        let xp = 0;
        let role = 'registered';

        // Суперпользователи — сразу даём доступ без ожидания Firestore
        const SUPER_EMAILS = ['dersire.der@gmail.com', 'cebotarigg@gmail.com', 'mihail.ce89@gmail.com'];
        if (SUPER_EMAILS.indexOf(fbUser.email.toLowerCase()) !== -1) {
            role = 'superuser';
            localStorage.setItem('user_role', 'superuser');
            document.dispatchEvent(new CustomEvent('roleReady', { detail: { role: 'superuser' } }));
        }

        try {
            const snap = await getDoc(doc(db, 'users', fbUser.uid));
            if (snap.exists()) {
                xp = snap.data().xp || 0;
                // Не перезаписываем superuser
                if (role !== 'superuser') {
                    role = snap.data().accessRole || 'registered';
                    localStorage.setItem('user_role', role);
                    document.dispatchEvent(new CustomEvent('roleReady', { detail: { role } }));
                }
            } else {
                if (role !== 'superuser') {
                    localStorage.setItem('user_role', 'registered');
                    document.dispatchEvent(new CustomEvent('roleReady', { detail: { role: 'registered' } }));
                }
            }
            localStorage.setItem('xp_data', JSON.stringify({ totalXP: xp }));
        } catch(e) {
            try { xp = JSON.parse(localStorage.getItem('xp_data') || '{}').totalXP || 0; } catch(e2) {}
            // Firestore недоступен — диспатчим то что есть
            if (role !== 'superuser') {
                document.dispatchEvent(new CustomEvent('roleReady', { detail: { role } }));
            }
        }

        applyUI(user, xp);
    } else {
        if (!fbInitialized) {
            // Первый вызов null — Firebase ещё восстанавливает сессию
            // НЕ трогаем localStorage, уже показали из кеша
            fbInitialized = true;
            // Через 3 сек если Firebase так и не вернул пользователя — значит реально не залогинен
            setTimeout(() => {
                if (!auth.currentUser) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('user_role');
                    localStorage.removeItem('xp_data');
                    document.dispatchEvent(new CustomEvent('roleReady', { detail: { role: 'guest' } }));
                    applyUI(null);
                }
            }, 3000);
        } else {
            // Повторный null — пользователь вышел
            localStorage.removeItem('user');
            localStorage.removeItem('user_role');
            localStorage.removeItem('xp_data');
            document.dispatchEvent(new CustomEvent('roleReady', { detail: { role: 'guest' } }));
            applyUI(null);
        }
    }
});

// ── Применяем UI ──────────────────────────────────────────────────
function applyUI(user, xpOverride) {
    const isPages = window.location.pathname.includes('/pages/');
    const base = isPages ? '../' : '';
    const dashHref = base + 'dashboard.html';

    let xp = xpOverride !== undefined ? xpOverride : 0;
    if (xpOverride === undefined) {
        try { xp = JSON.parse(localStorage.getItem('xp_data') || '{}').totalXP || 0; } catch(e) {}
    }

    // Ждём nav если ещё не загружен — polling каждые 50ms до 3 сек
    const navActions = document.getElementById('nav-actions-desktop') || document.querySelector('.nav-actions');
    if (!navActions) {
        let attempts = 0;
        const poll = setInterval(() => {
            const el = document.getElementById('nav-actions-desktop') || document.querySelector('.nav-actions');
            if (el || ++attempts > 60) {
                clearInterval(poll);
                if (el) applyUI(user, xpOverride);
            }
        }, 50);
        return;
    }

    if (user) {
        const initials = ((user.firstName||'')[0] + (user.lastName||'')[0]).toUpperCase() || '?';
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
        const avatarHTML = user.photoURL
            ? `<img src="${user.photoURL}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid rgba(99,102,241,.5);" onerror="this.outerHTML='<div style=width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;border:2px solid rgba(99,102,241,.5)>${initials}</div>'">`
            : `<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;border:2px solid rgba(99,102,241,.5);">${initials}</div>`;

        // Desktop — профиль + выйти в одном стиле
        navActions.innerHTML = `
            <a href="${dashHref}" style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:linear-gradient(135deg,rgba(99,102,241,.12),rgba(139,92,246,.12));border:1px solid rgba(99,102,241,.3);border-radius:14px;text-decoration:none;transition:all .2s;max-width:200px;overflow:hidden;"
               onmouseover="this.style.background='linear-gradient(135deg,rgba(99,102,241,.22),rgba(139,92,246,.22))';this.style.borderColor='rgba(99,102,241,.5)'"
               onmouseout="this.style.background='linear-gradient(135deg,rgba(99,102,241,.12),rgba(139,92,246,.12))';this.style.borderColor='rgba(99,102,241,.3)'">
                ${avatarHTML}
                <div style="display:flex;flex-direction:column;gap:1px;min-width:0;">
                    <span style="font-size:12px;font-weight:700;color:#e0e7ff;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px;">${fullName}</span>
                    <span id="nav-xp-badge" style="font-size:10px;color:#fbbf24;font-weight:700;line-height:1;white-space:nowrap;">⚡ ${xp} XP</span>
                </div>
            </a>
            <button id="nav-logout-btn" style="padding:6px 10px;border:1px solid rgba(239,68,68,.3);border-radius:14px;color:#fca5a5;font-size:12px;font-weight:600;background:rgba(239,68,68,.08);cursor:pointer;font-family:inherit;transition:all .2s;white-space:nowrap;flex-shrink:0;"
                onmouseover="this.style.background='rgba(239,68,68,.18)';this.style.borderColor='rgba(239,68,68,.5)'" onmouseout="this.style.background='rgba(239,68,68,.08)';this.style.borderColor='rgba(239,68,68,.3)'">
                Выйти
            </button>`;
        
        // Attach logout handler
        const logoutBtn = document.getElementById('nav-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', window.authLogout);
        }

        // Mobile navbar badge
        const mobWrap = document.getElementById('mob-xp-wrap');
        if (mobWrap) {
            mobWrap.style.display = 'flex';
            const mobAvatar = document.getElementById('mob-xp-avatar');
            const mobVal = document.getElementById('mob-xp-val');
            if (mobAvatar) {
                if (user.photoURL) {
                    mobAvatar.innerHTML = `<img src="${user.photoURL}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
                } else {
                    mobAvatar.textContent = initials;
                }
            }
            if (mobVal) mobVal.textContent = '⚡ ' + xp + ' XP';
        }

        // Mobile menu profile card
        const mobProfile = document.getElementById('mob-profile-card');
        const mobActions = document.getElementById('mob-actions');
        if (mobProfile) {
            mobProfile.style.display = 'block';
            const el = (id) => document.getElementById(id);
            if (el('mob-profile-name')) el('mob-profile-name').textContent = fullName;
            if (el('mob-profile-email')) el('mob-profile-email').textContent = user.email || '';
            if (el('mob-profile-xp')) el('mob-profile-xp').textContent = '⚡ ' + xp + ' XP';
            if (el('mob-profile-dash')) el('mob-profile-dash').href = dashHref;
            const av = el('mob-profile-avatar');
            if (av) {
                if (user.photoURL) {
                    av.innerHTML = `<img src="${user.photoURL}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">`;
                    av.style.background = 'none';
                } else {
                    av.textContent = initials;
                }
            }
        }
        if (mobActions) mobActions.style.display = 'none';
        
        // Attach mobile logout handler
        const mobLogoutBtn = document.getElementById('mob-logout-btn');
        if (mobLogoutBtn) {
            mobLogoutBtn.removeEventListener('click', window.authLogout); // Remove old listener
            mobLogoutBtn.addEventListener('click', window.authLogout);
        }

        // Stats icon always visible — no toggle needed

        // Admin link — show for superusers only
        const role = localStorage.getItem('user_role');
        const adminLink = document.getElementById('nav-admin-link');
        const mobAdminLink = document.getElementById('mob-admin-link');
        if (role === 'superuser') {
            if (adminLink) adminLink.style.display = '';
            if (mobAdminLink) mobAdminLink.style.display = '';
            const gameLink = document.getElementById('nav-game-link');
            const mobGameLink = document.getElementById('mob-game-link');
            if (gameLink) gameLink.style.display = '';
            if (mobGameLink) mobGameLink.style.display = '';
        } else {
            if (adminLink) adminLink.style.display = 'none';
            if (mobAdminLink) mobAdminLink.style.display = 'none';
            const gameLink = document.getElementById('nav-game-link');
            const mobGameLink = document.getElementById('mob-game-link');
            if (gameLink) gameLink.style.display = 'none';
            if (mobGameLink) mobGameLink.style.display = 'none';
        }

    } else {
        // Не залогинен
        navActions.innerHTML = `
            <button id="nav-signin-btn" style="display:flex;align-items:center;gap:8px;padding:8px 16px;background:#fff;border:none;border-radius:12px;font-size:14px;font-weight:600;color:#1f2937;cursor:pointer;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,0,.2);font-family:inherit;"
                onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
                <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Войти через Google
            </button>`;
        
        // Attach signin handler
        const signinBtn = document.getElementById('nav-signin-btn');
        if (signinBtn) {
            signinBtn.addEventListener('click', window.signInWithGoogle);
        }

        const mobWrap = document.getElementById('mob-xp-wrap');
        if (mobWrap) mobWrap.style.display = 'none';
        const mobProfile = document.getElementById('mob-profile-card');
        const mobActions = document.getElementById('mob-actions');
        if (mobProfile) mobProfile.style.display = 'none';
        if (mobActions) mobActions.style.display = 'flex';

        // Stats icon always visible — no toggle needed

        // Hide admin link when logged out
        const adminLink2 = document.getElementById('nav-admin-link');
        const mobAdminLink2 = document.getElementById('mob-admin-link');
        if (adminLink2) adminLink2.style.display = 'none';
        if (mobAdminLink2) mobAdminLink2.style.display = 'none';
        const gameLink2 = document.getElementById('nav-game-link');
        const mobGameLink2 = document.getElementById('mob-game-link');
        if (gameLink2) gameLink2.style.display = 'none';
        if (mobGameLink2) mobGameLink2.style.display = 'none';
    }
}

// ── Запуск ────────────────────────────────────────────────────────
// Сразу из кеша
applyFromCache();

// Совместимость
window.updateAuthUI = applyFromCache;

// Повторно применяем после загрузки навигации (nav.html через fetch)
document.addEventListener('navLoaded', applyFromCache);

// Повторная проверка роли — role-guard.js может обновить localStorage позже
setTimeout(() => {
    const role = localStorage.getItem('user_role');
    const adminLink = document.getElementById('nav-admin-link');
    const mobAdminLink = document.getElementById('mob-admin-link');
    const gameLink = document.getElementById('nav-game-link');
    const mobGameLink = document.getElementById('mob-game-link');
    if (role === 'superuser') {
        if (adminLink) adminLink.style.display = '';
        if (mobAdminLink) mobAdminLink.style.display = '';
        if (gameLink) gameLink.style.display = '';
        if (mobGameLink) mobGameLink.style.display = '';
    }
}, 2000);

// XP обновление
document.addEventListener('xpUpdated', (e) => {
    const xp = e.detail?.totalXP || 0;
    const badge = document.getElementById('nav-xp-badge');
    if (badge) badge.textContent = '⚡ ' + xp + ' XP';
    const mobVal = document.getElementById('mob-xp-val');
    if (mobVal) mobVal.textContent = '⚡ ' + xp + ' XP';
    const mobXp = document.getElementById('mob-profile-xp');
    if (mobXp) mobXp.textContent = '⚡ ' + xp + ' XP';
});
