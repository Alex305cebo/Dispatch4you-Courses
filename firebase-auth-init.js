/**
 * firebase-auth-init.js
 * Подключать как <script type="module" src="firebase-auth-init.js"></script>
 * на всех страницах где нужно отображение пользователя в навбаре.
 * Инициализирует Firebase Auth, пишет user в localStorage, обновляет навбар.
 */
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

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
window._fbAuth = auth;

// Флаг — первый вызов onAuthStateChanged это восстановление сессии
// Firebase может вернуть null пока токен ещё не проверен
let authInitialized = false;

onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
        authInitialized = true;
        const parts = (firebaseUser.displayName || '').split(' ');
        const firstName = parts[0] || firebaseUser.email.split('@')[0];
        const lastName = parts.slice(1).join(' ') || '';
        localStorage.setItem('user', JSON.stringify({
            uid: firebaseUser.uid,
            firstName,
            lastName,
            email: firebaseUser.email
        }));
    } else {
        // Удаляем user только если Firebase точно подтвердил что сессии нет
        // и это не первый быстрый null при инициализации
        if (authInitialized) {
            localStorage.removeItem('user');
        } else {
            // Первый вызов с null — Firebase ещё восстанавливает сессию
            // Ждём немного и проверяем снова
            setTimeout(() => {
                if (!auth.currentUser) {
                    localStorage.removeItem('user');
                    if (typeof window.updateAuthUI === 'function') {
                        window.updateAuthUI();
                    }
                }
            }, 2000);
        }
        authInitialized = true;
    }

    // Обновляем навбар — nav может ещё не быть в DOM
    if (typeof window.updateAuthUI === 'function') {
        if (document.querySelector('.nav-actions')) {
            window.updateAuthUI();
        } else {
            document.addEventListener('navLoaded', window.updateAuthUI, { once: true });
        }
    }
});
