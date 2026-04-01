/**
 * firebase-auth-init.js v3.0
 * Google Sign-In Popup — работает на всех страницах через nav-loader.js
 */
import {
    initializeApp, getApps
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
    getAuth, onAuthStateChanged, signOut,
    GoogleAuthProvider, signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyC505dhT1WjUPhXbinqLvEOTlEXWxYy8GI",
    authDomain: "dispatch4you-80e0f.firebaseapp.com",
    projectId: "dispatch4you-80e0f",
    storageBucket: "dispatch4you-80e0f.appspot.com",
    messagingSenderId: "349235354473",
    appId: "1:349235354473:web:488aeb29211b02bb153bf8"
};

const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

window._fbAuth = auth;

// ── Google Sign-In Popup ──────────────────────────────────────────
window.signInWithGoogle = async function () {
    try {
        showAuthLoading(true);
        await signInWithPopup(auth, provider);
        // onAuthStateChanged сам обновит UI
    } catch (err) {
        showAuthLoading(false);
        if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
            console.error('Google Sign-In error:', err.message);
        }
    }
};

// ── Sign Out ──────────────────────────────────────────────────────
window.authLogout = async function (e) {
    if (e) e.preventDefault();
    try {
        await signOut(auth);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user_role');
        updateNavUI(null);
    } catch (err) {
        console.error('Sign out error:', err);
    }
};

// ── Auth State Listener ───────────────────────────────────────────
let initialized = false;

onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
        const parts = (firebaseUser.displayName || '').trim().split(' ');
        const firstName = parts[0] || firebaseUser.email.split('@')[0];
        const lastName = parts.slice(1).join(' ') || '';
        const userData = {
            uid: firebaseUser.uid,
            firstName,
            lastName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL || null
        };
        localStorage.setItem('user', JSON.stringify(userData));
        initialized = true;
        updateNavUI(userData);
    } else {
        if (!initialized) {
            // Первый вызов — Firebase ещё восстанавливает сессию, ждём
            initialized = true;
            setTimeout(() => {
                if (!auth.currentUser) {
                    localStorage.removeItem('user');
                    updateNavUI(null);
                }
            }, 2000);
        } else {
            localStorage.removeItem('user');
            updateNavUI(null);
        }
    }
});

// ── Update Navbar UI ──────────────────────────────────────────────
function updateNavUI(user) {
    const navActions = document.querySelector('.nav-actions');
    const mobActions = document.querySelector('.mob-actions');

    if (!navActions) {
        // Nav ещё не загружен — ждём
        document.addEventListener('navLoaded', () => updateNavUI(user), { once: true });
        return;
    }

    if (user) {
        const initials = ((user.firstName || '')[0] + (user.lastName || '')[0]).toUpperCase() || '👤';
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
        const isPages = window.location.pathname.includes('/pages/');
        const dashHref = isPages ? '../dashboard.html' : 'dashboard.html';

        let xp = 0;
        try { xp = JSON.parse(localStorage.getItem('xp_data') || '{}').totalXP || 0; } catch (e) {}

        // Desktop navbar
        navActions.innerHTML = `
            <a href="${dashHref}" style="display:flex;align-items:center;gap:8px;padding:6px 14px;
                background:linear-gradient(135deg,rgba(99,102,241,.15),rgba(139,92,246,.15));
                border:1px solid rgba(99,102,241,.35);border-radius:12px;text-decoration:none;
                transition:all .3s;backdrop-filter:blur(10px);"
                onmouseover="this.style.background='linear-gradient(135deg,rgba(99,102,241,.25),rgba(139,92,246,.25))';this.style.transform='translateY(-2px)'"
                onmouseout="this.style.background='linear-gradient(135deg,rgba(99,102,241,.15),rgba(139,92,246,.15))';this.style.transform=''">
                ${user.photoURL
                    ? `<img src="${user.photoURL}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none'">`
                    : `<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;">${initials}</div>`
                }
                <div style="display:flex;flex-direction:column;gap:1px;">
                    <span style="font-size:12px;font-weight:700;color:#e0e7ff;">${fullName}</span>
                    <span id="nav-xp-badge" style="font-size:10px;color:#fbbf24;font-weight:700;">⚡ ${xp} XP</span>
                </div>
            </a>
            <button onclick="authLogout(event)" style="padding:6px 12px;border:1px solid rgba(239,68,68,.35);
                border-radius:12px;color:#fca5a5;font-size:12px;font-weight:600;
                background:rgba(239,68,68,.12);cursor:pointer;transition:all .3s;
                font-family:inherit;"
                onmouseover="this.style.background='rgba(239,68,68,.2)';this.style.transform='translateY(-2px)'"
                onmouseout="this.style.background='rgba(239,68,68,.12)';this.style.transform=''">
                🚪 Выйти
            </button>`;

        // Mobile menu — скрыть Войти/Регистрация, показать XP
        if (mobActions) mobActions.style.display = 'none';
        const mobWrap = document.getElementById('mob-xp-wrap');
        const mobAvatar = document.getElementById('mob-xp-avatar');
        const mobVal = document.getElementById('mob-xp-val');
        if (mobWrap) mobWrap.style.display = 'flex';
        if (mobAvatar) mobAvatar.textContent = initials;
        if (mobVal) mobVal.textContent = '⚡ ' + xp + ' XP';

    } else {
        // Не залогинен — показываем кнопку Google
        navActions.innerHTML = `
            <button onclick="signInWithGoogle()" id="google-signin-btn" style="display:flex;align-items:center;gap:8px;
                padding:8px 16px;background:#fff;border:none;border-radius:12px;
                font-size:14px;font-weight:600;color:#1f2937;cursor:pointer;
                transition:all .3s;box-shadow:0 2px 8px rgba(0,0,0,.2);font-family:inherit;"
                onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(0,0,0,.25)'"
                onmouseout="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,.2)'">
                <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Войти через Google
            </button>`;

        if (mobActions) mobActions.style.display = 'flex';
        const mobWrap = document.getElementById('mob-xp-wrap');
        if (mobWrap) mobWrap.style.display = 'none';
    }
}

// ── Loading state ─────────────────────────────────────────────────
function showAuthLoading(show) {
    const btn = document.getElementById('google-signin-btn');
    if (!btn) return;
    if (show) {
        btn.disabled = true;
        btn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid #ccc;border-top-color:#4285F4;border-radius:50%;animation:spin .6s linear infinite;"></span> Входим...';
        if (!document.getElementById('spin-style')) {
            const s = document.createElement('style');
            s.id = 'spin-style';
            s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
            document.head.appendChild(s);
        }
    } else {
        btn.disabled = false;
    }
}

// ── XP update listener ────────────────────────────────────────────
document.addEventListener('xpUpdated', (e) => {
    const badge = document.getElementById('nav-xp-badge');
    if (!badge) return;
    const xp = e.detail?.totalXP || 0;
    badge.textContent = '⚡ ' + xp + ' XP';
    badge.style.transition = 'all .2s';
    badge.style.color = '#fff';
    setTimeout(() => { badge.style.color = '#fbbf24'; }, 500);
    const mobVal = document.getElementById('mob-xp-val');
    if (mobVal) mobVal.textContent = '⚡ ' + xp + ' XP';
});

// Совместимость со старым auth.js
window.updateAuthUI = () => {
    const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch(e) { return null; } })();
    updateNavUI(user);
};
