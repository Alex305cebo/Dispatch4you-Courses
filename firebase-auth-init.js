/**
 * firebase-auth-init.js v2.1
 * Не обновляет UI до получения окончательного ответа от Firebase Auth.
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

let firstCall = true;

function triggerUI() {
    if (typeof window.updateAuthUI === 'function') {
        if (document.querySelector('.nav-actions')) {
            window.updateAuthUI();
        } else {
            document.addEventListener('navLoaded', window.updateAuthUI, { once: true });
        }
    }
}

onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
        // Пользователь залогинен — сохраняем и обновляем UI
        firstCall = false;
        const parts = (firebaseUser.displayName || '').split(' ');
        const firstName = parts[0] || firebaseUser.email.split('@')[0];
        const lastName = parts.slice(1).join(' ') || '';
        localStorage.setItem('user', JSON.stringify({
            uid: firebaseUser.uid,
            firstName,
            lastName,
            email: firebaseUser.email
        }));
        triggerUI();
    } else {
        if (firstCall) {
            // Первый вызов с null — Firebase ещё не восстановил сессию
            // Не трогаем localStorage и не обновляем UI
            // Ждём повторного вызова от Firebase
            firstCall = false;
            // Если через 3 секунды Firebase так и не вернул пользователя — значит реально не залогинен
            setTimeout(() => {
                if (!auth.currentUser) {
                    localStorage.removeItem('user');
                    triggerUI();
                }
            }, 3000);
        } else {
            // Повторный null — пользователь вышел
            localStorage.removeItem('user');
            triggerUI();
        }
    }
});
